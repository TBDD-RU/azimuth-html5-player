/**
 * Azimuth IMGX/IMGF player composer
 * composer.js
 * 
 * @requires: vue.js, fragments/{imgx.js,imgf.js}
 *
 * @author: alkorgun
 */
var composer;

function setComposer() {
	composer = new Vue({
		el: "#app-composer",
		data: {
			file: undefined,
			player: undefined,
			violations: {},
			streams: [],
			progress: 0,
			phases: [],
			huge: false,
			meta: [],
			metaDesc: {
				"datetime": "Время нарушения",
				"controller": "Тип комплекса",
				"controller_serial": "Серийный номер комплекса",
				"place": "Место нарушения",
				"lpn": "ГРЗ",
				"speed": "Скорость",
				"limit": "Допустимая скорость",
				"protocol": "Постановление",
				"user": "Проверено",
				"issue_text": "Причина браковки",
				"type": "Тип нарушения"
			},
			currentPlayer: null,
			visible: false
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
			"app-jpeg-player": {
				template: "#jpeg-player-template",
				props: ["phases", "progress"]
			},
			"metadata": {
				template: "#metadata-template",
				props: ["meta"]
			}
		},
		methods: {
			loadMeta: function (sourceMeta, externalMeta) {
				let preferedMeta;
				for (let key of Object.keys(this.metaDesc)) {
					if (externalMeta.hasOwnProperty(key) && externalMeta[key]) {
						preferedMeta = externalMeta;
					} else if (sourceMeta.hasOwnProperty(key) && sourceMeta[key]) {
						preferedMeta = sourceMeta;
					} else {
						continue;
					}
					composer.meta.push({ key: this.metaDesc[key], value: preferedMeta[key] });
				}
			},
			loadSource: function (filename, blob, externalMeta) {
				if (this.currentPlayer) {
					this.currentPlayer.clear();
				}
				this.meta = [];
				this.file = filename;

				let fragment;

				initBlobReader((data) => {
					if (filename.endsWith(".imgx")) {
						fragment = new IMGX(data);
						fragment.onready(function (imgx) {
							let violation;

							if (externalMeta && externalMeta.xml_id) {
								violation = imgx.violations[externalMeta.xml_id];
							} else {
								for (let xml_id of Object.keys(imgx.violations)) {
									violation = imgx.violations[xml_id];
									break;
								}
							} if (!violation) {
								alert("Ошибка: не удалось извлечь материалы из файла с нарушением.");
								return;
							}

							let spl = violation.primary.name.split(".");
							let ext = spl[spl.length - 1].toLowerCase();
							switch (ext) {
								case "mp4":
									composer.player = "app-imgx-player";

									setTimeout(() => {
										composer.currentPlayer = new EmbeddedIMGXPlayer("#app-imgx-player", composer);
										composer.currentPlayer.loadSource(violation.primary.source);
									}, 0);
									break;
								case "imgv":
								case "imgf":
									composer.player = "app-imgf-player";

									initBlobReader((data) => {
										(new IMGF(data)).onready(function (imgf) {
											composer.currentPlayer = new EmbeddedIMGFPlayer("#app-imgf-player", composer);
											composer.currentPlayer.loadSource(imgf.frames);

											composer.currentPlayer.definePhases(composer.calcImgfPhases(imgf));
										});
									}).readAsArrayBuffer(violation.primary.blob);
									break;
								case "jpg":
								case "jpeg":
									composer.player = "app-jpeg-player";

									setTimeout(() => {
										composer.currentPlayer = new EmbeddedJPEGPlayer("#app-jpeg-player", composer);
										composer.currentPlayer.loadSource(violation.primary.source);
									}, 0);
									break;
								default:
									alert("Ошибка: материал \"{name}\" имеет неизвестный тип.".format({name: violation.primary.name}));
							}
							composer.loadMeta(violation, externalMeta);
						});
					} else if (filename.endsWith(".imgf") || filename.endsWith(".imgv")) {
						if (filename.endsWith(".imgf")) {
							this.player = "app-imgf-player";
						} else {
							this.player = "app-jpeg-player";
						}
						fragment = new IMGF(data);
						fragment.onready(function (imgf) {
							if (filename.endsWith(".imgv")) {
								composer.currentPlayer = new EmbeddedJPEGPlayer("#app-jpeg-player", composer);
								composer.currentPlayer.loadSource(
									URL.createObjectURL(
										new Blob([imgf.frames[0].jpeg], {type: "image/jpeg"})
									)
								);
								
								composer.loadMeta(imgf.frames[0], externalMeta);
							} else {
								composer.currentPlayer = new EmbeddedIMGFPlayer("#app-imgf-player", composer);
								composer.currentPlayer.loadSource(imgf.frames);

								let lpn = externalMeta ? externalMeta.lpn.toLowerCase() : null;

								for (let frame of imgf.frames) {
									if (frame.lpn && (!lpn || frame.lpn == lpn)) {
										composer.loadMeta(frame, externalMeta);
										break;
									}
								}
								composer.currentPlayer.definePhases(composer.scanImgfPhases(imgf));
							}
						});
					} else if (filename.endsWith(".imgv")) {
						fragment = new IMGF(data);
					} else {
						alert("Unsupported file type!");
					}
				}).readAsArrayBuffer(blob);
			},
			scanImgfPhases: function (imgf) {
				let pdefines = ["green", "red", "yellow"];

				let phases = [];
				let previous = null;
				let color;
				for (let frame of imgf.frames) {
					color = pdefines[frame.lights];
					if (color === previous) {
						phases[phases.length - 1][0] += 1;
					} else {
						phases.push([1, color]);
					}
					previous = color;
				}
				for (let phase of phases) {
					phase[0] = phase[0] / imgf.frames.length * 100;
				}
				return phases;
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
			expandFile: function () {
				let file = document.querySelector("#imgx-input").files[0];
				if (!file) {
					return alert("No IMGX!");
				}
				this.loadSource(file.name, file, null);
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

String.prototype.format = function (desc) {
	return this.replace(/\{(.*?)\}/g, (function (data, key) { return desc[key] || ""; }));
};
