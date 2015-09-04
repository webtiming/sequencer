<!--
  Copyright 2015 Norut Northern Research Institute
  Author : Ingar Mæhlum Arntzen

  This file is part of the Sequencer module.

  The Sequencer is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  The Sequencer is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with the Sequencer.  If not, see <http://www.gnu.org/licenses/>.
-->




# Sequencer Module

## Dependencies
The Sequencer depends on motions implementing the Shared Motion API defined in MediaScape. Online motions are provided by Motion Corporation motioncorporation.com.

## Files
- sequencer.js : sequencer logic and module definition. 
- interval.js : datatype : Interval, the sequencer works on Intervals
- axis.js : datastructure for efficient ordering and lookup of Intervals
- sortedarraybinary.js : datastructure : efficient ordering and lookup of floats
- multimap.js : datastructure : (key,value) map supporting multiple values on single key
- motionutils.js : utility methods for correct time calculations
- timeoututils.js : timeout mechanism, improving setTimeout() by wrapping it.

## Sequencer Module
The sequencer module defines a Sequencer object and an Interval object. The Sequencer works on Intervals. Additionally, an inherit function is available, allowing the Sequencer to be specialized through inheritance.

```js
var mod = require('mediascape.Sequencer');
var Sequencer = mod.Sequencer;
var Interval = mod.Interval;
var inherit = mod.inherit;
var SequencerError = mod.SequencerError;
```

## Interval
The Sequencer works on Interval objects.

Intervals are expressed by two floating point values [low, high] (low \<= high). Infinity or -Infinity may be used to create un-bounded Intervals, e.g. [low, Infinity) or (-Infinity, high]. If low and high are equal, the Interval is said to be singular.

