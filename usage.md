---
layout: default
title: Usage
---

The Sequencer is useful for constructing timed presentations in a Web page. This documents the typical steps involved.  

1. [Create a Sequencer](#create) in a Web page
2. [Load timed data](#load) into a Sequencer
3. [Develop UI](#ui) for Sequencer.

In addition, we document how to integrate the Sequencer with a specific data model, by means of Sequencer [specialization](#specialization).

<a name="create"></a>
## Create a Sequencer


<a name="load"></a>
## Load Timed Data


<a name="ui"></a>
## Develop UI

The Sequencer may be used to implement a timed Web presentation, simply by translating "enter" and "exit" events into approapriate effects in the DOM. The following example shows how a timing sensitive data viewer can easily be built by virtue of connecting a Sequencer to a DOM element. The Sequencer effectively takes care of adding active cues to the DOM, and removing inactive cues from the DOM, always at the correct time.

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





<a name="specialization"></a>
## Sequencer Specialization

The Sequencer is by default data agnostic and can therefore be used by any application-specific data model. However in some cases it may be useful to integrate the Sequencer with a specific data model. In particular, if the programmer would like Sequencer events to include objects from the data model (instead of just keys), [Sequencer specialization](#specialization) supports this. Sequencer specialization is implemented through inheritance. Sequencer specialization only requires implementation of two methods.

#### .loadData()

This method is called by the Sequencer constructor and allows the programmer to load (key,Interval) associations from an application specific data model into the Sequencer. If the data model is dynamic, this is the place to set up event handlers so that the Sequencer may adapt to future changes in the data model.

#### .getData(key)
- param {string} [key] unique key

This method is used by the Sequencer internally whenever it needs to resolve the mapping from key to object in data model. The Sequencer uses this so that it can make objects from the data model available in "enter" and "exit" events - under data property of [SequencerEArg](/sequencer/docs.html#earg) or [SequencerCue](/sequencer/docs.html#cue) objects.


### Template Sequencer Specialization

The Sequencer is data agnostic, but may easily be integrated with a particular application specific data model.

```js
var SpecialSequencer = function (timingObject, datamodel) {
    this.datamodel = datamodel;
	Sequencer.call(this, timingObject);
};
inherit(SpecialSequencer, Sequencer);

SpecialSequencer.prototype.loadData = function () {
    // load data from datamodel - feed into sequencer
};

SpecialSequencer.prototype.getData = function (key) {
    // resolve data from datamodel using key
	return data;
};

```

The [Sequencer module](/sequencer/docs#module) provides a utility function *inherit* for making sure the inheritance is correctly implemented. The implementation is a commonly used pattern for inheritance in JavaScript. 

```js
var inherit = function (Child, Parent) {
	var F = function () {}; 
	F.prototype = Parent.prototype;
	Child.prototype = new F(); 
	Child.prototype.constructor = Child; 
};
```

### Example ArraySequencer

ArraySequencer is a [specialized Sequencer](#specialized) integrated with an array of timed data. The array is not assumed to be modified. The implementation uses the array index as unique key into Sequencer, and use "start" and "end" properties of array elements in order to create Intervals. 

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

var ArraySequencer = function (timingObject, array) {
	this.array = array;
	Sequencer.call(this, timingObject);
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



