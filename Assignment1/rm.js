#!/usr/bin/env babel-node

let  fs = require('pn/fs')
let dirPath = process.argv[2];


async function removeDirectory(dirPath){
	try{
		//let directoryPath = dirPath ==! '' ? path.join(__dirname, dirPath) : __dirname;
		if(dirPath !== ''){
			process.stdout.write('dirPath=' + dirPath + '\n')
			let stat = await fs.stat(dirPath);
			process.stdout.write('stat=' + stat.isDirectory() + '\n')
			if(stat.isDirectory()){
				await fs.rmdir(dirPath);
			}else{
				await fs.unlink(dirPath);			
			}
		}
	}catch(e){
		console.log(e.stack)
	}
}

console.log('Going to removeDirectory');
removeDirectory(dirPath);
console.log('Done');

