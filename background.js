// initialize the extension
chrome.runtime.onInstalled.addListener(function () {
	chrome.storage.sync.set({"concentrated": true, "quickAccess": []});

	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostContains: '.bilibili'},
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
});