---
layout: default
title: Sequencer Specialization
demoappid: 8456579076771837888
demojs: special
---

This demonstrates how the Sequencer may be specialized to integrate with a specific data model.


Data Model

```javascript
var data = {
    a: {data: 'A', start: 0, end: 1 },
    b: {data: 'B', start: 2, end: 3 },
    c: {data: 'C', start: 4, end: 5 },
    d: {data: 'D', start: 6, end: 7 },
    e: {data: 'E', start: 8, end: 9 },
    f: {data: 'F', start: 10, end: 11 },
    g: {data: 'G', start: 12, end: 13 },
    h: {data: 'H', start: 14, end: 15 },
    i: {data: 'I', start: 16, end: 17 },
    j: {data: 'J', start: 18, end: 19 },
    k: {data: 'K', start: 20, end: 21 },
    l: {data: 'L', start: 22, end: 23 },
    m: {data: 'M', start: 24, end: 25 },
    n: {data: 'N', start: 26, end: 27 },
    o: {data: 'O', start: 28, end: 29 },
    p: {data: 'P', start: 30, end: 31 },
    q: {data: 'Q', start: 32, end: 33 },
    r: {data: 'R', start: 34, end: 35 },
    s: {data: 'S', start: 36, end: 37 },
    t: {data: 'T', start: 38, end: 39 },
    u: {data: 'U', start: 40, end: 41 },
    v: {data: 'V', start: 42, end: 43 },
    w: {data: 'W', start: 44, end: 45 },
    x: {data: 'X', start: 46, end: 47 },
    y: {data: 'Y', start: 48, end: 49 },
    z: {data: 'Z', start: 50, end: 51 } 
};
```

Data Viewer

```javascript
var viewer = function (sequencer, elem) {
    var key = undefined;
    var enter = function (e) {
        key = e.key;
        elem.innerHTML = "<b>" + e.data + "</b>";
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
```


Specialization


```javascript
/* 
    Implement SpecialSequencer for my special data format.
    Timed data is associateive array
*/
var SpecialSequencer = function (timingObject, map) {
    this._map = map;
    Sequencer.call(this, timingObject); // invoke sequencer constructor
};
inherit(SpecialSequencer, Sequencer); // inheritance function supplied by sequencer module

SpecialSequencer.prototype.loadData = function () {
    var obj, r = this.request();
    Object.keys(this._map).forEach(function (key) {
        obj = this._map[key];
        r.addCue(key, new Interval(obj.start, obj.end), obj.data)
    }, this);
    r.submit(); 
};

SpecialSequencer.prototype.getData = function (key) {
    return this._map[key].data;
};
```


Combine

Single line statement (!) to combine timing object, data, sequencer, viewer and UI element.

```javascript
viewer(new SpecialSequencer(to, data), document.getElementById("active"));
```


## Controls
This demo page does not include its own controls for the timing object driving the Sequencer. Instead, open timing object controls [ctrl](examples/ctrl.html) in a different browser tab or window (even on another computer) in order to control playback of timed data. 



## Active data item 
<div style="height:50px">
<span id="position" style="width:150px;float:left"></span><span id="active"></span>
</div>



