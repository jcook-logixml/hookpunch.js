/// <reference path="hookpunch.trackHistory.js" />
/// <reference path="hookpunch.js" />
/// <reference path="hookpunch.parentLink.js" />

hookpunch.trackState = (function () {

    hookpunch.trackState = { originalItems: [] };

    hookpunch.trackState.init = function () {

        // tracks the item state
        ko.extenders.trackState = function (target, options) {

            if (!target.parent) {
                throw "The parentLink library is required.";
            }

            target.originalValue = options.originalValue;
            target.originalState = target.parent[hookpunch.options.stateField]();

            if (target.parent[hookpunch.options.stateField] === undefined) {
                throw "Make sure you've initialised the correct stateField in hookpunch.init({ stateField: '[Your field name here]'});";
            }

            target.subscribe(function (newValue) {

                var originalParentObject = hookpunch.utils.findByHookpunchId(hookpunch.trackState.originalItems, target.parent._hookpunch.id);
                var currentParentState = hookpunch.utils.stripItem(target.parent);
                var isDirty = !hookpunch.utils.compareExcludingState(originalParentObject, currentParentState);


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

                    // fire the global event handler for change on the entire object, only fires once when the object is first changed
                    if (hookpunch.options.globalChange && !target.parent.isDirty() && isDirty) {
                        target.parent.isDirty(isDirty);
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

                    // fire the global event handler for when the object is reverted to its original state. 
                    if (hookpunch.options.globalRevert && target.parent.isDirty() && !isDirty) {
                        target.parent.isDirty(isDirty);
                        hookpunch.options.globalRevert(target.parent);
                    }
                }
            });
            return target;
        };
    }

    return hookpunch.trackState;
})();