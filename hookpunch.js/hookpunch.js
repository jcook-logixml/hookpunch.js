/// <reference path="hookpunch.parentLink.js" />
/// <reference path="hookpunch.trackState.js" />
/// <reference path="hookpunch.trackHistory.js" />

hookpunch = (function () {

    var hookpunch = {};

    hookpunch.options = null;
    hookpunch.initialised = false;

    // to initialise everything
    hookpunch.init = function (options) {

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

            hookpunch.history[self._hookpunch.id] = { originalObject: data, itemHistory: new Array() };

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

            var itemHistory = hookpunch.history[self._hookpunch.id].itemHistory;
            if (itemHistory.length > 0) {

                itemHistory.reverse();
                for (item in itemHistory) {

                    var historyItem = itemHistory[item];
                    if (historyItem.latest || historyItem.ignore) {
                        historyItem.ignore = true;
                        continue;
                    } else {
                        if (historyItem !== undefined) {
                            console.log(historyItem.propertyName + " " + historyItem.value);
                            itemHistory[item].latest = true;
                            itemHistory[item].latest = true;
                            self._hookpunch.undoCalled = true;

                            self[historyItem.propertyName] = ko.observable(historyItem.value);
                            break;
                        }
                    }
                }

                //                itemHistory.reverse();
                //                do {
                //                    itemState = itemHistory.pop();
                //                } while (itemState.latest && itemHistory.length > 0)

                //                if (itemState) {
                //                    console.log(JSON.stringify(itemState));
                //                    console.dir(itemHistory);
                //                    //self[itemState.propertyName](itemState.value);
                //                }

            }

            //            latestItems = ko.utils.arrayFilter(itemHistory, function (item) {
            //                return !item.latest;
            //            });

            //            console.dir(latestItems);
            //            console.log(self._hookpunch.lastUndoField);
            //            if (self._hookpunch.lastUndoField == undefined) {

            //                var lastAddedHistoryItem = itemHistory[itemHistory.length - 1];
            //                self._hookpunch.lastUndoField = lastAddedHistoryItem.propertyName;
            //            } else if (self._hookpunch.lastUndoField != itemHistory.propertyName) {

            //                var lastAddedHistoryItem = itemHistory.pop();
            //                self._hookpunch.lastUndoField = lastAddedHistoryItem.propertyName;
            //            }



            //            console.dir(itemHistory);

            //var previousFieldState = itemHistory.pop();

            // console.log("previous state: " + JSON.stringify(previousFieldState));

            //            if (itemHistory.length > 1) {

            //                var previousState = itemHistory[itemHistory.length - 2];
            //                self[lastUpdatedField](previousState);
            //                delete itemHistory[itemHistory.length - 1];
            //                delete itemHistory[itemHistory.length - 2];
            //                itemHistory.length = itemHistory.length - 2;
            //                console.dir(itemHistory);
            //            } else {
            //            }

            //console.dir(hookpunch.history[self._hookpunch.id].itemHistory);



            //hookpunch.history);
            //console.dir(target);
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
