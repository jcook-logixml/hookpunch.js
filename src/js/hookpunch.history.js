/// <reference path="hookpunch.trackState.js" />
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
})();