/**
 * Azimuth IMGX player
 * imgx-player.js
 * 
 * @requires: fragments/imgx.js
 * 
 * @author: alkorgun
 */
function EmbeddedIMGXPlayer(elementSelector, composerInstance) {
	var scope = document.querySelector(elementSelector),
		video;

	this.FPS = 25.0;

	let objectCache = {};

	function $cache(selector) {
		if (!objectCache.hasOwnProperty(selector)) {
			objectCache[selector] = scope.querySelector(selector);
		}
		return objectCache[selector];
	}

	video = scope.querySelector("video");
	video.onloadstart = function () {
		document.body.style.cursor = "wait";
	}
	video.onloadedmetadata = function () {
		$cache(".duration").innerHTML = video.duration.toFixed(3);
		$cache(".scrubber").max = video.duration;
		$cache(".scrubber").value = video.currentTime;
	}
	video.oncanplay = function () {
		document.body.style.cursor = "default";
	}
	video.ontimeupdate = function () {
		$cache(".time").innerHTML = video.currentTime.toFixed(3);
		$cache(".scrubber").value = video.currentTime;
	}
	$cache(".scrubber").onclick = function (e) {
		video.currentTime = ((e.pageX - this.offsetLeft) / this.offsetWidth) * video.duration;
	}
	scope.addEventListener("keyup", keyboardListener);

	for (let button of scope.querySelectorAll("button")) {
		button.addEventListener("keyup", (e) => {
			if (e.keyCode == 32) {
				e.preventDefault();
			}
		});
	}

	this.video = video;

	this.playSwitch = function () {
		video.paused ? video.play() : video.pause();
	}

	this.shiftFrame = function (forward, multiply) {
		video.paused || video.pause();

		let frameDuration = video.mozPresentedFrames ? video.duration / video.mozPresentedFrames : 1.0 / this.FPS;

		if (multiply) {
			frameDuration *= 10;
		}

		video.currentTime += forward ? frameDuration : -frameDuration;
	}

	this.loadSource = function (url) {
		video.src = url;
	}

	function keyboardListener(event) {
		let multiply = false;

		switch (event.keyCode) {
			case 32:
				this.playSwitch();
				event.preventDefault();
				break;
			case 38:
				multiply = true;
			case 39:
				this.shiftFrame(true, multiply);
				event.preventDefault();
				break;
			case 40:
				multiply = true;
			case 37:
				this.shiftFrame(false, multiply);
				event.preventDefault();
				break;
			case 86:
				composerInstance.sizeSwitch();
				break;
			default:
				break;
		}
	}
}
