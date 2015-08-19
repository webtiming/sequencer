---
layout: default
title: API
---
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

### Sequencer Module

## Resources
- sequencer.js : sequencer logic and module definition. 
- interval.js : datatype : Interval, the sequencer works on Intervals
- axis.js : datastructure for efficient ordering and lookup of Intervals
- sortedarraybinary.js : datastructure : efficient ordering and lookup of floats
- multimap.js : datastructure : (key,value) map supporting multiple values on single key
- timeoututils.js : timeout mechanism, improving setTimeout() by wrapping it.
- arraysequencer.js : sequencer specializiation for timed data in static array

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

Intervals are expressed by two floating point values [low, high] (low <= high). Infinity or -Infinity may be used to create un-bounded Intervals, e.g. [low, Infinity) or (-Infinity, high]. If low and high are equal, the Interval is said to be singular.

Intervals may or may not include its endpoints; [a,b], [a,b>, <b,a], <a,b>. This is defined by optional boolean flags lowInclude and highInclude. If lowInclude and highInclude are omitted, [a,b> is the default setting. When multiple Intervals have the same endpoint, enpoint flags influence event ordering - see Sequencer precedence. The Sequencer implementation also depends internally on this feature for correctness.

Interval objects are immutable.

#### Constructor
Returns an Interval object.
```js
var i = new Interval(low, high, lowInclude, highInclude);
```
- param: {float} [low] value of lower endpoint of interval 
- param: {float} [high] value of higher endpoint of interval
- param: optional {boolean} [lowInclude] lower endpoint included in interval : default true
- param: optional {boolean} [highInclude] higher endpoint included in interval : default false

#### Properties
```js
var low = i.low,
    high = i.high,
    lowInclude = i.lowInclude,
    highInclude = i.highInclude,
    length = i.length;
```

#### .toString
Returns a string representation of the interval
```js
console.log(i.toString());
```
#### .isSingular
Returns true if (low === high) 
```js
if (i.isSingular()) {}
```


## Sequencer

The Sequencer works on a collection of cues. A cue is essentially an association between a key and an Interval, where key is a unique (string) - can only be associated with one Interval. The sequencer outputs enter and exit events at the correct time, according to motion and temporal aspects defined by Interval. Events include cue information. The Sequencer API and function is similar to the HTMLTrackElement, yet represent a significant improvement.


#### Constructor
Returns a Sequencer object. There is no need to start the Sequencer. Execution is driven by the given motion, and the Sequencer is operational when the constructed finalizes. 
```js
var s = new Sequencer(motion);
```
- param: {object} [motion] The motion that drives the execution of the Sequencer. Motion object implements Shared Motion API. 

#### .addCue
Associate a unique key with and Interval. The keyspace is designed by the programmer. In this regard, the Sequencer is essentially an associative array for Interval objects. Often, application specific datamodels include unique keys of some sort, so these may be used directly with the sequencer. Keys are reported back to application code by correctly timed Sequencer events. Intervals define the validity of keys. A key is valid inside the Interval and invalid outside the Interval. So, when the current position of motion is within an Interval, the associated key is said to be active.

.addCue will replace any previous association for given key. Since Intervals are immutable objects, modification of a cue must be be done by generating a new Interval and replacing the association using .addCue    

```js
s.addCue(key, interval);
```
- param: {string} [key] unique key identifying an Interval.  
- param: {Interval} [interval] defines the validity of the associated key. 


#### .removeCue
Removes existing association (if any) between key and Interval.
```js
s.removeCue(key);
```
- param: {string} [key] unique key identifying an Interval.  


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


