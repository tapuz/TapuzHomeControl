var noSleep = new NoSleep();
var wakeLockEnabled = true;
var toggleEl = document.querySelector("#toggle");

	toggleEl.addEventListener('click', function() {
    	if (!wakeLockEnabled) {
        	noSleep.enable(); // keep the screen on!
        	wakeLockEnabled = true;
        	toggleEl.value = "Wake Lock Enabled";
      	} else {
        	noSleep.disable(); // let the screen turn off.
       	 	wakeLockEnabled = false;
        	toggleEl.value = "Wake Lock Disabled";
      	}
   	}, false);