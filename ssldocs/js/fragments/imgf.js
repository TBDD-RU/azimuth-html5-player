/**
 * Azimuth IMGF library
 * imgf.js
 * 
 * @requires: bufferpack.js
 * 
 * @author: alkorgun
 */
function IMGF(arrayBuffer) {
	this.frames = [];
	this.onreadyFunc = null;

	let self = this;

	function initialize() {
		arrayBuffer = new Uint8Array(arrayBuffer);

		let meta,
			offset = 0;

		let lpnDecoder = new TextDecoder("cp1251");

		while (offset < arrayBuffer.byteLength) {
			meta = bufferPack.unpack("<IdxB14xB13A2B17xB22x", arrayBuffer, offset);

			offset += 84; // jpeg size pointer + metadata

			self.frames.push({
				datetime: new Date((meta[1]-25569)*86400*1000),
				lights: meta[2],
				lpn: meta[3] ? lpnDecoder.decode(meta[4].slice(0, meta[3])) : null,
				speed: meta[5],
				limit: meta[6],
				type: meta[7],
				jpeg: arrayBuffer.slice(offset, offset + meta[0])
			});

			offset += meta[0]; // image lenght
		}

		setTimeout(() => {
			self.onreadyFunc(self);
		}, 0);
	}

	this.onready = function (func) {
		this.onreadyFunc = func;
	}

	initialize();
}
