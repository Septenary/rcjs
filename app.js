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
  console.log(i2c.readByteSync(0x20));
  console.log(i2c.readByteSync(0x40));
  console.log(i2c.readByteSync(0x60));
  console.log(i2c.readByteSync(0x80));
});

var clearPins = function(){
	const clr = Buffer([0xff, 0xff])
	i2c1.i2cWriteSync(0x20, 2, clr);
  i2c1.i2cWriteSync(0x40, 2, clr);
  i2c1.i2cWriteSync(0x60, 2, clr);
  i2c1.i2cWriteSync(0x80, 2, clr);
};
clearPins();

var clientUpdate = function (){
  const rbufarray = []
  for (var i = 0; i < rbufarray.length; i++) {
    rbufarray[i] = new Buffer([0x00, 0x00])
  };
	io.emit('pinUpdate', i2c1.i2cReadSync(0x20, 2, rbufarray[0]));
  io.emit('pinUpdate', i2c1.i2cReadSync(0x40, 2, rbufarray[1]));
  io.emit('pinUpdate', i2c1.i2cReadSync(0x60, 2, rbufarray[2]));
  io.emit('pinUpdate', i2c1.i2cReadSync(0x80, 2, rbufarray[3]));
  console.log(rbufarray);
  };

var togglePin = function(){
  clearPins();
  //parseInt converts base 16 to dec to normalize input, as raspi-i2c accepts dec. this saves the trouble of converting frontend base 16 (0-F) to hex format (0x00-0xFF). hex format is used in the buffers for clarity.
  rboard = parseInt(arguments[0].split()[0],16);
  rindex = parseInt(arguments[0].split()[1],16);

  if (arg > 8){
    rindex = rindex%8;
    var rindex = Math.pow(2,(rindex-1));
    buf = Buffer([0xff-rindex, 0xff-0x00]);
  } else {
    var rindex = Math.pow(2,(rindex-1));
    buf = Buffer([0xff-0x00, 0xff-rindex])
  }
  i2c1.i2cWriteSync(rboard, 2, buf);
};

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
