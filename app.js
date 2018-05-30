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
var I2C = require('raspi-i2c')
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
init(() => {
  const i2c = new I2C();
  const boards = [1,2,4,8]
  for (var i = 0; i < boards.length; i++) {
    boards[i]
    i2c1.i2cWriteSync(0x70, 2, buffer([0x04, boards[i]]));
    console.log(i2c.readByteSync(0x20));
  }
});

//i2c1 usage is unclear, consult documentation for raspi-i2c for clarity of its use cases here.

//clearPins
var clearPins = function(){
	const clr = Buffer([0xff, 0xff])
	i2c1.i2cWriteSync(0x70, 2, clr);
  i2c1.i2cWriteSync(0x20, 2, clr);
};
clearPins();

//clientUpdate
var clientUpdate = function (){
  for (var i = 0; i < boards.length; i++) {
    i2c1.i2cWriteSync(0x70, 2, buffer([0x04, boards[i]]));
    console.log(i2c.readByteSync(0x20,2));
  }
};

//togglePin
var togglePin = function(){
  clearPins();
  //parseInt converts base 16 to dec to normalize input, as raspi-i2c accepts dec. this saves the trouble of converting frontend base 16 (0-F) to hex format (0x00-0xFF), which is normally prefered due to clarity. this clarity is preserved in the format of the buffers.
  rboard = parseInt(arguments[0].split()[0],16);
  rindex = parseInt(arguments[0].split()[1],16);
  rboard = boards[rboard];

  i2c1.i2cWriteSync(0x70, 2, buffer([0x04, rboard]));

  if (0 > arg > 8){
    rindex = rindex%8;
    var rindex = Math.pow(2,(rindex-1));
    buf = Buffer([0xff-rindex, 0xff-0x00]);
  } elseif (arg > 16) {
    var rindex = Math.pow(2,(rindex-1));
    buf = Buffer([0xff-0x00, 0xff-rindex])
  } else {
    console.log('variable "arg" outside of expected range. recieved ('+arg+'); expected range: (0 > "arg" > 16)')
  }
  i2c1.i2cWriteSync(0x20, 2, buf);
};


//socketio configuration
var io = require('socket.io')(server);
server.listen(port);
console.log('Server @ 10.0.0.16:'+port);
io.on('connect', function(client) {
  console.log('Client connected...');
  clientUpdate();

  client.on('togglePin', function(data) {
    //console.log(data)
    togglePin(data);
  });

  client.on('clearPins', function(pin) {
    clearPins();
  });

  setInterval(clientUpdate, 600);
});
