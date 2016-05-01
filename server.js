var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var last_color = "green";
var connections;

app.get('/', function(req, res){
 	res.sendFile(__dirname + '/color.html');
	});

app.get('/input', function(req, res){
 	res.sendFile(__dirname + '/input.html');
	});

io.on('connection', function(socket){
 	
	http.getConnections(function(error, count) {
		connections = count;
		console.log(connections + ' clients connected');
		}); 
	
	socket.on('color', function(color){
		io.emit('color', color);
		last_color = color;
		console.log('new color is: ' + color);
		});
	 
	socket.on('first_color', function (color){
		io.emit('first_color', last_color);
		});
	
	socket.on('fade',function(fade){
		io.emit('fade',fade);
		console.log(fade);    
		});
	 
	socket.on('strobe', function(mode){
		switch (mode) {
			case 'strobe_on':
				io.emit('mode','strobe');
				console.log('strobe_on');
				break;
			case 'strobe_off':
				io.emit('mode','static');
				console.log('strobe_off');
				break;
				}
		}); 
	 
	io.emit('connections', connections);
	
	socket.on('disconnect', function(){
		console.log('client disconnected');
		http.getConnections(function(error, count) {
			connections = count;
			console.log(connections + ' clients connected');
			});
		});
	 
});

http.listen(3000, function(){
	console.log('listening on *:3000');
	});