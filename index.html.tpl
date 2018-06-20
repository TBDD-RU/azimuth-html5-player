<!doctype html>
</html>
<head>
	<meta charset="utf-8">
	<title>Azimuth IMGX-viewer</title>
	<link rel="stylesheet" href="css/ext/bootstrap-3.3.7.min.css">
	<script src="js/ext/vue-2.5.2.min.js"></script>
</head>
<body onload="setComposer(true)">
	<!-- <br><input id="imgx-input" class="form-control" type="file" accept=".imgf,.imgv,.imgx" onchange="expandFile(this)"><br> -->

	{% include 'player/composer.html' %}

	<script>

addEventListener("load", () => {
	let __path = require("path");

	let filename = process.argv.slice(-1)[0];

	let exts = [
		".imgx",
		".imgf",
		".imgv"
	];

	if (exts.indexOf(__path.extname(filename)) > -1) {
		expandPath(filename);
	}
});

for (let event of ["dragover", "dragleave", "dragend"]) {
	addEventListener(event,  (event) => { event.preventDefault(); });
}

addEventListener("drop", (event) => {
	event.preventDefault();

	expandPath(event.dataTransfer.files[0].path);
});

expandPath = (function () {
	let __fs = require("fs");
	return (function (filename) {
		__fs.access(filename, () => {
			__fs.readFile(filename, (err, arrayBuffer) => {
				composer.visible = true;

				composer.expandFile(new File([new Blob([new Uint8Array(arrayBuffer)])], filename));
			});
		});
	});
})();

function expandFile(element) {
	let file = element.files[0];
	if (file) {
		composer.visible = true;

		composer.expandFile(file);
	}
}

	</script>
</body>
</html>