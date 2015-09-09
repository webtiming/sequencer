---
layout: default
title: Hello World
---

Minimal Web page setting up Shared Motion as timing object and initializing the Sequencer. This uses basic script includes;

Scripts:

- [sequencer.js](../lib/sequencer.js)
- [sequencer-min.js](../lib/sequencer-min.js)


```html
<!DOCTYPE html>
<html>
  <head>
    <script text="javascript" src="http://mcorp.no/lib/mcorp-2.0.js"></script>
    <script text="javascript" src="/lib/sequencer.js"></script>
    <script text="javascript">
      var app = MCorp.app("8456579076771837888", {anon:true});
      app.run = function () {
        var s = new SEQUENCER.Sequencer(app.motions.shared);
        document.getElementById("text").innerHTML = "Hello Sequencer!";
      };
      if (document.readyState === "complete") app.init();
      else window.onload = app.init;
    </script>
  </head>
  <body>
    <h1>Hello World</h1>
    <h1 id="text"></h1>
  </body>
</html>
```

Test [helloworld.html](../examples/helloworld.html)