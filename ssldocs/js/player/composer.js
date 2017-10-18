/**
 * Azimuth IMGX/IMGF player composer
 * composer.js
 * 
 * @author: alkorgun
 */
var composer;

window.onload = function () { formPage(); };

function formPage() {
	composer = new Vue({
		el: "#app-composer",
		data: {
			file: undefined,
			player: undefined,
			progress: 0,
			phases: [],
			huge: false,
			meta: [],
			currentReactor: null,
			IMGXPlayer: null,
			IMGFPlayer: null
		},
		components: {
			"app-imgf-player": {
				template: "#imgf-player-template",
				props: ["phases", "progress"]
			},
			"app-imgx-player": {
				template: "#imgx-player-template",
				props: ["phases", "progress"]
			},
			"metadata": {
				template: "#metadata",
				props: ["meta"]
			}
		},
		methods: {
			loadSource: function (filename, blob) {
				this.file = filename;

				let fragment;

				initBlobReader((data) => {
					if (filename.endsWith(".imgx")) {
						this.player = "app-imgx-player";

						fragment = new IMGX();
						fragment.onready(function (imgx) {
							let violation;
							
							for (let uid of Object.keys(imgx.violations)) {
								violation = imgx.violations[uid];
								break;
							}
							if (violation.filename.endsWith(".mp4")) {
								if (!composer.IMGXPlayer) {
									composer.IMGXPlayer = new EmbeddedIMGXPlayer("#app-imgx-player", composer);
								}
								composer.IMGXPlayer.loadSource(violation.src);

								composer.currentReactor = composer.IMGXPlayer;
							} else {
								alert("Not supported yet.")
							}
						});
						fragment.initialize(data);
					} else if (filename.endsWith(".imgf")) {
						this.player = "app-imgf-player";

						fragment = new IMGF();
						fragment.onready(function (imgf) {
							if (!composer.IMGFPlayer) {
								composer.IMGFPlayer = new EmbeddedIMGFPlayer("#app-imgf-player", composer);
							}
							composer.IMGFPlayer.loadSource(imgf.frames);
							
							composer.currentReactor = composer.IMGFPlayer;
						});
						fragment.initialize(data);
					} else if (filename.endsWith(".imgv")) {
						fragment = new IMGF(data);
					} else {
						alert("Unsupported file type!");
					}
				}).readAsArrayBuffer(blob);
			},
			switchPlayerSize: function () {
				if (this.huge) {
					document.querySelector("#fragment-player-slot").style.gridColumn="1";
					document.querySelector("#metadata").style.gridColumn="2";
					document.querySelector("#metadata").style.gridRow="1";
				} else {
					document.querySelector("#metadata").style.gridRow="2";
					document.querySelector("#metadata").style.gridColumn="1";
					document.querySelector("#fragment-player-slot").style.gridColumn="1 / span 2";
				}
			this.huge = !this.huge;
			},
			expandIMGX: function () {
				let file = $$$("#imgx-input").files[0];
				if (!file) {
					return alert("No IMGX!");
				}
				this.loadSource(file.name, file);
			},
			expandIMGF: function () {
				let file = $$$("#imgf-input").files[0];
				if (!file) {
					return alert("No IMGF!");
				}
				this.loadSource(file.name, file);
			}
		}
	});
	document.body.addEventListener("keyup", keyboardListener);
}

function initBlobReader(func) {
	let reader = new FileReader();
	reader.onload = function () {
		func(reader.result);
	}
	return reader;
}

function keyboardListener(event) {
	let multiply = false;

	switch (event.keyCode) {
		case 32:
			composer.currentReactor.playSwitch();
			event.preventDefault();
			break;
		case 38:
			multiply = true;
		case 39:
			composer.currentReactor.shiftFrame(true, multiply);
			event.preventDefault();
			break;
		case 40:
			multiply = true;
		case 37:
			composer.currentReactor.shiftFrame(false, multiply);
			event.preventDefault();
			break;
		case 86:
			composer.switchPlayerSize();
			break;
		default:
			break;
	}
}
