var socket = io.connect('http://23.251.135.169:3000/');
var myStrobe;
var set_color;
var i=0;
var fadebackground;

// receive fade timing from server
socket.on('fade', function(fade){
	fadebackground = fade;
});


function stroboscoop(){
		switch (i){
			case i = 1:
				$('body').css("background-color",'black');
				i=2;
				return;
				break;
			case i = 2:
				$('body').css("background-color",set_color);
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
		$('body').css("background-color",set_color);
	} else {
		set_color = color;
		$('body').animate({backgroundColor: set_color}, {duration: fadebackground});
	}
});

socket.on('color', function(color){
	if (fadebackground == 0) {
		set_color = color;
		$('body').css("background-color",set_color);
	} else {
		set_color = color;
		$('body').animate({backgroundColor: set_color}, {duration: fadebackground});
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
			$('body').css("background-color",set_color);
			break;
		}
});