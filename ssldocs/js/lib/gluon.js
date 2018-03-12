/**
 * Desktop application layer
 * gluon.js
 * 
 * @requires: handy.js
 *
 * @author: alkorgun
 */
const ifElectron = (function () {
	let isElectron = navigator.userAgent.indexOf("Electron/") > -1;
	let tempFolder = "/tmp";

	let self = {};

	if (isElectron) {
		self.electron = require("electron");
		self.path = require("path");
		self.fs = require("fs");

		self.send = self.electron.ipcRenderer.send;

		self.open = function (file, filename) {
			initBlobReader((bytes) => {
				filename = self.path.join(tempFolder, file.name || filename);

				self.fs.writeFile(filename, new Uint8Array(bytes), () => {
					self.send("open", filename, "clear");
				});
			}).readAsArrayBuffer(file);
		};
	}

	function ifElectron(desktopCb, browserCb) {
		if (isElectron) {
			desktopCb(self);
		} else if (browserCb) {
			browserCb();
		}
	};

	return ifElectron;
})();
