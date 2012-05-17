ko.hookpunch = new (function () {

    // Array Remove - By John Resig (MIT Licensed) - TODO: clean this up later.
    Array.prototype.remove = function (from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };

    var hookpunch = this;

    hookpunch.options = null;

    hookpunch.states = {
        NEW: 1,
        CHANGED: 2,
        UNCHANGED: 3
        //DELETED :4 //coming soon
    }

    initialised = false;

    hookpunch.init = function (options) {

        if (!hookpunch.initialised) {

            hookpunch.options = $.extend({}, hookpunch.options, options);

            // returns how many undo levels are in memory, should probably limit this some time.
            ko.hookpunch.undoLevels = function (item) {

                var undoLevels = 0;
                if (item.history) {
                    undoLevels = item.history.length;
                }

                return undoLevels;
            }

            ko.extenders.trackHistory = function (target, options) {

                target.originalObject = options.originalObject;

                //check that the history array exists
                if (!target.originalObject.history && hookpunch.options.history) {
                    target.originalObject.history = new Array();
                    target.originalObject.history.push(ko.mapping.toJS(target.originalObject));
                }

                target.subscribe(function (newValue) {

                    //todo: this is far from perfect. State doesn't always undo correctly
                    if (target.originalObject.history && hookpunch.options.history) {

                        var clonedObject = ko.mapping.toJS(target.originalObject);
                        var lastAddedHistoryItem = target.originalObject.history[target.originalObject.history.length - 1];
                        clonedObject[ko.hookpunch.options.stateField] = 2;

                        var isDuplicate = false;
                        if (target.originalObject.history.length > 1 && ko.mapping.toJSON(lastAddedHistoryItem) === ko.mapping.toJSON(clonedObject)) {
                            isDuplicate = true;
                        }

                        if (!isDuplicate) {
                            target.originalObject.history.push(clonedObject);
                        }
                    }
                });
            };

            ko.extenders.trackState = function (target, options) {

                target.originalObject = options.originalObject;
                target.originalValue = options.originalValue;
                target.originalState = options.originalObject[hookpunch.options.stateField]();

                if (options.originalObject[hookpunch.options.stateField] === undefined) {
                    throw "Make sure you've initialised the correct stateField in ko.hookpunch.init({ stateField: '[Your field name here]'});";
                }

                target.subscribe(function (newValue) {

                    var changed = target.originalValue !== newValue;
                    if (changed) {

                        // new Objects
                        if (target.originalState == hookpunch.states.NEW) {
                            target.originalObject[hookpunch.options.stateField] = hookpunch.states.NEW;
                        } else if (target.originalState == hookpunch.states.UNCHANGED) {
                            target.originalObject[hookpunch.options.stateField] = hookpunch.states.CHANGED;
                        }
                        //fire the event when a change is detected
                        if (target.originalObject.change) {
                            target.originalObject.change(target.originalObject);
                        }

                        // fire the global event handler for change
                        if (hookpunch.options.globalChange) {
                            hookpunch.options.globalChange(target.originalObject);
                        }
                    } else {
                        // new Objects
                        if (target.originalState == hookpunch.states.NEW) {
                            target.originalObject[hookpunch.options.stateField] = hookpunch.states.NEW;
                        } else if (target.originalState == hookpunch.states.UNCHANGED) {
                            target.originalObject[hookpunch.options.stateField] = hookpunch.states.UNCHANGED;
                        }
                        //fire the event when a change is detected
                        if (target.originalObject.revert) {
                            target.originalObject.revert(target.originalObject);
                        }

                        // fire the global event handler for change
                        if (hookpunch.options.globalRevert) {
                            hookpunch.options.globalRevert(target.originalObject);
                        }
                    }
                });
                return target;
            };

            hookpunch.initialised = true;
        }
    }

    hookpunch.stateTrackedModel = function (data) {

        var self = this;

        self.init = function (data, hookevents) {

            ko.mapping.fromJS(data, {}, self);
            if (hookevents) {
                for (prop in self) {
                    if (self[prop] != null && self[prop].extend != undefined && prop != hookpunch.options.stateField) {
                        self[prop].extend({ trackState: { originalObject: self, originalValue: self[prop]()} });
                        self[prop].extend({ trackHistory: { originalObject: self, propertyName: prop} });
                    }
                }
            }
        }

        self.undo = function () {
            if (self.history.length > 1) {
                var itemToUndoTo = self.history[self.history.length - 2];
                self.history.remove(self.history.length - 1); // remove the last item
                self.init(itemToUndoTo, false);
            }
        }

        self.stateName = function () {

            for (state in hookpunch.states) {
                var myState = this[hookpunch.options.stateField];
                if (hookpunch.states[state] === myState) {
                    return state;
                }
            }
        }

        self.init(data, true);
        return self;
    }
});