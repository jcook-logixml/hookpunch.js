/// <reference path="hookpunch.trackHistory.js" />
/// <reference path="hookpunch.js" />
/// <reference path="hookpunch.parentLink.js" />

hookpunch.trackState = (function () {

    hookpunch.trackState = {};

    hookpunch.trackState.init = function () {

        // tracks the item state
        ko.extenders.trackState = function (target, options) {

            target.originalValue = options.originalValue;
            target.originalState = target.parent[hookpunch.options.stateField]();

            if (target.parent[hookpunch.options.stateField] === undefined) {
                throw "Make sure you've initialised the correct stateField in hookpunch.init({ stateField: '[Your field name here]'});";
            }

            target.subscribe(function (newValue) {

                var changed = target.originalValue !== newValue;
                if (changed) {

                    // new Objects
                    if (target.originalState == hookpunch.states.NEW) {
                        target.parent[hookpunch.options.stateField] = hookpunch.states.NEW;
                    } else if (target.originalState == hookpunch.states.UNCHANGED) {
                        target.parent[hookpunch.options.stateField] = hookpunch.states.CHANGED;
                    }
                    //fire the event when a change is detected
                    if (target.parent.change) {
                        target.parent.change(target.parent);
                    }

                    // fire the global event handler for change
                    if (hookpunch.options.globalChange) {
                        hookpunch.options.globalChange(target.parent);
                    }
                } else {
                    // new Objects
                    if (target.originalState == hookpunch.states.NEW) {
                        target.parent[hookpunch.options.stateField] = hookpunch.states.NEW;
                    } else if (target.originalState == hookpunch.states.UNCHANGED) {
                        target.parent[hookpunch.options.stateField] = hookpunch.states.UNCHANGED;
                    }
                    //fire the event when a change is detected
                    if (target.parent.revert) {
                        target.parent.revert(target.parent);
                    }

                    // fire the global event handler for change
                    if (hookpunch.options.globalRevert) {
                        hookpunch.options.globalRevert(target.parent);
                    }
                }
            });
            return target;
        };
    }

    return hookpunch.trackState;
})();