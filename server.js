/*
LiveColors

COPYRIGHT 2016 - MICHEL SIEBEN & THIERRY DUHAMEEUW - ALL RIGHTS RESERVED
*/

var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http,{pingTimeout: 3000,pingInterval: 3000});
//var last_color = "green";
//var last_fade = 0;
//var last_mode = 'static';
var connections;
//var showstatus = 0;

var events = [];

//push some event...later to be done dynamically
events[1] = {id:1, name:"The ultimate show", showstatus:1, last_color:"blue", last_fade:0, last_mode:'static'};
events[2] = {id:2, name:"DJ contest", showstatus:0, last_color:"green", last_fade:0, last_mode:'static'};
events[3] = {id:3, name:"The summer of 17", showstatus:0, last_color:"green", last_fade:0, last_mode:'static'};
events[4] = {id:4, name:"The very best party", showstatus:0, last_color:"green", last_fade:0, last_mode:'static'};



app.get('/', function(req, res){
 	res.sendFile(__dirname + '/color.html');
	});

app.get('/input', function(req, res){
 	res.sendFile(__dirname + '/controller/input.html');
	});

app.get('/beats', function(req, res){
 	res.sendFile(__dirname + '/beats.html');
	});
	
app.get('/midi', function(req, res){
 	res.sendFile(__dirname + '/controller/midi-input.html');
	});	

app.use(express.static('assets'));
app.use(express.static('assets/img'));


io.on('connection', function(socket){
	
	//implement rooms
 	socket.on('join', function(event) {
		socket.join(event);
		console.log('event ' + event +' joined');
		//send the init values for the event
		socket.emit('init', events[event]);
		
		socket.emit('welcome',event);//for testing purp...
		});

    socket.on('leave', function(event) {
		socket.leave(event);
		console.log('event ' + event +' left');
		});
	
	socket.on('message', function(data) {
		socket.broadcast.to(data.event).emit('message', data.msg);
		
		console.log('sent:' + data.msg + ' to ' + data.event );
		});
	

	
	socket.on('showtoggle', function(data){
			events[data.event].showstatus = data.status;
			io.to(data.event).emit('showstatus',data.status);
		});
	

	
	http.getConnections(function(error, count) {
		//connections = count;
		connections = io.engine.clientsCount;
		io.emit('connections', connections);
		console.log(connections + ' clients connected');
		}); 
	
	
		
	socket.on('get_showstatus', function (event){
		io.emit('showstatus', showstatus);
		//socket.broadcast.to(event).emit('showstatus', );
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

http.listen(81, function(){
	console.log('listening on *:81');
	});