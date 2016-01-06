#!/usr/bin/env babel-node

let  fs = require('pn/fs')
let  path = require('path')
let directoryInput = process.argv[2];
let isRecursive = process.argv[3];

async function getAllFiles(directoryPath){

	try{

		//console.log('directoryPath = '+directoryPath)
		let fileNames = await fs.readdir(directoryPath)
		
		/*let promises = fileNames.map(function(fileName){
			let filePath = path.join(directoryPath, fileName); 
			return isDirectory(filePath)
			let stats = await Promise.all(promises)
		})*/
		for(let fileName of fileNames){
			let filePath = path.join(directoryPath, fileName); 
			let isDir =  await isDirectory(filePath)
			if(isDir.isDirectory()){
				if(isRecursive === '-R'){
					let nextDirectoryPath = path.join(directoryPath, fileName);
					getAllFiles(nextDirectoryPath);
				}
			}else{
				let fileNameToDisplay = directoryPath + fileName;
				fileNameToDisplay = fileNameToDisplay.replace(__dirname,'');
				console.log(fileNameToDisplay)
			}
		}

	}catch(e){
		console.log(e.stack)
	}


}

async function isDirectory(path){
	let stat =  await fs.stat(path)
	return stat
}

console.log('Going to list files');
directoryInput = path.join(__dirname, directoryInput);
getAllFiles(directoryInput);
