let  fs = require('pn/fs')

async function readFile(fileName){
	process.stdout.write(fileName + '\n')
	let data =  await fs.readFile('README.md')
	process.stdout.write(data)
}

console.log('Going to read file');
readFile('README.md');
console.log('Reading asynchronously');

/*fs.readFile(file, 'utf8', function (err,data) {
	  if (err) {
	    return process.stdout.write(err);
	  }
	  process.stdout.write(data);
});*/
