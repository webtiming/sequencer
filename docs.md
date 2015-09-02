---
layout: default
title: Documentation
---

## Introduction

The Sequencer is essentially a special kind of dictionary (associative array), where string keys map to [Interval](#interval) objects. Interval simply represents the concept of a mathematical interval, such as [12.75, 13.1>, or singular points [3.02]. 

The core idea is that programmers express temporal validity of objects by associating them with Intervals. For instance, a subtitle may be associated with [12.1, 17.44] indicating validity in reference to some media timeline. Furthermore, in order to decouple the Sequencer from the data model, Intervals are not associated directly with data objects, but indirectly through some unique identifier. For instance, programmers may use identifiers from an application specific data model as keys into the Sequencer.

> the Sequencer manages a collection of (key,Interval) associations, where *Intervals* define the temporal validity of *keys*. 
> A (key,value) association is also known as a [Cue](#cue).

The sequencer uses a [TimingObject](http://webtiming.github.io/timingobject) as timing source. The main function of the Sequencer is to emit [enter](#enter) and [exit](#exit) events at the correct time, as the [TimingObject](http://webtiming.github.io/timingobject) enters and exits Intervals. The Sequencer API has similarities to the [TrackElement](http://www.html5rocks.com/en/tutorials/track/basics/) API.

<a name="toc"></a>
## Table of contents

This documentation includes the following sections:

- [Sequencer Module](#module)
- [Interval](#interval)
- [SequencerError](#error)
- [SequencerCue](#cue)
- [SequencerEArg](#earg)
- [Sequencer](#sequencer)



<a name="module"></a> 
## Sequencer Module

The sequencer module provides constructor functions for [Sequencer](#sequencer) and [Interval](#interval). The module is implemented as plain JavaScript and packaged as an [AMD](http://requirejs.org/) module.


```javascript
var mod = require("./sequencer");   // import sequencer module
var Sequencer = mod.Sequencer;      // Sequencer constructor function
var Interval = mod.Interval;        // Interval constructor function
var inherit = mod.inherit;          // utility function for extending Sequencer
```

The sequencer module depends on [Shared Motion](http://motioncorporation.com), a JavaScript implementation of the [HTMLTimingObject](http://webtiming.github.io/timingobject), provided by the [Motion Corporation](http://motioncorporation.com). Shared Motion comes with built-in support for online synchronization. The Sequencer will serve as reference implementation for sequencing logic integrated with the HTMLTimingObject. Both the Sequencer and Shared Motion are plain JavaScript and should run in every modern Web browser.



<a name="interval"></a>
## Interval

An [Interval](#interval) is expressed by two floating point values <code>low, high</code>, where <code>low <= high</code>. <code>-Infinity</code> or <code>Infinity</code> may be used to create un-bounded Intervals, e.g. <code>[low, Infinity)</code> or <code>(-Infinity, high]</code>. If <code>low === high</code> the Interval is said to represent a singular point <code>[low]</code>.

Intervals may or may not include its endpoints; <code>[a,b], [a,b>, \<b,a], \<a,b></code>. This is defined by optional boolean flags <code>lowInclude</code> and <code>highInclude</code>. If <code>lowInclude</code> and <code>highInclude</code> are omitted, <code>[a,b></code> is the default setting. When multiple Intervals have the same endpoint, these endpoint flags influence [event ordering](#event ordering). The Sequencer implementation also depends on this feature internally for correctness.

Interval objects are immutable.

### Interval: Constructor

```javascript
var i = new Interval(low, high, lowInclude, highInclude);
```
- param: {float} [low] value of lower endpoint of interval 
- param: {float} [high] value of higher endpoint of interval
- param: optional {boolean} [lowInclude] lower endpoint included in interval : default true
- param: optional {boolean} [highInclude] higher endpoint included in interval : default false
- returns : {Interval} Interval object

### Interval: Properties
```js
var low = i.low,
    high = i.high,
    lowInclude = i.lowInclude,
    highInclude = i.highInclude,
    length = i.length;
```

### Interval: Methods

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


<a name="error"></a>
## SequencerError


<a name="cue"></a>
## SequencerCue

[SequencerCue](#cue) is a simple datatype used by [Sequencer](#sequencer) for query responses (and in some cases as parameter to event callback parameters). A SequencerCue is essentially an association between a key (string) and an [Interval](#interval). It is representated as a simple JavaScript object. The property *data* is only used in context of [sequencer specialization](#specialization). 

```javascript
var cue = {
    key : "string",                  // unique string key
    interval : new Interval(12,13),  // interval object
    data : {}                        // javascript object - only used in context of sequencer specialization
};
```



