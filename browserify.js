var fs = require("fs");
var browserify = require('browserify');
var b = browserify(
  ["jsgit-index.js"],
  {standalone: "jsgit"}
).bundle((err, buf) => {
  let rewritten = String(buf).replace(/(repo.refPrefix = prefix;)/, "$1\n  repo.loadRaw = loadRaw;");
  fs.writeFileSync("jsgit.js", rewritten);
})
