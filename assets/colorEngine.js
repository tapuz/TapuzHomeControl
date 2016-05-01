var socket = io.connect('http://23.251.135.169:3000/');
var myStrobe;
var set_color;
var i=0;
var fadebackground;
var status = 0;

//request showstatus from the server
socket.emit('get_showstatus','showstatus');
socket.on('showstatus', function(status){
	switch (status){
		case 0:
			$('#livecolors').addClass('hidden');
			break;
		case 1:
			$('#livecolors').removeClass('hidden');
			break;
	}
});


// receive fade timing from server
socket.on('fade', function(fade){
	fadebackground = fade;
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
	});

socket.emit('first_color','first_color');
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