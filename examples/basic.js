var DEMO = function () {


	var log = function (listEl, str) {
		var entry = document.createElement('li');		
		entry.innerHTML = str;
		listEl.appendChild(entry);
	};

	var run = function (motions) {
		var to = motions.shared;
		var mod = SEQUENCER;
		// create sequencer
    	var s = new mod.Sequencer(to);
        var Interval = mod.Interval;
    	// load cues
        s.request()
            .addCue("zero", new Interval(0.0, 9.9))
            .addCue("one", new Interval(0.5, 2.1))
            .addCue("two", new Interval(4.4, 5.6))
            .addCue("four", new Interval(3.3, 3.3))
            .addCue("five", new Interval(-Infinity, Infinity))
            .addCue("seven", new Interval(0))
            .addCue("eight", new Interval(3.3, 3.3))
            .submit();
        
         // Set up UI
        var activeEl = document.getElementById("active");
        var logEl = document.getElementById("log");
        s.on("enter", function (e) {
            activeEl.innerHTML = "active keys: <b>" + JSON.stringify(s.getActiveKeys()) + "</b>";
            log(logEl, e.toString());
        });
        s.on("exit", function (e) {
            activeEl.innerHTML = "active keys: <b>" + JSON.stringify(s.getActiveKeys()) + "</b>";
            log(logEl, e.toString());
        });
        var posEl = document.getElementById("position");
        to.on("timeupdate", function (e) {
        	posEl.innerHTML = "pos: <b>[" + to.query().pos.toFixed(2) + "]</b>";
        });
	};
	return { run : run };
}();
