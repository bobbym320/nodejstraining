let http = require('http')
let request = require('request')
let path = require('path')
let fs = require('fs')
let argv = require('yargs')
    .default('host', 'localhost')
    .argv

let logStream = argv.serverlog ? fs.createWriteStream(argv.serverlog) : process.stdout
let scheme = 'http://'
let port = argv.port || (argv.host === 'localhost' ? 8000 : 80)
let destinationUrl = argv.url || scheme + argv.host + ':'+port

console.log(`Starting server with destinationUrl ::${destinationUrl} `)

//Echo server
http.createServer((req,res) => {
	console.log(`Request received at: ${req.url}`)
	for (let header in req.headers) {
	    res.setHeader(header, req.headers[header])
	}

	logStream.write('\n Request Headers : '+ JSON.stringify(req.headers))
	req.pipe(res)
}).listen(8000)

//Proxy Server
http.createServer((req,res) => {
	let dest=destinationUrl
	console.log(`From proxy destination : ${dest}`)
	if(req.headers['x-destination-url']){
		dest=req.headers['x-destination-url']
	}

	let options = {
		headers: req.headers,
		url: `${dest}`	
	}

	options.method = req.method
	let downstreamResponse = req.pipe(request(options))
	logStream.write('\n\n Headers from destination: ' + JSON.stringify(downstreamResponse.headers))
	downstreamResponse.pipe(res)
}).listen(8001)
