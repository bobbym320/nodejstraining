#!/usr/bin/env babel-node

let  fs = require('pn/fs')
let file = process.argv[2];

async function touchFile(fileName){
	process.stdout.write('fileName=' + fileName + '\n')
	let data =  await fs.readFile(fileName)

	//process.stdout.write('data=' + data + '\n')

	await fs.writeFile(fileName,data)
	process.stdout.write('File touched ')

	var fd = fs.openSync(file, 'a');
	fs.fstat(fd,function(err,stats){
		console.log(stats.mtime);
	});

	}

console.log('Going to touch file');
touchFile(file);
console.log('Touching asynchronously');


/*fs.readFile(file, 'utf8', function (err,data) {
	  if (err) {
	    return process.stdout.write(err);
	  }
	  fs.writeFile(file,data,function(){
		  if (err) {
		    return process.stdout.write(err);
		  }
	});
});
*/

//let fd = fs.createReadStream(file);
/*var fd = fs.openSync(file, 'a');
fs.fstat(fd,function(err,stats){
	console.log(stats);
});*/