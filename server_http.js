var fs = require('fs');
var http = require('http');


var express = require('express');
var app = express();



var serverPort = 81;

var server = http.createServer(app);
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

events.push({id:1, name:"The ultimate show", showstatus:1, mainColor:"blue", beatColor:"yellow", interval:0, crossfade:0, triggerTime:0, clients:0});
events.push({id:2, name:"DJ contest", showstatus:0, last_color:"green", last_fade:0, last_mode:'static', clients:0});
events.push({id:3, name:"The summer of 17", showstatus:0, last_color:"green", last_fade:0, last_mode:'static', clients:0});
events.push({id:4, name:"The very best party", showstatus:0, last_color:"green", last_fade:0, last_mode:'static', clients:0});



//var newEvent = {};

//newEvent= {id:100, name:"100 party", showstatus:1, last_color:"blue", last_fade:0, last_mode:'static', clients:0};
 

 
 
console.log(events.length + ' events');

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
    
//could use
//var result = names.filter(function(v) {return v.id === 45; })[0];
//but the getEvent function is quicker because it stops looking as soon as the event is found
function getEvent(id){
	for (var i = 0, len = events.length; i < len; i++) 
	{
  	  if (events[i].id === id)
    	{
      	  return events[i]; // Return as soon as the object is found
    	}
	}
}

function setEventProperty(id,property,value){
	for (var i = 0, len = events.length; i < len; i++) 
	{
  	  if (events[i].id === id)
    	{
        events[i][property] = value;
        return; // Return as soon as the object is found
    	}
	}
}


io.on('connection', function(socket){
   connections = io.engine.clientsCount;
   io.emit('clientsServerCount',io.engine.clientsCount); //change this so it only emits to admins and not to all clients
   
   socket.on('requestEvents', function(geo){ //geo is the obj with lat/long
		socket.emit('events',events);  
   })

    
	
 	socket.on('join', function(eventId) {
		socket.join(eventId);
		console.log('event ' + eventId +' joined');
		//send the init values for the event
    	//filter the event array
    	var event = getEvent(Number(eventId)); //convert to int and search event
  
		socket.emit('init', event); //emits the event object
		//calculate 
		var d = new Date();
      	var time = d.getTime();
		var delta = (time - event.triggerTime)/event.interval;

		socket.emit('welcome','welcome to event ' + event.name);//for testing purp...
      
      console.log(numClientsInEvent('/',eventId) + ' clients in event ' + eventId);
      io.to(eventId).emit('clientsEventCount',(numClientsInEvent('/',eventId)));
      
		});

   socket.on('leave', function(eventId) {
      
      socket.leave(eventId);
      io.to(eventId).emit('clientsEventCount',(numClientsInEvent('/',eventId)));
         
   
   	console.log('event ' + eventId +' left');
        
      //console.log(numClientsInEvent('/',event) + 'clients in event ' + event);
		});
	
	socket.on('message', function(data) {
		socket.broadcast.to(data.event).emit('message', data.msg);
		
		console.log('sent:' + data.msg + ' to ' + data.event );
		});
	
	
	socket.on('showstatus', function(data){
      console.log('the new status should be: ' + data.status);
      setEventProperty(Number(data.event),'showstatus',Number(data.status));
      //console.log('the saved one is: ' )
			io.to(data.event).emit('showstatus',data.status);
		});

	socket.on('mainColor', function(data){
      io.to(data.event).emit('mainColor',data.color);
	  setEventProperty(Number(data.event),'mainColor',data.color)
	  console.log('mainColor: ' + data.color);
	});

	socket.on('beatColor', function(data){
      io.to(data.event).emit('beatColor',data.color);
	  setEventProperty(Number(data.event),'beatColor',data.color)
	  console.log('beatColor: ' + data.color);
	});

	socket.on('interval', function(data){
	  //get time of action
	  var d = new Date();
      var time = d.getTime();
	  
      io.to(data.event).emit('interval',data.interval);
	  setEventProperty(Number(data.event),'triggerTime',time)
	  setEventProperty(Number(data.event),'interval',data.interval)
	  console.log('interval: ' + data.interval);
	});

	socket.on('crossfade', function(data){
      io.to(data.event).emit('crossfade',data.crossfade);
	  setEventProperty(Number(data.event),'crossfade',data.crossfade)
	  console.log('interval: ' + data.crossfade);
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















