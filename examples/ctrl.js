var DEMO = function () {

	var run = function (motions) {
		var root = document.getElementById("demo");
		var to = motions.shared; // timing object

	    // Hook up text UI
    	var value = document.getElementById('position');
      	to.on("timeupdate", function () {
      		var v = to.query();
      		value.innerHTML = "p: " + v.pos.toFixed(2) + ", v: " + v.vel.toFixed(2) + ", a: " + v.acc.toFixed(2);
      	});

		// Hook up buttons UI
		var buttonsEl = document.getElementById("buttons");
		buttonsEl.onclick = function (e) {
			var elem, evt = e ? e:event;
			if (evt.srcElement)  elem = evt.srcElement;
			else if (evt.target) elem = evt.target;
			if (elem.id === "reset") to.update(0.0);
			else if (elem.id === "pause") to.update(null, 0.0, 0.0);
			else if (elem.id === "play") to.update(null, 1.0, 0.0);
			else if (elem.id === "end") to.update(100.0);

			else { // relative
				var v = to.query();
				if (elem.id === "p-") to.update(v.pos - 1);
				else if (elem.id === "p+") to.update(v.pos + 1);
				else if (elem.id === "v-") to.update(null, v.vel - 1);
				else if (elem.id === "v+") to.update(null, v.vel + 1);
				else if (elem.id === "a-") to.update(null, null, v.acc - 1);
				else if (elem.id === "a+") to.update(null, null, v.acc + 1);
			}
		}
	};
	return { run : run };
}();
