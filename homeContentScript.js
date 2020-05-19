/*          functions          */
function getQuickAccessVideos() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get("quickAccess", function (data) {
			const {quickAccess} = data;
			resolve(quickAccess);
		});
	});
}

function createQuickAccessContainer() {
	const div = document.createElement("div");
	div.classList.add("quickAccessContainer");

	document.body.appendChild(div);

	return div;
}

function createVideoAccess({title, picURL, url, bvid}) {
	const video_div = document.createElement("div");
	video_div.id = bvid;
	video_div.classList.add("video-card-common");

	const card_div = document.createElement("div");
	card_div.classList.add("card-pic");
	video_div.appendChild(card_div);

	const img_link = document.createElement("a");
	img_link.href = url;
	const img = document.createElement("img");

	// some images are served as http
	try {
		img.src = picURL;
	} catch (console.error);
	
	img_link.appendChild(img);

	const title_link = document.createElement("a");
	title_link.href = url;
	title_link.title = title;
	title_link.classList.add("title");
	title_link.innerText = title;
	card_div.append(img_link);

	const close_button = document.createElement("div");
	close_button.classList.add("close-button");
	close_button.innerText = "X";
	close_button.onclick = function () {
		getQuickAccessVideos().then(videos => {
			console.log(videos, bvid);
			const newVideos = videos.filter(video => bvid !== video.bvid);
			chrome.storage.sync.set({"quickAccess": newVideos});
		});
		video_div.remove();
	}
	card_div.append(close_button);

	video_div.append(title_link);

	return video_div;
}


/*          main           */
getQuickAccessVideos().then(videos => {
	const container = createQuickAccessContainer();
	videos.forEach(video => {
		container.prepend(createVideoAccess(video));
	});
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.message === "add video access") {
		document.querySelector(".quickAccessContainer")
				.prepend(createVideoAccess(request.video));
		sendResponse({code: 0});
	}
});