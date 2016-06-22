var fs = require("fs");
var browserify = require('browserify');
var b = browserify(
  ["jsgit-index.js"],
  {standalone: "jsgit"}
).bundle().pipe(fs.createWriteStream("jsgit.js"));
