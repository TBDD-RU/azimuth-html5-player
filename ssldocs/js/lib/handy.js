/**
 * Common handy JS features
 * handy.js
 *
 * @author: alkorgun
 */
function downloadFile(source, filename) {
	if (source instanceof (File, Blob)) {
		filename = source.name || filename;
		source = URL.createObjectURL(source);
	}
	let link = document.createElement("a");
	link.style.display = "none";
	link.href = source;
	link.download = filename || "blob.bin";

	document.body.appendChild(link);

	link.click();

	setTimeout(function () {
		document.body.removeChild(link);

		URL.revokeObjectURL(source);
	}, 3000);
}

function initBlobReader(func) {
	let reader = new FileReader();
	reader.onload = function () {
		func(reader.result);
	}
	return reader;
}

function b64encode(str) {
	return Buffer.from(str).toString("base64");
}

String.prototype.format = function (desc) {
	return this.replace(/\{(.*?)\}/g, (function (data, key) { return desc[key] || ""; }));
};
