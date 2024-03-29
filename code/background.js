
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "scrapeWebsite") {
    // Handle the scrapeWebsite action
    fetch('http://localhost:3000/scrape?url=' + encodeURIComponent(request.url))
      .then(response => response.json())
      .then(data => {
        chrome.storage.local.set({ 'scrapedData': data.matchedWords });
      })
      .catch(error => console.error('Error scraping website:', error));
  }
});


chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    title: "Quick Pronunciation Search",
    contexts: ["selection"],
    id: "searchGoogle"
  });

  chrome.contextMenus.create({
    title: "Pronunciation",
    contexts: ["selection"],
    id: "pronounceWord"
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  var selectedText = info.selectionText.trim();
  var searchUrl;

  if (info.menuItemId === "searchGoogle") {
    searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(selectedText + " pronunciation");
  }

  if (info.menuItemId === "pronounceWord") {
    // Send a message to content script to handle pronunciation
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "pronounceWord", selectedText: selectedText });
    });
    return;
  }

  if (searchUrl) {
    chrome.tabs.create({ url: searchUrl }, function (createdTab) {
      setTimeout(function () {
        chrome.tabs.remove(createdTab.id, function () {
          console.log('Tab closed successfully');
        });
      }, 30 * 1000);
    });
  }
});
