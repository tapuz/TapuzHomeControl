$(function() {

    var noSleep = new NoSleep();	
    var socket = io.connect('https://192.168.0.2:81');
    var myStrobe;
    var set_color;
    var i=0;
    var fadebackground = 0;
    //var showstatus = 0;
    var screenLockEnabled = false;
    var event = null;
    
    $('.btn_event').click(function(){
        //an event has been selected.. get the id
        old_event = event;
        new_event = $(this).attr('event_id');
        //lets connect to the event
        socket.emit('join', new_event);
        if (old_event !== null){socket.emit('leave', old_event);} //only emit 'leave' when user is connected to an event
        event = new_event;
        // keep the screen on!
        noSleep.enable();
        screenLockEnabled = true; // set flag to true when user has selected a show
        //init the show
        
        
    });
    
    

    $('#preshow_content').addClass('hidden');
    $('#livecolors').addClass('hidden');
    
    if (event === null) {
		console.log('no event selected yet');
	} 
    
    //receive init handler
    socket.on('init', function (event) {
        console.log(event.name);
        fadebackground = event.last_fade;
        last_mode = event.last_mode;
        setStatus(event.showstatus);
        setColor(event.last_color);
    });
    
    socket.on('showstatus', function(status){
        //showstatus = status;
        setStatus(status);
        
        });
    
    socket.on('color', function (color) {
        setColor(color);
    });
    
    socket.on('fade', function(fade){
	fadebackground = fade;
    console.log('fade received = ' + fadebackground);
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
    
    
    socket.on('welcome', function(data) {
            console.log('Welcome to event -> ' + data);
        });
    socket.on('message', function(data) {
            console.log(data);
        });
    
    
    
    
    function setColor(color){
        if (fadebackground === 0) {
        	set_color = color;
        	$('#livecolors').css("background-color",set_color);
        } else {
        	set_color = color;
        	$('#livecolors').animate({backgroundColor: set_color}, {duration: fadebackground});
        }
    }
    
    function setStatus(status){
    
        switch (status){
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
        }
        
    
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
    
});











