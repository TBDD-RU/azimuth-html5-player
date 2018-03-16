/**
 * Desktop application layer
 * gluon.js
 * 
 * @requires: handy.js
 *
 * @author: alkorgun
 */
const ifElectron = (function () {
	let electron = navigator.userAgent.indexOf("Electron/") > -1;
	let tmpdir;

	let self = {};

	if (electron) {
		self.electron = require("electron");
		self.path = require("path");
		self.fs = require("fs");
		self.os = require("os");

		tmpdir = self.os.tmpdir();

		self.send = self.electron.ipcRenderer.send;

		self.open = function (file, filename) {
			initBlobReader((bytes) => {
				filename = self.path.join(tmpdir, file.name || filename);

				self.fs.writeFile(filename, new Uint8Array(bytes), () => {
					self.send("open", filename, "clear");
				});
			}).readAsArrayBuffer(file);
		};
	}

	function ifElectron(desktopCb, browserCb) {
		if (electron) {
			desktopCb(self);
		} else if (browserCb) {
			browserCb();
		}
	};

	return ifElectron;
})();
