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
		//setTimeout(() => {
			changeFrame(innerGetScrubberOffset(e));
		//}, 0);

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

		sheduler = setTimeout(() => {
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

	this.loadSource = function (frameBuffer) {
		innerStop();

		currentOffset = 0;

		frames = frameBuffer;

		document.body.style.cursor = "wait";

		let start = 0,
			end = frames.length - 1;

		duration = (frames[end].datetime - frames[start].datetime) / 1000;

		$cache(".duration").innerHTML = duration.toFixed(3);
		$cache(".scrubber").max = end;
		$cache(".scrubber").value = start;

		changeFrame(start);

		document.body.style.cursor = "default";
	};

	this.clear = function () {
		innerStop();
		currentOffset = 0;
		frames = [];
	};
}
