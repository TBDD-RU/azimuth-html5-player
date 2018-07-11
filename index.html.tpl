<!doctype html>
</html>
<head>
	<meta charset="utf-8">
	<title>Azimuth IMGX-viewer</title>
	<link rel="stylesheet" href="css/ext/bootstrap-3.3.7.min.css">
	<script src="js/ext/vue-2.5.2.min.js"></script>
	<style>

#imgx-input-label {
	display: block;
	position: absolute;
	top: 5%;
	left: 25%;
	width: 50%;
}

#imgx-input-label:hover { cursor: pointer; }

#imgx-input-label img { width: 100%; }

#imgx-input { display: none; }

	</style>
</head>
<body onload="setComposer(true)">
	<div id="initial-frame">
		<label id="imgx-input-label" for="imgx-input">
			<img src="images/feather/file.svg">
		</label>
		<input id="imgx-input" type="file" accept=".imgf,.imgv,.imgx" onchange="expandFile(this)">
	</div>

	{% include 'player/composer.html' %}

	<script>

addEventListener("load", () => {
	let filename = process.argv.slice(-1)[0];

	openIfIMGX(filename);
});

for (let event of ["dragover", "dragleave", "dragend"]) {
	addEventListener(event, (event) => {
		event.preventDefault();
	});
}

addEventListener("drop", (event) => {
	if (event.dataTransfer.files.length) {
		event.preventDefault();

		let filename = event.dataTransfer.files[0].path;

		openIfIMGX(filename);
	}
});

let openIfIMGX = (function () {
	let __path = require("path"),
		extensions = [
		".imgx",
		".imgf",
		".imgv"
	];
	return (function (filename) {
		if (extensions.indexOf(__path.extname(filename)) > -1) {
			expandPath(filename);
		}
	});
})();

let expandPath = (function () {
	let __fs = require("fs");
	return (function (filename) {
		__fs.access(filename, () => {
			__fs.readFile(filename, (err, arrayBuffer) => {
				hideInputOverlay();
				composer.visible = true;

				composer.expandFile(new File([new Blob([new Uint8Array(arrayBuffer)])], filename));
			});
		});
	});
})();


function hideInputOverlay() {
	document.querySelector("#initial-frame").style.display = "none";
}

function expandFile(element) {
	let file = element.files[0];
	if (file) {
		hideInputOverlay();
		composer.visible = true;

		composer.expandFile(file);
	}
}

	</script>
</body>
</html>