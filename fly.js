var _ = require('underscore');
var arDrone = require('ar-drone');
var client  = arDrone.createClient();

var UNIT_DURATION = 1001;
var UNIT_SPEED = 0.3;
var POSITIONING_SPEED = 0.1;

module.exports.fly = function(req, res) {
  doFly(req, res);

  // response
  res.send('flying?');
}

doFly = function(req, res) {

  // square
  var deltas = [
    [1,0],
    [0,1],
    [-1,0],
    [0,-1]
  ];

  // right and left
//  var deltas = [
//    [1,0],
//    [-1,0],
//    [1,0],
//    [-1,0],
//    [1,0],
//    [-1,0],
//    [1,0],
//    [-1,0],
//    [1,0],
//    [-1,0],
//    [1,0],
//    [-1,0]
//  ];

  // initiate takeoff
  console.log('initiating takeoff');
  client.after(0, function() {
    client.takeoff();
  });
  // wait to take off
  console.log('takeoff completed');
  client.after(2000, function() {});

  // initiate positioning
  initiatePositioning();

  // initiate flight commands
  console.log('initiating flight commands');
  runCommands(deltasToCommands(deltas));

  // initiate stop and land
  console.log('initiating stop and land');
  client.after(UNIT_DURATION*8, function() {
    client.stop();
    client.land();
    console.log('stop and land completed');
  });
}

initiatePositioning = function() {
  var position = false;
  client.on('navdata', function(data) {
    var clockwise = data.demo.clockwiseDegrees;
    if(!data.demo) {
      console.log(data);
      return;
    }
    if (position === false) {
      position = clockwise;
    }
    if (position > 170) {
      position = 0
    } else if (position < -170) {
      position = 0
    } else if(clockwise > position + 10) { // positive
      // rotate negative
//      console.log('Over 10, Clockwise = ', clockwise);
      client.counterClockwise(POSITIONING_SPEED);
    } else if(clockwise < position - 10) { // negative
      // rotate positive
//      console.log('Under -10, Clockwise = ', clockwise);
      client.clockwise(POSITIONING_SPEED);
    } else {
//      console.log('Within 10, Clockwise = ', clockwise);
      client.clockwise(0);
      client.counterClockwise(0);
    }
  });
}

deltasToCommands = function(deltas) {
  var commands = _(deltas).map(deltaToCommands);
  return _(commands).flatten();
}

deltaToCommands = function(delta) {
  var commands = [];

  var x = delta[0];
  if (x > 0) {
    _.range(x).forEach(function() { commands.push('right') });
  } else if (x < 0) {
    _.range(Math.abs(x)).forEach(function() { commands.push('left') });
  }

  var y = delta[1];
  if (y > 0) {
    _.range(y).forEach(function() { commands.push('front') });
  } else if (y < 0) {
    _.range(Math.abs(y)).forEach(function() { commands.push('back') });
  }

  return commands;
}

runCommands = function(commands) {
  // run each command
  _(commands).reduce(function (client, command) {
    console.log("initiating command \"", command, "\"");
    client.after(UNIT_DURATION, function() {
      client.stop(); //[command].call(client, 0);
      console.log("command \"", command, "\" stopped");
    }).after(UNIT_DURATION, function() {
      client[command].call(client, UNIT_SPEED);
      console.log("command \"", command, "\" completed");
    });
    return client;
  }, client);
}

doFly();