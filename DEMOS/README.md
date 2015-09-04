<!--
  Copyright 2015 Norut Northern Research Institute
  Author : Ingar Mæhlum Arntzen

  This file is part of the Sequencer module.

  The Sequencer is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  The Sequencer is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with the Sequencer.  If not, see <http://www.gnu.org/licenses/>.
-->


# Demo Documentation

These are demoes for the Sequencer.

All demoes may be run directly by opening the local file in the browser. 

Open at least ctrl.html and <X>.html in two different tabs/windows.

Open <X>.html in multiple tabs/windows in order to appreciate precise sync. 

You may also verify multi-device sync by opening links on different computers. 

Note that all demoes uses a single timing source/motion. This motion is shared globally, so other people might also be playing with the demo when you do. If you would like to explore the Sequencer using your own motions, you may do so by creating a developer account at Motion Corporation http://motioncorporation.com.


Resources
* js/viewer.js - simplistic viewer used by most demoes to update DOM based on timed sequencer events.
* js/timeddata.js - collection of timeddata resources used by demonstrations.
* js/localstorage.js - sequencer, viewer and editor for timed data persisted and shared using LocalStorage - relevant for dynamic.html
* js/test.js - test code - relevant for test.html
* app.js - main application - loads motion

Demoes
* ctrl.html - all demoes are controlled by the same motion. You may control it by opening ctrl.html.
* index.html is the most basic demonstration of the Sequencer 
* array.html demoes how to sequence and array with timed data using the Sequencer
* special.html demoes how the Sequencer may be specialized to integrate with a specific data format
* minimal.html demoes how timed data, motion, sequencer and viewer may be connected essentially in ONE(!) line of code
* dynamic.html demoes Sequencer support for dynamic changes of timed data. Includes viewer and editor for working with timed data.
* test.html runs some precoded tests
