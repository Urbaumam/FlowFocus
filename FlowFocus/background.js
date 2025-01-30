let timer = null;
let blocklist = [];
let schedule = [];

// Load blocklist and schedule from storage
chrome.storage.sync.get(["blocklist", "schedule"], (data) => {
  blocklist = data.blocklist || [];
  schedule = data.schedule || [];
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ blocklist: [], schedule: [] });
});

// Handle blocking websites
chrome.webNavigation.onBeforeNavigate.addListener(
  (details) => {
    const url = new URL(details.url);
    if (isSiteBlocked(url.hostname)) {
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL("blocked.html"),
      });
    }
  },
  { url: [{ schemes: ["http", "https"] }] }
);

function isSiteBlocked(hostname) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  // Check if hostname is in the blocklist and if it's within a scheduled block period
  for (const rule of schedule) {
    if (rule.hostname === hostname && rule.days.includes(currentDay)) {
      if (currentHour >= rule.startHour && currentHour < rule.endHour) {
        return true;
      }
    }
  }
  return blocklist.includes(hostname);
}

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
  } else if (message.command === "schedule_blockage") {
    schedule.push(message.rule);
    chrome.storage.sync.set({ schedule });
  }
  sendResponse({ status: "success" });
});
