/// <reference path="hookpunch.parentLink.js" />
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
