﻿/// <reference path="hookpunch.trackState.js" />
/// <reference path="hookpunch.parentLink.js" />
/// <reference path="hookpunch.js" />

hookpunch.history = (function () {

    hookpunch.history = {};

    hookpunch.history.init = function () {
        if (!hookpunch.initialised) {
            if (hookpunch.options.history) {
                hookpunch.history = {
                    undoFlag: false, 
                    busyRevertingValue: false
                };
            }
        }
    }

    ko.extenders.trackHistory = function (target, options) {

        target.propertyName = options.propertyName;
        target.version = 0;

        target.subscribe(function (newValue) {

            if (!hookpunch.history.busyRevertingValue) {

                var hookpunchId = target.parent._hookpunch.id;

                if (!hookpunch.history[hookpunchId].changes) {
                    hookpunch.history[hookpunchId].changes = [];
                }

                if (hookpunch.history.undoFlag) {
                    hookpunch.history[hookpunchId].changes = [];
                    target.version = 0;
                    hookpunch.history.undoFlag = false;
                }

                target.version = ++target.version;
                hookpunch.history[hookpunchId].changes.splice(0, 0, {
                    propertyName: options.propertyName,
                    value: target(),
                    version: target.version
                });
            }
        });
    }

    return hookpunch.history;
})();﻿/// <reference path="hookpunch.parentLink.js" />
/// <reference path="hookpunch.trackState.js" />
/// <reference path="hookpunch.trackHistory.js" />

hookpunch = (function () {

    var hookpunch = {};

    hookpunch.states = {
        NEW: 1,
        CHANGED: 2,
        UNCHANGED: 3
    }

    hookpunch.options = null;
    hookpunch.initialised = false;

    // to initialise everything
    hookpunch.init = function (options) {

        if (!hookpunch.initialised) {

            hookpunch.options = $.extend({
                parentLink: true,
                trackState: true,
            }, hookpunch.options, options);

            // load all of the extensions and init them
            if (hookpunch.parentLink) { hookpunch.parentLink.init(); }
            if (hookpunch.trackState) { hookpunch.trackState.init(); }
            if (hookpunch.history) { hookpunch.history.init(); }

            hookpunch.initialised = true;
        }
    }

    hookpunch.observable = function (data) {

        var self = this;
        
        // gets a unique sequential id for items.
        self.getUniqueId = function () {

            if (!hookpunch.lastId) {
                hookpunch.lastId = 0;
            }

            return ++hookpunch.lastId;
        }

        self.init = function (data) {

            ko.mapping.fromJS(data, { }, self);
            self['isDirty'] = ko.observable(false);

            self._hookpunch = {};

            self._hookpunch.id = self.getUniqueId();
            self._hookpunch.undoCalled = false;

            hookpunch.history[self._hookpunch.id] = { changes: new Array() };

            for (prop in self) {
                if (self[prop] != null && self[prop].extend != undefined && prop != hookpunch.options.stateField) {

                    // to do, check dependecy logic here to ensure options work together.
                    if (hookpunch.options.parentLink) {
                        self[prop].extend({ parentLink: { parent: self} });
                    }

                    if (hookpunch.options.trackState) {
                        self[prop].extend({ trackState: { originalValue: self[prop]()} });
                    }

                    if (hookpunch.options.history) {
                        self[prop].extend({ trackHistory: { propertyName: prop, hookpunchId: self._hookpunch.id} });
                    }
                }
            }

            if (self[hookpunch.options.stateField] !== hookpunch.states.NEW) {

                var originalItem = hookpunch.utils.stripItem(self);
                if (!hookpunch.utils.contains(hookpunch.trackState.originalItems, originalItem)) {
                    hookpunch.trackState.originalItems.push(originalItem)
                }
            }
        }

        self.undo = function () {

            var changes = hookpunch.history[self._hookpunch.id].changes;

            var lastChange = changes.splice(0, 1)[0];
            if (lastChange) {

                hookpunch.history.undoFlag = true;  // mark item as undone, any subsequent changes will delete history
                hookpunch.history.busyRevertingValue = true; // ignore history tracking while we update the observables.

                var changeFound = false;
                for (index in changes) {

                    var change = changes[index];
                    if (change.propertyName === lastChange.propertyName && change.version !== lastChange.version) {

                        changeFound = true;
                        self[lastChange.propertyName].version = change.version;
                        self[lastChange.propertyName](change.value);

                        break;
                    }
                }

                if (!changeFound) {
                    self[lastChange.propertyName].version = 0;
                    self[lastChange.propertyName](self[lastChange.propertyName].originalValue);
                }

                hookpunch.history.busyRevertingValue = false; //resume history logging
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

    return hookpunch;
})();
﻿/// <reference path="hookpunch.js" />
/// <reference path="hookpunch.trackHistory.js" />
/// <reference path="hookpunch.trackState.js" />

hookpunch.parentLink = (function () {

    hookpunch.parentLink = { };

    hookpunch.parentLink.init = function () {
        if (!hookpunch.initialised) {
            // adds a reference to the parent object to observable
            ko.extenders.parentLink = function (target, options) {
                target.parent = options.parent;
            }
        }
    }

    return hookpunch.parentLink;
})();﻿/// <reference path="hookpunch.trackHistory.js" />
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
})();﻿hookpunch.utils = (function () {

    hookpunch.utils = {};

    hookpunch.utils.contains = function (array, obj) {

        var i = array.length;
        while (i--) {
            if (array[i] === obj) {
                return true;
            }
        }
        return false;
    }

    hookpunch.utils.findByHookpunchId = function (array, id) {

        for (index in array) {
            var item = array[index];

            if (item.hookpunchId === id) {
                return item;
            }
        }
    }

    hookpunch.utils.compareExcludingState = function (a, b) {

        return JSON.stringify(a) === JSON.stringify(b);
    }

    //removes state and persists only the fields as JSON text
    hookpunch.utils.stripItem = function (item) {

        var hookpunchId = item._hookpunch.id;
        var originalItem = JSON.parse(ko.mapping.toJSON(item));
        delete originalItem[hookpunch.options.stateField];
        originalItem.hookpunchId = hookpunchId;
        originalItem = originalItem;

        return originalItem;
    }

    return hookpunch.utils;
})();