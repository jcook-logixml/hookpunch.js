﻿ko.hookpunch = new (function () {

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

        ko.mapping.fromJS(data, {}, this);
        var self = this;
        for (prop in self) {
            if (self[prop] != null && self[prop].extend != undefined && prop != hookpunch.options.stateField) {
                self[prop].extend({ trackState: { originalObject: self, originalValue: self[prop]()} });
            }
        }

        self.stateName = function () {

            for (state in hookpunch.states) {
                var myState = this[hookpunch.options.stateField];
                if (hookpunch.states[state] === myState) {
                    return state;
                }
            }
        };

        return self;
    }
});