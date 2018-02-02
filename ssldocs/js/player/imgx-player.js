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

	let sync = false,
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
	};
	video.oncanplay = function () {
		document.body.style.cursor = "default";
	};
	video.ontimeupdate = function () {
		$cache(".time").innerHTML = video.currentTime.toFixed(3);
		$cache(".scrubber").value = video.currentTime;

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

	this.video = video;

	this.playSwitch = function () {
		video.paused ? video.play() : video.pause();
	};

	this.shiftFrame = function (forward, multiply) {
		video.paused || video.pause();

		let frameDuration = video.mozPresentedFrames ? video.duration / video.mozPresentedFrames : 1.0 / this.FPS;

		if (multiply) {
			frameDuration *= 10;
		}

		video.currentTime += forward ? frameDuration : -frameDuration;
	};

	this.definePhases = function (phases) {};

	this.loadSource = function (url) {
		video.hidden = false;
		video.src = url;
	};

	this.clear = function () {
		video.hidden = true;
	};
}
