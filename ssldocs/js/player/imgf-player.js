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

	let self = this;

	this.FPS = 25.0 / 3;

	let ft = 1.0 / this.FPS * 1000; // frame duration

	let lights = [
		"green", // 0
		"red", // 1
		"yellow" // 2
	];

	let frames = [],
		duration = 0,
		stop = true,
		onplay = false,
		scrolled = false,
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
	$cache(".scrubber").onmousedown = function (e) {
		if (!stop) {
			innerStop();
			onplay = true;
		}
		changeFrame(innerGetScrubberOffset(e));

		scrolled = false;

		document.addEventListener("mousemove", scrub);
		document.addEventListener("mouseup", scrubExit);

		e.preventDefault();
	};

	for (let button of scope.querySelectorAll("button")) {
		button.addEventListener("keyup", (e) => {
			if (e.keyCode == 32) {
				e.preventDefault();
			}
		});
	}

	function innerGetScrubberOffset(e) {
		let scrubber = $cache(".scrubber");

		let offsetLeft = 0,
			element = scrubber;

		do {
			offsetLeft += element.offsetLeft;
			element = element.offsetParent;
		} while (element);

		if (e.pageX < offsetLeft) {
			return 0;
		}

		if (e.pageX > (offsetLeft + scrubber.offsetWidth)) {
			return frames.length - 1;
		}

		return Math.floor(((e.pageX - offsetLeft) / scrubber.offsetWidth) * frames.length);
	}

	function scrub(e) {
		scrolled = true;

		changeFrame(innerGetScrubberOffset(e));
	}

	function scrubExit(e) {
		if (onplay && !scrolled) {
			innerPlay(currentOffset + 1);
		}
		onplay = false;

		document.removeEventListener("mousemove", scrub);
		document.removeEventListener("mouseup", scrubExit);
	}

	function updateTime(offset) {
		$cache(".time").innerHTML = ((offset / frames.length) * duration).toFixed(3);
		$cache(".scrubber").value = offset;
	}

	function updateLights(phase) {
		$cache(".phase-id").style.borderColor = lights[phase];
	}

	function changeFrame(offset) {
		if (offset >= frames.length || offset < 0) {
			return;
		}
		let jpeg = frames[offset].jpeg;

		video.src = URL.createObjectURL(
			new Blob([jpeg], {type: "image/jpeg"})
		);

		currentOffset = offset;

		updateTime(offset);
		updateLights(frames[offset].lights);
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

		sheduled = setTimeout(() => {
			playLoop(offset);
		}, ft);
	}

	function innerPlay(offset) {
		if (stop) {
			stop = false;
		}
		if (offset + 1 > frames.length) {
			offset = 0;
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
	};

	this.shiftFrame = function (forward, multiply) {
		innerStop();

		let offset = multiply ? 10 : 1;

		changeFrame(currentOffset + (forward ? offset : -offset));
	};

	this.definePhases = function (phases) {
		switch (phases.length) {
			case 0:
				return;
			case 1:
				if (phases[0][1] == lights[0]) {
					return;
				} break;
		}
		$cache(".phase-id").style.display = "inline-block";

		let phasebar = $cache(".phasebar");

		let ph;
		for (let [length, color] of phases) {
			ph = document.createElement("span");
			ph.className = "phase-" + color;
			ph.style.width = length + "%";
			phasebar.appendChild(ph);
		}
	};

	this.loadSource = function (frameBuffer, startFrame) {
		video.hidden = false;

		innerStop();

		currentOffset = 0;

		frames = frameBuffer;

		document.body.style.cursor = "wait";

		let start = 0,
			end = frames.length - 1;

		duration = (frames[end].datetime - frames[start].datetime) / 1000;

		start = startFrame || start;

		$cache(".duration").innerHTML = duration.toFixed(3);
		$cache(".scrubber").max = end;
		$cache(".scrubber").value = start;

		changeFrame(start);

		document.body.style.cursor = "default";
	};

	this.clear = function () {
		video.hidden = true;

		innerStop();
		currentOffset = 0;
		frames = [];

		let phasebar = $cache(".phasebar");

		while (phasebar.firstChild) {
			phasebar.removeChild(phasebar.firstChild);
		}
		$cache(".phase-id").style.display = "none";
	};
}
