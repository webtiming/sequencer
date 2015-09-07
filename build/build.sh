node r.js -o baseUrl=../Sequencer name=sequencer out=../lib/sequencer-require-min.js # built and minified for requirejs usage
node r.js -o baseUrl=../Sequencer name=sequencer optimize=none out=../lib/sequencer-require.js # built for requirejs usage
node r.js -o almond-build.js optimize=none out=../lib/sequencer.js
node r.js -o almond-build.js out=../lib/sequencer-min.js