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


define ('timeoututils',[],function () {

	'use strict';

	var clock_ms = function (){return new Date().getTime();}; 

	/*
	  TIMEOUT

	  Wraps setTimeout() to implement improved version
	  - guarantee that timeout does not wake up too early
	  - offers precise timeout by "busy"-looping just before timeout 
	  - wraps a single timeout
	  - operates on milliseconds
	  - wake up 3 seconds before on long timeouts to readjust
	*/

	var Timeout = function (callback, delay, options) {	
		this.tid = null;
		this.callback = callback;
		this.delay_counter = 0;
		this.options = options || {};
		var now = clock_ms();
		this.options.anchor = this.options.anchor || now; // epoch millis
		this.options.early = Math.abs(this.options.early) || 0; // millis
		this.target = this.options.anchor + delay; // epoch millis

		// Initialise
		var self = this;
		window.addEventListener("message", this, true); // this.handleEvent
		var time_left = this.target - clock_ms(); // millis
		if (time_left > 10000) {
			// long timeout > 10s - wakeup 3 seconds earlier to readdjust
			this.tid = setTimeout(function () {self._ontimeout();}, time_left - 3000);
		} else {
			// wake up just before
			this.tid = setTimeout(function () {self._ontimeout();}, time_left - self.options.early);
		}
	};

	// Internal function
	Timeout.prototype._ontimeout = function () {
	    if (this.tid !== null) {
	    	var time_left = this.target - clock_ms(); // millis
			if (time_left <= 0) {
			    // callback due
			    this.cancel();
			    this.callback();
			} else if (time_left > this.options.early) {
				// wakeup before target - options early sleep more
				var self = this;
				this.tid = setTimeout(function () {self._ontimeout();}, time_left - this.options.early);
			} else {
				// wake up just before (options early) - event loop
			    this._smalldelay();
			}
	    }
	};
	
	// Internal function - handler for small delays
	Timeout.prototype.handleEvent = function (event) {
	    if (event.source === window && event.data.indexOf("smalldelaymsg_") === 0) {
			event.stopPropagation();
			// ignore if timeout has been canceled
			var the_tid = parseInt(event.data.split("_")[1]);
			if (this.tid !== null && this.tid === the_tid) {
			    this._ontimeout();
			}
	    }
	};

	Timeout.prototype._smalldelay = function () {
	    this.delay_counter ++;
	    var self = this;
	    window.postMessage("smalldelaymsg_" + self.tid, "*");
	};

	Timeout.prototype.cancel = function () {
	    if (this.tid !== null) {
			clearTimeout(this.tid);
			this.tid = null;
			var self = this;
			window.removeEventListener("message", this, true);	
	    }
	};
	
	// return module object
	return Timeout;
});


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


define( 'interval',[],function () {

	'use strict';

	/*
		INTERVAL
	*/

	var isNumber = function(n) {
		var N = parseFloat(n);
	    return (n===N && !isNaN(N));
	};

	var IntervalError = function (message) {
		this.name = "IntervalError";
		this.message = (message||"");
	};
	IntervalError.prototype = Error.prototype;


	var Interval = function (low, high, lowInclude, highInclude) {
		var lowIsNumber = isNumber(low);
		var highIsNumber = isNumber(high);
		// new Interval(3.0) defines singular - low === high
		if (lowIsNumber && high === undefined) high = low; 
		if (!isNumber(low)) throw new IntervalError("low not a number");
		if (!isNumber(high)) throw new IntervalError("high not a number");	
		if (low > high) throw new IntervalError("low > high");
		if (low === high) {
			lowInclude = true;
			highInclude = true;
		}
		if (low === -Infinity) lowInclude = true;
		if (high === Infinity) highInclude = true;
		if (lowInclude === undefined) lowInclude = true;
		if (highInclude === undefined) highInclude = false;
		if (typeof lowInclude !== "boolean") throw new IntervalError("lowInclude not boolean");
		if (typeof highInclude !== "boolean") throw new IntervalError("highInclude not boolean");
		this.__defineGetter__("length", function () {return high - low;});
		this.__defineGetter__("low", function () {return low;});
		this.__defineGetter__("high", function () {return high;});
		this.__defineGetter__("lowInclude", function () {return lowInclude;});
		this.__defineGetter__("highInclude", function () {return highInclude;});
	};


	Interval.prototype.toString = function () {
		var lowBracket = (this.lowInclude) ? "[" : "<";
		var highBracket = (this.highInclude) ? "]" : ">";
		var low = (this.low === -Infinity) ? "<--" : this.low.toFixed(2);
		var high = (this.high === Infinity) ? "-->" : this.high.toFixed(2);
		if (this.isSingular())
			return lowBracket + low + highBracket;
		return lowBracket + low + ',' + high + highBracket;
	};
	Interval.prototype.isFinite = function () { 
		return (isFinite(this.low) && isFinite(this.high));
	};
	Interval.prototype.isSingular = function () {
		return (this.low === this.high);
	};
	Interval.prototype.coversPoint = function (x) {
		if (this.low < x && x < this.high) return true;
		if (this.lowInclude && x === this.low) return true;
		if (this.highInclude && x === this.high) return true;
		return false;
	};

	// overlap : it exists at least one point x covered by both interval 
	Interval.prototype.overlapsInterval = function (other) {
		if (other instanceof Interval === false) throw new IntervalError("paramenter not instance of Interval");	
		// singularities
		if (this.isSingular() && other.isSingular()) 
			return (this.low === other.low);
		if (this.isSingular())
			return other.coversPoint(this.low);
		if (other.isSingular())
			return this.coversPoint(other.low); 
		// not overlap right
		if (this.high < other.low) return false;
		if (this.high === other.low) {
			return this.coversPoint(other.low) && other.coversPoint(this.high);
		}
		// not overlap left
		if (this.low > other.high) return false;
		if (this.low === other.high) {
			return (this.coversPoint(other.high) && other.coversPoint(this.low));
		}
		return true;
	};
	Interval.prototype.coversInterval = function (other) {
		if (other instanceof Interval === false) throw new IntervalError("paramenter not instance of Interval");
		if (other.low < this.low || this.high < other.high) return false;
		if (this.low < other.low && other.high < this.high) return true;
		// corner case - one or both endpoints are the same (the other endpoint is covered)
		if (this.low === other.low && this.lowInclude === false && other.lowInclude === true)
			return false;
		if (this.high === other.high && this.highInclude === false && other.highInclude === true)
			return false;
		return true;
	};
	Interval.prototype.equals = function (other) {
		if (this.low !== other.low) return false;
		if (this.high !== other.high) return false;
		if (this.lowInclude !== other.lowInclude) return false;
		if (this.highInclude !== other.highInclude) return false;
		return true;
	};

	/* 
		Possibility for more interval methods such as union, intersection, 
	*/

	return Interval;
});


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


