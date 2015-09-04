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

    /* Timed data */
    var array = [
        { data: 'A', start: 0, end: 1 },
        { data: 'B', start: 2, end: 3 },
        { data: 'C', start: 4, end: 5 },
        { data: 'D', start: 6, end: 7 },
        { data: 'E', start: 8, end: 9 },
        { data: 'F', start: 10, end: 11 },
        { data: 'G', start: 12, end: 13 },
        { data: 'H', start: 14, end: 15 },
        { data: 'I', start: 16, end: 17 },
        { data: 'J', start: 18, end: 19 },
        { data: 'K', start: 20, end: 21 },
        { data: 'L', start: 22, end: 23 },
        { data: 'M', start: 24, end: 25 },
        { data: 'N', start: 26, end: 27 },
        { data: 'O', start: 28, end: 29 },
        { data: 'P', start: 30, end: 31 },
        { data: 'Q', start: 32, end: 33 },
        { data: 'R', start: 34, end: 35 },
        { data: 'S', start: 36, end: 37 },
        { data: 'T', start: 38, end: 39 },
        { data: 'U', start: 40, end: 41 },
        { data: 'V', start: 42, end: 43 },
        { data: 'W', start: 44, end: 45 },
        { data: 'X', start: 46, end: 47 },
        { data: 'Y', start: 48, end: 49 },
        { data: 'Z', start: 50, end: 51 } 
    ];


    var associative = {
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


    return {
        array: array,
        associative : associative
    };
});