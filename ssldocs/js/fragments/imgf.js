/**
 * Azimuth IMGF library
 * imgf.js
 * 
 * @requires: bufferpack.js
 * 
 * @author: alkorgun
 */
function IMGF(arrayBuffer) {
	this.violations = {};
	this.frames = [];
	this.onreadyFunc = null;

	this.initialize = function (data) { // ArrayBuffer
		data = new Uint8Array(data);

		let meta,
			offset = 0;

		let lpnDecoder = new TextDecoder("cp1251");

		while (offset < data.byteLength) {
			meta = bufferPack.unpack("<IdxB14xB13A2B17xB22x", data, offset);

			offset += 84; // jpeg size pointer + metadata

			this.frames.push({
				datetime: new Date((meta[1]-25569)*86400*1000),
				lights: meta[2],
				lpn: meta[3] ? lpnDecoder.decode(meta[4].slice(0, meta[3])) : null,
				speed: meta[5],
				limit: meta[6],
				type: meta[7],
				jpeg: data.slice(offset, offset + meta[0])
			});

			offset += meta[0]; // image lenght
		}

		setTimeout(() => {
			this.onreadyFunc(this);
		}, 0);
	}

	this.onready = function (func) {
		this.onreadyFunc = func;
	}
}
