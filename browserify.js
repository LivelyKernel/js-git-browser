var fs = require("fs");
var browserify = require('browserify');
var b = browserify(
  ["jsgit-index.js"],
  {standalone: "jsgit"}
).bundle((err, buf) => {
  var rep = "$1\n  repo.getMem = () => ({objects: objects, refs: refs});";
  var rep_2 = "\n  repo.setMem = me => { objects = me.objects; refs = me.refs; };";
  var rewritten = String(buf).replace(/(var refs = {};\n)/, rep + rep_2);
  fs.writeFileSync("jsgit.js", rewritten);
});
