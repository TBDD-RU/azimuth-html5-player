<!doctype html>
</html>
<head>
	<meta charset="utf-8">
	<title>Azimuth IMGX-player</title>
	<link rel="stylesheet" href="css/ext/bootstrap-3.3.7.min.css">
	<script src="js/ext/vue-2.5.2.min.js"></script>
</head>
<body onload="setComposer(true)">
	<br><input id="imgx-input" class="form-control" type="file" accept=".imgf,.imgv,.imgx" onchange="expandFile(this)"><br>

	{% include 'player/composer.html' %}

	<script>

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
