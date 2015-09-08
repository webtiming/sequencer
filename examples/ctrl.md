---
layout: default
title: Timing Object Controls
demoappid: 8456579076771837888
demojs: ctrl
---


This Web page provides controls the timing object used in all sequencer demoes. You may also control the timing object from the developer console : 

```javascript
m.update(position, velocity, acceleration);
```

Here are a number of buttons to play with the timing object. In addition to familiar controls, you may increament and decrement position, velocity and acceleration. To the right you will find the current state of the timing object, it's position, velocity and accelereation.

<p id="buttons">
  <!-- absolute -->
  <button id='reset'>Reset</button>
  <button id='pause'>Pause</button>
  <button id='play'>Play</button>
  <button id='end'>End</button>
  <!-- relative-->
  <button id='p-'>Pos-1</button>
  <button id='p+'>Pos+1</button>
  <button id='v-'>Vel-1</button>
  <button id='v+'>Vel+1</button>
  <button id='a-'>Acc-1</button>
  <button id='a+'>Acc+1</button>
  <!-- position -->
  <b><span id='position' style='float:right'></span></b>
</p>