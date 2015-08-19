---
layout: default
title: Sequencer Module
---

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