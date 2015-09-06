define (['sequencer'], function (seq) {
	return function (motions) {
		// do stuff here
		var s = new seq.Sequencer(motions.shared);
		console.log("hurrah!");
	};
});