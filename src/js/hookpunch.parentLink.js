/// <reference path="hookpunch.js" />
/// <reference path="hookpunch.trackHistory.js" />
/// <reference path="hookpunch.trackState.js" />

hookpunch.parentLink = (function () {

    hookpunch.parentLink = {};

    hookpunch.parentLink.init = function () {
        if (!hookpunch.initialised) {
            // adds a reference to the parent object to observable
            ko.extenders.parentLink = function (target, options) {
                target.parent = options.parent;
            }
        }
    }

    return hookpunch.parentLink;
})();