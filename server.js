/*
LiveColors

COPYRIGHT 2016 - MICHEL SIEBEN & THIERRY DUHAMEEUW - ALL RIGHTS RESERVED
*/

var express = require('express');
var app = express();


var http = require('http').Server(app);
var io = require('socket.io')(http,{pingTimeout: 3000,pingInterval: 3000});
var last_color = "green";
var last_fade = 0;
var last_mode = 'static';
var connections;
var showstatus = 0;

console.log ('last_fade_to_start=' + last_fade);

app.get('/', function(req, res){
 	res.sendFile(__dirname + '/color.html');
	});

app.get('/input', function(req, res){
 	res.sendFile(__dirname + '/controller/input.html');
	});
	
app.get('/midi', function(req, res){
 	res.sendFile(__dirname + '/controller/midi-input.html');
	});	

app.use(express.static('assets'));


io.on('connection', function(socket){
 	
	http.getConnections(function(error, count) {
		//connections = count;
		connections = io.engine.clientsCount;
		io.emit('connections', connections);
		console.log(connections + ' clients connected');
		}); 
	
	
	socket.on('showtoggle', function(status){
				showstatus = status;
	    io.emit('showstatus', showstatus);
		});
		
	socket.on('get_showstatus', function (){
		io.emit('showstatus', showstatus);
		});
	
	socket.on('color', function(color){
		io.emit('color', color);
		last_color = color;
		console.log('new color is: ' + color);
		});
	 
	socket.on('first_color', function (color){
		io.emit('first_color', last_color);
		});
		
	socket.on('first_fade', function (){
		io.emit('first_fade', last_fade);
		console.log('firstfade emitted = ' + last_fade);
		});
	
	socket.on('first_mode', function (){
		io.emit('mode', last_mode);
		console.log('last_mode emitted = ' + last_mode);
		});
	
	socket.on('fade',function(fade){
		last_fade = fade;
		io.emit('fade',last_fade);
		console.log(fade);    
		});
	 
	socket.on('strobe', function(mode){
		switch (mode) {
			case 'strobe_on':
				io.emit('mode','strobe');
				last_mode = 'strobe';
				console.log('strobe_on');
				break;
			case 'strobe_off':
				io.emit('mode','static');
				last_mode = 'static';
				console.log('strobe_off');
				break;
				}
		}); 
	 
	
	
	socket.on('disconnect', function(){
		console.log('client disconnected');
		http.getConnections(function(error, count) {
			//connections = count;
			connections = io.engine.clientsCount;
			io.emit('connections', connections);
			console.log(connections + ' clients connected');
			});
		});
	 
});

http.listen(80, function(){
	console.log('listening on *:80');
	});