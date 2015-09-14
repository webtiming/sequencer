---
layout: default
title: Overview
---

## Introduction
This page gives a wider overview of the Sequencer concept, including term definitions, related work, design goals, scope/limitation, importance/applicability/usage and future work.

## Media Model

- **Timeline** A timeline is simply the set of floating point numbers p where min \<= p \<= max. min and max are floating point numbers and may take on values -Infinity or Infinity. Values on the timeline are usually associated with a unit, such as seconds, frame counter or slide number.

- **Timing object** Defines a timeline and movement of a point along this timeline. Point *not moving* (i.e. standing still or paused) is considered a special case of movement. The timing object supports continuous movements (expressed through velocity and acceleration) as well as discrete jumps on the timeline. A discrete jumps from A to B here implies that no time was spent on the transition and that no point p between A and B was visited.

- **Timed data** Objects, whose validity is defined in reference to a timeline. For instance, the validity of subtitles are typically defined in reference to a media timeline. Points and intervals on the timeline is a common way of defining object validity, but not the only way. Timed scripts are a special case of timed data where objects represent operations or commands to be executed.

- **Sequencing** The process of translating timed data or a timed script into timed execution.

- **Timed Media** A timed media presentation is created by mapping timed media content (i.e. timed data) to a common timeline, and applying movement along this timeline. *So, timed media is ultimately created from two distinct entities; timing resources and timed content resources.* No timed content (i.e. empty) is considered a special case. This way, a media presentation may dynamically replace all its timed content during playback/presentation, yet remain well defined at all times. Multiple timingobjects/timelines may be defined for a single media presentation, and media content may define validity with respect to multiple timelines.

- **Online Timed Media** Online timed media is media presentation where at least one resource (timing resource or content resource) is connected to an online resource.

- **Multi-device Timed Media** A timed media presentation where at least one timing object is connected to an online timing resource. It follows that multi-device timed media is also online timed media.

> Timed media is ultimately created from two distinct entities; timing resources and timed content resources.

## Related work

All media framework includes some form of timeline, playback controls and sequencing logic.

In the Web, text track support is integrated with media elements. The current text trac implementation provides an API that is quite similar to the Sequencer, but suffers a few limitations. The precision of enter/exit events is coarse as their execution is ... 

> To be completed...

<!--
Sequencing functionality is already provided by existing media frameworks, for example text tracks  integrated with  media elements, audio sample scheduling within the Web Audio API [[WEBAUDIO]], or timegraph traversal within SMIL Timing [[SMIL3]]. 

limited to points and intervals
-->



## Design goals

A general purpose sequencing mechanisms for the Web, such as [Sequencer](index.html) or [timing text track](http://webtiming.github.io/timingobject/#timing-text-track), would be very useful. It would mean that various kinds of timed data and UI components can easily be integrated and used for timed presentation, without requiring application programmers to re-invent necessary timing logic. Furthermore, by integrating a general purpose sequencing mechanism are with the [timing object](http://webtiming.github.io/timingobject), media products using this mechanims would readily be open for synchronization and external control, both in single-device and multi-device scenarios.

Below we list important design goals for a general purpose sequencing mechanism for the Web.  

- **Data-independency**. The sequencing mechanism should be implemented without reference to any specific data format. This way, timing support for a wide range of data formats can be provided, including application-specific data formats.
 
- **UI-independency**. The sequencing mechanism should not be bundled with any predefined UI elements or UI frameworks. This ensures that programmers are free to exploit it for any purpose, including purposes that require custom UI solutions or no UI at all. General purpose UI components for timed presentation may still be developed and shared independently.

- **Precise timing**. The sequencing mechanism should be based on a precise timeout mechanism (e.g. setTimeout) for enter/exit events to be emitted with high precision, ideally correct down to a single millisecond. This additionally ensures effectiveness with respect to power consumption.

- **Expressive controls**. The sequencing mechanism should support any motion supported by the timing object, including fast forward, slow motion, backwards playback, immediate jumps or acceleration. This way, the sequencing mechanism may support a variety of media control primitives, appropriate for a wide range of media applications.

- **Dynamic data** The sequencing mechanism should allow modifications of timed data to safely occur at any time, with immediate and consistent effects, and without introducing any added complexity for the programmer. This would enable both live authoring and live viewing of dynamic timed media, applicable in both single-device and collaborative, multi-device scenarios.

- **Simple usage**






# Importance

> To be completed...

<!--
## Programming tool
In short, the sequencing mechanism should be made available as a generic programming concept/tool. This would presumably benefit both individual programmers as well as developers of advanced media frameworks. 
- Should be available in any kind of 

## Any kind of data
- the view of utility is typically limited to subtitles.

## Flexibility
- decoupling sequencer from timing resource and data and UI gives a lot of flexibility.

## Defining the state of linear media
-->


# Applicability and usage

<!-- various topic from chess demo exercise -->

> To be completed...


# Future work

> To be completed...