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

	let self = this;

	this.FPS = 25.0;

	let lights = [
		"green", // 0
		"red", // 1
		"yellow" // 2
	];

	let enterTime,
		phases = [],
		sync = false,
		next = NaN,
		onplay = false;

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
	};
	video.onloadedmetadata = function () {
		$cache(".duration").innerHTML = video.duration.toFixed(3);
		$cache(".scrubber").max = video.duration;
		$cache(".scrubber").value = video.currentTime;

		createPhasebar();
	};
	video.oncanplay = function () {
		document.body.style.cursor = "default";
	};
	video.ontimeupdate = function () {
		$cache(".time").innerHTML = video.currentTime.toFixed(3);
		$cache(".scrubber").value = video.currentTime;

		updateLights(video.currentTime);

		if (sync) {
			if (isNaN(next)) {
				sync = false;
				return;
			}
			video.currentTime = next;
		}
	};
	$cache(".scrubber").onmousedown = function (e) {
		if (!video.paused) {
			video.pause();
			onplay = true;
		}
		video.currentTime = innerGetScrubberOffset(e);

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
			return video.duration;
		}

		return ((e.pageX - offsetLeft) / scrubber.offsetWidth) * video.duration;
	}

	function scrub(e) {
		let seek = innerGetScrubberOffset(e);

		if (sync) {
			next = seek;
		} else {
			sync = true;

			video.currentTime = seek;
		}
	}

	function scrubExit(e) {
		if (sync) {
			sync = false;
			next = NaN;
		} else if (onplay) { video.play(); }
		onplay = false;

		document.removeEventListener("mousemove", scrub);
		document.removeEventListener("mouseup", scrubExit);
	}

	function updateLights(time) {
		if (!enterTime) {
			return;
		}
		time = enterTime + time*1000;

		let light = 0;
		for (let phase of phases) {
			if (time < phase.start) {
				break;
			}
			light = phase.light;
		}

		$cache(".phase-id").style.borderColor = lights[light];
	}

	function createPhasebar() {
		if (!enterTime) {
			return;
		}
		let endTime = enterTime + video.duration*1000;

		let phasebar = $cache(".phasebar");

		let el,
			duration,
			start,
			end;
		for (let ph of phases) {
			start = enterTime > ph.start ? enterTime : ph.start;
			end = endTime < ph.end ? endTime : ph.end;

			duration = (end - start) / 10 / video.duration;

			el = document.createElement("span");
			el.className = "phase-" + lights[ph.light > 2 ? 0 : ph.light];
			el.style.width = duration + "%";
			phasebar.appendChild(el);
		}
	}

	this.video = video;

	this.playSwitch = function () {
		video.paused ? video.play() : video.pause();
	};

	this.shiftFrame = function (forward, multiply) {
		video.paused || video.pause();

		let frameDuration = video.mozPresentedFrames ? video.duration / video.mozPresentedFrames : 1.0 / self.FPS;

		if (multiply) {
			frameDuration *= 10;
		}

		video.currentTime += forward ? frameDuration : -frameDuration;
	};

	this.definePhases = function (phs, enter) {
		switch (phs.length) {
			case 0:
				return;
			case 1:
				if (phs[0].light == "0") {
					return;
				} break;
		}
		enterTime = enter.getTime();

		for (let ph of phs) {
			ph = Object.assign({}, ph);

			ph.start = ph.start.getTime();
			ph.end = ph.end.getTime();

			phases.push(ph);
		}
		updateLights(0);

		$cache(".phase-id").style.display = "inline-block";
	};

	this.loadSource = function (url, fps, start) {
		video.hidden = false;
		video.src = url;

		self.FPS = fps || self.FPS;

		if (start) {
			video.currentTime = start / self.FPS;
		}
	};

	this.clear = function () {
		video.hidden = true;

		video.pause();
		enterTime = undefined;
		phases = [];

		self.FPS = 25.0;

		let phasebar = $cache(".phasebar");

		while (phasebar.firstChild) {
			phasebar.removeChild(phasebar.firstChild);
		}
		$cache(".phase-id").style.display = "none";
	};
}
