/// <reference path="hookpunch.trackState.js" />
/// <reference path="hookpunch.parentLink.js" />
/// <reference path="hookpunch.js" />

hookpunch.history = (function () {

    hookpunch.history = {};

    hookpunch.history.init = function () {
        if (!hookpunch.initialised) {
            if (hookpunch.options.history) {
                hookpunch.history = {};
            }
        }
    }

    ko.extenders.trackHistory = function (target, options) {

        target.propertyName = options.propertyName;
        target.revertValue = target.originalState[target.propertyName];

        target.subscribe(function (newValue) {

            var hookpunchId = target.parent._hookpunch.id;

            if (!hookpunch.history[hookpunchId].itemHistory) {
                hookpunch.history[hookpunchId].itemHistory = [];
            }

            if (target.parent._hookpunch.undoCalled) {
                target.parent._hookpunch.undoCalled = false;
                hookpunch.history[hookpunchId].itemHistory = [];
            }

            for (item in hookpunch.history[hookpunchId].itemHistory) {
                if (hookpunch.history[hookpunchId].itemHistory[item].propertyName == options.propertyName) {
                    hookpunch.history[hookpunchId].itemHistory[item].latest = false;
                }
            }
            hookpunch.history[hookpunchId].itemHistory.push({ propertyName: options.propertyName, value: target(), latest: true });
        });
    }

    return hookpunch.history;
})();