define ('sortedarraybinary',['interval'], function (Interval) {

    'use strict';

    // check if n is a number
    var is_number = function(n) {
    	var N = parseFloat(n);
        return (n==N && !isNaN(N));
    };


    var SortedArrayError = function (message) {
        this.name = "SortedArrayError";
        this.message = (message||"");
    };
    SortedArrayError.prototype = Error.prototype;

    /*

    SORTED ARRAY BINARY

    */

    var SortedArrayBinary = function () {
    	/*
    	  use binary search to implement sorted insert
    	  guard against duplicates
    	 */
    	this.array = [];
    };
    	
    /**
     * Binary search on sorted array
     * @param {*} searchElement The item to search for within the array.
     * @return {Number} The index of the element which defaults to -1 when not found.
     */
    SortedArrayBinary.prototype.binaryIndexOf = function (searchElement) {
        var minIndex = 0;
        var maxIndex = this.array.length - 1;
        var currentIndex;
        var currentElement;
        while (minIndex <= maxIndex) {
    		currentIndex = (minIndex + maxIndex) / 2 | 0;
    		currentElement = this.array[currentIndex];
    		if (currentElement < searchElement) {
    		    minIndex = currentIndex + 1;
    		}
    		else if (currentElement > searchElement) {
    		    maxIndex = currentIndex - 1;
    		}
    		else {
    		    return currentIndex;
    		}
        }
    	return ~maxIndex;
    	
        // NOTE : ambiguity?
        // search for minimum element returns 0 if it exists, and 0 if it does not exists
    };
    	
    SortedArrayBinary.prototype.insert = function (element) {
        var index = this.binaryIndexOf(element);
        if (index < 0 || (index === 0 && this.array[0] !== element)) { 
    		this.array.splice(Math.abs(index), 0, element);
        }
    };

    SortedArrayBinary.prototype.indexOf = function (element) {
        var index = this.binaryIndexOf(element);
        if (index < 0 || (index === 0 && this.array[0] !== element)) { 
    		return -1;
        } else {
    		return index;
        }
    };

    SortedArrayBinary.prototype.hasElement = function (element) {
        var index = this.binaryIndexOf(element);
        if (index < 0 || (index === 0 && this.array[0] !== element)) { 
    		return false;
        } else {
    		return true;
        }
    };

    SortedArrayBinary.prototype.remove = function (element) {
        var index = this.binaryIndexOf(element);
        if (index < 0 || (index === 0 && this.array[0] !== element)) { 
    		return;
        } else {
    		this.array.splice(index, 1);
        }
    };

    SortedArrayBinary.prototype.getMinimum = function () {
        return (this.array.length > 0) ? this.array[0] : null;
    };

    SortedArrayBinary.prototype.getMaximum = function () {
        return (this.array.length > 0) ? this.array[this.array.length - 1] : null;
    };

    /* 
       Find index of largest value less than x
       Returns -1 if noe values exist that are less than x
     */
    SortedArrayBinary.prototype.ltIndexOf = function(x) {
        var i = this.binaryIndexOf(x);
        // consider element to the left
        i = (i < 0) ? Math.abs(i) - 1 : i - 1;
        return (i >= 0) ? i : -1;
    };

    /* 
       Find index of largest value less than x or equal to x 
       Returns -1 if noe values exist that are less than x or equal to x
     */
    SortedArrayBinary.prototype.leIndexOf = function(x) {
        var i = this.binaryIndexOf(x);
        // equal
        if (i > 0 || (i === 0 && this.array[0] === x)) {
    		return i;
        }
        // consider element to the left
        i = Math.abs(i) - 1;
        return (i >= 0) ? i : -1;
    };

    /* 
       	Find index of smallest value greater than x
       	Returns -1 if noe values exist that are greater than x

    	note ambiguity :
    	
    	search for for an element that is less than array[0]
    	should return a negative value indicating that the element 
    	was not found. Furthermore, as it escapes the while loop
    	the returned value should indicate the index that this element 
    	would have had - had it been there - as is the idea of this bitwise 
    	or trick
    	
    	it should return a negative value x so that
    	Math.abs(x) - 1 gives the correct index which is 0
    	thus, x needs to be -1

    	instead it returns 0 - indicating that the non-existing value
    	was found!
    	
    	I think this bug is specific to breaking out on (minIndex,maxIndex) === (0,-1)



    */

    SortedArrayBinary.prototype.gtIndexOf = function (x) {
        var i = this.binaryIndexOf(x);
        
    	// ambiguity if i === 0
    	if (i === 0) {
    		if (this.array[0] === x) {
    			// found element - need to exclude it
    			// since this is gt it is element to the right
    			i = 1;
    		} else {
    			// did not find element 
    			// - the first element is the correct
    			// i === 0
    		}
    	}
    	else {		
    		i = (i < 0) ? Math.abs(i): i + 1;
    	}
        return (i < this.array.length) ? i : -1;
    };


    /* 
       Find index of smallest value greater than x or equal to x 
       Returns -1 if noe values exist that are greater than x or equal to x
     */

     SortedArrayBinary.prototype.geIndexOf = function(x) {
        var i = this.binaryIndexOf(x);
        // equal
        if (i > 0 || (i === 0 && this.array[0] === x)) {
    		return i;
        }
    	/*		    
    	if (i === 0) {
        	// ambiguity - either there is no element > x or array[0] is the smallest value > x
        	if (array.length >= 0 && array[0] > x) {
        		return 0;
        	} else return -1;
        } else {
        	// consider element to the right
        	i = Math.abs(i);
    	}
    	*/
    	i = Math.abs(i);	
        return (i < this.array.length) ? i : -1;
    };

    SortedArrayBinary.prototype.indexOf = function (element) {
        var index = this.binaryIndexOf(element);
        if (index < 0 || (index === 0 && this.array[0] !== element)) { 
    		return -1;
        } else {
    		return index;
        }
    };

    SortedArrayBinary.prototype.lookup = function (interval) {
    	if (interval === undefined) 
    		interval = new Interval(-Infinity, Infinity, true, true);
    	if (interval instanceof Interval === false) 
            throw new SortedArrayError("lookup requires Interval argument");
        var start_index = -1, end_index = -1;
        if (interval.lowInclude) {
    		start_index = this.geIndexOf(interval.low);
        } else {
    		start_index = this.gtIndexOf(interval.low);
        }
        if (start_index === -1) {
    		return [];
        }
        if (interval.highInclude) {
    		end_index = this.leIndexOf(interval.high);
        } else {
    		end_index = this.ltIndexOf(interval.high);
        }
        if (end_index === -1) { // not reachable - I think
    		return [];
        }
        return this.array.slice(start_index, end_index + 1);
    };

    SortedArrayBinary.prototype.get = function (i) {return this.array[i];};
    SortedArrayBinary.prototype.list = function () {return this.array;};

    return SortedArrayBinary;
});




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


define ('multimap',[],function () {

	'use strict';

	/*
		MULTI MAP

	  	MultiMap stores (key,value) tuples  
	  	- one key may be bound to multiple values  
		- protection from duplicate (key, value) bindings.
		- values are not assumed to be unique, i.e., the same value may be
	  	associated with multiple points.
	  
		MultiMap supports addition and removal of (key,value) bindings.  
		- insert (key, value) 
		- remove (key, value)
	*/

	var MultiMap = function () {
		this._map = {}; // key -> [value,]
	};

	MultiMap.prototype.insert = function (key, value) {
	    return this.insertAll([{key:key, value:value}]);
	};

	MultiMap.prototype.insertAll = function (tuples) {
	    var values, added = [];
	    tuples.forEach(function (tuple){
	    	if (!this._map.hasOwnProperty(tuple.key)) {
			    this._map[tuple.key] = [];
			}
			// protect against duplicate (key,value) bindings
			values = this._map[tuple.key];
			if (values.indexOf(tuple.value) === -1) {
			    values.push(tuple.value);
			    added.push(tuple);
			}
	    }, this);
	    return added;
	};

	MultiMap.prototype.remove = function (key, value) {
	    return this.removeAll([{key:key, value:value}]);
	};

	MultiMap.prototype.removeAll = function (tuples) {
		var index, values, removed = [];
		tuples.forEach(function (tuple) {
			if (this._map.hasOwnProperty(tuple.key)) {
			    values = this._map[tuple.key];
			    index = values.indexOf(tuple.value);
			    if (index > -1) {
					values.splice(index, 1);
					removed.push(tuple);
					// clean up if empty
					if (values.length === 0) {
					    delete this._map[tuple.key];
					}
			    }
			}
		}, this);
	    return removed;
	};

	MultiMap.prototype.hasKey = function (key) {
		return this._map.hasOwnProperty(key);
	};

	MultiMap.prototype.keys = function () {
		return Object.keys(this._map);
	};

	MultiMap.prototype.getItemsByKey = function (key) {
		var res = [];
		if (this.hasKey(key)) {
			this._map[key].forEach(function (value) {
				res.push({key: key, value: value});
			});	
		}
		return res;
	};

	MultiMap.prototype.getItemsByKeys = function (_keys) {
		if (_keys === undefined) _keys = this.keys();
		var res = [];
		_keys.forEach(function (key) {
			res = res.concat(this.getItemsByKey(key));	
		}, this);
		return res;
	};
	MultiMap.prototype.list = MultiMap.prototype.getItemsByKeys;

	return MultiMap;
});



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


