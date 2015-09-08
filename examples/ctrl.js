var DEMO = function () {

	var run = function (motions) {
		var root = document.getElementById("demo");
		var to = motions.shared; // timing object

		var html = "";
		html += "<button id='play'>Play</button>";
		html += "<button id='pause'>Pause</button>";
		html += "<button id='reset'>Reset</button>";
		html += "<div id='value'><div>";

		root.innerHTML = html;		

	    // Hook up text UI
    	var value = document.getElementById('value');
      	to.on("timeupdate", function () {value.innerHTML = to.query().pos.toFixed(2)});

		// Hook up buttons UI
    	var playBtn = document.getElementById('play');
    	var pauseBtn = document.getElementById('pause');
    	var resetBtn = document.getElementById('reset');
    	playBtn.onclick = function () {to.update(null, 1.0, 0.0);};
    	pauseBtn.onclick = function () {to.update(null, 0.0, 0.0);};
    	resetBtn.onclick = function () {to.update(0.0, 0.0, 0.0);};
	};

	return { run : run };
}();
