#!/usr/bin/env node
var args = process.argv.slice(2);

args.forEach(function (val, index, array) {
  process.stdout.write(val);
});
