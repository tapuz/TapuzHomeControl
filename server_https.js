var fs = require('fs');
var https = require('https');

var express = require('express');
var app = express();


var options = {
   key  : fs.readFileSync('server.key'),
   cert : fs.readFileSync('server.crt')
};

var serverPort = 81;

var server = https.createServer(options, app);
var io = require('socket.io')(server,{pingTimeout: 3000,pingInterval: 3000});

//start keymetrics stuff
var probe = require('pmx').probe();
var pmx = require('pmx').init({
  network       : true,  // Network monitoring 
  ports         : true,  // Shows which ports app is listening on
});

var connections = 0;
var metric = probe.metric({
  name    : 'Connections',
  value   : function() {
    return connections;
  }
});


var events = [];

//push some event...later to be done dynamically by the controller

events[1] = {id:1, name:"The ultimate show", showstatus:1, last_color:"blue", last_fade:0, last_mode:'static', clients:0};
events[2] = {id:2, name:"DJ contest", showstatus:0, last_color:"green", last_fade:0, last_mode:'static', clients:0};
events[3] = {id:3, name:"The summer of 17", showstatus:0, last_color:"green", last_fade:0, last_mode:'static', clients:0};
events[4] = {id:4, name:"The very best party", showstatus:0, last_color:"green", last_fade:0, last_mode:'static', clients:0};



var newEvent = {};

newEvent= {id:100, name:"100 party", showstatus:1, last_color:"blue", last_fade:0, last_mode:'static', clients:0};
 
events[newEvent.id] = newEvent; 
 
 
console.log(events.length + 'events');

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


function numClientsInEvent(namespace, event) { //all clients reside in default namespace -> '/'
      var clients = io.nsps[namespace].adapter.rooms[event];
      try {
         return Object.keys(clients).length;  //catch the exeption when event is empty -> server will crash if this is run when last client exits event
      }catch(err) {
         return 0;
      }
    }

io.on('connection', function(socket){
   connections = io.engine.clientsCount;
   io.emit('clientsServerCount',io.engine.clientsCount); //change this so it only emits to admins and not to all clients
      
	
 	socket.on('join', function(event) {
		socket.join(event);
		console.log('event ' + event +' joined');
		//send the init values for the event
		socket.emit('init', events[event]);
		socket.emit('welcome',event);//for testing purp...
      
      console.log(numClientsInEvent('/',event) + ' clients in event ' + event);
      io.to(event).emit('clientsEventCount',(numClientsInEvent('/',event)));
      
		});

   socket.on('leave', function(event) {
      
      socket.leave(event);
      io.to(event).emit('clientsEventCount',(numClientsInEvent('/',event)));
         
   
   	console.log('event ' + event +' left');
        
      //console.log(numClientsInEvent('/',event) + 'clients in event ' + event);
		});
	
	socket.on('message', function(data) {
		socket.broadcast.to(data.event).emit('message', data.msg);
		
		console.log('sent:' + data.msg + ' to ' + data.event );
		});
	
	
	socket.on('showtoggle', function(data){
			events[data.event].showstatus = data.status;
			io.to(data.event).emit('showstatus',data.status);
		});
	
		
	socket.on('get_showstatus', function (event){
		io.emit('showstatus', showstatus);
		//socket.broadcast.to(event).emit('showstatus', );
		});
	
	socket.on('color', function(data){
      io.to(data.event).emit('color',data.color);
		events[data.event].last_color = data.color;
     
		console.log('new color is: ' + data.color);
		});
	 
	socket.on('fade',function(data){
      io.to(data.event).emit('fade',data.duration);
		events[data.event].last_fade = data.duration;
		});
	 
	socket.on('strobe', function(data){
		switch (data.mode){
			case 'strobe':
            io.to(data.event).emit('mode',data.mode);
            events[data.event].last_mode = data.mode;
            console.log(data.mode);
				break;
			case 'static':
            io.to(data.event).emit('mode',data.mode);
            events[data.event].last_mode = data.mode;
            console.log(data.mode);
				break;
				}
		}); 
	 
	
	
	socket.on('disconnect', function(){
		//console.log('user disconnected');
      //console.log(io.engine.clientsCount);
      io.emit('clients_count',io.engine.clientsCount);
      connections = io.engine.clientsCount;
		
		});
	 
});

server.listen(serverPort, function() {
  console.log('server up and running at %s port', serverPort);
});
