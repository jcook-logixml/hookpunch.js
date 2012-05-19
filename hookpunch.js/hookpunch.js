﻿/// <reference path="hookpunch.parentLink.js" />
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

        if (!Array.prototype.filter) {
            Array.prototype.filter = function (fun /*, thisp */) {
                "use strict";

                if (this == null)
                    throw new TypeError();

                var t = Object(this);
                var len = t.length >>> 0;
                if (typeof fun != "function")
                    throw new TypeError();

                var res = [];
                var thisp = arguments[1];
                for (var i = 0; i < len; i++) {
                    if (i in t) {
                        var val = t[i]; // in case fun mutates this  
                        if (fun.call(thisp, val, i, t))
                            res.push(val);
                    }
                }

                return res;
            };
        }

        if (!hookpunch.initialised) {

            hookpunch.options = $.extend({
                parentLink: true,
                trackState: true,
                history: false
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

            ko.mapping.fromJS(data, {}, self);
            self._hookpunch = {};

            self._hookpunch.id = self.getUniqueId();
            self._hookpunch.undoCalled = false;

            hookpunch.history[self._hookpunch.id] = { originalObject: data, changes: new Array() };

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
        }

        self.undo = function () {

            var changes = hookpunch.history[self._hookpunch.id].changes;

            var lastChange = changes.splice(0, 1)[0];
            if (lastChange) {
                var changeFound = false;
                for (index in changes) {

                    var change = changes[index];
                    if (change.propertyName === lastChange.propertyName && change.version !== lastChange.version) {

                        changeFound = true;
                        hookpunch.history.undoFlag = true;
                        hookpunch.history.busyRevertingValue = true;
                        self[lastChange.propertyName].version = change.version;
                        self[lastChange.propertyName](change.value);
                        hookpunch.history.busyRevertingValue = false;

                        break;
                    }
                }

                if (!changeFound) {
                    hookpunch.history.undoFlag = true;
                    hookpunch.history.busyRevertingValue = true;
                    self[lastChange.propertyName].version = 0;
                    self[lastChange.propertyName](self[lastChange.propertyName].originalValue);
                    hookpunch.history.busyRevertingValue = false;
                }
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
