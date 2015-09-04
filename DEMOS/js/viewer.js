/*
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
*/


define(function () {
	/* 
	   This module defines a simple viewer for timed data.
	   The viewer targets a DOM element and update it with
	   data from the sequencer, based on enter and leave events. 
   	*/
    return function (sequencer, elem) {
        var key = undefined;
        var enter = function (e) {
            key = e.key;
            elem.innerHTML = JSON.stringify(e.data);
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
        sequencer.on("change", enter);
        sequencer.on("exit", exit);
    };
});