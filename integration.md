---
layout: default
title: Integration
---

The Sequencer is in itself *data-agnostic* and *UI-agnostic*. This implies that integration with a specific data source and a specific UI is left to the programmer.


## Sequencer Data Integration

The Sequencer is data agnostic and can therefore be used by any application-specific data model, provided only that application data can be associated with unique keys, and that temporal aspects can be expressed in terms of  Intervals (or singular points).

The Sequencer can always be used directly. However, it may also be specialized for a specific data model. In short, if you want sequencer events to include objects from the data model in the .data property, specialization lets you do this. Sequencer specialization is implemented through inheritance. To do this, a subclass only needs to implement two methods.

#### .loadData()

This method is called by the Sequencer constructor and allows the programmer to load cues from an application specific data model and register them with the sequencer. If the datamodel is dynamic, this is the place to set up event handlers so that the Sequencer may adapt to future changes in the data model.

#### .getData(key)
- param {string} [key] unique key

This method is used by the Sequencer internally whenever it needs to resolve the mapping from key to object in data model. The sequencer uses this so that it can make objects from the data model available in "enter" and "exit" events - under the eArg objects or Cue objects under the data property.

### Template Sequencer Specialization

The Sequencer is data agnostic, but may easily be integrated with a particular application specific data model.

```js
var SpecialSequencer = function (motion, datamodel) {
    this.datamodel = datamodel;
	Sequencer.call(this, motion);
};
inherit(SpecialSequencer, Sequencer);

SpecialSequencer.prototype.loadData = function () {
    // load data from datamodel - feed into sequence
};

SpecialSequencer.prototype.getData = function (key) {
    // resolve data from datamodel using key
	return data;
};

```

The Sequencer module (see above) provides the utility function *inherit* for making sure the inheritance is correctly implemented. The implementation is a commonly used pattern for inheritance in JavaScript. 

```js
var inherit = function (Child, Parent) {
    // empty object to break prototype chain - stop child prototype changes affecting parent
	var F = function () {}; 
	F.prototype = Parent.prototype;
	Child.prototype = new F(); // child gets parents prototypes via F
	Child.prototype.constructor = Child; // resetting constructor pointer 
};
```

### Example ArraySequencer

ArraySequencer works on an array of timed data which is not assumed to be modified. The implementation uses array index as unique key in Sequencer, and "start" and "end" properties of elements in array are used to create intervals. 

```js

/* Timed data */
var array = [
    { data: 'A', start: 0, end: 1 },
    { data: 'B', start: 2, end: 3 },
    { data: 'C', start: 4, end: 5 },
    { data: 'D', start: 6, end: 7 },
    { data: 'E', start: 8, end: 9 },
    { data: 'F', start: 10, end: 11 },
    { data: 'G', start: 12, end: 13 },
    { data: 'H', start: 14, end: 15 },
    { data: 'I', start: 16, end: 17 },
    { data: 'J', start: 18, end: 19 },
    { data: 'K', start: 20, end: 21 },
    { data: 'L', start: 22, end: 23 },
    { data: 'M', start: 24, end: 25 },
    { data: 'N', start: 26, end: 27 },
    { data: 'O', start: 28, end: 29 },
    { data: 'P', start: 30, end: 31 },
    { data: 'Q', start: 32, end: 33 },
    { data: 'R', start: 34, end: 35 },
    { data: 'S', start: 36, end: 37 },
    { data: 'T', start: 38, end: 39 },
    { data: 'U', start: 40, end: 41 },
    { data: 'V', start: 42, end: 43 },
    { data: 'W', start: 44, end: 45 },
    { data: 'X', start: 46, end: 47 },
    { data: 'Y', start: 48, end: 49 },
    { data: 'Z', start: 50, end: 51 } 
];

var ArraySequencer = function (motion, array) {
	this.array = array;
	Sequencer.call(this, motion);
};
inherit(ArraySequencer, Sequencer);

ArraySequencer.prototype.loadData = function () {
	if (this.array.length === 0) return;
	var r = this.request();
	for (var i=0; i<this.array.length; i++) {
		r.addCue(i.toString(), new Interval(this.array[i].start, this.array[i].end));
	}
	r.submit();
};

ArraySequencer.prototype.getData = function (key) {
	return this.array[parseInt(key)];
};

```

### Example Sequencer UI Integration

The Sequencer may control UI if "enter" and "exit" events implement approapriate effects in the DOM. The following example shows how a timing sensitive viewer can easily be built by virtue of connecting a Sequencer to a DOM element. This allows active cues to be written and removed to/from the DOM at the correct time.

```js
/*
    Simple viewer limited to presenting only a single active cue at the time. 
    In the case of multiple concurrent active cues, 
    only the last one to become active will be presented.
*/
var viewer = function (sequencer, elem) {
    var key = undefined;
    var enter = function (e) {
        key = e.key;
        elem.innerHTML = JSON.stringify(e.data);
        console.log(e.toString());
    };
    var exit = function (e) {
        if (e.key === key) {
            elem.innerHTML = "";
            key = undefined;
        }
        console.log(e.toString());
    };
    sequencer.on("enter", enter);
    sequencer.on("change", enter);
    sequencer.on("exit", exit);
};
viewer(s, document.getElementById("viewer"));
```

