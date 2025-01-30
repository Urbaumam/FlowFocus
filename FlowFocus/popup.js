// Load existing blocklist
chrome.storage.sync.get("blocklist", (data) => {
  const blocklist = data.blocklist || [];
  blocklist.forEach(addToBlocklistUI);
});

// Add website to blocklist
document.getElementById("add-website").addEventListener("click", () => {
  const website = document.getElementById("website-input").value.trim();
  if (website) {
    chrome.runtime.sendMessage(
      { command: "add_website", website },
      (response) => {
        if (response.status === "success") {
          addToBlocklistUI(website);
        }
      }
    );
  }
});

function addToBlocklistUI(website) {
  const listItem = document.createElement("li");
  listItem.textContent = website;
  document.getElementById("blocklist").appendChild(listItem);
}

// Start focus timer
document.getElementById("start-timer").addEventListener("click", () => {
  const duration = parseInt(document.getElementById("timer").value, 10);
  if (duration > 0) {
    chrome.runtime.sendMessage({ command: "start_timer", duration });
  }
});
