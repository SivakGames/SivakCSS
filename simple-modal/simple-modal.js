//=======================================================================================
const overlayID = "simple-modal";

//=======================================================================================
/*
External Dependencies:

	-The included simple-modal.css
	-A browser that supports ES6 Javascript syntax (i.e. something that came out around 2017 or later)
	
	Otherwise, none
*/

//=======================================================================================
/*
Usage:
	To use, call initSimpleModal() with optional arguments set in it (see below)

	Add the attribute  data-modal-open-id="xxx"  onto the tag that the user would click on to open the modal window.  Replace "xxx" with the desired ID of the corresponding target that contains the modal content.
	All tags that have this attribute will get an onClick event added onto them for triggering.

	Modal content itself should be wrapped within a parent tag with  style='display:none'  set on it or another similar method to keep it invisible in the document.  
	This content can theorhetically be place anywhere in the document.
*/

//=======================================================================================
/*
Args:

---REQUIRED---

	none

---OPTIONAL---

	zIndex: (integer - default 9999) You can specify a different z-index to achieve the overlay effect 
		(e.g. because another kind of overlay library's z-indeces might be interfering)

	insertNode: (string - default "body") The desired node in the DOM where this will be generated and appended.
		Can be a tag name, can start with a "#" for an ID or "." for a class
		(defaults to the body tag)
		***This should ONLY be set on a node that wraps the entire document or the part of the document you want the modal to appear on.
		***The node this gets inserted into needs relative positioning (or possibly such positioning on one of its ancestors)
	
	darkenColor: (string/null - default: null) What color to darken the screen with. If set, needs a valid BG color string to override default styling color.
		Can use "transparent" for no BG color. (the area around will still be clickable to close the modal window)
		If null, then just uses default styling.
	
	extraClassName: (string) Extra class(es) to add to the simple modal ID node. 
		Ideal for extra user-defined styling. For multiple classes, simply separate with spaces

	modalWindowBorder: (boolean - default: true) Whether the modal window has a border around it
	
	modalMainPadding: (boolean - default: true) Whether to pad the modal main area.
	modalMainBorder: (boolean - default: false) Whether to have an extra border on the modal main area. This can be handy if the content is tall and will provide extra padding around the scroll bar.

	titleBar: (boolean - default: true) Whether or not to generate the title bar.
	titleBarCloseButton: (boolean - default: true) Whether or not to generate the close button in the title bar. (if titleBar is false, then this doesn't matter)
*/

//=======================================================================================
/*
	Node structure:

	<div id="simple-modal">
		<input class="visual-control" type="checkbox" name="bDarken" />
		<input class="visual-control" type="checkbox" name="bModal" />
		<div class="darken"></div>
		<div class="modal-wrap">
			<div class="modal-window">
				<div class="modal-title-bar">
					<p class="modal-title-text"></p>
					<button class="modal-title-close" type="button" name="closeModal"></button>
				</div>
				<div class="modal-main">
					<div class="modal-content"></div>
				</div>
			</div>
		</div>
	</div>
*/

//=======================================================================================
//=======================================================================================
class simpleModal
{

	constructor()
	{
		this.args = {};
		this.modalSources = new Map();
		return;
	}

	init(args)
	{	args = args || {};
		
		this.args.darkenColor = ('darkenColor' in args) ? args.darkenColor : null;
		this.args.extraClassName = ('extraClassName' in args && typeof (args.extraClassName) === "string") ? args.extraClassName.trim() : "";
		this.args.insertNode = ('insertNode' in args && typeof (args.insertNode) === "string" && document.querySelector(args.insertNode) !== null) 
			? document.querySelector(args.insertNode)
			: document.querySelector("body");

		this.args.modalWindowBorder = ('modalWindowBorder' in args && typeof (args.modalWindowBorder) === "boolean") ? args.modalWindowBorder : true;
		this.args.modalMainPadding = ('modalMainPadding' in args && typeof (args.modalMainPadding) === "boolean") ? args.modalMainPadding : true;
		this.args.modalMainBorder = ('modalMainBorder' in args && typeof (args.modalMainBorder) === "boolean") ? args.modalMainBorder : false;
		this.args.titleBar = ('titleBar' in args && typeof (args.titleBar) === "boolean") ? args.titleBar : true;
		this.args.titleBarCloseButton = ('titleBarCloseButton' in args && typeof (args.titleBarCloseButton) === "boolean") ? args.titleBarCloseButton : true;
		this.args.zIndex = ('zIndex' in args && typeof (args.zIndex) === "number") ? Math.floor(args.zIndex) : 9999;

		this.createModalTags(args);

		let documentOverlays = document.getElementById(overlayID) || null;
		this.SIMPLE_MODAL_CONTENT = documentOverlays.querySelector(".modal-content") || null;
		this.SIMPLE_MODAL_CHECK_DARK = documentOverlays.querySelector("[name=bDarken]") || null;
		this.SIMPLE_MODAL_CHECK_MODAL = documentOverlays.querySelector("[name=bModal]") || null;

		//Let ESC key close the window
		document.addEventListener("keydown", (event) =>
		{
			if (event.keyCode === 27)
			{
				this.closeModal();
			}
		});

		this.assignModalClicks();
		return;
	}
	

