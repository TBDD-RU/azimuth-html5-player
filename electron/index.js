/**
 * Azimuth-player electron core script
 * index.js
 *
 * @author: alkorgun
 */
const electron = require("electron");
const path = require("path");
const fs = require("fs");

const {app, BrowserWindow, ipcMain} = electron;

let win;

function createMainWindow() {
	win = new BrowserWindow({width: 960, height: 720, icon: path.join(__dirname, "assets/tbdd.png")});

	win.loadURL("file://{fld}/ssldocs/index.html".format({fld: __dirname}));

	//win.webContents.openDevTools();

	win.on("closed", () => {
		win = null;
	});
}

app.on("ready", createMainWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (win === null) {
		createMainWindow();
	}
});

const webview = "<webview style=\"height: 100%\" src=\"file://{filename}\" plugins></webview>";

ipcMain.on("open", (event, filename, clear) => {
	let tmp = new BrowserWindow({width: 960, height: 720});

	tmp.loadURL("data:text/html;base64," + b64encode(webview.format({filename: filename})));

	if (clear) {
		tmp.on("closed", () => {
			if (fs.existsSync(filename)) {
				fs.unlinkSync(filename);
			}
		});
	}
});

ipcMain.once("get-argv", (event) => { // TODO: additionalArguments with 2.0
	let argv = process.argv,
		path = null;

	if (argv.length > 1) {
		path = argv[argv.length - 1];
	}
	event.sender.send("got-file", path);
});

function b64encode(str) {
	return Buffer.from(str).toString("base64");
}

String.prototype.format = function (desc) {
	return this.replace(/\{(.*?)\}/g, (function (data, key) { return desc[key] || ""; }));
};
