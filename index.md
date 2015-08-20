---
layout: default
title: Home
---

## Sequencer in a nutshell

> The *Sequencer* is a simple and generic mechanism for timed execution of *timed data*.

Sequencing is not a new concept. Frameworks for timed media or timed presentation are always built around some form of sequencing logic. However, implementations are typically internal, custom to specific media formats, and tightly integrated with predefined UI components. Furthermore, media clocks and media controls (e.g. play/pause) are also implemented internally, making it hard to synchronize with other timed media.

external time coordination and synchronization difficult.

To address these issues, the Sequencer is designed with two main goals.

**1) Isolate Sequencer logic from data and UI.**
The Sequencer is pure JavaScript and fully encapsulates sequencing logic, without introducing any dependencies to data formats or UI. By virtue of being *data-agnostic* and *UI-agnostic*, the Sequencer makes common timing logic available for any Web application and any purpose.

**2) Use the HTMLTimingObject as timing source.**
The HTMLTimingObject is a simple concept encapsulating both timing and timing controls. It is proposed as a unifying approach for temporal interoperability in the Web. In short, by sharing a single timing object as timing source, independent components may be precisely coordinated in time. Crucially, this is also true in the distributed scenario, as timing objects support synchronization with online timing objects (Shared Motion). So, by using the timing object as timing source, the Sequencer readily supports precise sequencing in both single-device and multi-device scenarios.

## Dependencies
Sequencer and Shared Motion are vanilla JavaScript and should run in every modern browser.

The Sequencer implementation depends of Shared Motion, an early implementation of the HTMLTimingObject provided by the [Motion Corporation](http://motioncorporation.com). The HTMLTimingObject is currently being prepared for standardization by [W3C Multi-device Timing Community Group](https://www.w3.org/community/webtiming/), and its design is inspired by Shared Motion. The Sequencer will serve as reference implementation.

For experimentation and development with the Sequencer, please contact the Motion Corporation for access to Shared Motion.

## Authors
- Ingar Mæhlum Arntzen (ingar.arntzen@norut.no) (@ingararntzen)

## Acknowledgements
The development of the Sequencer is funded in part by the [EU FP7 MediaScape project](http://mediascapeproject.eu), and results are contributed as reference implementation to the W3C Multi-device Timing Community Group.

- Njål Borch (njaal.borch@norut.no) (@snarkdoof) has been much involved in testing, evaluation and API design.

## License

Copyright 2015 Norut Northern Research Institute.

Author : Ingar Mæhlum Arntzen

The Sequencer is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

The Sequencer is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with the Sequencer.  If not, see [http://www.gnu.org/licenses/](http://www.gnu.org/licenses/).
