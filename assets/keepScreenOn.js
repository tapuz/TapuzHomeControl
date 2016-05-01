$(function() {
    var noSleep = new NoSleep();	

    $('#startModal').modal('show'); 
	
   
    
    $('#btn_continue').on('click',function(evt){
    alert('clicked');
    noSleep.enable(); // keep the screen on!
    $('#startModal').modal('hide'); 
    }
    );
	
   
   
   
});

