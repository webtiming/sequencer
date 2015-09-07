node r.js -o baseUrl=../source name=sequencer out=built/sequencer-require-min.js # built and minified for requirejs usage
node r.js -o baseUrl=../source name=sequencer optimize=none out=built/sequencer-require.js # built for requirejs usage
node r.js -o almond-build.js optimize=none out=built/sequencer.js # built for regular script includes
node r.js -o almond-build.js out=built/sequencer-min.js # built and minified for regular script includes