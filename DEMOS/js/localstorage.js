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
   
define(['sequencer/sequencer'], function (seq) {

    /*
        This module contains building block for visualization of timed data from localStorage

        - a sequencer specialization for localStorage
        - a viewer for the contents of localStorage
    */

    var supports_html5_storage = function() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    };

    /*
        LOCAL STORAGE


        Wrap localstorage to correct a bug in the specification 
        Localstorage does not trigger event in the same document where the change is requested.
        This is just terrible.
        Workaround involves dispatching new events for current document.
        May yield duplicate events as some browsers do not follow dumb ass specification.
    */


    var LocalStorage = function () {
        if (!supports_html5_storage()) throw new Error("LocalStorage not supported");
    };
    LocalStorage.prototype.key = function (i) {return window.localStorage.key(i)};
    Object.defineProperty(LocalStorage.prototype, "length", {
        get: function () {return window.localStorage.length;}
    });
    LocalStorage.prototype.getItem = function (key) {return window.localStorage.getItem(key);};
    LocalStorage.prototype.setItem = function (key, newValue) {
        var oldValue = window.localStorage.getItem(key);
        var res = window.localStorage.setItem(key, newValue);
        // Trigger event on document
        setTimeout(function () {
            var e = document.createEvent("StorageEvent");
            e.initStorageEvent(
                "storage",
                false,
                false,
                key,
                oldValue,
                newValue,
                window.location,
                localStorage
            );
            window.dispatchEvent(e)
        },0);
        return res;
    };
    LocalStorage.prototype.removeItem = function (key) {
        var oldValue = window.localStorage.getItem(key);
        if (oldValue !== null) {
            window.localStorage.removeItem(key);
            // Trigger event on document
            var e = document.createEvent("StorageEvent");
            e.initStorageEvent(
                "storage",
                false,
                false,
                key,
                oldValue,
                null,
                window.location,
                localStorage
            );
            setTimeout(function () {window.dispatchEvent(e)},0);
        }
    };

    // Initialise localStorage with some mock-up data
    var initialise = function (storage) {
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

        Object.keys(associative).forEach(function (key) {
            // add key if not already defined
            var value = storage.getItem(key);
            if (value === null) {
                storage.setItem(key, JSON.stringify(associative[key]));
            } 
        });
    };


    // Make wrapped LocalStorage available through a singleton
    var _singletonLocalStorage;
    var getLocalStorage = function () {
        if (!_singletonLocalStorage) {
            _singletonLocalStorage = new LocalStorage();
            initialise(_singletonLocalStorage);
        }
        return _singletonLocalStorage;
    };
   

    /*
        LOCAL STORAGE SEQUENCER

        - assume values are objects include data, start and end properties
    */
    var checkValue = function (value) {
        if (typeof value !== 'object') return false;
        return (value.hasOwnProperty("start") && value.hasOwnProperty("end") && value.hasOwnProperty("data")); 
    };


    var LocalStorageSequencer = function (motion) {
        this._storage = getLocalStorage();
        seq.Sequencer.call(this, motion);
    };
    seq.inherit(LocalStorageSequencer, seq.Sequencer);

    LocalStorageSequencer.prototype.loadData = function () {
        // load initial data 
        var key, value, length = this._storage.length;
        for (var i=0; i<length; i++) {
            key = this._storage.key(i);
            value = this._storage.getItem(key);
            var e = {
                key: key,
                oldValue : null,
                newValue: value
            };
            this.handleEvent(e);          
        }
        // set event handler
        if (window.addEventListener) {
            window.addEventListener("storage", this, false);
        } else {
            throw new seq.SequencerError("LocalStorage addEventListener not supported");
        };
    };

    LocalStorageSequencer.prototype.getData = function (key) {
        return JSON.parse(this._storage.getItem(key));
    };

    LocalStorageSequencer.prototype.handleEvent = function (e) {
        if (e.newValue === null) {
            // remove
            this.removeCue(e.key, JSON.parse(e.oldValue));
        } else {
            // add or modify
            var value = JSON.parse(e.newValue);
            if (checkValue(value)) {
                this.addCue(e.key, new seq.Interval(value.start, value.end), value);
            } 
        }
    };



    /*  
        LOCAL STORAGE VIEWER

        Visualize dynamic content of Local Storage. 
        Use motion to and a LocalStorageSequencer to visualize active (keys)
    */
    var LocalStorageViewer = function (motion, elem) {
        if (!supports_html5_storage()) throw new Error("LocalStorage not supported");
        this._storage = getLocalStorage();
        this._sequencer = new LocalStorageSequencer(motion);
        this._elem = elem;
        // Initialise UI
        this.refresh();
        // set event handlers on localStorage
        if (window.addEventListener) {
            window.addEventListener("storage", this, false);
        } else {
            throw new Error("LocalStorage addEventListener not supported");
        };
        // set up event handler on UI
        var self = this;
        this._elem.onclick = function (e) {
            // find key as id attribute of parent DIV enclosing BUTTON 
            if (e.target.parentNode.id && e.target.localName === 'button') {
                self._storage.removeItem(e.target.parentNode.id);
            }
        };
        // set up event handler on sequencer
        this._sequencer.on("enter", function (e) {self.handleEnter(e);});
        this._sequencer.on("change", function (e) {self.handleChange(e);});
        this._sequencer.on("exit", function (e) {self.handleExit(e);});    
    };

    LocalStorageViewer.prototype.refresh = function () {
        var html = "";
        var key, value, length = this._storage.length;
        for (var i=0; i<length; i++) {
            key = this._storage.key(i);
            html += this._getElementHTML(key);
        }
        this._elem.innerHTML = html;
        this.sortChildNodesByKey();
    };

    LocalStorageViewer.prototype._getElementHTML = function (key) {
        var html = "";
        var value = JSON.parse(this._storage.getItem(key));
        if (checkValue(value)) {
            html += "<div id=\"" + key + "\" ";
            if (this._sequencer.isActive(key)) html += "class=\"active\"";
            html +=  "\">";
            html += "<button> remove </button>";
            html += "&nbsp;\"" + key + "\" : \"" + this._storage.getItem(key) + "\"&nbsp;";
            html += "</div>";
        }
        return html;
    }

    LocalStorageViewer.prototype.sortChildNodesByKey = function () {
        var elems = this._elem.childNodes;
        // copy
        var array = [];
        for (var i in elems) {
            if (elems[i].nodeType === 1) array.push(elems[i]);
        }    
        // sort    
        array.sort(function (a,b) {
            return (a.id === b.id) 
                ? 0 
                : (a.id > b.id) ? 1 : -1;
        });
        // insert
        for (var i=0; i<array.length; i++) {
           this._elem.appendChild(array[i]); 
        }
    };


    LocalStorageViewer.prototype.handleEvent = function (e) {
        var elem = document.getElementById(e.key);
        if (e.newValue === null) {
            // remove
            if (elem) this._elem.removeChild(elem);
        } else {
            if (elem) {
                // modify
                elem.innerHTML = this._getElementHTML(e.key);
            } else {
                // add
                var tmp = document.createElement('DIV');
                var html =  this._getElementHTML(e.key);
                if (html) {
                    tmp.innerHTML = html;
                    this._elem.appendChild(tmp.childNodes[0]);
                    this.sortChildNodesByKey();
                }
            }
        }
    };



    LocalStorageViewer.prototype.handleEnter = function (e) {
        var elem = document.getElementById(e.key);
        if (elem) elem.className = "active";
    };

    LocalStorageViewer.prototype.handleChange = function (e) {
        /* 
            nothing - all data changes are handled directly from viewer -
            taking isActive into consideration when needed - thus
            no need for a specific change event for active elements
        */
    };

    LocalStorageViewer.prototype.handleExit = function (e) {
        var elem = document.getElementById(e.key);
        if (elem) elem.className = "";
    };


    /*
        LOCAL STORAGE EDITOR
    */

    // utility
    var parseNumber = function(n) {
        var f = parseFloat(n);
        if (!isNaN(f) && isFinite(n)) {
            return f;
        };
        return null;
    };

    var unique_key = function(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < length; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };

    var itemEquals = function(item_a, item_b) {
        if (item_a === null || item_b === null) return false;
        if (item_a.data !== item_b.data) return false;
        if (item_a.type !== item_b.type) return false;
        if (item_a.start !== item_b.start) return false;
        if (item_a.end !== item_b.end) return false;
        return true;
    };

    var LocalStorageEditor = function (rootElem) {
        this._rootElem = rootElem;
        this._storage = getLocalStorage();

        var html = "";  
        html += "key:&nbsp;<input type='text' name='key' value='' placeholder='optional' size='50'/>&nbsp;";
        html += "<input type='button' name='load' value='Load by given key'/></br>"; 
        html += "data:&nbsp;<input type='text' name='data' value='' placeholder='text' size='50'/></br>";
        html += "start:&nbsp;<input type='text' name='start' value='' placeholder='float' size='5'/>&nbsp;";
        html += "end:&nbsp;<input type='text' name='end' value='' placeholder='float' size='5'/></br>";
        html += "<input type='button' name='clear' value='Clear'/>";
        html += "<input type='button' name='post' value='Post'/>";
        rootElem.innerHTML = html; 

        // identify elements in DOM
        this._inputElems = {}; // name -> elem
        var elem, elems = rootElem.getElementsByTagName('input');
        for (var i=0; i<elems.length; i++) {
            elem = elems[i];
            if (elem.name) {
                this._inputElems[elem.name] = elem;
            }  
        }

        // Set up click handlers
        var self = this;
        this._inputElems['load'].onclick = function (e) {self.load();};
        this._inputElems['clear'].onclick = function (e) {self.clear();};
        this._inputElems['post'].onclick = function (e) {self.post();};
    };

    LocalStorageEditor.prototype.clear = function () {
        this._inputElems['key'].value = "";
        this._inputElems['data'].value = "";
        this._inputElems['start'].value = "";
        this._inputElems['end'].value = "";  
    };

    LocalStorageEditor.prototype.post = function () {
        var key = this._inputElems['key'].value;
        var newValue = {
            data: this._inputElems['data'].value,
            start: parseNumber(this._inputElems['start'].value),
            end: parseNumber(this._inputElems['end'].value)
        };
        if (key) {
            // protect agaist noop posts
            var oldValue = JSON.parse(this._storage.getItem(key));                
            if (!itemEquals(oldValue, newValue)) {
                // post
                this._storage.setItem(key, JSON.stringify(newValue));
            }
            // cleanup UI
            this.clear();
        } else if ( newValue.data && newValue.start !== null && newValue.end !== null) {
            // no key - but there is data to post
            // invent key
            var key = unique_key(3);
            // post
            this._storage.setItem(key, JSON.stringify(newValue));
            this.clear();
        } else {
            // nothing
        }
    };
   
    LocalStorageEditor.prototype.load = function () {
        var value, key = this._inputElems['key'].value;
        if (key) {
            value = this._storage.getItem(key);
            if (value) value = JSON.parse(value);
            this._inputElems['data'].value = value.data;
            this._inputElems['start'].value = value.start;
            this._inputElems['end'].value = value.end;
        }
    };
       
   
    return {
        LocalStorageSequencer : LocalStorageSequencer,
        LocalStorageViewer : LocalStorageViewer,
        LocalStorageEditor : LocalStorageEditor
    };
 

});