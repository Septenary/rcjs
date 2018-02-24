var http = require('http')
var url = require('url')
var fs = require('fs')
var path = require('path')
var baseDirectory = __dirname
var r = require('array-gpio')

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

var pinOut = r.out(3, 5, 7, 11, 13, 15, 19, 21, 8, 10, 12, 16, 18, 22, 24, 26);
for (var i = 0; i < pinOut.length; i++){
pinOut[i].write(1);
};

var togglePin = (function(pin){
	state = pinOut[pin].read(() => {
	pinOut[pin].write(1-state)
	console.log("Relay " +pin+ ": " + state);
})})

var io = require('socket.io')(server);
server.listen(port);
console.log('Server @ 10.0.0.23: '+port);
io.on('connect', function(client) { 
	console.log('Client connected...'); 
	for (var i = 1; i < 16; i++ ){
	io.emit('pinUpdate', i, 1-pinOut[i].read());
	};
	console.log('Clients updated...')
    	client.on('togglePin', function(pin) {
    		togglePin(pin);
		io.emit('pinUpdate', pin, pinOut[pin].read());
    });
});