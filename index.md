---
layout: default
title: Home
---

## The Sequencer in a nutshell

> The *Sequencer* is a simple and generic mechanism for timed execution of *timed data*.

Sequencing is not a new concept. Frameworks for timed media or timed presentation are always built around some form of sequencing logic. However, implementations are typically internal, custom to specific media formats, and tightly integrated with predefined UI components. Furthermore, media clocks and media controls (e.g. play/pause) are also implemented internally, making it hard to synchronize with other timed media.

To address these issues, the Sequencer is designed with two main goals.

**1) Isolate sequencing logic from data and UI.**
The Sequencer is pure JavaScript and fully encapsulates sequencing logic, without introducing any dependencies to specific data formats or UI elements. By virtue of being data-agnostic and UI-agnostic, the Sequencer makes common timing logic available for any Web application and any purpose.

**2) Use the HTMLTimingObject as timing source.**
The [HTMLTimingObject](http://webtiming.github.io/timingobject) is a simple concept encapsulating both timing and timing controls. It is proposed as a unifying approach for temporal interoperability in the Web. The HTMLTimingObject is proposed for standardization by [W3C Multi-device Timing Community Group](https://www.w3.org/community/webtiming/). In short, by sharing a single timing object as timing source, independent components may be precisely coordinated in time. Crucially, this is also true in the distributed scenario, as timing objects support synchronization with online timing objects. So, by using the timing object as timing source, the Sequencer is ready to support precise sequencing in both single-device as well as multi-device scenarios.

## Dependencies
The Sequencer implementation depends on [Shared Motion](http://motioncorporation.com), a JavaScript implementation of the [HTMLTimingObject](http://webtiming.github.io/timingobject), provided by the [Motion Corporation](http://motioncorporation.com). Shared Motion comes with built-in support for online synchronization. The Sequencer will serve as reference implementation for sequencing logic integrated with the HTMLTimingObject. Both the Sequencer and Shared Motion are vanilla JavaScript and should run in every modern Web browser.

For experimentation and development with the Sequencer, please contact the Motion Corporation for access to Shared Motion.

## Authors
- Ingar Mæhlum Arntzen [ingar.arntzen@norut.no](mailto://ingar.arntzen@norut.no) - [github.com/ingararntzen](https://github.com/ingararntzen)

## Acknowledgements
The development of the Sequencer is funded in part by the [EU FP7 MediaScape project](http://mediascapeproject.eu), and results are contributed as reference implementation to the W3C Multi-device Timing Community Group.

- Njål Borch [njaal.borch@norut.no](mailto://njaal.borch@norut.no) - [github.com/snarkdoof](https://github.com/snarkdoof) has been much involved in testing, evaluation and API design.

## License

Copyright 2015 Norut Northern Research Institute.

Author : Ingar Mæhlum Arntzen

The Sequencer is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

The Sequencer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with the Sequencer.  If not, see [http://www.gnu.org/licenses/](http://www.gnu.org/licenses/).


