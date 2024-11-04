function resize() {
	var coef = (innerWidth >= innerHeight * (16 / 9) ? (innerHeight / 720) : (innerWidth / 1280));
	document.getElementsByTagName("body")[0].style.transform = "scale(" + coef + ")";
}

setInterval(resize, 100);