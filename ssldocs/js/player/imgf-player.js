/**
 * Azimuth IMGF player
 * imgf-player.js
 * 
 * @requires: fragments/imgf.js
 * 
 * @author: alkorgun
 */
function EmbeddedIMGFPlayer(elementSelector, composerInstance) {
	var scope = document.querySelector(elementSelector),
		video;

	this.FPS = 25.0 / 3;

	let ft = 1.0 / this.FPS * 1000; // frame duration

	let frames = [],
		duration = 0,
		stop = true,
		currentOffset = 0,
		sheduled;

	let objectCache = {};

	function $cache(selector) {
		if (!objectCache.hasOwnProperty(selector)) {
			objectCache[selector] = scope.querySelector(selector);
		}
		return objectCache[selector];
	}

	video = scope.querySelector(".imgf");
	$cache(".scrubber").onclick = function (e) {
		innerStop();
		setTimeout(function () {
			innerPlay(Math.floor(((e.pageX - this.offsetLeft) / this.offsetWidth) * frames.length));
		}, ft);
	}
	scope.addEventListener("keyup", keyboardListener);

	for (let button of scope.querySelectorAll("button")) {
		button.addEventListener("keyup", (e) => {
			if (e.keyCode == 32) {
				e.preventDefault();
			}
		});
	}

	function updateTime(offset) {
		$cache(".time").innerHTML = ((offset / frames.length) * duration).toFixed(3);
		$cache(".scrubber").value = offset;
	}

	function changeFrame(offset) {
		let jpeg = frames[offset].jpeg;
		
		video.src = URL.createObjectURL(
				new Blob([jpeg], {type: "image/jpeg"})
		);

		currentOffset = offset;

		updateTime(offset);
	}

	function playLoop(offset) {
		if (stop) {
			return;
		}
		changeFrame(offset);

		offset += 1;
		if (offset > frames.length) {
			stop = true;
			return;
		}
		
		sheduler = setTimeout(function () {
			playLoop(offset);
		}, ft);
	}

	function innerPlay(offset) {
		if (stop) {
			stop = false;
		}
		playLoop(offset);
	}

	function innerStop() {
		if (sheduled) {
			clearTimeout(sheduled);
			sheduled = null;
		}
		stop = true;
	}

	this.video = video;

	this.playSwitch = function () {
		if (stop) {
			innerPlay(currentOffset + 1);
		} else {
			innerStop();
		}
	}

	this.shiftFrame = function (forward, multiply) {
		innerStop();

		let offset = multiply ? 10 : 1;

		changeFrame(currentOffset + (forward ? offset : -offset));
	}

	this.loadSource = function (frameBuffer) {
		frames = frameBuffer;
	
		document.body.style.cursor = "wait";

		let start = 0,
			end = frames.length - 1;

		duration = frames[end].datetime - frames[start].datetime;

		$cache(".duration").innerHTML = duration.toFixed(3);
		$cache(".scrubber").max = end;
		$cache(".scrubber").value = start;

		document.body.style.cursor = "default";
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
