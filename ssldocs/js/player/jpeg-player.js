/**
 * Azimuth JPEG player
 * jpeg-player.js
 *
 * @author: alkorgun
 */
function EmbeddedJPEGPlayer(elementSelector, composerInstance) {
	var scope = document.querySelector(elementSelector),
		video = scope.querySelector(".jpeg");

	let self = this;

	this.FPS = 0;

	this.video = video;

	this.playSwitch = function () {};

	this.shiftFrame = function (forward, multiply) {};

	this.definePhases = function (phases) {};

	this.loadSource = function (url) {
		video.hidden = false;
		video.src = url;
	};

	this.clear = function () {
		video.hidden = true;
	};
}
