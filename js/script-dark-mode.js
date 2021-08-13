const bUserDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches || false;
var bDarkMode = bUserDarkMode;

window.addEventListener("load",initDarkMode)

function initDarkMode()
{
	setHTMLdarkMode()
	return;
}

function setHTMLdarkMode()
{
	document.querySelector("html").setAttribute("data-dark", bDarkMode ? "true" : "");
	return;
}

function toggleDarkMode()
{
	bDarkMode = !bDarkMode;
	setHTMLdarkMode();
	return;
}