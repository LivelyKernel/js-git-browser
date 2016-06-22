# js-git-browser

A build of [js-git](https://github.com/creationix/js-git) that is made to run
in the browser via browserify and uses promises by default (that can be used in
combination with `await`).

## Usage

```js
// Create a repo by creating a plain object.
var repo = jsgit.createRepo();

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// First we create a blob from a string.  The `formats` mixin allows us to
// use a string directly instead of having to pass in a binary buffer.

// echo 'Hello World' | git hash-object -w --stdin

var blobHash = await repo.saveAs("blob", "Hello World\n");

// Now we create a tree that is a folder containing the blob as `greeting.txt`
var treeHash = await repo.saveAs("tree", {
  "greeting.txt": { mode: jsGit.modes.file, hash: blobHash }
});

// With that tree, we can create a commit.
// Again the `formats` mixin allows us to omit details like committer, date,
// and parents.  It assumes sane defaults for these.
var commitHash = await repo.saveAs("commit", {
  author: {
    name: "Tim Caswell",
    email: "tim@creationix.com"
  },
  tree: treeHash,
  message: "Test commit\n"
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var fileAsText = await repo.loadAs("text", blobHash);

// Also if you prefer array format, you can load a directory as an array.
var entries = await repo.loadAs("array", treeHash);

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var logStream = await repo.logWalk(commitHash);

// Looping through the stream is easy by repeatedly calling waiting on `read`.
var commit, object;
while (commit = await logStream.read(), commit !== undefined) {

  console.log(commit);

  // We can also loop through all the files of each commit version.
  var treeStream = await repo.treeWalk(commit.tree);
  while (object = await treeStream.read(), object !== undefined) {
    show(object);
  }
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var headHash = await repo.readRef("refs/heads/master");
var commit = await repo.loadAs("commit", headHash);
var tree = await repo.loadAs("tree", commit.tree);
````
