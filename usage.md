---
layout: default
title: Usage
---

The Sequencer is useful for constructing timed presentations in a Web page. In particular, as the Sequencer integrates with the [TimingObject](http://webtiming.github.io/timingobject), the resulting presentation may be synchronized precisely with other timed components anywhere in the world. 

1. [Create a Sequencer](#create)
2. [Load timed data](#load)
3. [Develop UI](#ui)
4. [Start presentation](#control)

Finally, it is documented how the Sequencer may be integrated with a specific data model by means of [Sequencer specialization](#specialization).

<a name="create"></a>
## Create Sequencer
Before a Sequencer may be created a [TimingObject](http://webtiming.github.io/timingobject) must be loaded into the Web page. The TimingObject may become part of the future HTML standard, however, in the mean time a temporary implementation is provided by [Motion Corporation](http://motioncorporation.com). In this example we will use a timing object that is globally shared. In order to define your own timing objects, register as a developer with Motion Corporation and create your own [Motion apps](http://dev.mcorp.no).

The Sequencer module is available packaged for regular script inclusion as well as an [AMD](http://requirejs.org/) module for use with requirejs, see [helloworld](examples.html#helloworld) and [helloworld-require](examples.html#helloworld-require) for full examples. In the following example we use regular script includes for loading both the timing object (i.e. Shared Motion) and the SEQUENCER module.


Create index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <script text="javascript" src="http://mcorp.no/lib/mcorp-2.0.js"></script>
    <script text="javascript" src="/lib/sequencer.js"></script>
    <script text="javascript">
      var app = MCorp.app("mcorp_app_id", {anon:true});
      app.run = function () {
        var timingObject = app.motions['mcorp_name_of_motion'];
        var s = new SEQUENCER.Sequencer(timingObject);
        // timing object ready and sequencer created
        // kick off application logic from here
      };
      if (document.readyState === "complete") app.init();
      else window.onload = app.init;
    </script>
  </head>
  <body>
  </body>
</html>
```


<a name="load"></a>
## Load Timed Data

Loading timed data into the Sequencer involves extracting the timing information from the data, and representing this as Intervals.

```javascript
// Timed data
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

// Load timed data, use array indexes as keys into Sequencer
for (var i=0; i<array.length; i++) {
    var obj = array[i];
    s.addCue(i.toString(), new Interval(obj.start, obj.end));
}
```

<a name="ui"></a>
## Develop UI

To implement a timed Web presentation using the Sequencer, simply translate "enter" and "exit" events into approapriate effects in the DOM. The following example shows how a timing sensitive data viewer can easily be built by virtue of connecting a Sequencer to a DOM element. The Sequencer effectively takes care of adding active cues to the DOM, and removing inactive cues from the DOM, always at the correct time.

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
    sequencer.on("exit", exit);
};
viewer(s, document.getElementById("viewer"));
```


<a name="control"></a>
## Start presentation

Having loaded data into the Sequencer and defined the UI, the Sequencer is already operational. However, the Sequencer itself does not provide any playback controls. Instead it is simply a slave to a timing object. So, in order to start playback, pause the presentation, or control it in other ways, use the timing object. 

The timing object may be controlled manually from the developer console (assign it to a global variable). Alternatively, controls may be added to the Web page. Below is an example of how play and pause buttons may be connected to the timing object.

Finally, if the timing object is connected to an online timing resource, it may be controlled from other Web pages. It may be a good idea to make a new Web page as a dedicated control interface for the timing object, and the timed Web presentation by implication.

```html
<body>
    <button id="play">Play/Resume</button>
    <button id="pause">Pause</button>
    <button id="reset">Reset</button>
</body>
```

```javascript
document.getElementById('play').onclick = function () {timingObject.update(null, 1.0, 0.0);};
document.getElementById('pause').onclick = function () {timingObject.update(null, 0.0, 0.0);};
document.getElementById('reset').onclick = function () {timingObject.update(0.0, 0.0, 0.0);};
```


<a name="specialization"></a>
## Sequencer Specialization

The Sequencer is by default data agnostic and can therefore be used by any application-specific data model. However in some cases it may be useful to integrate the Sequencer with a specific data model. In particular, if the programmer would like Sequencer events to include objects from the data model (instead of just keys), [Sequencer specialization](#specialization) supports this. Sequencer specialization is implemented through inheritance. Sequencer specialization only requires implementation of two methods. A complete example is provided in [special](examples/special.html).

#### .loadData()

This method is called by the Sequencer constructor and allows the programmer to load (key,Interval) associations from an application specific data model into the Sequencer. If the data model is dynamic, this is the place to set up event handlers so that the Sequencer may adapt to future changes in the data model.

#### .getData(key)
- param {string} [key] unique key

This method is used by the Sequencer internally whenever it needs to resolve the mapping from key to object in data model. The Sequencer uses this so that it can make objects from the data model available in "enter" and "exit" events - under data property of [SequencerEArg](docs.html#earg) or [SequencerCue](docs.html#cue) objects.


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


// Usage - one code line - create ArraySequencer and connect to UI
viewer(new ArraySequencer(timingObject, array), document.getElementById("viewer"));

```

