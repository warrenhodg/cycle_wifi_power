"use strict";

var child_process = require('child_process');
var moment = require('moment');

var ONE_MINUTE = 1000 * 60;

var isWifiOn;

function ping(host) {
	return new Promise(function (resolve, reject) {
	    try {
            var command = "ping -c 1 " + host;

            child_process.exec(command, function (error, stdout, stderr) {
                resolve(stderr.match(/Unknown host/) === null);
            });
        } catch (error) {
	        console.log("Error " + error.stack);
	    	reject(error);
		}
	});
}

function turnWifiOff(){
    isWifiOn = false;
    return executeCommand('networksetup -setairportpower en0 off');
}

function turnWifiOn(){
    isWifiOn = true;
    return executeCommand('networksetup -setairportpower en0 on');
}

function executeCommand(command) {
	return new Promise(function (resolve, reject) {
		child_process.exec(command, function(error, stdout, stderr) {
			if (error instanceof Error) {
				reject (error);
			} else {
				var wifiStatus = (isWifiOn) ? 'ON' : 'OFF';
				console.log(moment().format('MMMM Do, h:mm:ss a') + ' => Wifi is ' + wifiStatus);
				resolve();
			}
		});
	});
}

function run() {
	var rerun = function() {
		setTimeout(function() {
			run();
		}, ONE_MINUTE);
	};

	ping("www.google.co.za")
		.then(function (result) {
			if (!result) {
				console.log(moment().format('MMMM Do, h:mm:ss a') + ' => Cannot ping - cycling power');
				turnWifiOff()
					.then(turnWifiOn)
					.then(function () {
						rerun();
					});
			} else {
				rerun();
			}
		})
		.catch(function (error) {
			console.log(moment().format('MMMM Do, h:mm:ss a') + ' => ' + error.stack);
			rerun();
		});
}

run();
