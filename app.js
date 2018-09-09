/*  Copyright © 2017-2018 John R. Craps - All Rights Reserved
 *  Unauthorized copying, modification, and/or distribution of this file, via any medium, is strictly prohibited.
 *  Version 0.5.2 - For internal use only
 */

var http = require('http')
var url = require('url')
var fs = require('fs')
var path = require('path')
var baseDirectory = __dirname
var raspi = require('raspi')
var I2C = require('raspi-i2c').I2C;
var port = 80

//server configuration
var server = http.createServer(function (request, response) {
  try {
    var requestUrl = url.parse(request.url)
    // normalize path to prevent access to directories underneath baseDirectory
    var fsPath = baseDirectory+path.normalize(requestUrl.pathname)
    if (fs.statSync(fsPath).isDirectory()) fsPath += '/index.html';

    var fileStream = fs.createReadStream(fsPath)
      fileStream.pipe(response)
      fileStream.on('open', function() {
           response.writeHead(200)
      })
      fileStream.on('error',function(e) {
           response.writeHead(404)
           response.end()
      })
    } catch(e) {
      response.writeHead(500)
      response.end()      // end the response so browsers don't hang
      console.log(e.stack)
    }
});
 

//initialize I2C devices
var i2c = new I2C();
  const read = new Array();
  const boards = ['04','08','16','02','01']
raspi.init(() => {
  clientUpdate();
  clear();
  clientUpdate();
});

//clear
function clear(){
	i2c.writeByteSync(0x70, 0x04, 0xff);
  	i2c.writeByteSync(0x20, 0xff, 0xff);
};

//clientUpdate
function clientUpdate(){
  for (var i = 0; i < boards.length; i++) {
    i2c.writeSync(0x70, Buffer.from([0x04, boards[i]]));
    read[i] = boards[i] + i2c.readWordSync(0x20).toString(16);
  };
  console.log(read);

};

//toggleRelay
function toggleRelay(location){
  location = location.toString();
  let relayBoard = parseInt(location.slice(0,2),16);
  let firstByte = parseInt(location.slice(2,4),16);
  let secondByte = parseInt(location.slice(4,6),16);
	console.log(relayBoard, firstByte, secondByte);
  //let target = read.indexOf(boards.indexOf("0"+relayBoard)).toString();
  //console.log(target);
  //firstByte = target.slice(2,4) - firstByte;
  //secondByte = target.slice(4,6) - secondByte;
  i2c.writeByteSync(0x70, 0x04, relayBoard);
  i2c.writeByteSync(0x20, secondByte, firstByte);
};

//socketio configuration
var io = require('socket.io')(server);
server.listen(port);
console.log('Server @ 10.0.0.16:'+port);
setInterval(clientUpdate, 1500);
io.on('connect', function(client) { 
    console.log('Client connected...'); 

    client.on('toggleRelay', function(location) {
	console.log(location);
        toggleRelay(location);
    });
  client.on('clear', function(aaa) {
	console.log("Reset!")
    	clear();
  });

});