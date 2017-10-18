/**
 * Azimuth IMGX library
 * imgx.js
 * 
 * @requires: untar.js
 * 
 * @author: alkorgun
 */
function IMGX() {
	this.violations = {};
	this.streams = {};
	this.onreadyFunc = null;

	this.initialize = function (data) { // ArrayBuffer
		untar(data).then((files) => {
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
				let violation = xml.querySelector("violation");

				let info = {};

				let stream = violation.querySelector("stream[name$='.mp4']");

				let filename = stream.attributes.name.value;

				info.datetime = new Date(+xml.querySelector("streams stream[name='" +filename + "'] frames frame[n='" + stream.querySelector("frame").textContent + "'] timecode").textContent);
				info.complex = xml.querySelector("complexinfo name").textContent;
				info.place = violation.querySelector("place name").textContent;
				info.lpn = violation.querySelector("LPN").textContent;
				info.type = violation.querySelector("type").textContent;
				info.filename = filename;

				let mp4;

				for (let file of files) {
					if (file.name.endsWith(filename)) {
						mp4 = file.getBlobUrl();
						break;
					}
				} if (!mp4) {
					alert("No MP4!");
				}
				info.src = mp4;

				this.violations[violation.id] = info;

				this.onreadyFunc(this);
			}).readAsText(xml);
		});
	}

	this.onready = function (func) {
		this.onreadyFunc = func;
	}
}

function initBlobReader(func) {
	let reader = new FileReader();
	reader.onload = function () {
		func(reader.result);
	}
	return reader;
}
