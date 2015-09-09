---
layout: default
title: Basic Sequencing
demoappid: 8456579076771837888
demojs: basic
---

This demonstrates multi-device timed playback of a small set of SequencerCues.

```javascript
// load cues
s.request()
  .addCue("zero", new Interval(0.0, 9.9))
  .addCue("one", new Interval(0.5, 2.1))
  .addCue("two", new Interval(4.4, 5.6))
  .addCue("four", new Interval(3.3, 3.3))
  .addCue("five", new Interval(-Infinity, Infinity))
  .addCue("seven", new Interval(0))
  .addCue("eight", new Interval(3.3, 3.3))
  .submit();
```

### Controls
This demo page does not include its own controls for the timing object driving the Sequencer. Instead, open timing object controls [ctrl](examples/ctrl.html) in a different browser tab or window (even on another computer) in order to control playback of timed data. 


For example, run the timing object back and forth between 0.0 and 10.0 to see the event log and timed changes to active keys.
The demo page may safely be reloaded during playback. Also make sure to open the page on multiple devices to verify multi-device synchronization. 

### Active keys
The shows active keys at any time

<span id="position" style="width:150px;float:left"></span><span id="active"></span>

### Sequencer Events
Detailed event information is logged here, formatted as follows :

[point] key interval verbType directionType pointType delay

See [SequencerEArg](../docs.html#earg) for detailed information.

<ul id="log"></ul>
