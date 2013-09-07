var arDrone = require('ar-drone');
var client  = arDrone.createClient();
var speed = 0.5;

// Keep things near zero
function initPosition() {

	client.on('navdata', function(data) {
		var clockwise = data.demo.clockwiseDegrees;

		console.log('Clockwise = ', clockwise);
		if(clockwise > 10) { // positive
			// rotate negative
			client.counterClockwise(speed);
		} else if(clockwise < -10) { // negative
			// rotate positive
			client.clockwise(speed);
		}else{
			client.clockwise(0);
			client.counterClockwise(0);
			//client.land();
			// callback
		}

	});
};

console.log('Taking Off');
client.takeoff();

client.after(3000, function(){
	console.log('Positioning');
	initPosition();
});

client.after(15000, function(){
	console.log('Landing');
	client.stop();
	client.land();
});
