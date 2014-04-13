$(document).ready(function(){
	// detection variables
	var isDetect = 0;
	var dontCheck = 0;
	var detectArrayCounter = 0;
	var bufferSize = 50;    // tweak to meet custom needs
	var threshold = 80;      // tweak to meet custom needs
	var detectArray = new Array(bufferSize);

	 var kiwisocket = io.connect('http://build.kiwiwearables.com:8080');

	 var toParse = null;
	 var Ax = 0;
	 var Ay = 0;
	 var Az = 0;
	 var Gx = 0;
	 var Gy = 0;
	 var Gz = 0;

	// Enter your device id and password here

	kiwisocket.on('connect', function() {
		kiwisocket.emit('listen', {device_id: '30', password: '123'});
	});

	kiwisocket.on('listen_response', function(data) {

		//console.log(data);

		toParse = JSON.parse(data.message);

	    // initialize dtw worker
	    var dtw = DTW(toParse);  // call dynamic-time-warp algorithm
	    var result = dtw.result;

		//console.log("result is: " + result);

		// Detection logic
	    if ((result <= threshold) && (dontCheck == 0)) {
	            detectArrayCounter++;

	            //only count a motion if 10 predictions are counted
	            if(detectArrayCounter >= bufferSize) {
	              isDetect++;
	              start = new Date().getTime();
	              //$('#detect_1').fadeOut(); //
	              //$('#detect_off').toggleClass("detect-off");
	              //$('#detect_on').toggleClass("detect-off");


	              //toggleClass("detect-off");
	              //$('#prediction_1_label').fadeIn();//
	              //$('#prediction_1_label').toggleClass("change-color");
	              dontCheck_1 = 1;
	              console.log("Detected!");

	              setTimeout(function(){
	                detectArrayCounter = 0;
	                dontCheck = 0;
	                //$('#detect_1_off').toggleClass("detect-off");
	                //$('#detect_1_on').toggleClass("detect-off");
	                //$('#detect_1').fadeIn(); // toggleClass("detect-off");

	              },1500);
	            }
	    }

		Ax = parseFloat(toParse.ax);
		Ay = parseFloat(toParse.ay);
		Az = parseFloat(toParse.az);

		Gx = parseFloat(toParse.gx);
		Gy = parseFloat(toParse.gy);
		Gz = parseFloat(toParse.gz);

	  if (Gz > 400) {
	    $('#button1').css("background-color", "#87FC91"); //parking
	  }
	  if (Gy > 400) {
	    $('#button1').css("background-color", "#DF8484"); //forward
	  }
	  if (Gy < -400) {
	    $('#button1').css("background-color", "#A0B6EE"); //reverse
	  }

		$('#result').html(result);
	  $('#gz').html(result);

		// $('#accelerometer-x').html(Ax);
		// $('#accelerometer-y').html(Ay);
		// $('#accelerometer-z').html(Az);

		// $('#gyroscope-x').html(Gx);
		// $('#gyroscope-y').html(Gy);
		// $('#gyroscope-z').html(Gz);

	});
});