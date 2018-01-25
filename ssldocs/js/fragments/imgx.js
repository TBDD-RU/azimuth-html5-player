/**
 * Azimuth IMGX library
 * imgx.js
 * 
 * @requires: untar.js
 * 
 * @author: alkorgun
 */
function IMGX(arrayBuffer) {
	this.violations = {};
	this.streams = {};
	this.onreadyFunc = null;

	let self = this;

	function initialize() {
		untar(arrayBuffer).then((files) => {
			let xml;

			for (let file of files) {
				if (file.name.endsWith("info.xml")) {
					xml = file.blob;
					break;
				}
			} if (!xml) {
				alert("No XML!");
			}
			initBlobReader((result) => {
				xml = (new DOMParser()).parseFromString(result, "text/xml");

				for (let violation of xml.querySelectorAll("violation")) {
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

					info.datetime = new Date(+xml.querySelector("streams stream[name='" + primary + "'] frames frame[n='" + (frame ? frame.textContent : 0) + "'] timecode").textContent);
					info.controller = xml.querySelector("complexinfo name").textContent;
					info.place = violation.querySelector("place name").textContent;
					info.lpn = violation.querySelector("LPN").textContent;
					info.type = violation.querySelector("type").textContent;
					info.primary = null;
					info.streams = [];

					for (let stream of Array.from(streams)) {
						for (let file of files) {
							if (file.name == stream.attributes.name.value) {
								let desc = {
									name: file.name,
									blob: file.blob,
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

	this.onready = function (func) {
		this.onreadyFunc = func;
	}

	initialize();
}

function initBlobReader(func) {
	let reader = new FileReader();
	reader.onload = function () {
		func(reader.result);
	}
	return reader;
}
