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
			type: undefined,
			huge: false,
			meta: [],
			IMGXPlayer: null,
			IMGFPlayer: null
		},
		components: {
			"app-imgf-player": {
				template: "#imgf-player-template",
				props: ["phases", "source"]
			},
			"app-imgx-player": {
				template: "#imgx-player-template",
				props: ["phases", "source"]
			},
			"metadata": {
				template: "#metadata",
				props: ["meta"]
			}
		},
		methods: {
			loadSource: function (filename, blob) {
				this.file = filename;

				console.log(filename, blob);

				let fragment;

				initBlobReader((data) => {
					if (filename.endsWith(".imgx")) {
						this.type = "imgx";

						fragment = new IMFX();
						fragment.onready(function (imgx) {
							let violation = imgx.violations[0];
							if (violation.srcType == "mp4") {
								if (!this.IMGXPlayer) {
									this.IMGXPlayer = new EmbeddedIMGXPlayer("#app-imgx-palyer", this);
								}
								this.IMGXPlayer.loadSource(violation.src);
							} else {
								alert("Not supported yet.")
							}
						});
						fragment.initialize(data);
					} else if (filename.endsWith(".imgf")) {
						this.type = "imgf";

						fragment = new IMGF();
						fragment.onready(function (imgf) {
							if (!this.IMGFPlayer) {
								this.IMGFPlayer = new EmbeddedIMGFPlayer("#app-imgf-palyer", this);
							}
							this.IMGFPlayer.loadSource(imgf.frames);
						});
						fragment.initialize(data);
					} else if (filename.endsWith(".imgv")) {
						fragment = new IMFF(data);
					} else {
						alert("Unsupported file type!");
					}
				}).readAsArrayBuffer(file);
			},
			sizeSwitch: function () {
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
}

function initBlobReader(func) {
	let reader = new FileReader();
	reader.onload = function () {
		func(reader.result);
	}
	return reader;
}
