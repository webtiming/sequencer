---
layout: default
title: Hello World Require
---

Minimal Web page setting up Shared Motion as timing object and initializing the Sequencer. This uses requirejs for script includes; 

Scripts:

- [sequencer-require.js](../lib/sequencer-require.js) 
- [sequencer-require-min.js](../lib/sequencer-require-min.js)

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- requirejs config -->
    <script>
      var require = {
        baseUrl : '../source', // module name <sequencer> points to sequencer.js inside source directory
        paths: {
          'mcorp': 'http://mcorp.no/lib/mcorp-2.0',
          //'sequencer': '../lib/sequencer-require', // module name <sequencer> points to built js file - non-minified
          //'sequencer': '../lib/sequencer-require-min', // module name <sequencer> points to built js file - minified 
        },
        shim: { 
            'mcorp': { exports: 'MCorp'}
        }
      };
    </script>
    <!-- requirejs -->
    <script src="../lib/require.js"></script>
    <!--  main -->
    <script text="javascript">
      require(['mcorp', 'sequencer'], function (MCorp, seq) {
        var app = MCorp.app("8456579076771837888", {anon:true});
        app.run = function () {
            var s = new seq.Sequencer(app.motions.shared);
            document.getElementById("text").innerHTML = "Hello Sequencer!"
        };
        if (document.readyState === "complete") app.init();
        else window.onload = app.init;
      });
    </script>    
  </head>
  <body>
    <h1>Hello World</h1>
    <h1 id="text"></h1>
  </body>
</html>
```


Test [helloworld-require.html](../examples/helloworld-require.html)