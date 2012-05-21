hookpunch.utils = (function () {

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