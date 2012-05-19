hookpunch.js
============

**hookpunch.js** adds *state tracking* to a specified field on observable Knockout.js objects. 
It also provides helper functions for *filtering out only the objects that have changed* from 
observableCollections. This is useful when working with serialized server objects on the client 
side, or when you *only want to send updated objects* back to the server.

You only require the hookpunch.js script to make this work, but it does depend on [knockout] and 
the knockout mapping plugin.

##Basic Usage

First, include the knockout, knockout mapping and hookpunch.js scripts.

```js
	<script src="js/libs/knockout-2.1.0.js"></script>
	<script src="js/libs/knockout.mapping-latest.debug.js" type="text/javascript"></script>
    <script src="../hookpunch.js/hookpunch.js" type="text/javascript"></script>
    <script src="../hookpunch.js/hookpunch.history.js" type="text/javascript"></script>
    <script src="../hookpunch.js/hookpunch.parentLink.js" type="text/javascript"></script>
    <script src="../hookpunch.js/hookpunch.trackState.js" type="text/javascript"></script>
```

Then, initialise hookpunch.js with the field that you want to track.

```js
	hookpunch.init({ stateField: "state" });
```

Then, create a stateTrackedItem

```js
	var stateTrackedItem = new hookpunch.observable({
        firstName: "Eric",
        lastName: "Cartman",
        state: hookpunch.states.UNCHANGED,
        change: function (item) {
            // fires when an object changes; new objects 
			// will always have a new state.
        },
        revert: function (item) {
			// fires when the object state is reverted to its 
			// original state, not fired for new objects.
        }
    });
```
Then, apply the Knockout.js bindings to the observable

```js
	ko.applyBindings(stateTrackedItem);
```

That should get you going.

###Undo!!!

Undo is now supported and working 100%. Watch out though, it is destructive (ie. changes are rolled back permanently).

*Support is coming soon for redo, which effectively gives us object versions :)*

In a foreach, you can bind the click event for a button to the *undo* function on the `hookpunch.observable`. 

Literally as simple as:

```html
	<a href="#" class="btn btn-primary pull-right" data-bind="click: undo">
```

##Global Events

**hookpunch** allows for hooking into global events that fire when any object is changed or reverted to its original state. 

Here's how it works:

```js
    function itemChanged(item) {
        console.log(item.someProperty() + " was changed");
    }

    function itemReverted(item) {
        console.log(item.someProperty() + " was reverted");
    }

    hookpunch.init({ 
		stateField: "state", 
		globalChange: itemChanged, 
		globalRevert: itemReverted 
	});
```
##History

###How to set it up

History support is now working. You can specify that history should be tracked on objects by setting `history` to `true` in the init options.

```js
    hookpunch.init({
        stateField: "state",
        history: true,
        globalChange: itemChanged,
        globalRevert: itemReverted
    });
```

This will give your `hookpunch.observable` objects a `history` property.

```js
	
	console.dir(myItem.history);

```
