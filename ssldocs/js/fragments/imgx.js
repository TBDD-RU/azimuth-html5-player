/**
 * Azimuth IMGX library
 * imgx.js
 *
 * @requires: handy.js, untar.js
 *
 * @author: alkorgun
 */
function IMGX(arrayBuffer) {
	this.violations = {};
	this.onreadyFunc = null;

	let self = this;

	function initialize() {
		untar(arrayBuffer).then((files) => {
			let dom, xml;

			for (let file of files) {
				if (file.name.endsWith("info.xml")) {
					xml = file.blob;
					break;
				}
			} if (!xml) {
				alert("No XML!");
			}
			initBlobReader((text) => {
				dom = (new DOMParser()).parseFromString(text, "application/xml");

				for (let violation of dom.querySelectorAll("violation")) {
					let info = {};

					let primary,
						streams = violation.querySelectorAll("stream");

					if (streams.length == 1) {
						primary = streams[0];
					} else {
						primary = violation.querySelector("stream[primary='1']");
					}

					let frame = primary.querySelector("frame");

					primary = primary.attributes.name.value;

					info.datetime = parseTime(dom.querySelector(
						"streams stream[name='{s}'] frames frame[n='{f}'] timecode".format(
							{s: primary, f: (frame ? frame.textContent : 0)}
						)
					));
					info.controller = dom.querySelector("complexinfo name").textContent;
					info.place = violation.querySelector("place name").textContent;
					info.speed = violation.querySelector("speed value").textContent;
					info.limit = violation.querySelector("speed limit").textContent;
					info.lpn = violation.querySelector("LPN").textContent;
					info.type = violation.querySelector("type").textContent;
					info.lights = [];
					info.primary = null;
					info.streams = [];
					info.xml = xml;

					for (let ph of Array.from(violation.querySelectorAll("trafficlight phase"))) {
						info.lights.push({
							light: +(ph.querySelector("light").textContent),
							start: parseTime(ph.querySelector("start_timecode"))
						});
					}

					info.lights.sort((a, b) => { return a.start - b.start; });

					for (let stream of Array.from(streams)) {
						for (let file of files) {
							if (file.name == stream.attributes.name.value) {
								let _st = dom.querySelector("streams stream[name='{n}']".format({n: file.name}));
								let display_name = _st.attributes.display_name,
									fps = _st.attributes.fps;
								let desc = {
									name: file.name,
									display_name: display_name ? display_name.value : file.name,
									blob: file.blob,
									enter: parseTime(_st.querySelector("frames frame[n='0'] timecode")),
									fps: fps ? fps.value : null,
									source: file.getBlobUrl()
								};
								if (desc.name == primary) {
									info.primary = desc;
								}
								info.streams.push(desc);
								break;
							}
						}
					} if (!info.primary) {
						alert("No primary!");
					}

					self.violations[violation.id] = info;
				}
				self.onreadyFunc(self);
			}).readAsText(xml);
		});
	}

	function parseTime(element) {
		return new Date((
			+element.textContent
		)*1000); // JS time
	}

	this.onready = function (func) {
		this.onreadyFunc = func;
	}

	initialize();
}
