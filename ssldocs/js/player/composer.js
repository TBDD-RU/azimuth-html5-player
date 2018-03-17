/**
 * Azimuth IMGX/IMGF player composer
 * composer.js
 * 
 * @requires: vue.js, gluon.js, handy.js, fragments/{imgx.js,imgf.js}
 *
 * @author: alkorgun
 */
var composer;

function setComposer(entire) {
	composer = new Vue({
		el: "#app-composer",
		data: {
			file: undefined,
			player: undefined,
			violations: {},
			streams: [],
			menu: { violation: null, stream: null },
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
			visibleMenu: entire || false,
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
			}
		},
		watch: {
			"menu.violation": function (current, old) {
				if (!old || !current) {
					// skip initial setup
					return;
				}
				this.choseIMGXViolation(current);
			},
			"menu.stream": function (current, old) {
				if (!old || !current) {
					// skip initial setup
					return;
				}
				if (current.name.endsWith(".pdf")) {
					this.menu.stream = old;
				} else if (old.name.endsWith(".pdf")) {
					return;
				}
				this.loadIMGXStream(current);
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
					this.meta.push({ key: this.metaDesc[key], value: preferedMeta[key] });
				}
			},
			loadSource: function (filename, blob, externalMeta) {
				self = this;

				self.file = filename;
				self.violations = {};

				let fragment;

				initBlobReader((data) => {
					if (filename.endsWith(".imgx")) {
						fragment = new IMGX(data);
						fragment.onready(function (imgx) {
							self.violations = imgx.violations;

							let violation;

							if (externalMeta && externalMeta.xml_id) {
								violation = imgx.violations[externalMeta.xml_id];
							} else {
								for (let xml_id of Object.keys(imgx.violations)) {
									violation = imgx.violations[xml_id];
									break;
								} if (!violation) {
									alert("Ошибка: не удалось извлечь материалы из файла с нарушением.");
									return;
								}
							}
							self.choseIMGXViolation(violation, externalMeta, true);
						});
					} else if (filename.endsWith(".imgf") || filename.endsWith(".imgv")) {
						self.player = filename.endsWith(".imgf") ? (
							"app-imgf-player"
						) : (
							"app-jpeg-player"
						);
						self.clear();

						fragment = new IMGF(data);
						fragment.onready(function (imgf) {
							if (filename.endsWith(".imgv")) {
								self.currentPlayer = new EmbeddedJPEGPlayer("#app-jpeg-player", self);
								self.currentPlayer.loadSource(
									URL.createObjectURL(
										new Blob([imgf.frames[0].jpeg], {type: "image/jpeg"})
									)
								);
								self.loadMeta(imgf.frames[0], externalMeta);
							} else {
								self.currentPlayer = new EmbeddedIMGFPlayer("#app-imgf-player", self);
								self.currentPlayer.loadSource(imgf.frames, externalMeta.frame);

								let lpn = externalMeta.lpn ? externalMeta.lpn.toLowerCase() : null;

								let frameData = {};
								for (let frame of imgf.frames) {
									if (frame.lpn && (!lpn || frame.lpn == lpn)) {
										frameData = frame;
										break;
									}
								}
								self.loadMeta(frameData, externalMeta);

								self.currentPlayer.definePhases(self.scanImgfPhases(imgf));
							}
						});
					} else {
						alert("This file type is not suppoted!");
					}
				}).readAsArrayBuffer(blob);
			},
			choseIMGXViolation: function (violation, meta, set) {
				if (set) {
					this.menu.violation = violation;
				}
				this.clear();

				meta = meta || {};

				this.streams = violation.streams;

				this.loadIMGXStream(violation.primary, meta.frame, true);
				this.loadMeta(violation, meta);
			},
			loadIMGXStream: function (stream, frame, set) {
				if (set) {
					this.menu.stream = stream;
				}
				self = this;

				let spl = stream.name.split(".");
				let ext = spl[spl.length - 1].toLowerCase();
				switch (ext) {
					case "mp4":
						self.player = "app-imgx-player";

						setTimeout(() => {
							self.currentPlayer = new EmbeddedIMGXPlayer("#app-imgx-player", self);
							self.currentPlayer.loadSource(stream.source, frame);
						}, 0);
						break;
					case "imgv":
					case "imgf":
						self.player = "app-imgf-player";

						initBlobReader((data) => {
							(new IMGF(data)).onready(function (imgf) {
								self.currentPlayer = new EmbeddedIMGFPlayer("#app-imgf-player", self);
								self.currentPlayer.loadSource(imgf.frames, frame);

								self.currentPlayer.definePhases(self.scanImgfPhases(imgf));
							});
						}).readAsArrayBuffer(stream.blob);
						break;
					case "jpg":
					case "jpeg":
						self.player = "app-jpeg-player";

						setTimeout(() => {
							self.currentPlayer = new EmbeddedJPEGPlayer("#app-jpeg-player", self);
							self.currentPlayer.loadSource(stream.source);
						}, 0);
						break;
					case "pdf":
						let file = new File([stream.blob], stream.name, {type: "application/pdf"});

						ifElectron((gluon) => {
							gluon.open(file);
						}, () => {
							open(URL.createObjectURL(file), "_blank");
						});
						break;
					default:
						alert("Отображение выбранного материала ( {name} ) не поддерживается.".format({name: stream.name}));
				}
			},
			clear: function () {
				if (this.currentPlayer) {
					this.currentPlayer.clear();
				}
				this.meta = [];
				this.streams = [];
			},
			scanImgfPhases: function (imgf) {
				let lights = [
					"green", // 0
					"red",  // 1
					"yellow" // 2
				];

				let phases = [];
				let previous = null;
				let color;
				for (let frame of imgf.frames) {
					color = lights[frame.lights];
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
			expandFile: function (file) {
				if (!file) {
					alert("No IMGX!");
					return;
				}
				this.loadSource(file.name, file, {});
			},
			showXML: function () {
				let file = new File([this.menu.violation.xml], "info.xml", {type: "application/xml"});

				ifElectron((gluon) => {
					gluon.open(file);
				}, () => {
					open(URL.createObjectURL(file), "_blank");
				});
			},
			saveStream: function () {
				downloadFile(this.menu.stream.source, this.menu.stream.name);
			},
		}
	});
	document.body.addEventListener("keyup", keyboardListener);
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
