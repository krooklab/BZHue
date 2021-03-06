var util = require('util');
var async = require('async');
var hue = require("node-hue-api");
var _ = require('underscore');

var config = require('./config');

var api = new hue.HueApi(config.hue.hostname, config.hue.username);

var animateStates = {};
var animationIsOn = false;
animateLight();

function turnOnAnimation(lightid){
	animateStates[lightid] = {lightid: lightid, animate: true, isBright: false};
}

function turnOffAnimation(lightid){
	if(animateStates[lightid])
		animateStates[lightid].animate = false;
}

// animateLight() keeps running constantly
function animateLight(){
	var transitiontime = config.animateTime;
	async.forEach(_.toArray(animateStates), function (animateState, $){

		if(!animateState.isBright && animateState.animate){
			api.setLightState(animateState.lightid, {
				bri: 255,
				transitiontime: Math.round(transitiontime/100)
			}, function (err){
				animateState.isBright = true;
				$();
			});
		}else if(animateState.isBright){
			api.setLightState(animateState.lightid, {
				bri: 0,
				transitiontime: Math.round(transitiontime/100)
			}, function (err){
				animateState.isBright = false;
				$();
			})
		}else{
			$();
		}

	}, function (err){
		setTimeout(function(){ animateLight(); },transitiontime);
	});
}

function turnOffLight(lightid){
	api.setLightState(lightid, {
		on: false,
		transitiontime: 0
	}, function (err, lights) {
		if (err) return console.log(err);
	});
}

function turnOnLight(lightid){
	api.setLightState(lightid, {
		on: true,
		transitiontime: 0
	}, function (err, lights) {
		if (err) return console.log(err);
	});
}

function burstLight(lightid, callback){
	// 2 helper functions:
	function bright(cb){
		api.setLightState(lightid, {
			"bri": 255,
			"transitiontime": 0
		}, function (err, lights) {
			if (err) console.log(err);
			if(cb) cb();
		});
	}

	function dark(cb){
		api.setLightState(lightid, {
			bri: 0,
			transitiontime: 2
		}, function (err, lights) {
			if (err) console.log(err);

			// check after x seconds if the light has gone to 'dark'
			setTimeout(function(){
				isDark(lightid, function (isdark){
					if(!isdark)
						dark();
				})
			},3000);
		});
	}

	bright( function (){
		dark();
	});
}

function isDark(lightid, callback){
	api.lightStatus(lightid, function (err, result) {
		if (err) console.log(err);
		if (err) callback(true); //just return true

		var dark = true;
		if (result.state.bri != 0){
			dark = false;
		}

		if(callback) callback(dark);
	});
}

function getLightState(lightid, callback){
	api.lightStatus(lightid, function (err, result) {
		if(callback) return callback(err, result.state);
	});
}


function dimLight(lightid, callback){
	api.setLightState(lightid, {
		bri: 0,
		transitiontime: 0
	}, function (err, lights) {
		if (err) console.log(err);
		if(callback) callback();
	});
}

function dimToWhite(lightid, callback){
	api.setLightState(lightid, {
		bri: 0,
		hue: 65535,
		sat: 0,
		transitiontime: 5
	}, function (err, lights) {
		if (err) console.log(err);
		if(callback) callback();
	});
}

function turnOnDefaultLight(lightid, callback){
	api.setLightState(lightid, {
		on: true,
		bri: 0,
		hue: 65535,
		sat: 0,
		transitiontime: 0
	}, function (err, lights) {
		if (err) console.log(err);
		if(callback) callback();
	});
}

function turnOffDefaultLight(lightid, callback){
	api.setLightState(lightid, {
		on: false,
		bri: 0,
		hue: 65535,
		sat: 0,
		transitiontime: 0
	}, function (err, lights) {
		if (err) console.log(err);
		if(callback) callback();
	});
}


function beamOfLight(){


	burstLight(1);
	setTimeout(function(){burstLight(2)},150);
	setTimeout(function(){burstLight(3)},300);
}

function startlooping(callback){
	api.setLightState(1, {
		effect: 'colorloop'
	}, function (err, lights) {
		if (err) console.log(err);
		if(callback) callback();
	});
}


function stoplooping(callback){
	api.setLightState(1, {
		effect: 'none'
	}, function (err, lights) {
		if (err) console.log(err);
		if(callback) callback();
	});
}

function setLight(lightid, hue, sat, callback){
	api.setLightState(lightid, {
		hue: hue,
		sat: sat,
		transitiontime: 0
	}, function (err, lights) {
		if (err) return console.log(err);
		if(callback) return callback();
	});
}




function deathAnimation(lightid, callback){

	function on(){
		api.setLightState(lightid, {
			bri: 255,
			hue: 65535,
			sat: 255,
			transitiontime: 0
		}, function (err, lights) {
			if (err) console.log(err);
		});
	}

	function off(){
		api.setLightState(lightid, {
			bri: 0,
			transitiontime: 0
		}, function (err, lights) {
			if (err) console.log(err);
		});
	}

	var count = 0;
	var isOn = false;
	async.whilst(
	    function () { return count < 5; },
	    function (callback) {
	    	if(isOn){
	    		off();
	    		isOn = false;
	    	}else{
	    		on();
	    		isOn = true;
	    	}

	        count++;
	        setTimeout(callback, 50);
	    },
	    function (err) {
	        if(callback) callback(err);
	    }
	);
}

function killedAnimation(lightid, callback){
	function on(){
		api.setLightState(lightid, {
			bri: 255,
			hue: 25717,
			sat: 254,
			transitiontime: 0
		}, function (err, lights) {
			if (err) console.log(err);
		});
	}

	function off(){
		api.setLightState(lightid, {
			bri: 0,
			transitiontime: 0
		}, function (err, lights) {
			if (err) console.log(err);
		});
	}

	var count = 0;
	var isOn = false;
	async.whilst(
	    function () { return count < 5; },
	    function (callback) {
	    	if(isOn){
	    		off();
	    		isOn = false;
	    	}else{
	    		on();
	    		isOn = true;
	    	}

	        count++;
	        setTimeout(callback, 50);
	    },
	    function (err) {
	        if(callback) callback(err);
	    }
	);
}

exports.startlooping  = startlooping;
exports.stoplooping = stoplooping;
exports.setLight = setLight;
exports.burstLight = burstLight;
exports.beamOfLight = beamOfLight;
exports.turnOffLight = turnOffLight;
exports.turnOnLight = turnOnLight;
exports.turnOffDefaultLight = turnOffDefaultLight;
exports.turnOnDefaultLight = turnOnDefaultLight;
exports.dimLight = dimLight;
exports.dimToWhite = dimToWhite;
exports.deathAnimation = deathAnimation;
exports.killedAnimation = killedAnimation;
exports.getLightState = getLightState;
exports.turnOnAnimation = turnOnAnimation;
exports.turnOffAnimation = turnOffAnimation;