	//Generate the modal tags
	//=======================================================================================
	createModalTags()
	{
		let args = this.args;

		//Point of DOM insertion
		const POINT_OF_INSERTION = args.insertNode;
		//let poiPositioning = window.getComputedStyle(POINT_OF_INSERTION, null).getPropertyValue("position");
		//if(poiPositioning !== "relative")
			//POINT_OF_INSERTION.style.position = "relative";

		//Create the main wrapper
		const documentOverlays = document.createElement("div");
		documentOverlays.id = overlayID;
		documentOverlays.className = (args.extraClassName.length > 0) ? args.extraClassName : "";


		//Checkbox 1 - Darken BG
		const checkDark = document.createElement("input");
		checkDark.className = "visual-control";
		checkDark.setAttribute("type", "checkbox");
		checkDark.setAttribute("name", "bDarken");
		documentOverlays.appendChild(checkDark);

		//Checkbox 2 - Modal Window itself
		const checkModal = document.createElement("input");
		checkModal.className = "visual-control";
		checkModal.setAttribute("type", "checkbox");
		checkModal.setAttribute("name", "bModal");
		documentOverlays.appendChild(checkModal);

		//Darken BG
		const darken = document.createElement("div");
		darken.className = "darken";
		darken.style.zIndex = args.zIndex;
		documentOverlays.appendChild(darken);

		if (args.darkenColor !== null)
		{
			darken.style.backgroundColor = args.darkenColor;
		}

		//Modal wrap and window
		const modalWrap = document.createElement("div");
		modalWrap.className = "modal-wrap";
		modalWrap.style.zIndex = args.zIndex + 1;
		modalWrap.addEventListener("click", this.closeModal.bind(this));

		const modalWindow = document.createElement("div");
		modalWindow.className = "modal-window";
		if (args.modalWindowBorder)
			modalWindow.setAttribute("data-border", true);
		modalWindow.addEventListener("click", (e) => { e.stopPropagation(); });

		//Title bar (optional)
		if (args.titleBar)
		{
			const modalTitleBar = document.createElement("div");
			modalTitleBar.className = "modal-title-bar";
			const modalTitleText = document.createElement("p");
			modalTitleText.className = "modal-title-text";
			modalTitleBar.appendChild(modalTitleText);

			if (args.titleBarCloseButton)
			{
				const modalTitleClose = document.createElement("button");
				modalTitleClose.className = "modal-title-close";
				modalTitleClose.setAttribute("type", "button");
				modalTitleClose.setAttribute("name", "closeModal");
				modalTitleClose.addEventListener("click", this.closeModal.bind(this));
				modalTitleBar.appendChild(modalTitleClose);
			}
			modalWindow.appendChild(modalTitleBar);
		}

		//Main content
		const modalMain = document.createElement("div");
		modalMain.className = "modal-main";
		if (args.modalMainPadding)
		{
			modalMain.setAttribute("data-padding", true);
		}
		if (args.modalMainBorder)
		{
			modalMain.setAttribute("data-border", true);
		}

		const modalContent = document.createElement("div");
		modalContent.className = "modal-content";
		modalMain.appendChild(modalContent);
		modalWindow.appendChild(modalMain);

		//Append to modal wrap
		modalWrap.appendChild(modalWindow);
		documentOverlays.appendChild(modalWrap);

		//Final append to document
		POINT_OF_INSERTION.appendChild(documentOverlays);
		return;
	}

//Darken the screen and open the modal
//=======================================================================================
	openModal(targetNode)
	{
		this.SIMPLE_MODAL_CHECK_DARK.checked = true;
		this.SIMPLE_MODAL_CHECK_MODAL.checked = true;

		//Clear existing modal content (if any)
		this.clearModalContent();

		//Put content in window
		let cln = targetNode.cloneNode(true);
		cln.id = cln.id + "-cloned";
		this.SIMPLE_MODAL_CONTENT.appendChild(cln);

		//Look for anything in the newly added content that might close the window
		for (let v of this.SIMPLE_MODAL_CONTENT.querySelectorAll("[data-modal-close]"))
		{
			v.addEventListener("click", () => { this.closeModal() });
		}

		return;
	}

//Remove the modal from the screen
//=======================================================================================
	closeModal()
	{
		this.SIMPLE_MODAL_CHECK_DARK.checked = false;
		this.SIMPLE_MODAL_CHECK_MODAL.checked = false;

		//Clear existing modal content (if any)
		this.clearModalContent();
		return;
	}

//=======================================================================================
	clearModalContent()
	{
		while (this.SIMPLE_MODAL_CONTENT.firstChild) 
		{
			this.SIMPLE_MODAL_CONTENT.removeChild(this.SIMPLE_MODAL_CONTENT.lastChild);
		}
		return;
	}


//Look for tags that contain a data-modal-open-id property
//If they have it and the ID DOES NOT exist, then no onClick will be assigned.
//=======================================================================================
	assignModalClicks()
	{
		for(let v of document.querySelectorAll("[data-modal-open-id]"))
		{
			let m = v.getAttribute("data-modal-open-id");
			if (document.getElementById(m) !== null)
			{
				v.addEventListener("click", () => { this.openModal(document.getElementById(m)) });
				this.modalSources.set(m, document.getElementById(m));
			}
		}

		return;
	}
}

//=======================================================================================
//=======================================================================================
const SIMPLE_MODAL_OBJECT = new simpleModal()

function initSimpleModal(args)
{
	SIMPLE_MODAL_OBJECT.init(args);
	return;
}

function closeSimpleModal()
{
	SIMPLE_MODAL_OBJECT.closeModal();
	return;
}