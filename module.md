---
layout: default
title: Sequencer Module
---

This module defines the Sequencer along with a few associated resources. The module is implemented as plain JavaScript and packaged as a [requirejs](http://requirejs.org/) module.


```javascript
var mod = require("./sequencer");   // import sequencer module
var Sequencer = mod.Sequencer;      // shortcut to Sequencer constructor
var Interval = mod.Interval;        // shortcut to Interval constructor
var inherit = mod.inherit;          // utility function for extending Sequencer
```

<!--
{% highlight javascript linenos %}
var mod = require("./sequencer");   // import sequencer module
var Sequencer = mod.Sequencer;      // shortcut to Sequencer constructor
var Interval = mod.Interval;        // shortcut to Interval constructor
var inherit = mod.inherit;          // utility function for extending Sequencer
{% endhighlight %}
-->

## Dependencies
The Sequencer depends on [Shared Motion](http://motioncorporation.com), a JavaScript implementation of the [HTMLTimingObject](http://webtiming.github.io/timingobject), provided by the [Motion Corporation](http://motioncorporation.com). Shared Motion comes with built-in support for online synchronization. The Sequencer will serve as reference implementation for sequencing logic integrated with the HTMLTimingObject. Both the Sequencer and Shared Motion are plain JavaScript and should run in every modern Web browser.




