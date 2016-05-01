$(function() {
    var noSleep = new NoSleep();	

    $('#startModal').modal('show'); 
	
    $('#startModal').on('hidden.bs.modal', function (e) {
        noSleep.enable(); // keep the screen on!         
  
    })	
	
   
   
   
});

