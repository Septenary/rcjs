/*  Copyright © 2017-2018 John R. Craps - All Rights Reserved
 *  Unauthorized copying, modification, and/or distribution of this file, via any medium, is strictly prohibited.
 *  Version 0.3.0 - For internal use only
 */

var http = require('http')
var url = require('url')
var fs = require('fs')
var path = require('path')
var baseDirectory = __dirname
var raspi = require('raspi')
var I2C = require('raspi-i2c')
var port = 80

var server = http.createServer(function (request, response) {
    try { 
        var requestUrl = url.parse(request.url)

        // need to use path.normalize so people can't access directories underneath baseDirectory
        var fsPath = baseDirectory+path.normalize(requestUrl.pathname)
    if (fs.statSync(fsPath).isDirectory()) fsPath += '/index.html';

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
init(() => {
   const i2c = new I2C();
    console.log(i2c.readByteSync(0x20));
});

var clearPins = function(){
    for (var i = 0; i < pinOut.length; i++){
    pinOut[i].write(1);
}};
clearPins();

//var clientUpdate = function (){
//    for (var i = 0; i < pinOut.length; i++ ){
//    io.emit('pinUpdate', i, 1-pinOut[i].read());
//}};
//
//var togglePin = function(){
//	var k = arguments[0]
//	for (var j = 0; j < k.length; j++){
//		state = pinOut[k[j]].read()
//		pinOut[k[j]].write(1-state)
//	 	//console.log("Relay " +(k[j]+1)+ ": " + state);
//	}
//    	clientUpdate();
//};
//
//var io = require('socket.io')(server);
//server.listen(port);
//console.log('Server @ 10.0.0.16:'+port);
//io.on('connect', function(client) { 
//    console.log('Client connected...'); 
//    clientUpdate();
//
//    client.on('togglePin', function(data) {
//	//console.log(data)
//        togglePin(data);
//    });
//
//    client.on('clearPins', function(pin) {
//        clearPins();
//   	clientUpdate();
//    });
//
//    setInterval(clientUpdate, 500);
//
//});


