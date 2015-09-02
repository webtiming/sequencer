---
layout: default
title: Interval
---



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