Intervals may or may not include its endpoints; [a,b], [a,b>, \<b,a], \<a,b>. This is defined by optional boolean flags lowInclude and highInclude. If lowInclude and highInclude are omitted, [a,b> is the default setting. When multiple Intervals have the same endpoint, these endpoint flags influence event ordering - see *event ordering*. The Sequencer implementation also depends on this feature internally for correctness.

Interval objects are immutable.

### Constructor
```js
var i = new Interval(low, high, lowInclude, highInclude);
```
- param: {float} [low] value of lower endpoint of interval 
- param: {float} [high] value of higher endpoint of interval
- param: optional {boolean} [lowInclude] lower endpoint included in interval : default true
- param: optional {boolean} [highInclude] higher endpoint included in interval : default false
- returns : {Interval} Interval object

### Properties
```js
var low = i.low,
    high = i.high,
    lowInclude = i.lowInclude,
    highInclude = i.highInclude,
    length = i.length;
```

### Methods

#### .toString()
- returns: {string} string representation of the interval

```js
console.log(i.toString());
```
#### .isSingular()
- returns: {boolean} true if (low === high) 
```js
if (i.isSingular()) {}
```

#### .coversPoint(point)
- param: {float} [point]
- returns: {boolean} true if point is within interval

#### .coversInterval(otherInterval)
- param: {Interval} [otherInterval] another Interval
- returns: {boolean} true if interval covers all points covered by other interval

#### .overlapsInterval(otherInterval)
- param: {Interval} [otherInterval] another Interval
- returns: {boolean} true if interval covers at least one point also covered by other interval

## Cue
Cue is a simple datatype used by the Sequencer for query responses and event callback parameters. 
A cue is essentially an association between a key (string) and an Interval. It is representated as a simple object. The property *data* is only used by Sequencer specializations (see below). 
```js
var cue = {
    key : {string}, //unique key
    interval : {Interval}, //interval 
    data : {object} // data - only used by Sequencer specializations
};
```

### EArg
*EArg* is a simple datatype used by the Sequencer as argument for event callbacks. *EArg* is a *Cue* but includes additional properties relevant for specific event types. 
```js
var eArg = {
    key : {string}, //unique key
    interval : {Interval}, //interval 
    data : {object}, // data - only used by Sequencer specializations
    // additional
    src: {Sequencer}, // reference to sequencer intance emitting the event
    point : {float}, // position of motion when event was triggered
    pointType : {string}, // how point relates to the interval {"low"|"high"|"inside"|"outside"|"singular"}
    dueTs : {float}, // timestamp when the event should ideally be emitted
    delay : {float}, // lateness relative to dueTs
    directionType : {string}, // direction of motion at point {"backwards"|"forwards"|"nodirection"}
    verbType : {string} // {"enter"|"exit"}
};

```


## Sequencer

The Sequencer works on a collection of cues. A cue is essentially an association between a key and an Interval, where key is a unique string, thus it can only be associated with one Interval. The sequencer main function is to output enter and exit events at the correct time, as motion enters and exits intervals. The Sequencer API and function is similar to the HTMLTrackElement, yet represent a significant improvement.

### Constructor
Returns a Sequencer object. There is no need to start the Sequencer. Execution is driven by the given motion, and the Sequencer is operational when the constructed finalizes. 
```js
var s = new Sequencer(motion);
```
- param: {object} [motion] The motion that drives the execution of the Sequencer. Motion object implements Shared Motion API. 

### Operations

#### .addCue(key, interval)
- param: {string} [key] unique key identifying an Interval.  
- param: {Interval} [interval] defining the validity of the associated key. 
- returns : {undefined}

Associate a unique key with an Interval. The keyspace is designed by the programmer. In this regard, the Sequencer is essentially an associative array for Interval objects. Often, application specific datamodels include unique keys of some sort, and these may be used directly with the sequencer. These application specific keys are then reported back to application code by correctly timed Sequencer events. Intervals define when keys are *active*. So, when the current position of motion enters an Interval, the associated key becomes *active*.

addCue() will replace any previous association for given key. Since Intervals are immutable objects, modification of a cue must be be done by generating a new Interval and replacing the association using .addCue() with the same key.

```js
s.addCue(key, new Interval(12.1, 24.22));
```

#### .removeCue(key, removedData)
- param: {string} [key] unique key identifying an Interval.
- param: optional: {object} [removeData] data associated with cue that is to be removed

Removes existing association (if any) between key and Interval.

The removeData parameter is only useful in context of Sequencer specialization (see below). If some data item has been removed from a datamodel, the removed item can still be provided in "exit" events from the Sequencer.

```js
s.removeCue("key1");
```

#### .request().submit()
Using the builder pattern .addCue() and .removeCue() operations may be batched and processed together. This allows related operations to be performed together by the Sequencer. Resulting events will also be batched, reducing the number of event callbacks and allowing application code to make decision on the level of event-batches, as opposed to individual events. 

- returns {object} request object, where Sequencer operations can be registered and submitted.

```js
var r = s.request()
    .addCue("key1", new Interval(23.56, 27.8))
    .addCue("key2", new Interval(27.8, Infinity))
    .removeCue("key3")
    .submit();
```

### Queries

The Sequencer supports a number of queries on its collection of cues.

#### keys()
- returns: {list} list of keys of all cues

```js
s.keys().forEach(function (key){});
```


#### .hasCue(key)
- param: {string} [key] unique key identifying an Interval.
- returns: {boolean} True if cue exists for key

```js
if (s.hasCue("key1")) {}
```


#### .getCues()
- returns: {list} list of all cues

```js
s.getCues().forEach(function (cue){});
```

#### .getCue(key)
- param: {string} [key] unique key identifying an Interval.
- returns: {object} cue if exists for key else null

```js
var cue = s.getCue("key1");
```

### Active Cues

The Sequencer maintains a list of *active* cues. A cue is *active* if cue.interval.low \<= motion.position \<= cue.interval.high. In other words, if the motion is inside the Interval of a cue, that cue is said to be active. More generally, for timed media, the union of *active* cues may define the state of media, at any given point in time. 

#### .getActiveKeys()
- returns: {list} list of keys of active cues

```js
s.getActiveKeys().forEach(function(key){});
```

#### .getActiveCues()
- returns: {list} of activ cues

```js
s.getActiveCues().forEach(function(cue){});
```

#### .isActive(key)
- param: {string} [key] unique key identifying an Interval.
- returns: {boolean} true if cue identified by key is found within active cues

```js
if (s.isActive("key1") {};
```

### Search

The Sequencer allows it's collection of cues to be searched effectively.

#### .getCuesByPoint(searchPoint)
- param: {float} [searchPoint] return all cues, where cue interval cover given search point.
- returns: {list} list of cues

```js
s.getCuesByPoint(4.0).forEach(function(cue){});
```

#### .getCuesByInterval(searchInterval)
- param: {Interval} [searchInterval] search interval
- returns: {list} list of all cues, where cue interval overlaps with given search interval.

```js
s.getCuesByInterval(new Interval(4.0, 8.0)).forEach(function(cue){});
```
#### .getCuesCoveredByInterval(searchInterval)
- param: {Interval} [searchInterval] search interval
- returns: {list} list of all cues, where cue interval is covered by given search interval.

```js
s.getCuesCoveredByInterval(new Interval(4.0, 8.0)).forEach(function(cue){});
```

### Events

The Sequencer supports four event types; *"enter"*, *"exit"*, *"events"*, *"change"*. "Enter" and "exit" correspond to motion entering or exiting a specific cue. "Events" delivers a batch (list) of events and may include both "enter" and "exit" events. The programmer should likely choose to handle events in batch mode using "events" callback, or handle events individually using "enter" and "exit" events. 

Event types "enter", "exit" and "events" all relate to changes to *active cues*. In constrast, "change" events report modifications to cues which do NOT cause any changes to *active cues*. In other words, the cue was modified, but remained *active* or remained *inactive*. 

Intervals that are singular points will still emit both "enter" and "exit" events during playback. If motion is paused precisely within a singular Interval, only the "enter" event is emitted, just like non-singular Interval. The "exit" event will be emitted the position is changed.

#### EventHandler(e)
- param: {EArgs|Cue} [e] event argument.
An event handlers is a function that take one parameter type EArg or Cue (depending on event type).

```js
var handler = function (e) {};
```
Events "enter", "exit" and "events" provide *EArg* as event parameter, whereas event "change" provides *Cue* as event parameter.

#### .on(type, handler, context)
- param: {string} [type] event type
- param: {function} [handler] event handler
- param: optional {object} [context] *this* === context in event handler, if contex is provided, else *this* === Sequencer instance.

```js
this.handler = function (e) {};
// register callback
s.on("enter", this.handler, this)

// callback invocation from sequencer
handler.call(context, e)
```

#### .off(type, handler)
- param: {string} [type] event type
- param: {function} [handler] event handler
Remove handler from Sequencer. 

#### Immediate Events
The classical pattern for using events typically involves two steps
- get the current state
- register event handlers for listening to subsequent changes to current state

The Sequencer simplifies this process for the programmer by delivering current state (*active cues*) as events on handler callback, *immediately after* an event handler is registered, but before any subsequent events. So, registering a handler or event types "enter" or "events" will cause a batch of immediate "enter" events corresponding to *active cues*. This is equivalent to current state being empty initially, but then changing quickly. This implies that current state based on *active cues* can always be built the same way, through a single event handler. *immediately after* here means that the events will be dispatched to the JaveScript task queue during .on() call.  


#### Event delay
Note that event delay is not a direct measure of the timeliness of the Sequencer. This is because dueTs is derived from the timestamp of the motion. In particular, whenever an online motion is updated, the effects will suffer network delay before clients (Sequencers) are notified. The Sequencer is aware of the distributed nature of motion, and takes such delays into account. In short, the Sequencer replays events that should ideally have been emitted earlier, were it not for the network delay. So, dueTs is the time when the event would have been emitted if network delay was zero. This behavior of the Sequencer also ensures consistent behaviour between distributed Sequencers (provided that they are working on the same collection of timed data). 

#### Event ordering.

If multiple Intervals are bound to the same endpoint, multiple events will be emitted according to the following ordering, given that direction of motion is forwards. If direction of motion is backwards, the ordering is reversed.

- > exit non-singular Interval with > exit-endpoint
- [ enter non-singular Interval with [ enter-endpoint
- [ enter singular Interval
- ] exit singular Interval
- ] exit non-singular Interval with ] exit-endpoint
- \< enter non-singular Intervals with \< enter-endpoint



### Example
```js
// register cues
var s = new Sequencer(motion);
s.addCue("key1", new Interval(1.0, 2.4));
s.removeCue("key2");

// attach handler
var handler = function (e) {
  console.log(e.toString());
}; 
s.on("enter", handler);
s.on("exit", handler);

// ready - control by updating motion
```




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
