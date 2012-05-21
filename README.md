hookpunch.js
============

**hookpunch.js** adds *state tracking*, *undo funtionality* and a link to the parent object to observable Knockout.js objects. ~~It also provides helper functions for filtering out only the objects that have changed from observableCollections.~~ (not yet, coming soon!).

I reckon that this library will help developers who build rich web applications that are light on traffic (you can send back only changed objects) and heavy on functionality (you can now undo changes made to view models, soon you will be able to roll back to a specified version of a view model).

You only require the hookpunch.js scripts to make this work, but it does depend on [knockout] and the knockout mapping plugin. I split the functionality into different files because it feel cleaner and makes more sense to me that way. 

*Run the build.bat file in the Build folder to output the latest version as a debug and minified build to the lib folder.* A closurecmd tool is included in the build folder which requires the .NET framework to run. It hits the Google Closure compiler service to minify the script. The project page for this handy little tool is at http://mightystassen.github.com/closurecmd/

##Basic Usage

First, include the knockout, knockout mapping and hookpunch.js scripts.

```js
	<script src="js/libs/knockout-2.1.0.js"></script>
	<script src="js/libs/knockout.mapping-latest.debug.js" type="text/javascript"></script>
    <script src="../hookpunch.js/hookpunch.min.js" type="text/javascript"></script>
```

Then, initialise hookpunch.js with the field that you want to track.

```js
	hookpunch.init({ stateField: "state" });
```

Then, create a *hookpunch* observable

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

##Undo Support!!!

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

There are loads of features planned, watch this space.