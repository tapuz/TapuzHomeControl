$(function() {
    var noSleep = new NoSleep();	

    $('#btn_entershow').on('click',function(evt){
        console.log('clicked_button');
        noSleep.enable(); // keep the screen on!
        screenLockEnabled = true;
        socket.emit('get_showstatus','showstatus');
    });
});

