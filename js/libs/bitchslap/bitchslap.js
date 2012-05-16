ko.bitchslap = new (function () {

    var bitchslap = this;

    bitchslap.options = {
        stateField: "State"
    };

    bitchslap.states = {
        NEW: 1,
        CHANGED: 2,
        UNCHANGED: 3
        //DELETED :4 //coming soon
    }    

    bitchslap.initialised = false;

    bitchslap.init = function (options) {
        if (!bitchslap.initialised) {

            $.extend(bitchslap.options, options);

            ko.extenders.trackState = function (target, options) {

                target.parent = options.parent;
                target.originalValue = options.originalValue;
                target.originalState = options.parent[bitchslap.options.stateField]();

                target.subscribe(function (newValue) {

                    var changed = target.originalValue !== newValue;
                    if (changed) {
                        // new Objects
                        if (target.originalState == bitchslap.states.NEW) {
                            target.parent[bitchslap.options.stateField] = bitchslap.states.NEW;
                        } else if (target.originalState == bitchslap.states.UNCHANGED) {
                            target.parent[bitchslap.options.stateField] = bitchslap.states.CHANGED;
                        }
                        //fire the event when a change is detected
                        if (target.parent.change) {
                            target.parent.change(target.parent);
                        }
                    } else {
                        // new Objects
                        if (target.originalState == bitchslap.states.NEW) {
                            target.parent[bitchslap.options.stateField] = bitchslap.states.NEW;
                        } else if (target.originalState == bitchslap.states.UNCHANGED) {
                            target.parent[bitchslap.options.stateField] = bitchslap.states.UNCHANGED;
                        }
                        //fire the event when a change is detected
                        if (target.parent.revert) {
                            target.parent.revert(target.parent);
                        }
                    }
                });
                console.dir(target.parent);
                return target;
            };

            bitchslap.initialised = true;
        }
    }

    bitchslap.stateTrackedModel = function (data) {

        ko.mapping.fromJS(data, {}, this);
        var self = this;
        for (prop in self) {
            if (self[prop] != null && self[prop].extend != undefined && prop != bitchslap.options.stateField) {
                self[prop].extend({ trackState: { parent: self, originalValue: self[prop]()} });
            }
        }
        return self;
    }

    bitchslap.init();
});