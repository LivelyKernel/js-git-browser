// This provides symbolic names for the octal modes used by git trees.
var modes = require('js-git/lib/modes');

// Create a repo by creating a plain object.
// var repo = {};

var mixins = {};
// This provides an in-memory storage backend that provides the following APIs:
// - saveAs(type, value) => hash
// - loadAs(type, hash) => hash
// - saveRaw(hash, binary) =>
// - loadRaw(hash) => binary
mixins.memDb = require('js-git/mixins/mem-db');

// This adds a high-level API for creating multiple git objects by path.
// - createTree(entries) => hash
mixins.createTree = require('js-git/mixins/create-tree');

// This provides extra methods for dealing with packfile streams.
// It depends on
// - unpack(packStream, opts) => hashes
// - pack(hashes, opts) => packStream
mixins.packOps = require('js-git/mixins/pack-ops');

// This adds in walker algorithms for quickly walking history or a tree.
// - logWalk(ref|hash) => stream<commit>
// - treeWalk(hash) => stream<object>
mixins.walkers = require('js-git/mixins/walkers');

// This combines parallel requests for the same resource for effeciency under load.
mixins.readCombiner = require('js-git/mixins/read-combiner');

// This makes the object interface less strict.  See it's docs for details
mixins.formats = require('js-git/mixins/formats');


function popCallbackFromArgs(args) {
  var maybeCallback = args[args.length-1];
  var hasCallback = typeof maybeCallback === "function";
  if (hasCallback) args.pop();
  return hasCallback ? maybeCallback : null;
}

function makePromise(object, methodName) {
  var wrapped = object[methodName];
  // convert repo callback-style functions into promise producers
  object[methodName] = function() {
    var args = []; for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
    var maybeCallback = popCallbackFromArgs(args);
    return new Promise((resolve, reject) => {
      args.push((err, result) => {
        if (maybeCallback) maybeCallback(err, result);
        err ? reject(err) : resolve(result)
      })
      return wrapped.apply(object, args);
    });
  };
  object[methodName].toString = () => wrapped.toString();
}

function createRepo() {
  var repo = {};
  mixins.memDb(repo);
  mixins.createTree(repo);
  mixins.packOps(repo);
  mixins.walkers(repo);
  mixins.readCombiner(repo);
  mixins.formats(repo);
  Object.keys(repo).forEach(name => {
    if (typeof repo[name] === "function") makePromise(repo, name);
  });
  var realLogWalk = repo.logWalk;
  repo.logWalk = function (ref, callback) {
    var args = []; for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
    return realLogWalk.apply(repo, args).then(walk => {
      if (walk.read) makePromise(walk, "read");
      return walk;
    });
  }
  var realTreeWalk = repo.treeWalk;
  repo.treeWalk = function(ref, callback) {
    var args = []; for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
    return realTreeWalk.apply(repo, args).then(walk => {
      if (walk.read) makePromise(walk, "read");
      return walk;
    });
  }
  return repo;
}

module.exports = {
  modes: modes,
  createRepo: createRepo
}