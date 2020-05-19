/*           errors            */
const SUCCESS = 0;
const PAGE_NOT_CONTAIN_VIDEO = 1;


/*          functions          */
function init() {
	// this style is for video container
	const style = document.createElement("link");
	style.href = chrome.extension.getURL("css/home.css");
	style.rel = "stylesheet";
	style.id = "homePageLayout";

	document.querySelector("head").appendChild(style);

	chrome.storage.sync.get("concentrated", function (data) {
	if(data.concentrated) {
		clearPlaceholder();
		enterFocusMode();
	}
});
}

function getPageInfo() {
	// create a script tag
	const scr = document.createElement('script');
	scr.id = "tmpScript";
	// create the injected javascript code
	const scriptContent = `document.body.setAttribute('tmp_info', JSON.stringify(window.__INITIAL_STATE__))`;
	scr.appendChild(document.createTextNode(scriptContent));
	// append the script tag to DOM
	(document.body || document.head || document.documentElement).appendChild(scr);

	// get the window.__INITIAL_STATE__ object
	const obj = JSON.parse(document.body.getAttribute('tmp_info'));
	// remove the script tag we added
	document.body.removeAttribute("tmp_info");
	document.querySelector("#tmpScript").remove();

	return obj;
}

function clearPlaceholder() {
	// Get the placeholder of the input at the top of the page
	const getPlaceholderInterval = setInterval(function () {
		// get the input
		const input = document.querySelector("input");
		// check if the input is renderred & if the placeholder has been updated
		if (input !== null && input.placeholder !== null && input.placeholder !== "") {
			// if the input exists and have a placeholder clear it
			input.placeholder = "";
			// clear the time interval
			clearInterval(getPlaceholderInterval);
		}
	}, 500);
}

function enterFocusMode() {
	// if you already in the focus mode, function should return immediately
	// this can happen when you forward to another page
	if(document.querySelector("#ext_focus")) return;

	// this style wipes bilibili recommendation
	const style = document.createElement("link");
	style.href = chrome.extension.getURL("css/I-WANNA-FOCUS.css");
	style.rel = "stylesheet";
	style.id = "ext_focus";

	document.querySelector("head").appendChild(style);

	

}

function leaveFocusMode() {
	// remove the "focus" css if exists
	const style = document.querySelector("#ext_focus");
	if (style) {
		style.remove();
	}
}



/*          main           */
init();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "enter focus mode") {
    	enterFocusMode();
	    sendResponse({code: 0, status: "on"});
    } else if (request.message === "leave focus mode") {
		leaveFocusMode();
    	sendResponse({code: 0, status: "off"});
	} else if (request.message === "add page to home") {
		const pageInfo = getPageInfo();
		if(pageInfo.videoData) {
			sendResponse({code: 0, videoData: pageInfo.videoData})
		} else {
			sendResponse({code: 1})
		}
	}
});




