---
layout: default
title: Sequencer
---




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

### Cue
Cue is a simple datatype used by the Sequencer for query responses and event callback parameters. 
A cue is essentially an association between a key (string) and an Interval. It is representated as a simple object. The property *data* is only used by Sequencer specializations (see below). 
```js
var cue = {
    key : {string}, //unique key
    interval : {Interval}, //interval 
    data : {object} // data - only used by Sequencer specializations
};
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


#### EArg
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


## Example
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
