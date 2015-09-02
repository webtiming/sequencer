---
layout: default
title: Sequencer Project
---

## Introduction
This page gives the introduction to the Sequencer project.

## Definition

In this document, the process of translating a timed script or timed data into timed execution is broadly referred to as sequencing.
- timed data
- dimension/timeline
- motion along dimension

## Related Work

Sequencing functionality is already provided by existing media frameworks, for example text tracks  integrated with  media elements, audio sample scheduling within the Web Audio API [[WEBAUDIO]], or timegraph traversal within SMIL Timing [[SMIL3]]. 


## Requirements

Similarly, the ability to connect sequencing logic (e.g. a text track) to a timing object would be very useful. It would allow timed data to be time-aligned (synchronized) with any other timed component, provided only that they are directed by the same timing object. Crucially, this would also be true in the multi-device scenario, as distributed timing objects may connect to and be directed by the same online timing source. Below we list important design goals for a general purpose sequencing mechanism for the Web.  

- **Data-independency**. The sequencing mechanism should be implemented without reference to any specific data format. This way, timing support for a wide range of data formats can be provided, including application-specific data formats.
 
- **UI-independency**. The sequencing mechanism should not be bundled with any predefined UI elements or UI frameworks. This ensures that programmers are free to exploit it for any purpose, including purposes that require custom UI solutions or no UI at all. General purpose UI components for timed presentation may still be developed and shared independently.

- **Precise timing**. The sequencing mechanism should be based on a precise timeout mechanism (e.g. setTimeout) for enter/exit events to be emitted with high precision, ideally correct down to a single millisecond.

- **Expressive controls**. The sequencing mechanism should support any motion supported by the timing object, including fast forward, slow motion, backwards playback, immediate jumps or acceleration. This way, the sequencing mechanism may support a variety of media control primitives, appropriate for a wide range of media applications.

- **Dynamic data** The sequencing mechanism should allow modifications of timed data to safely occur at any time, with immediate and consistent effects, and without introducing any added complexity for the programmer. This would enable both live authoring and live viewing of dynamic timed media, applicable in both single-device and collaborative, multi-device scenarios.

- **Simple usage**

# Importance

## Programming tool
In short, the sequencing mechanism should be made available as a generic programming concept/tool. This would presumably benefit both individual programmers as well as developers of advanced media frameworks. 
- Should be available in any kind of 

## Any kind of data
- the view of utility is typically limited to subtitles.

## Flexibility
- decoupling sequencer from timing resource and data and UI gives a lot of flexibility.

## Defining the state of linear media
