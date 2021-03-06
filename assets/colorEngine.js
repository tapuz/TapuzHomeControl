/*
ColorEngine

COPYRIGHT 2016 - MICHEL SIEBEN & THIERRY DUHAMEEUW - ALL RIGHTS RESERVED

*/



var socket = io.connect('http://192.168.0.2:81/');
var myStrobe;
var set_color;
var i=0;
var fadebackground;
var showstatus = 0;
var screenLockEnabled = false;

 $('#welcome_content').toggle();
 $('#preshow_content').toggle();

//request showstatus from the server
socket.emit('get_showstatus','showstatus');
socket.on('showstatus', function(status){
    showstatus = status;
	switch (showstatus){
		case 0: //show has not started yet
			if (screenLockEnabled) {
				$('#welcome_content').addClass('hidden');
				$('#preshow_content').removeClass('hidden');
			}else{
				$('#welcome_content').removeClass('hidden');
				$('#preshow_content').addClass('hidden');
			}
			$('#livecolors').addClass('hidden');
			$('#aftershow_content').addClass('hidden');
			break;
		case 1: //show has started 
			if (screenLockEnabled) {
                $('#livecolors').removeClass('hidden');
                $('#welcome_content').addClass('hidden');
            }else{
				$('#welcome_content').removeClass('hidden');
				$('#livecolors').addClass('hidden')
			}
            
			$('#preshow_content').addClass('hidden');
			$('#aftershow_content').addClass('hidden');
			
			break;
		case 2: //show is finished
			if (screenLockEnabled) {
				$('#welcome_content').addClass('hidden');
				$('#aftershow_content').removeClass('hidden');		
            }else{
				$('#welcome_content').removeClass('hidden');
				$('#aftershow_content').addClass('hidden');
			}
			$('#preshow_content').addClass('hidden');
			$('#livecolors').addClass('hidden')
			break;
		
	}
});

function stroboscoop(){
		switch (i){
			case i = 1:
				$('#livecolors').css("background-color",'black');
				i=2;
				return;
				break;
			case i = 2:
				$('#livecolors').css("background-color",set_color);
				i=1;
				return;
				break;
	}
	
}

// check if there is a connection to the server
socket.on('connect', function () {
			$('#connectionstatus').html('Connection OK');
            console.log('connected');
            $('#lost_connection').addClass('hidden');
            socket.emit('first_color','first_color'); //get first color
            socket.emit('first_fade','first_fade'); // get first fade setting
            socket.emit('first_mode','first_mode'); // get the first mode
            //socket.emit('first_mode','first_mode');
            console.log('connect fired');
	});

socket.on('disconnect', function(){
     console.log('disconnect fired');
     $('#lost_connection').removeClass('hidden');
  });

socket.on('reconnect', function() {
            console.log('reconnect fired!');
        });
// receive fade timing from server
socket.on('fade', function(fade){
	fadebackground = fade;
    console.log('fade received = ' + fadebackground);
});

socket.on('first_fade', function(fade){
	fadebackground = fade;
    console.log('first_fade received = ' + fadebackground);
});



socket.on('first_color', function (color){
	if (fadebackground == 0) {
		set_color = color;
		$('#livecolors').css("background-color",set_color);
	} else {
		set_color = color;
		$('#livecolors').animate({backgroundColor: set_color}, {duration: fadebackground});
	}
});

socket.on('color', function(color){
	if (fadebackground == 0) {
		set_color = color;
		$('#livecolors').css("background-color",set_color);
	} else {
		set_color = color;
		$('#livecolors').animate({backgroundColor: set_color}, {duration: fadebackground});
	}
});

socket.on('mode', function(mode){
	switch (mode) {
		case 'strobe':
			clearInterval(myStrobe);
			myStrobe = setInterval(stroboscoop, 33);
			break;
		case 'static':
			clearInterval(myStrobe);
			$('#livecolors').css("background-color",set_color);
			break;
		}
});




