#!/usr/bin/env babel-node

let  fs = require('pn/fs')
let file = process.argv[2];

async function readFile(fileName){
	process.stdout.write(fileName + '\n')
	let data =  await fs.readFile(file)
	process.stdout.write(data)
}

console.log('Going to read file');
readFile(file);
console.log('Reading asynchronously');

