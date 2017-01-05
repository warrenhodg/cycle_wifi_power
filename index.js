"use strict";

var child_process = require('child_process');
var request = require('request');
var moment = require('moment');

var ONE_MINUTE = 1000 * 60;
var URL = 'https://code.jquery.com/jquery-migrate-3.0.0.min.js';

var isWifiOn;

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

    request(URL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(moment().format('MMMM Do, h:mm:ss a') + ' => Succeeded');
            rerun();
        }else{
            turnWifiOff()
                .then(turnWifiOn)
                .then(function () {
                    rerun();
                });
		}
    });
}

run();
