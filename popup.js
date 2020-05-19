/*          functions          */
function showMessage(message) {
	const messageHolder = document.querySelector(".message");
	messageHolder.innerText = message;
	setTimeout(function () {
		messageHolder.innerText = "";
	}, 3000);
}

// set the toggle to right status
chrome.storage.sync.get("concentrated", function (data) {
	document.querySelector("input[type='checkbox']").checked = data.concentrated;
	setTimeout(function () {
		document.querySelector(".slider").classList.add("transition");
	}, 400);
	
});

// de/activate focus mode
document.querySelector("#focus").addEventListener('click', function () {
	chrome.storage.sync.get("concentrated", function (data) {
		// toggle the concentrated variable 
    	chrome.storage.sync.set({"concentrated": !data.concentrated});

    	// boardcast the status to all bilibili pages
    	chrome.tabs.query({currentWindow: true, url: "https://www.bilibili.com/*"}, function(tabs) {
    		tabs.forEach(tab => {
    			chrome.tabs.sendMessage(tab.id, {message: data.concentrated ? "leave focus mode" : "enter focus mode"});
    		})
		 	
		});
    });
	
});

document.querySelector("#addPage").addEventListener('click', function () {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {message: "add page to home"}, function(response) {
			// success
			if(response.code === 0) {
				const {videoData} = response;
				chrome.storage.sync.get("quickAccess", function (data) {
					const videos = data.quickAccess;

					// check if this video exists
					let exists = false;
					for (const {bvid} of videos) {
						if (bvid === videoData.bvid) {
							exists = true;
						}
					}

					if (!exists) {
						// if not exists,
						// add the new video to the array
						const video = {
							bvid: videoData.bvid,
							picURL: videoData.pic,
							url: `https://www.bilibili.com/video/${videoData.bvid}`,
							title: videoData.title
						};
						videos.push(video);
						chrome.storage.sync.set({"quickAccess": videos});

						// update homepage
						chrome.tabs.query({active:false, currentWindow: true, url: "https://www.bilibili.com/*"}, function (tabs) {
							// detect homepage
							// there is a problem matching Chinese, os I have to do this urgily
							const homepage = tabs.find(tab => tab.title.substring(17) === "bilibili");
							if(homepage) {
								chrome.tabs.sendMessage(homepage.id, {message: "add video access", video: video}, function (response) {
									if(response.code === 0) {
										console.log("update homepage");
									}
								});
							}
							
						});
					} else {
						showMessage("video exists");
					}
				});
			} else {
				console.log("error code is " + response.code + ": can't add this page to home");
				if(response.code === 1) {
					showMessage("video not found");
				} else {
					showMessage("unknown error");
				}
			}
		});
	});
	
});