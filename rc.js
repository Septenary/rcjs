var http = require('http')
var url = require('url')
var fs = require('fs')
var path = require('path')
var baseDirectory = __dirname
var rpio = require('rpio')


rpio.init({mapping: 'gpio'});

var port = 8000

var server = http.createServer(function (request, response) {
    try {
        var requestUrl = url.parse(request.url)

        // need to use path.normalize so people can't access directories underneath baseDirectory
        var fsPath = baseDirectory+path.normalize(requestUrl.pathname)

        var fileStream = fs.createReadStream(fsPath)
        fileStream.pipe(response)
        fileStream.on('open', function() {
             response.writeHead(200)
        })
        fileStream.on('error',function(e) {
             response.writeHead(404)     // assume the file doesn't exist
             response.end()
        })
   } catch(e) {
        response.writeHead(500)
        response.end()     // end the response so browsers don't hang
        console.log(e.stack)
   }
});

pinList = [2, 3, 4, 17, 27, 22, 10, 9];

for (var i; i < pinList.length; i++){
	rpio.open(pinList[i], rpio.OUTPUT, rpio.HIGH);
}


var togglePin = (function(pin){
	state = 1-(rpio.read(pinList[pin-1]));
	if (state){
	rpio.write(pinList[pin-1], rpio.HIGH);
	} else {
	rpio.write(pinList[pin-1], rpio.LOW);
	}
	console.log("Relay " +pin+ ": " + (1-state));
})

var io = require('socket.io')(server);
server.listen(port);
console.log('Server @ 10.0.0.23: '+port);
io.on('connect', function(client) { 
	console.log('Client connected...'); 
	io.emit('pinUpdate', 1, 1-(rpio.read(pinList[0])));
	io.emit('pinUpdate', 2, 1-(rpio.read(pinList[1])));
	io.emit('pinUpdate', 3, 1-(rpio.read(pinList[2])));
	io.emit('pinUpdate', 4, 1-(rpio.read(pinList[3])));
	io.emit('pinUpdate', 5, 1-(rpio.read(pinList[4])));
	io.emit('pinUpdate', 6, 1-(rpio.read(pinList[5])));
	io.emit('pinUpdate', 7, 1-(rpio.read(pinList[6])));
	io.emit('pinUpdate', 8, 1-(rpio.read(pinList[7])));
	console.log('Clients updated...')
    	client.on('togglePin', function(pin) {
    		togglePin(pin);
		io.emit('pinUpdate', pin, 1-(rpio.read(pinList[pin-1])));
    });
});