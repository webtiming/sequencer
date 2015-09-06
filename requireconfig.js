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


requirejs.config({
	baseUrl: '.',
  packages: [
    //{ name: 'sequencer', location: 'SOURCE/Sequencer', main: 'sequencer'},
    { name: 'sequencer', location: '.', main: 'sequencer-require-min'},
  ],
  paths: {
      'js': 'DEMOS/js',
      'mcorp': 'http://mcorp.no/lib/mcorp-2.0',
  },
  shim: { 
      'mcorp': { exports: 'MCorp'}
  }
});







   







