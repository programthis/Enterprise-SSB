$(document).ready(function(){
	//map function to be used to map values from leap into proper degrees (0-360)
	function map(value, inputMin, inputMax, outputMin, outputMax){
	  outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);
	  if(outVal >  outputMax){
	    outVal = outputMax;
	  }
	  if(outVal <  outputMin){
	    outVal = outputMin;
	  }
	  return outVal;
	}

	//create scene
	var scene = new THREE.Scene();
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// Setup Leap loop with frame callback function
	var controllerOptions = {enableGestures: true};

	// create a Directional light as pretend sunshine.
	directional = new THREE.DirectionalLight( 0xCCCCCC, 1.2 )
	directional.castShadow = true
	directional.position.set( 100, 200, 300 )
	directional.target.position.copy( new THREE.Vector3(0,0,0) )
	directional.shadowCameraTop     =  1000
	directional.shadowCameraRight   =  1000
	directional.shadowCameraBottom  = -1000
	directional.shadowCameraLeft    = -1000
	directional.shadowCameraNear    =  600
	directional.shadowCameraFar     = -600
	directional.shadowBias          =   -0.0001
	directional.shadowDarkness      =    0.4
	directional.shadowMapWidth      = directional.shadowMapHeight = 2048
	scene.add( directional )

	window.ambient = new THREE.AmbientLight( 0x666666 )
	scene.add( ambient )


	// create the stars
	var pMaterial = new THREE.ParticleBasicMaterial({
	    color: 0xFFFFFF,
	    size: 10,
	    map: THREE.ImageUtils.loadTexture(
	      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/109794/particle.png"
	    ),
	    transparent: true,
	    blending: THREE.CustomBlending,
	    blendSrc: THREE.SrcAlphaFactor,
	    blendDst: THREE.OneMinusSrcColorFactor,
	    blendEquation: THREE.AddEquation
	});
	var particleCount = 3600;
	var particles = new THREE.Geometry(), pMaterial
	for(var p = 0; p < particleCount; p++) {
	  var a1 = Math.random() * Math.PI * 2,
	      a2 = Math.random() * Math.PI * 2,
	      d = Math.random() * 500 + 500,
	      particle = new THREE.Vector3(d*Math.sin(a1)*Math.cos(a2), d*Math.sin(a1)*Math.sin(a2), d*Math.cos(a1));
	  particles.vertices.push(particle);
	}
	scene.add(particles)
	window.particleSystem = new THREE.ParticleSystem(particles, pMaterial);
	particleSystem.sortParticles = true;
	scene.add(particleSystem);
	var starsPositionX = 0;
	var starsPositionY = 0;
	var starsPositionZ = 0;

	//clouds object
	window.clouds = new THREE.Mesh(
	  new THREE.SphereGeometry( 50 + 1, 32, 32 ),
	  new THREE.MeshLambertMaterial({
	    map: THREE.ImageUtils.loadTexture( 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/109794/clouds.jpg' ),
	    transparent: true,
	    blending: THREE.CustomBlending,
	    blendSrc: THREE.SrcAlphaFactor,
	    blendDst: THREE.OneMinusSrcColorFactor,
	    blendEquation: THREE.AddEquation
	  })
	)
	var cloudPositionX = 0;
	var cloudPositionY = 0;
	var cloudPositionZ = 0;

	clouds.position.set( cloudPositionX, cloudPositionY, cloudPositionZ )
	clouds.receiveShadow = true
	clouds.castShadow = true
	scene.add( clouds )


	//earth object
	var earthBumpImage = THREE.ImageUtils.loadTexture( "https://s3-us-west-2.amazonaws.com/s.cdpn.io/109794/earthBumpMap.jpg" );
	var geometry = new THREE.SphereGeometry(50, 40, 40)
	var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture( 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/109794/earthSatTexture.jpg' ), ambient: 0x050505, color: 0xFFFFFF, specular: 0x555555, bumpMap: earthBumpImage, bumpScale: 19, metal: true } );
	window.earth = new THREE.Mesh( geometry, material );
	scene.add(earth);

	var earthPositionX = 0;
	var earthPositionY = 0;
	var earthPositionZ = 0;

	//add camera
	WIDTH      = window.innerWidth,
	HEIGHT     = window.innerHeight,
	VIEW_ANGLE = 45,
	ASPECT     = WIDTH / HEIGHT,
	NEAR       = 0.1,
	FAR        = 10000
	window.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
	camera.lookAt( scene.position )
	camera.position.set( 0, 0, 290 )

	//initiate variables
	var firstValidFrame = null
	var cameraRadius = 290
	var rotateY = 90, rotateX = 0, curY = 0
	var fov = camera.fov;


	var jetPacksActivated = "NO";
	var reverseJets = "NO";
	var initialJetPacks = "NO";
	var canSwitchJets = "YES";

	//request animation frame and connect to leap socket
	Leap.loop(function(frame) {
	  if (frame.valid) {

	    //getting the jets to activate when the user does a specific gesture
	    var gestureOutput = document.getElementById("gestureData");

	    if (frame.gestures.length > 0){
	      for (var i = 0; i < frame.gestures.length; i++){
	        var gesture = frame.gestures[i];
	        if (gesture.type === "circle" && reverseJets === "NO" && jetPacksActivated === "YES" && initialJetPacks === "YES" && canSwitchJets === "YES"){
	          reverseJets = "YES";
	          canSwitchJets = "NO";
	          $("#jet_direction").text("Direction: Away From Earth");
	          $("#reverse_jetpacks").text("Your jetpacks are reversed!");
	          $(".button-caution").css("background", "yellow");
	          $(".button-caution").css("border-color", "#A69212");
	          $("#direction_label").text("REVERSE");
	          
	          setTimeout(function(){
	            canSwitchJets = "YES";
	          },3000);
	        }
	        else if (gesture.type === "circle" && reverseJets === "YES" && jetPacksActivated === "YES" && initialJetPacks === "YES" && canSwitchJets === "YES"){
	          reverseJets = "NO";
	          canSwitchJets = "NO";
	          $("#jet_direction").text("Direction: Towards Earth");
	          $("#reverse_jetpacks").text("Your jetpacks are propelling you forward!");
	          $(".button-caution").css("background", "green");
	          $(".button-caution").css("border-color", "#1B5207");
	          $("#direction_label").text("FORWARD");

	          setTimeout(function(){
	            canSwitchJets = "YES";
	          },3000);
	        }
	        if (gesture.type === "circle" && initialJetPacks === "NO"){
	          jetPacksActivated = "YES";
	          $("#jets").text("Jet Packs: ACTIVATED!");
	          $("#direction_label").text("FORWARD");
	          $(".button-caution").css("background", "green");
	          $(".button-caution").css("border-color", "#1B5207");

	          console.log("WE'RE COMING TO SAVE YOU SANDRA!!");
	          setTimeout(function(){
	            initialJetPacks = "YES";
	          },3000);
	        }
	      }
	    }

	    //checking to see if any hand gestures were activated
	    var handsActivated = 0;
	    handsActivated = frame.hands.length;
	    if (frame.hands.length > 0 && jetPacksActivated === "YES"){
	      if (reverseJets === "NO"){
	        camera.position.z --
	        camera.position.y --
	      }
	      else{
	        camera.position.z ++
	        camera.position.y ++
	      }
	      
	      for (var i = 0; i< frame.hands.length; i++){
	        var hand = frame.hands[i];
	        if (hand.palmNormal[0] >= -0.5 && hand.palmNormal[0] <= 0.50){
	          console.log("go straight");
	          $("#direction_label2").text("");
	        }
	        else if (hand.palmNormal[0] < -0.5 && hand.palmNormal[0] >= -0.7){
	          console.log("go right and up");
	          cloudPositionX--;
	          cloudPositionY--;
	          earthPositionX--;
	          earthPositionY--;
	          starsPositionX--;
	          starsPositionY--;
	          cloudPositionZ--;
	          earthPositionZ--;
	          starsPositionZ--;
	          $("#direction_label2").text("RIGHT");

	          $("#palm_direction").text("Palm Direction: " + hand.palmNormal[0] + ". Travelling right and up!");
	          clouds.position.set( cloudPositionX, cloudPositionY, cloudPositionZ );
	          earth.position.set(earthPositionX, earthPositionY, earthPositionZ);
	          particleSystem.position.set(starsPositionX, starsPositionY, starsPositionZ);
	        }
	        else if (hand.palmNormal[0] < -0.7){
	          console.log("go right");
	          cloudPositionX--;
	          cloudPositionY--;
	          earthPositionX--;
	          earthPositionY--;
	          starsPositionX--;
	          starsPositionY--;
	          $("#direction_label2").text("RIGHT");

	          $("#palm_direction").text("Palm Direction: " + hand.palmNormal[0] + ". Travelling right!");
	          clouds.position.set( cloudPositionX, cloudPositionY, cloudPositionZ);
	          earth.position.set(earthPositionX, earthPositionY, earthPositionZ);
	          particleSystem.position.set(starsPositionX, starsPositionY, starsPositionZ);
	        }
	        else if (hand.palmNormal[0] >= 0.5 && hand.palmNormal[0] <= 0.7){
	          console.log("go left and up");
	          cloudPositionX++;
	          cloudPositionY++;
	          earthPositionX++;
	          earthPositionY++;
	          starsPositionX++;
	          starsPositionY++;
	          cloudPositionZ++;
	          earthPositionZ++;
	          starsPositionZ++;
	          $("#direction_label2").text("LEFT");

	          $("#palm_direction").text("Palm Direction: " + hand.palmNormal[0] + ". Travelling left and up!");
	          clouds.position.set( cloudPositionX, cloudPositionY, cloudPositionZ );
	          earth.position.set(earthPositionX, earthPositionY, earthPositionZ);
	          particleSystem.position.set(starsPositionX, starsPositionY, starsPositionZ);
	        }
	        else if (hand.palmNormal[0] > 0.7){
	          console.log("go left");
	          cloudPositionX++;
	          cloudPositionY++;
	          earthPositionX++;
	          earthPositionY++;
	          starsPositionX++;
	          starsPositionY++;
	          $("#direction_label2").text("LEFT");

	          $("#palm_direction").text("Palm Direction: " + hand.palmNormal[0] + ". Travelling left!");
	          clouds.position.set( cloudPositionX, cloudPositionY, cloudPositionZ );
	          earth.position.set(earthPositionX, earthPositionY, earthPositionZ);
	          particleSystem.position.set(starsPositionX, starsPositionY, starsPositionZ);
	        }
	      }
	    }

	    //rotate cloud and earth independently
	    clouds.rotation.y+=.002
	    earth.rotation.y+=.001

	    if (!firstValidFrame) firstValidFrame = frame
	    var t = firstValidFrame.translation(frame)

	    //limit y-axis between 0 and 180 degrees
	    curY = map(t[1], -300, 300, 0, 179)

	    //assign rotation coordinates
	    rotateX = t[0]
	    rotateY = -curY

	    zoom = Math.max(0, t[2] + 200);
	    zoomFactor = 1/(1 + (zoom / 150));

	    //adjust 3D spherical coordinates of the camera
	    // camera.position.x = earth.position.x + cameraRadius * Math.sin(rotateY * Math.PI/180) * Math.cos(rotateX * Math.PI/180)
	    // camera.position.z = earth.position.y + cameraRadius * Math.sin(rotateY * Math.PI/180) * Math.sin(rotateX * Math.PI/180)
	    if (jetPacksActivated === "NO"){
	      camera.position.z ++
	      camera.position.y ++
	    }
	    $("#distance").text("Distance From Earth (km): " + trueRound(camera.position.z * 3.5, 2));
	    // camera.position.y = earth.position.z + cameraRadius * Math.cos(rotateY * Math.PI/180)
	    // camera.fov = fov * zoomFactor;
	  }

	  camera.updateProjectionMatrix();
	  camera.lookAt(scene.position)
	  renderer.render(scene, camera)
	});

	//function for rounding
	function trueRound(value, digits){
    	return (Math.round((value*Math.pow(10,digits)).toFixed(digits-1))/Math.pow(10,digits)).toFixed(digits);
	}

	//window resize method
	window.addEventListener( 'resize', onWindowResize, false );
	function onWindowResize(){
	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();

	    renderer.setSize( window.innerWidth, window.innerHeight );
	}
});