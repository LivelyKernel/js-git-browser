var fs = require("fs");
var browserify = require('browserify');
var b = browserify(
  ["jsgit-index.js"],
  {standalone: "jsgit"}
).bundle((err, buf) => {
  var rep = "$1\n  repo.mem = {objects: objects, refs: refs};";
  var rewritten = String(buf).replace(/(var refs = {};\n)/, rep);
  fs.writeFileSync("jsgit.js", rewritten);
});
