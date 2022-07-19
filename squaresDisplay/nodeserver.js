const http = require('http')
const fs = require('fs')
const path = require('path')

process.on('uncaughtException', err => console.error('uncaughtException', err))
process.on('unhandledRejection', err => console.error('unhandledRejection', err))

const publicFolder = process.argv.length > 2 ? process.argv[2] : '.'
const port = process.argv.length > 3 ? process.argv[3] : 4002
const mediaTypes = {
	zip: 'application/zip',
	jpg: 'image/jpeg',
	html: 'text/html'
}



const server = http.createServer(function(request, response) {
	console.log(request.method + ' ' + request.url)
	let filepath = path.join(publicFolder, request.url)
	
	if(filepath == '.\\'){
		filepath = '.\\index.html'
	}
	
	fs.readFile(filepath, function(err, data) {
		if (err) {
			response.statusCode = 404
			return response.end('File not found or you made an invalid request.')
		}
		let mediaType = 'text/html'
		const ext = path.extname(filepath)
		if (ext.length > 0 && mediaTypes.hasOwnProperty(ext.slice(1))) {
			mediaType = mediaTypes[ext.slice(1)]
		}
		response.setHeader('Content-Type', mediaType)
		response.end(data)
	})
})

server.on('clientError', function onClientError(err, socket) {
	console.log('clientError', err)
	socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})

server.listen(port, '127.0.0.1', function() {
	console.log('👨‍🔧 Development server is online. Port: '+port)
})



/*
// Importing the required modules
const WebSocketServer = require('ws');
// Creating a new websocket server
const wsSocket = 4001;
const wss = new WebSocketServer.Server({ port: wsSocket })
const clients = new Map();

// Creating connection using websocket
wss.on("connection", ws => {
	console.log("new client connected");
	clients.set(ws);
	
	// sending message
	ws.on("message", data => {
		console.log(`Client has sent us: ${data}`);
		const message = JSON.parse(data);
		const outbound = JSON.stringify(message);
		[...clients.keys()].forEach((client) => {
			client.send(outbound);
		});
	});
	// handling what to do when clients disconnects from server
	ws.on("close", () => {
		console.log("the client has connected");
	});
	// handling client connection error
	ws.onerror = function () {
		console.log("Some Error occurred")
	}
});
console.log("The WebSocket server is running on port "+wsSocket);

*/