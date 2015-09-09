var DEMO = function () {

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


	var run = function (motions) {
		var to = motions.shared;
		var mod = SEQUENCER;
		// create sequencer
    	var s = new mod.Sequencer(to);
        var Interval = mod.Interval;
   
        // Load array indexes as keys into Sequencer
        for (var i=0; i<array.length; i++) {
            var obj = array[i];
            s.addCue(i.toString(), new Interval(obj.start, obj.end));
        }
     
        // Set up UI
        var el = document.getElementById("active");
        s.on("enter", function (e) {
            el.innerHTML = "<b>" + JSON.stringify(array[parseInt(e.key)]) + "</b>";
        });
        s.on("exit", function (e) {
            el.innerHTML = "";
        });
        var posEl = document.getElementById("position");
        to.on("timeupdate", function (e) {
            posEl.innerHTML = "pos: <b>[" + to.query().pos.toFixed(2) + "]</b>";
        });
	};
	return { run : run };
}();
