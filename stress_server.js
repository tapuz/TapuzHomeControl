var io = require('socket.io').listen(8000);

io.set("log level",1);

var socketsCount = 0;
var pingsCount = 0;
var pongsCount = 0;

io.sockets.on('connection', function (socket) {
  
  socketsCount++;

  var itv = setInterval(function() {
	socket.emit('ping');

	pingsCount++;
  },1000);

  socket.on('disconnect',function() {
	clearTimeout(itv);
	socketsCount--;
  });

  socket.on('pong',function() {
	pongsCount++;
  });

});

setInterval(function() {
	console.log(pingsCount+" pings, "+pongsCount+" pongs over "+socketsCount+" sockets.");
},1000);