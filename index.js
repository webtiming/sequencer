var DEMO = function () {


	var text = "This animation is driven by the Sequencer and synchronized globally through TimingObject and Shared Motion! Open the page on multiple devices, click play and be amazed!";
	var range = [0.0, 100.0];
	var scale = function (offset, oldLength, newLength) {
		return offset*range[1]/text.length;
	};
	var data = [];
	for (var i=0; i<text.length; i++) {
		data.push({key:i.toString(), start:scale(i), end:scale(i+1), data: text[i]});
	}

	var Viewer = function (rootElem, to, sequencer, timeddata) {
		this.rootElem = rootElem;
		this.to = to; // timing object
		this.sequencer = sequencer;

		// initialise DOM
		var html = "";
		html += "<p id='buttons'>";
		html += "<button id='tostart'>Start</button>";
		html += "<button id='pause'>Pause</button>";
		html += "<b><button id='forward'>Play</button></b>";
		html += "<button id='backward''>Backwards</button>";
		html += "<button id='toend' style='margin-right:10px'>End</button>";
		html += "<button id='fastbackward''>\<\<</button>";	
		html += "<button id='fastforward'>\>\></button>";
		html += "<b><span id='position' style='float:right'></span></b>";
		html += "</p>";
		html += "<p>";
		timeddata.forEach(function (item) {
			html += "<span id='"+ item.key +"'>" + item.data + "</span>";
		});
		html += "</p>";
		this.rootElem.innerHTML = html;

		// set up button click handlers
		var buttonsElem = document.getElementById("buttons");
		var self = this;
		buttonsElem.onclick = function (e) {
			var elem, evt = e ? e:event;
			if (evt.srcElement)  elem = evt.srcElement;
			else if (evt.target) elem = evt.target;
			if (elem.id === "tostart") self.to.update(0.0);
			else if (elem.id === "fastbackward") self.to.update(null, -3.0);
			else if (elem.id === "backward") self.to.update(null, -1.0);
			else if (elem.id === "pause") self.to.update(null, 0.0);
			else if (elem.id === "forward") self.to.update(null, 1.0);
			else if (elem.id === "fastforward") self.to.update(null, 3.0);
			else if (elem.id === "toend") self.to.update(100.0);
		}

		// set up refresh of timingobject position
		this.to.on("timeupdate", function () {
			document.getElementById("position").innerHTML = this.to.query().pos.toFixed(2);
		}, this);

		// register data in sequencer
		var Interval = SEQUENCER.Interval;
		timeddata.forEach(function(item) {
			this.sequencer.addCue(item.key, new Interval(item.start, item.end));
		}, this);

		// init bold face
		this.to.on("change", function () {
			var pos = this.to.query().pos;
			var leftInterval = new Interval(0.0, pos, true, true);
			this.sequencer.getCues().forEach(function (cue) {
				var el = document.getElementById(cue.key);
				if (leftInterval.overlapsInterval(cue.interval)) el.classList.add("bold");
				else el.classList.remove("bold");
			});
		}, this);
	
		// register event handlers on sequencer
		this.sequencer.on("enter", function (e) {
			var el = 	document.getElementById(e.key);
			el.classList.add("bold");
			el.classList.add("active");
		});
		this.sequencer.on("exit", function (e) {
			var el = document.getElementById(e.key);
			el.classList.remove("active");
			if (e.directionType === "backwards") el.classList.remove("bold");
		});
	};

	








	
	var run = function (motions) {
		var root = document.getElementById("demo");
		var to = motions.shared; // timing object
		var s = new SEQUENCER.Sequencer(to);
		new Viewer(root, to, s, data);
	};

	return { run : run };
}();