define ('axis',['interval', 'sortedarraybinary', 'multimap'], 
	function (Interval, SortedArrayBinary, MultiMap) {

	'use strict';

	var AxisError = function (message) {
		this.name = "AxisError";
		this.message = (message || "");
	};
	AxisError.prototype = Error.prototype;


	// Operation Types
	var OpType = Object.freeze({
		NOOP : "noop",
		CREATE: "create",
		UPDATE: "update",
		REMOVE: "remove"
	});

	// POINT TYPES
    var PointType = Object.freeze({
		LOW: "low",
		SINGULAR: "singular",
		HIGH: "high",
		INSIDE: "inside",
		OUTSIDE: "outside",
		toInteger: function (s) {
		    if (s === PointType.LOW) return -1;
		    if (s === PointType.HIGH) return 1;
		    if (s === PointType.INSIDE) return 2;
		    if (s === PointType.OUTSIDE) return 3;
		    if (s === PointType.SINGULAR) return 0;
		    throw new AxisError("illegal string value for point type");
		},
		fromInteger: function (i) {
			if (i === -1) return PointType.LOW;
			else if (i === 0) return PointType.SINGULAR;
			else if (i === 1) return PointType.HIGH;
			else if (i === 2) return PointType.INSIDE;
			else if (i === 3) return PointType.OUTSIDE;
			throw new AxisError("illegal integer value for point type");
		}
    });


	/*
		AXIS

		Manages a collection of Intervals.
		Each interval is identified by a key, and may be inserted or removed using the key, just like a map/dictionary.
		Interval objects represents an interval on the Axis or real floating point numbers.

		In addition to key access, the Axis provides efficient access to Intervals by search.
		- lookupByInterval (searchInterval) returns all Intervals whose endpoints are covered by given search Interval
		- lookupByPoint (x) returns all Intervals in the collection that covers given point.
	*/

	var Axis = function () {
		// Mapping key to Intervals
		this._map = {}; // key -> Interval(point,point)
		// Revers-mapping Interval points to Interval keys
		this._reverse = new MultiMap(); // point -> [key, ...]
		// Index for searching Intervals effectively by endpoints - used by lookupByInterval
		this._index = new SortedArrayBinary(); // [point, point, ...]
		// No index provided for lookupByPoint
	};


	// internal helper function to insert (key, interval) into map, reverse and index
	Axis.prototype._insert = function (key, interval) {
		// map
		this._map[key] = interval;
		// index add to index if reverse is empty before insert
		if (!this._reverse.hasKey(interval.low)) {
			this._index.insert(interval.low);
		}
		if (!this._reverse.hasKey(interval.high)) {
			this._index.insert(interval.high);
		}
		// reverse index
		this._reverse.insert(interval.low, key);
		this._reverse.insert(interval.high, key);
	};



	// internal helper function to clean up map, reverse and index during (key,interval) removal
	Axis.prototype._remove = function (key) {
		if (!this._map.hasOwnProperty(key)) 
			throw new AxisError("attempt to remove non-existing key");
		var interval = this._map[key];
		// map
		delete this._map[key];
		// reverse
		this._reverse.remove(interval.low, key);
		this._reverse.remove(interval.high, key);
		// index remove from index if reverse is empty after remove
		if (!this._reverse.hasKey(interval.low)) {
			this._index.remove(interval.low);
		}
		if (!this._reverse.hasKey(interval.high)) {
			this._index.remove(interval.high);
		}
		// return old interval
		return interval;		
	};


	/*
		UPDATEALL
		- process a batch of operations
		- creates, replaces or removes args [{key:key, interval:interval},] 
	*/
	Axis.prototype.updateAll = function (args) {
		var e, elist = [], oldInterval, key, interval;
		args.forEach(function(arg){
			key = arg.key;
			interval = arg.interval;
			// INTERVAL is undefined
			if (interval === undefined) {
				if (this._map.hasOwnProperty(key)) {
					// REMOVE
					oldInterval = this._remove(key);
					e = {type: OpType.REMOVE, key: key, interval: oldInterval, data: arg.data};
				} else {
					// NOOP
					e = {type: OpType.NOOP, key: key, interval: undefined, data: undefined};
				}
			} 
			// INTERVAL defined
			else {
				if (interval instanceof Interval === false) throw new AxisError("parameter must be instanceof Interval");
				if (this._map.hasOwnProperty(key)) {
					oldInterval = this._map[key];

					if (interval.equals(oldInterval)) {
						e = {type: OpType.NOOP, key: key, interval: oldInterval, data: arg.data};
					} else {
						this._remove(key);
						this._insert(key, interval);
						e = {type: OpType.UPDATE, key: key, interval: interval, data: arg.data};
					}
				} else {
					// CREATE
					this._insert(key, interval);
					e = {type: OpType.CREATE, key: key, interval: interval, data: arg.data};
				}
			}
			elist.push(e);
		}, this);

		return elist;	
	};

	// shorthand for update single (key, interval) pair
	Axis.prototype.update = function (key, interval) {
		return this.updateAll([{key:key, interval:interval}]);
	};

	/*
		Find (key,interval) pairs for intervals that cover x.
		Simply scan all intervals in collection - no index provided.
		x undefined means all (key, interval)
	*/
	Axis.prototype.lookupByPoint = function (x) {
		var interval, res = [];
		Object.keys(this._map).forEach(function(key){
			interval = this._map[key];
			if (x === undefined || interval.coversPoint(x)) {
				res.push({key:key, interval: interval});
			}
		}, this);
		return res;
	};

	/*
		Find all interval endpoints within given interval 
	*/
	Axis.prototype.lookupByInterval = function (interval) {
		// [point,]
		var points = this._index.lookup(interval);
		// [{key: key, point: point, interval:interval},]
		var res = [], items, point;
		this._index.lookup(interval).forEach(function (point) {
			this._reverse.getItemsByKey(point).forEach(function (item) {
				point = item.key;
				interval = this._map[item.value];
				res.push({
					key: item.value,
					interval: interval,
					point: point,
					pointType: this.getPointType(point, interval)
				});
			}, this);
		}, this);
		return res;
	};

	Axis.prototype.items = function () {return this.lookupByPoint();};
	Axis.prototype.keys = function () {return Object.keys(this._map);};

	Axis.prototype.getPointType = function (point, interval) {
		if (interval.isSingular() && point === interval.low) return PointType.SINGULAR;
	    if (point === interval.low) return PointType.LOW;
	    if (point === interval.high) return PointType.HIGH;
	    if (interval.low < point && point < interval.high) return PointType.INSIDE;
	    else return PointType.OUTSIDE;
	};

	Axis.prototype.getIntervalByKey = function (key) {
		return this._map[key];
	};

	Axis.prototype.hasKey = function (key) {
		return this._map.hasOwnProperty(key);
	};

	// module definition
	return {
		Axis: Axis,
		OpType : OpType,
		PointType: PointType
	};
});


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


