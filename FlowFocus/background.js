let timer = null;
let blocklist = [];

// Load blocklist and start persistent listener
chrome.storage.sync.get(["blocklist"], (data) => {
  blocklist = data.blocklist || [];
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ blocklist: [] });
});

// Handle blocking websites
chrome.webNavigation.onBeforeNavigate.addListener(
  (details) => {
    const url = new URL(details.url);
    if (blocklist.includes(url.hostname)) {
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL("blocked.html"),
      });
    }
  },
  { url: [{ schemes: ["http", "https"] }] }
);

// Focus timer logic
function startTimer(duration) {
  const endTime = Date.now() + duration * 60000;
  chrome.storage.local.set({ endTime });

  timer = setInterval(() => {
    const remainingTime = Math.max(0, endTime - Date.now());
    chrome.action.setBadgeText({
      text: Math.ceil(remainingTime / 60000).toString(),
    });

    if (remainingTime === 0) {
      clearInterval(timer);
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "Focus Session Complete",
        message: "Great job! You've completed your focus session.",
      });
      chrome.action.setBadgeText({ text: "" });
    }
  }, 1000);
}

// Handle commands from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "start_timer") {
    startTimer(message.duration);
  } else if (message.command === "add_website") {
    blocklist.push(message.website);
    chrome.storage.sync.set({ blocklist });
  }
  sendResponse({ status: "success" });
});
