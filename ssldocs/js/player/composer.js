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
			currentPlayer: null
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
				template: "#metadata-template",
				props: ["meta"]
			}
		},
		methods: {
			loadSource: function (filename, blob) {
				this.meta = [];
				this.file = filename;

				let fragment;

				initBlobReader((data) => {
					if (filename.endsWith(".imgx")) {
						this.player = "app-imgx-player";

						fragment = new IMGX(data);
						fragment.onready(function (imgx) {
							let violation;

							for (let uid of Object.keys(imgx.violations)) {
								violation = imgx.violations[uid];
								break;
							}
							if (violation.filename.endsWith(".mp4")) {
								if (composer.currentPlayer) {
									composer.currentPlayer.clear();
								}
								composer.currentPlayer = new EmbeddedIMGXPlayer("#app-imgx-player", composer);

								composer.currentPlayer.loadSource(violation.src);
							} else {
								alert("Not supported yet.");
								return;
							}
							let metaDesc = {
								"datetime": "Время нарушения",
								"complex": "Тип комплекса",
								"place": "Место нарушения",
								"lpn": "ГРЗ",
								"type": "Тип нарушения"
							};
							for (let key of Object.keys(metaDesc)) {
								composer.meta.push({key: metaDesc[key], value: violation[key]});
							}
						});
					} else if (filename.endsWith(".imgf")) {
						this.player = "app-imgf-player";

						fragment = new IMGF(data);
						fragment.onready(function (imgf) {
							if (composer.currentPlayer) {
								composer.currentPlayer.clear();
							}
							composer.currentPlayer = new EmbeddedIMGFPlayer("#app-imgf-player", composer);

							composer.currentPlayer.loadSource(imgf.frames);

							let pdefines = ["green", "red", "yellow"];

							let phases = [];
							let previous = null;
							let color;
							for (let frame of imgf.frames) {
								color = pdefines[frame.lights];
								if (color == previous) {
									phases[phases.length - 1][0] += 1;
								} else {
									phases.push([1, color]);
								}
								previous = color;
							}
							for (let phase of phases) {
								phase[0] = phase[0] / imgf.frames.length * 100;
							}
							composer.currentPlayer.definePhases(phases);
						});
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
	if (!composer.currentPlayer) {
		return;
	}
	let multiply = false;

	switch (event.keyCode) {
		case 32:
			composer.currentPlayer.playSwitch();
			event.preventDefault();
			break;
		case 38:
			multiply = true;
		case 39:
			composer.currentPlayer.shiftFrame(true, multiply);
			event.preventDefault();
			break;
		case 40:
			multiply = true;
		case 37:
			composer.currentPlayer.shiftFrame(false, multiply);
			event.preventDefault();
			break;
		case 86:
			composer.switchPlayerSize();
			break;
		default:
			break;
	}
}