define(
	'sequencer',['timeoututils', 'interval', 'axis'], 
	function (Timeout, Interval, axis)  {

	'use strict';

	// UTILITY

	// UNIQUE ID GENERATOR 
	var id = (function(length) {
	 	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	    return function (len) { // key length
	    	len = len || length; 
	    	var text = "";
		    for( var i=0; i < len; i++ )
	    	    text += possible.charAt(Math.floor(Math.random() * possible.length));
	    	return text;
		};
	})(10); // default key length

	// Local time source (seconds)
    var secClock = function () {
		return new Date().getTime()/1000.0;
    };
	
	var P = 0, V = 1, A = 2, T = 3;

	// check if n is a number
	var isNumber = function(n) {
	    return !isNaN(parseFloat(n));
	};

    var calculateVector = function(vector, t) {
		if (t === undefined) {
		    t = clock();
		}
		var d = t - vector[T];
		var v = vector[V] + vector[A]*d;
		var p = vector[P] + vector[V]*d + 0.5*vector[A]*d*d;
		return [p,v,vector[A], t];
    };
    
    var isMoving = function (vector) {
		if (vector === null) return false;
		if (vector[V] !== 0.0 || vector[A] !== 0.0) return true;
		return false;
    };

    // Compare values
    var cmp = function (a, b) {
		if (a > b) {return 1;}
		if (a === b) {return 0;}
		if (a < b) {return -1;}
    };

	// Calculate direction of movement at time t.
	// 1 : forwards, -1 : backwards: 0, no movement
    var calculateDirection = function (vector, t) {
		var freshVector = calculateVector(vector, t);
		var direction = cmp(freshVector[V], 0.0);
		if (direction === 0) {
	        direction = cmp(vector[A], 0.0);
		}
		return direction;
    };

    var hasRealSolution = function (p,v,a,x) {
		if ((Math.pow(v,2) - 2*a*(p-x)) >= 0.0) return true;
		else return false;
    };

    var calculateRealSolutions = function (p,v,a,x) {
		if (a === 0.0 && v === 0.0) {
		    if (p != x) return [];
		    else return [0.0];
		}
		if (a === 0.0) return [(x-p)/v];
		if (hasRealSolution(p,v,a,x) === false) return [];
		var discriminant = v*v - 2*a*(p-x);
		if (discriminant === 0.0) {
		    return [-v/a];
		}
		var sqrt = Math.sqrt(Math.pow(v,2) - 2*a*(p-x));
		var d1 = (-v + sqrt)/a;
		var d2 = (-v - sqrt)/a;
		return [Math.min(d1,d2),Math.max(d1,d2)];
    };

    var calculatePositiveRealSolutions = function (p,v,a,x) {
		var res = calculateRealSolutions(p,v,a,x);
		if (res.length === 0) return [];
		else if (res.length == 1) {
		    if (res[0] > 0.0) { 
				return [res[0]];
		    }
		    else return []; 
		}
		else if (res.length == 2) {
		    if (res[1] < 0.0) return [];
		    if (res[0] > 0.0) return [res[0], res[1]];
		    if (res[1] > 0.0) return [res[1]];
		    return [];
		}
		else return [];
    };

    var calculateMinPositiveRealSolution = function (p,v,a,x) {
		var res = calculatePositiveRealSolutions(p,v,a,x);
		if (res.length === 0) return null;
		else return res[0];
    };
    
    var calculateDelta = function (vector, rangeInterval ) {
		var p = vector[P];
		var v = vector[V];
		var a = vector[A];
		// Time delta to hit posBefore
		var deltaBefore = calculateMinPositiveRealSolution(p,v,a, rangeInterval.low);
		// Time delta to hit posAfter
		var deltaAfter = calculateMinPositiveRealSolution(p,v,a, rangeInterval.high);
		// Pick the appropriate solution
		if (deltaBefore !== null && deltaAfter !== null) {
		    if (deltaBefore < deltaAfter)
				return [deltaBefore, rangeInterval.low];
		    else 
				return [deltaAfter, rangeInterval.high];
		}
		else if (deltaBefore !== null)
		    return [deltaBefore, rangeInterval.low];
		else if (deltaAfter !== null)
		    return [deltaAfter, rangeInterval.high];
		else return [null,null];
    };
  
    var calculateSolutionsInInterval = function(vector, d, plist) {
    	var sortFunc = function (a,b){return a[0]-b[0];};
		var solutions = [];
		var p0 = vector[P];
		var v0 = vector[V];
		var a0 = vector[A];
		for (var i=0; i<plist.length; i++) {
		    var o = plist[i];
		    var intersects = calculateRealSolutions(p0,v0,a0, o.point);
		    for (var j=0; j<intersects.length; j++) {
				var t = intersects[j];
				if (0.0 <= t && t <= d) {
				    solutions.push([t,o]);
				}
		    }
		}
		// sort solutions
		solutions.sort(sortFunc);
		return solutions;
    };
    
    var calculateInterval = function (vector_start, d) {
		var p0 = vector_start[P];
		var v0 = vector_start[V];
		var a0 = vector_start[A];
		var p1 = p0 + v0*d + 0.5*a0*d*d;
		
		if (a0 !== 0.0) {
		    var d_turning = -v0/a0;
		    if (0.0 <= d_turning && d_turning <= d) {           
				var p_turning = p0 - 0.5*v0*v0/a0;
				if (a0 > 0.0) {
					return new Interval(p_turning, Math.max(p0, p1), true, true);
				}
				else {
				    return new Interval(Math.min(p0,p1), p_turning, true, true);
				}
		    }
		}
		return new Interval(Math.min(p0,p1), Math.max(p0,p1), true, true);
    };


	/*
      unique
      return list of elements that are unique to array 1
     */
    var unique = function (array1, array2) {
		var res = [];
		for (var i=0; i<array1.length;i++) {
		    var found = false;
		    for (var j=0; j<array2.length;j++) {
				if (array1[i] === array2[j]) {
				    found = true;
				    break;
				} 
	    	}
	   		if (!found) {
				res.push(array1[i]);
	    	}	 
		}
		return res;
    };


    // VERBS
    var VerbType = Object.freeze({
		ENTER: "enter",
		EXIT: "exit",
		toString : function (s) {
		    if (s === VerbType.ENTER) return "enter";
		    if (s === VerbType.EXIT) return "exit";
		    throw new SequencerError("illegal string value verb type " + s);
		},
		fromInteger : function (i) {
			if (i === -1) return VerbType.EXIT;
			else if (i === 1) return VerbType.ENTER;
			throw new SequencerError("illegal integer value for direction type " + i);
		}
    });

    // DIRECTIONS
    var DirectionType = Object.freeze({
		BACKWARDS: "backwards",
		FORWARDS: "forwards",
		NODIRECTION : "nodirection",
		toInteger : function (s) {
		    if (s === DirectionType.BACKWARDS) return -1;
		    if (s === DirectionType.FORWARDS) return 1;
		    if (s === DirectionType.NODIRECTION) return 0;
		    throw new SequencerError("illegal string value direction type " + string);
		},
		fromInteger : function (i) {
			if (i === 0) return DirectionType.NODIRECTION;
			else if (i === -1) return DirectionType.BACKWARDS;
			else if (i === 1) return DirectionType.FORWARDS;
			throw new SequencerError("illegal integer value for direction type" + i + " " + typeof(i));
		}
    });


	/*

      SCHEDULE

      The purpose of schedule is to keep tasks planned for execution
      in the near future.
      
      <start> and <end> timestamps defines the time
      interval covered by the schedule - the <covering interval>. The
      idea is to move this interval stepwise, to eventually cover the
      entire time-line. The length of this interval is defined by the
      option <lookahead>. The default value is 5 seconds.

      The <advance> operation moves the interval so that the next
      interval <start> matches the previous interval <end>. If
      lookahead is 5 seconds, the general idea is to advance the
      covering interval every 5 seconds.  However, it is safe to
      advance it more often. It is also safe to advance it less
      often. In this case the covering interval will grow in length to
      cover otherwise lost parts of the timeline - but events will be 
      delivered too late.

      The push(ts,task) operation allows tasks to be added to the
      schedule, provided their due-times fall within the covering
      interval. The push_immediate(task) will assign <ts> === now.
      Push maintains time ordering.
      
      The pop() operation is used to get all tasks that are due for
      execution. The schedule should be popped regularly/frequently to
      keep tasks from being delayed in execution. The delay_next()
      operation returns the time (milliseconds) until the next task is
      due. This can be used with setTimeout() to arrange timely
      popping. However, note that this timeout may have to be
      re-evealuated as new tasks are pushed onto the schedule.

      Associated with the <covering interval> (time), there is also a
      "covering interval" with respect to motion (position). Eg. In real-time
      (epoch) interval [1434891233.407, 1434891235.407] motion covers
      positions [23.0, 25.0].  All tasks are associated with a position on a
      dimension. This is set by the advance() operation.  The position
      interval is used (externally) to quickly evaluate relevance of tasks, essentially to
      avoid calculating the due-times of a task only to find that it falls
      outside the time convering interval. Position interval is only managed
      externally.

     */

    var Schedule = function (options) {
		this.queue = [];
		// options
		this.options = options || {};	
		this.options.lookahead = this.options.lookahead || 5.0;
		// time-interval
		var ts = secClock();
		this.timeInterval = new Interval(ts, ts + this.options.lookahead, true, true);
		// position-interval
		this.posInterval = null;
	};

	Schedule.prototype.getTimeInterval = function (){return this.timeInterval;};
	Schedule.prototype.getPosInterval = function (){return this.posInterval;};
	Schedule.prototype.setPosInterval = function (interval) {this.posInterval = interval;};
	Schedule.prototype.sortFunc = function(a,b) {return a.ts - b.ts;};

	// push
	// task assumed to have a key -- se usage by Sequencer
	Schedule.prototype.push = function (now, ts, task) {
		if (this.timeInterval.coversPoint(ts)) {
			var entry = {
			    ts: ts,
			    task: task,
		    	push_ts: now
			};
			if (ts >= now) {
			    this.queue.push(entry);
			    this.queue.sort(this.sortFunc); // maintain ordering
			    return true;
			} else {
				console.log("Schedule : task pushed a bit too late, ts < now ", (ts-now));
			}
	    }
	    return false;
	};

		// pop
	Schedule.prototype.pop = function (now) {
	    var res = [];
	    while (this.queue.length > 0 && this.queue[0].ts <= now) {
			var entry = this.queue.shift();
			var info = {
			    task: entry.task,
			    pop_ts: now, // fresh timestamp?
			    push_ts: entry.push_ts,
			    ts: entry.ts
			};
			res.push(info);
	    }
	    return res;
	};
		

	/* Invalidate task with given key */
	Schedule.prototype.invalidate = function (key) {
	    var i, index, entry, remove = [];
	    // Find
	    for (i=0; i<this.queue.length; i++) {
			entry = this.queue[i];
			if (entry.task.key === key) {
			    remove.push(entry);
			}
	    }
	    // Remove
	    for (i=0; i<remove.length; i++) {
			entry = remove[i];
			index = this.queue.indexOf(entry);
			if (index > -1) {
			    this.queue.splice(index, 1);
			}
		}
    };


    /*

  		ADVANCE

      The covering time interval is defined by [start,end>
      The covering interval should be advanced so that it always
      contains real-time, e.g., now.

      Advancing the covering interval assumes task queues to be empty.
      Therefore, make sure to pop all task before calling advance.

      Also, the time-sequence of covering intervals should ideally
      lay back-to-back on the time-line. To achive this the end of
      one interval becomes the start of the next. The end of the interval is 
      now + lookahead.
  
      If advance is called before the current interval is expired,
      the current interval is cut short.
  
      If advance is not called for an extended time, the next
      invocation will cause the covering interval to stretch long
      into the past.
    
      If parameter start is supplied, this is used as starting point
      for covering interval.

	*/

	Schedule.prototype.advance = function(now) {
	    if (now < this.timeInterval.low) {
			console.log("Schedule : Advancing backwards " + (now - this.timeInterval.low));
	    } 
	    this.queue = []; // drop tasks (time interval cut off)
	    this.timeInterval = new Interval(now, now + this.options.lookahead, false, true);
	    this.posInterval = null; // reset
	};
	
	/* 
		Current schedule is expired (at given time)
	*/	
	Schedule.prototype.isExpired = function(now) {
		return (now > this.timeInterval.high);
	};

	/* 
		delay until the next due task in schedule, or until the
		current time_interval expires 
	*/
	Schedule.prototype.getDelayNextTs = function (ts) {
	    // ts should be fresh timestamp in seconds
	    if (this.queue.length > 0) {
			return Math.max(0.0, this.queue[0].ts - ts);
	    }
	    return Math.max(0.0, this.timeInterval.high - ts);
	};


	
	/*
		BUILDER

		Build arguments for updateAll function of Sequencer
	*/

	var Builder = function (sequencer) {
		this._argOrder = [];
		this._argMap = {};
		this._sequencer = sequencer;
	};

	Builder.prototype.addCue = function (key, interval, data) {
		this._argOrder.push(key);
		this._argMap[key] = {key:key, interval:interval, data: data};
		return this;
	};
	
	Builder.prototype.removeCue = function (key, removedData) {
		return this.addCue(key, undefined, removedData);
	};

	Builder.prototype.submit = function () {
		var argList = [];
		this._argOrder.forEach(function (key) {
			argList.push(this._argMap[key]);
		}, this);
		// reset
		this._argMap = {};
		this._argOrder = [];
		if (argList.length > 0) {
			return this._sequencer.updateAll(argList);
		}
		return [];
	};


	/*
		Sequencer Error
	*/
	var SequencerError = function (message) {
		this.name = "SequencerError";
		this.message = (message || "");
	};
	SequencerError.prototype = Error.prototype;


	/*
		Sequencer EArgs
	*/
	var SequencerEArgs = function (sequencer, key, interval, data, point, pointType, ts, dueTs, directionType, verbType) {
		this.src = sequencer;
		this.key = key;
		this.interval = interval;
		this.point = point;
		this.pointType = pointType;
		this.dueTs = dueTs;
		this.delay = ts - dueTs;
		this.directionType = directionType;
		this.verbType = verbType;
		this.data = data;
	};

	SequencerEArgs.prototype.toString = function () {
		var s = "[" +  this.point.toFixed(2) + "]";
        s += " " + this.key;
        s += " " + this.interval.toString();
        s += " " + this.verbType;
        s += " " + this.directionType;
        s += " " + this.pointType;
        s += " delay:" + this.delay.toFixed(4);
        if (this.data) s += " " + JSON.stringify(this.data);
        return s;
	};


	/*
		SequencerCue
	*/
	var SequencerCue = function (key, interval, data) {
		this.key = key;
		this.interval = interval;
		this.data = data;
	};

	SequencerCue.prototype.toString = function () {
		var s = this.key + " " + this.interval.toString();
		if (this.data) s += " " + JSON.stringify(this.data);
		return s;
	};


	/*
	
		SEQUENCER

	*/
	var Sequencer = function (motion) {
		this._motion = motion;
		this._axis = new axis.Axis();
		this._schedule = null;
		this._to = null; // timeout	
		this._activeKeys = []; // active intervals
		this._callbacks = { // event handlers
			events: [],
			enter: [],
			exit: [],
			change: [],
			changes: [] // for data that has changed on active objects (no enter-exit event)
		}; 
		this.ID = id(4);
			
		// initialise
		this._motion.on("change", this._onMotionUpdate, this);
		// Allow subclass to load data into the sequencer
		this.loadData();

	};

	// To be overridden by subclass specializations
	Sequencer.prototype.loadData = function () {};
	Sequencer.prototype.getData = function (key) {};

	/* 
	
		Motion UPDATED

		Whenever the motion position changes abruptly we need to
	        re-evaluate intervals. 

		A) Abrupt changes in position occur 1) after certain motion
	        updates or 2) when the motion is initially loaded.

		B) Non-abrupts changes occur when velocity or acceleration is
		changed without affecting the position

		In all cases - the schedule and timeout need to be re-evaluated.

        In case A. 1) the motion update is possibly late due to network
        latency. To include effects of singulars/intervals from the small "lost"
        time interval, make sure to advance according to the timestamp of the
		motion update.  2) and 3) aren't really motion updates, so they
        are not delayed.

        Furthermore in a small time-interval just before motion updates
        the previous motion incorrectly drove the sequencer instead of the new
        updated motion.  This may have caused the sequencer to falsely
        report some events, and to not report other events.  This time
        interval is (initVector[T], now). For non-singular Intervals this will be
        corrected by the general re-evalution of Intervals. For singular Intervals
        explicit action is required to signal incorrect events. This implementation
        does not support this.

	*/

	Sequencer.prototype._onMotionUpdate = function (event) {
		
	    var now = secClock(); // Set the time for this processing step
	    var initVector = this._motion.getInfo().vector;

	    if (this._schedule === null) {
			// Initial update from msv starts the sequencer
			this._schedule = new Schedule();
	    } else {
	    	// Deliberately set time (a little) back for delayed updates
	    	now = initVector[T];
	    	// Empty schedule
	    	this._schedule.advance(now); 
	    }

	    /*
	      Re-evaluate non-singularities
	      This is strictly not necessary after motion updates that
          preserve position. However, for simplicity we
	      re-evaluate intervals whenever motions changes.
	    */
	    var nowVector = calculateVector(initVector, now);
	    var oldKeys = this._activeKeys;
	    var newKeys = this._axis.lookupByPoint(nowVector[P]).map(function (item) {
	    	return item.key;
	    });
	    var exitKeys = unique(oldKeys, newKeys);
	    var enterKeys = unique(newKeys, oldKeys);

	    /*
			Corner Case: Exiting Singularities
			and
			Exiting closed intervals ]
			and 
			Entering open intervals <
	    */
	    var _isMoving = isMoving(initVector);
	    if (_isMoving) {
	    	var nowPos = nowVector[P];
		    var points = this._axis.lookupByInterval(new Interval(nowPos, nowPos, true, true));
		    points.forEach(function (pointInfo) {
		    	// singularities
				if (pointInfo.pointType === axis.PointType.SINGULAR) {
				    exitKeys.push(pointInfo.key);
				} else {
					// closed interval?
					var interval = pointInfo.interval;
					var closed = false;
					if (pointInfo.pointType === axis.PointType.LOW && interval.lowInclude) {
						closed = true;
					} else if (pointInfo.pointType === axis.PointType.HIGH && interval.highInclude) {
						closed = true;
					}
					// exiting or entering interval?
					var direction = calculateDirection(initVector, now);
					var entering = true;						
					if (pointInfo.pointType === axis.PointType.LOW && direction === DirectionType.BACKWARDS)
						entering = false;
					if (pointInfo.pointType === axis.PointType.HIGH && direction === DirectionType.FORWARDS)
						entering = false;
					// exiting closed interval
					if (!entering && closed) {
						exitKeys.push(pointInfo.key);
					}
					// entering open interval
					if (entering && !closed) {
						enterKeys.push(pointInfo.key);
					}
				}
		    }, this);
	    }

	  
	    /* 
	    	Note : is it possible that a key for singularity
	    	may be in both enterKeys and exitKeys? 
	    	- only in the corner case of movement and evaluation at eaxctly the point
	    	where the singularity lies - have duplicate protection elsewhere - ignore
		*/
	   
	    var exitItems = exitKeys.map(function (key) {
	    	return {key:key, interval: this._axis.getIntervalByKey(key), data: this.getData(key)};
	    }, this);
	    var enterItems = enterKeys.map(function (key) {
	    	return {key:key, interval: this._axis.getIntervalByKey(key), data: this.getData(key)};
	    }, this);
	    // Notify interval events
	    this._processIntervalEvents(now, exitItems, enterItems);
	        
	    /*
	      	Rollback falsely reported events
	      	Non-singular Intervals entered/left wrongly before update was sorted out above.
	      	- So far we do not roll back events. 
	    */

        /* 
        	Re-creating events lost due to network latency in motion update. 
        	This is achieved by advancing and loading from <now> which is derived 
        	from update vector rather than an actual timestamp. 
        */

	    // Kick off main loop
    	this._load(now);
    	this._main(now);
	};



	/*
	  UPDATE

	  Updates the axis. Updates have further effect
	  if they relate to intervals within the immediate future.  
	  This roughly corresponds to the covering
	  time-interval and covering position-interval.

		- EVENTS (i.e. singular intervals)
	  
	  Relevant events for the sequencer are those that apply to the immediate future
	  i.e. the Schedule.

	  - removed events may have to be invalidated if they were due in immediate future
	  - new events may be added to the schedule if due in immedate future

	  - INTERVALS
	  Relevant interval changes trigger exit or enter events,
	  and since their relevance is continuous they will be delayed
	  no matter how late they are, as long as the interval update is
	  relevant for the current position of the motion.
	 */

	Sequencer.prototype.updateAll = function(argList) {
		if (this._motion.readyState === this._motion.STATE["CLOSED"]) 
			throw new SequencerError("Update failed: Msv closed");

		var i, e, key, interval, data;	

		// Wrap update function of axis to capture axis operations
		var origOpList = this._axis.updateAll(argList);

		// filter out NOOPs
		var opList = origOpList.filter(function (op) {
			return (op.type !== axis.OpType.NOOP);
		});	

		if (this._motion.readyState === this._motion.STATE["INIT"]) {
			// nothing to do if msv is not ready
			return origOpList;
		}

		// axis is updated - update scheduler
	    var now = secClock();
	    var nowVector = calculateVector(this._motion.getInfo().vector, now);
	    var nowPos = nowVector[P];

	    // EXIT and ENTER Intervals
	    var enterItems = []; // {key:key, interval:interval}
	    var exitItems = []; // {key:key, interval:interval}
	    var isActive, shouldBeActive;
	    opList.forEach(function (op) {
	    	interval = op.interval;
	    	key = op.key;
		    /*
		      	Re-evaluate active intervals. Immediate action is required only if 
			    a interval was active, but no longer is -- or the opposite.

				Singularity intervals may not be ignored here - as a singluarity 
				might have been an active interval and just now collapsed
				into a singularity
		    */
		    isActive = this.isActive(key);
		    shouldBeActive = false;
		    if (op.type === axis.OpType.CREATE || op.type === axis.OpType.UPDATE) {
		    	if (interval.coversPoint(nowPos)) {
					shouldBeActive = true;
		    	}
		    }
		    // set data element
		    if (op.type === axis.OpType.REMOVE) {
		    	data = op.data 
		    } else {
		    	data = op.data || this.getData(key)
		    }

		    if (isActive && !shouldBeActive) {
		    	
				exitItems.push({key:key, interval:interval, data: data});
			} else if (!isActive && shouldBeActive) {
				enterItems.push({key:key, interval:interval, data: data});
		    }
	    }, this);


		/* 
			changes events
			generate change events for currently active spans, which did change, 
			but remained active - thus no enter/exit events will be emitted).
		
			these are items that are active, but not in enterItems list
			including NOOP operation (change in non-temporal sense)
		*/
		var changeItems = origOpList.
			filter (function (op) {
				return (this.isActive(op.key) && enterItems.indexOf(op.key) === -1);
			}, this).
			map (function (op) {
				return {key: op.key, interval: op.interval, data: op.data};
			}, this);



		// INVALIDATE events in the SCHEDULE
		if (this._schedule === null) return;
		/*
	      Re-evaluate the near future. The schedule may include
	      tasks that refer to these keys. These may have to
	      change as a result of intervals changing. 

	      Simple solution:
	      - invalidate all tasks in the schedule
	      - most of them wont be in the schedule
	      - invalidate even if the motion is not moving
	    
			if motion is not moving, the schedule may not have been advanced in a while
			simply advance it - to empty it - as an effective way of invalidation
		*/
		var _isMoving = isMoving(nowVector);
		if (!_isMoving) {
			// not moving - not sure this is necessary
			this._schedule.advance(now);
		} else {
			// moving - invalidate all events - possibly advance is just as good
			opList.forEach(function (op) {
				this._schedule.invalidate(op.key);
			}, this);

			// RELOAD events into the SCHEDULE
			var point, reloadPoints = [];
			opList.forEach(function (op) {
				interval = op.interval;
	    		key = op.key;

	    		// Nothing to reload for remove events
		    	if (op.type === axis.OpType.REMOVE) {
					return;
		    	}

				/* 
			       Corner Case: If the new interval is singularity, and if it
			       happens to be exactly at <nowPos>, then it needs to be
			       fired. 
			    */

			    // Reload only required if the msv is moving
				if (_isMoving) {
					/*
				      Load interval endpoints into schedule			      
				      The interval has one or two endpoints that might or might not be
				      relevant for the remainder of the current time-interval of the schedule.
				      Check relevance, i.t. that points are within the
				      position range of the schedule.
				    */
					var item = {key: key, interval: interval}; 
				    var rangeInterval = this._schedule.getPosInterval();
				    if (rangeInterval !== null) {
				    	if (rangeInterval.coversPoint(interval.low)) {
				    		item.point = interval.low;
				    	} 
				    	if (rangeInterval.coversPoint(interval.high)) {
				    		item.point = interval.high;
				    	}
				    	item.pointType = this._axis.getPointType(item.point, item.interval);
				    	reloadPoints.push(item);
				    }
				}
			}, this);

		   	// reload relevant points
		    if (reloadPoints.length > 0) {
				this._load(now, reloadPoints);
		    }
		}
	
		


		// break control flow with setTimeout so that events are emitted after addCue has completed
		var self = this;
		setTimeout(function () {
			// notify interval events
			self._processIntervalEvents(now, exitItems, enterItems);
			// notify change events
			self._processChangeEvents(now, changeItems);
			// kick off main loop
			self._main(now);
		}, 0);
	
	};


	/*
        Sequencer core loop, loops via the timeout mechanism as long
        as there is motion.
	*/
	Sequencer.prototype._main = function (now) {
	    // cancel_timeout
	    if (this._to !== null) {
			this._to.cancel();
			this._to = null;
	    }
	    now = now || secClock();
	    // process tasks (empty due tasks from schedule)
        this._processScheduleEvents(now, this._schedule.pop(now));
        // advance schedule window
        var _isMoving = isMoving(this._motion.getInfo().vector);
        if (_isMoving && this._schedule.isExpired(now)) {		
			now = this._schedule.getTimeInterval().high;
            this._schedule.advance(now);
            this._load(now);
            // process tasks again
            this._processScheduleEvents(now, this._schedule.pop(now));
	    }
        // set timeout if moving
        if (_isMoving) {
        	var secAnchor = secClock();	
			var secDelay = this._schedule.getDelayNextTs(secAnchor); // seconds
			var self = this;
			this._to = new Timeout(
					function () {self._main();}, 
					secDelay*1000, 
					{anchor: secAnchor*1000, early: 0.5}
				);
	    }
	};


	/* 
	   LOAD

       Sequencer loads a new batch of points from axis into
       the schedule

       If given_points is specified, this implies that the
       points to load are known in advance. This is the case when
       axis is being updated dynamically during execution. If
       points are not known the load function fetches points from
       the axis by means of the time cover of the schedule.

	   load only makes sense when motion is moving
	*/

	Sequencer.prototype._load = function (now, givenPoints) {
		var _isMoving = isMoving(this._motion.getInfo().vector);
	    if (!_isMoving) {
			return;
	    }
	    /* 
	       MOVING
	       Load events from time interval
	    */
	    var timeInterval = this._schedule.getTimeInterval();
	    var tStart = timeInterval.low;
	    var tEnd = timeInterval.high;
	    var tDelta = tEnd - tStart;
	    var initVector = this._motion.getInfo().vector;
		// motion.range should be expressed as Interval in the future. 
		var range = this._motion.getInfo().range;
		var rangeStart = (isNumber(range[0])) ? range[0] : -Infinity;
	    var rangeEnd = (isNumber(range[1])) ? range[1] : Infinity;
		var rangeInterval = new Interval(rangeStart, rangeEnd, true, true);

	    var vectorStart = calculateVector(initVector, tStart);
	    var points = givenPoints;

	    // Calculate points if not provided
	    if (!points) {
			// 1) find the interval covered by the motion during the time delta
			var posInterval = calculateInterval(vectorStart, tDelta);
			var pStart = Math.max(posInterval.low, rangeInterval.low);
			var pEnd = Math.min(posInterval.high, rangeInterval.high);
			posInterval = new Interval(pStart, pEnd, true, true);
			this._schedule.setPosInterval(posInterval);

			// 2) find all points in this interval
			points = this._axis.lookupByInterval(posInterval);
	    } 

	    /*
			Add data to points
	    */
	    points.forEach(function (pointInfo){
	    	pointInfo.data = this.getData(pointInfo.key);
	    }, this);


	    /*
	      Note : 1) and 2) could be replaced by simply fetching
	      all points of the axis. However, in order to avoid
	      calculating time intercepts for a lot of irrelevant points, we
	      use step 1) and 2) to reduce the point set.
	    */
	    
	    // create ordered list of all events for time interval t_delta 
	    var eventList = calculateSolutionsInInterval(vectorStart, 
								 tDelta,
								 points);
	    /* 
	       SUBTLE 1 : adjust for range restrictions within
	       time-interval tasks with larger delta will not be
	       pushed to schedule it is not necessary to truncate the
	       time interval of schedule similarly - just drop all
	       events after prospective range violations. <rDelta> is
	       time to (first) range violation
	    */	    
	    var rDelta = calculateDelta(vectorStart, rangeInterval)[0];
	    
 	    /* 
	       SUBTLE 2: avoid tasks exactly at start of time-interval
	       assume that this point should already be processed by the
	       previous covering interval.
	    */
	    
	    // filter and push events on sched
	    eventList.forEach(function (e)  {
	    	var d = e[0];
			var task = e[1];
			var push = true;
			
			/* 
			   drop events exactly at the start of the time covering
			   interval. 
			*/
			if (d === 0) {
			    push = false; 
			}
			/* 
			   drop all events scheduled after (in time) range
			   violation should occur
			*/
			if (d > rDelta) {
				push = false;  
			}
			/*
			  event scheduled exactly at range point.
			  - interval : 
			  Exiting/entering a interval should not happen at range point - drop
			*/
			if (d === rDelta) {
			    push = false;
			}
			
			/* 
			   check if we are touching an interval without
			   entering or exiting. Note that direction will
			   not be zero at this point, because direction
			   includes acceleration, which is not zero in
			   this case.
			   drop all interval events that have zero velocity
			   at the time it is supposed to fire
			*/
			if (task.pointType === axis.PointType.LOW || task.pointType === axis.PointType.HIGH) {
			    var v = calculateVector(this._motion.getInfo().vector, tStart + d);
			    if (v[V] === 0){
					push = false;
			    }
			}
			// push
			if (push) {		    
			    this._schedule.push(now, tStart + d, task);
			} 
	    }, this); 
	};


	/*
		Helper function to make event messages
	*/
	Sequencer.prototype._makeEArgs = function(key, interval, data, directionInt, verbType, point, ts, dueTs) {
		var directionType = DirectionType.fromInteger(directionInt);
		var pointType = this._axis.getPointType(point, interval);
		if (verbType === undefined) {
			var pointInt = axis.PointType.toInteger(pointType);
			var verbInt = pointInt * directionInt * -1;
			verbType = VerbType.fromInteger(verbInt);
		}
		return new SequencerEArgs(this, key, interval, data, point, pointType, ts, dueTs, directionType, verbType);
	};


	// Process point events originating from the schedule
	Sequencer.prototype._processScheduleEvents = function (now, eventList) {
	   	var msg, msgList = [];	   		
	   	var nowVector = calculateVector(this._motion.getInfo().vector, now);
   		var directionInt = calculateDirection(nowVector, now);
		var ts = secClock(); 
	    eventList.forEach(function (e) {
			if (e.task.interval.isSingular()) {
				// make two events messages for singular
				msg = this._makeEArgs(e.task.key, e.task.interval, e.task.data, directionInt, VerbType.ENTER,e.task.point, ts, e.ts);
				msgList.push(msg);
				msg = this._makeEArgs(e.task.key, e.task.interval, e.task.data, directionInt, VerbType.EXIT,e.task.point, ts, e.ts);
				msgList.push(msg);
			} else {				
		    	msg = this._makeEArgs(e.task.key, e.task.interval, e.task.data, directionInt, undefined, e.task.point, ts, e.ts);
		    	msgList.push(msg);	
			}			
	    }, this);
	    if (msgList) {
	     	this._notifyCallback(now, msgList);
	    }
	};

	// Process interval events orignating from update, motion update or initHandler
	Sequencer.prototype._processIntervalEvents = function (now, exitItems, enterItems, handler) {
	    if (exitItems.length + enterItems.length === 0) {
			return;
	    }
	    var nowVector = calculateVector(this._motion.getInfo().vector, now);
		var directionInt = calculateDirection(nowVector, now);
		var ts = secClock(); 
		var msgList = [];
		exitItems.forEach(function (item){
			msgList.push(this._makeEArgs(item.key, item.interval, item.data, directionInt, VerbType.EXIT, nowVector[P], ts, now));
		}, this); 
		enterItems.forEach(function (item){
			msgList.push(this._makeEArgs(item.key, item.interval, item.data, directionInt, VerbType.ENTER, nowVector[P], ts, now));
		}, this);
	    this._notifyCallback(now, msgList, handler);
	};

	// Process change events
	Sequencer.prototype._processChangeEvents = function (now, changeItems) {
		this._doCallbacks("changes", changeItems);
		changeItems.forEach(function (e) {
			this._doCallbacks("change", e);
		}, this);
	};

	// used to create initial callback from active keys
	Sequencer.prototype._initHandler = function (handler) {
		// only do initial callback if motion is ready
		if (this._motion.readyState !== this._motion.STATE["INIT"]) {
			var now = secClock();
			if (this._activeKeys.length > 0) {
				var activeItems = this._activeKeys.map(function (key) {
					return {key:key, interval: this._axis.getIntervalByKey(key), data: this.getData(key)};
				}, this);
			    this._processIntervalEvents(now, [], activeItems, handler);
				return true;
			}
		}
		return false;
	};
	
	/*
		Notify callback ensures consistency of active keys as changes
		to active keys are driven by actual notifications
	*/

	Sequencer.prototype._notifyCallback = function (now, msgList, handler) {
		var index, eventList = [];
		msgList.forEach(function (msg) {
			// exit interval - remove keys 
		    if (msg.verbType === VerbType.EXIT) {
				index = this._activeKeys.indexOf(msg.key);
				if (index > -1) {
			    	this._activeKeys.splice(index, 1);		
				} else {
					// drop duplicates, except for immediate events (handler !== undefined)
					if (handler === undefined) return;
				}
		    }
		    // enter interval - add key
		    if (msg.verbType === VerbType.ENTER) {
				index = this._activeKeys.indexOf(msg.key);
				if (index === -1) {
				    this._activeKeys.push(msg.key);
				} else {
					// drop duplicates, except for immediate events (handler !== undefined)
					if (handler === undefined) return;
				}
		    }
		    eventList.push(msg);
		}, this);


		if (eventList.length > 0) {
			// make sure event_list is correctly ordered
			eventList = this._reorderEventList(eventList);
			// invoke
	    	this._doCallbacks("events", eventList, handler);
	    	eventList.forEach(function (e) {
	    		if (e.verbType === VerbType.ENTER) {
	    			this._doCallbacks("enter", e, handler);
	    		} else {
	    			if (e.verbType === VerbType.EXIT) {
	    				this._doCallbacks("exit", e, handler);
	    			}
	    		}
	    	}, this);
	    }	    
	};

	Sequencer.prototype._doCallbacks = function(what, e, handler) {
	 	var err;
		// invoke callback handlers
		this._callbacks[what].forEach(function(h) {
			if (handler === undefined) {
	      		// all handlers to be invoked, except those with pending immeditate
	      		if (h["_immediatePending_" + what + this.ID]) {
	      			return;
	      		}
	      	} else {
	      		// only given handler to be called
	      		if (h === handler) handler["_immediatePending_" + what + this.ID] = false;
	      		else {
	      			return;
	      		}
	      	}
	        try {
	          h.call(h["_ctx_" + what + this.ID], e);
	        } catch (err) {
	          console.log("Error in " + what + ": " + h + ": " + err);
	        }
		}, this);
    };
	
	/*
		Event list is sorted by time. 
		There can be multiple events on the same time.
		Events with the same point (thus time) need to be sorted according to the following precedence
		a. exit interval > (interval does not include exit-point)
		x. enter interval [ (interval includes enter-point)
		b. enter singular
		c. exit singular			
		y. exit intervals ] (interval includes exit-point)
		d. enter intervals < (interval does not include enter-point)
	*/
	Sequencer.prototype._reorderEventList = function (msgList) {
		if (msgList.length < 2) return msgList;
		// stack events per point
		var point, dueTs, newList = [];
		var s = {"a": [], "x": [], "b": [], "c": [], "y": [], "d": []};
		msgList.forEach(function(msg) {
			// new point - pop from stack
			if (msg.point !== point || msg.dueTs !== dueTs) {
				newList = newList
					.concat(s["a"])
					.concat(s["x"])
					.concat(s["b"])
					.concat(s["c"])
					.concat(s["y"])
					.concat(s["d"]);
				s = {"a": [], "x": [], "b": [], "c": [], "y": [], "d": []};
				point = msg.point;
				dueTs = msg.dueTs;
			}
			// push on stack
			if (msg.pointType === axis.PointType.SINGULAR) {
				if (msg.verbType === VerbType.ENTER) {
					// enter singular
					s["b"].push(msg);
				} else {
					// exit singular
					s["c"].push(msg);
				}
			} else {
				/* 
					Interval
					special ordering when we enter or exit interval
					through endpoint (low or high) and this endpoint is CLOSED ] as opposed to OPEN >
				*/
				var closed = false;
				if ((msg.pointType === axis.PointType.LOW) && msg.interval.lowInclude) {
					closed = true;
				} else if ((msg.pointType === axis.PointType.HIGH) && msg.interval.highInclude) {
					closed = true;
				}
				if (msg.verbType === VerbType.ENTER) {
					// enter interval
					if (closed) s["x"].push(msg);
					else s["d"].push(msg);
				} else {
					// exit interval
					if (closed) s["y"].push(msg);
					else s["a"].push(msg);
				}
			}
		}, this);

		// pop last from stack
		return newList
				.concat(s["a"])
				.concat(s["x"])
				.concat(s["b"])
				.concat(s["c"])
				.concat(s["y"])
				.concat(s["d"]);
	};

	
	

    // regiser callback
	Sequencer.prototype.on = function (what, handler, ctx) {
    	if (!handler || typeof handler !== "function") 
    		throw new SequencerError("Illegal handler");
    	if (!this._callbacks.hasOwnProperty(what)) 
    		throw new SequencerError("Unsupported event " + what);
    	 if (this._motion.readyState === this._motion.STATE["CLOSED"]) 
    	 	throw new SequencerError("Msv closed");
    	var index = this._callbacks[what].indexOf(handler);
        if (index === -1) {
        	// register handler
        	handler["_ctx_" + what + this.ID] = ctx || this;
        	this._callbacks[what].push(handler);
        	if (what === "events" || what === "enter") {
		    	// flag handler
		    	handler["_immediatePending_" + what + this.ID] = true;
		    	// do immediate callback
		    	var self = this;
		    	setTimeout(function () {
		    		var immediateDone = self._initHandler(handler);
		    		if (!immediateDone) {
		    			handler["_immediatePending_" + what + self.ID] = false;
		    		}
		    	}, 0);
		    }
        }
        return this;
    };

	// unregister callback
    Sequencer.prototype.off = function (what, handler) {
    	if (this._callbacks[what] !== undefined) {
    		var index = this._callbacks[what].indexOf(handler);
        	if (index > -1) {
        		this._callbacks[what].splice(index, 1);
	  		}
    	}
    	return this;
    };


    // get request builder object
	Sequencer.prototype.request = function () {
		return new Builder(this);
	};

	// TODO : force SequencerCue object on input?
	Sequencer.prototype.addCue = function (key, interval, data) {
		return this.updateAll([{key:key, interval:interval, data: data}]);
	};

	Sequencer.prototype.removeCue = function (key, removedData) {
		return this.updateAll([{key:key, interval:undefined, data:removedData}]);
	};

	// true if cues exists with given key
	Sequencer.prototype.hasCue = function (key) {
		return this._axis.hasKey(key);
	};

	// Get all keys
	Sequencer.prototype.keys = function () {
		return this._axis.keys();
	};
	
	// get specific cue {key: key, interval:interva} given key
	Sequencer.prototype.getCue = function (key) {
		if (this._axis.hasKey(key)) {
			return new SequencerCue (key, this._axis.getIntervalByKey(key), this.getData(key));
		}  
	};

	// get all cues
	Sequencer.prototype.getCues = function () {
		return this.keys().map(function (key) {
			return this.getCue(key);
		}, this);
	};

	// return true if cue of given key is currently active
	Sequencer.prototype.isActive = function (key) {
	    return (this._activeKeys.indexOf(key) > -1);
	};

	// Get keys of active cues
	Sequencer.prototype.getActiveKeys = function () {
		// copy keys
		var res = [];
		this._activeKeys.forEach(function (key) {
			res.push(key);
		}, this);
		return res;
	};

	Sequencer.prototype.getActiveCues = function () {
		var res = [];
		this._activeKeys.forEach(function (key) {
			res.push(this.getCue(key));
		}, this);
		return res;
	};


	// return all (key, inteval, data) tuples, where interval covers point
	Sequencer.prototype.getCuesByPoint = function (point) {
		return this._axis.lookupByPoint(point).map(function (item) {
			return this.getCue(item.key);
		}, this);
	};

	// return all cues with at least one endpoint within searchInterval
	Sequencer.prototype.getCuesByInterval = function (searchInterval) {
		// keys may be mentioned for 2 points in searchInterval - use dict to avoid duplicating intervals
		var _dict = {};
		this._axis.lookupByInterval(searchInterval).forEach(function (pointInfo) {
			_dict[pointInfo.key] = pointInfo.interval;
		});
		return Object.keys(_dict).
			map(function(key){
				return this.getCue(key);
			}, this).
			filter(function (cue) {
				return (searchInterval.coversInterval(cue.interval));
			}, this);
	};

	// return all cues covered by searchInterval
	Sequencer.prototype.getCuesCoveredByInterval = function (searchInterval) {
		return this.getCuesByInterval(searchInterval).filter(function (cue) {
			return (searchInterval.overlapsInterval(cue.interval)) ? true : false;
		}, this);
	};

	// shutdown
	Sequencer.prototype.close = function () {
	    this._motion.off("change", this._onMotionUpdate);
	    if (this.to !== null) {
			this.to.cancel();
			this.to = null;		
	    }
	};


	// Inherit function used for specialized sequencers.
	var inherit = function (Child, Parent) {
		var F = function () {}; // empty object to break prototype chain - hinder child prototype changes to affect parent
		F.prototype = Parent.prototype;
		Child.prototype = new F(); // child gets parents prototypes via F
		Child.uber = Parent.prototype; // reference in parent to superclass
		Child.prototype.constructor = Child; // resetting constructor pointer 
	};

	// Module Definition
	return {
		inherit : inherit,
		Interval : Interval,
		Sequencer : Sequencer,
		SequencerError : SequencerError,
	};

});




