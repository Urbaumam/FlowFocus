// Load existing blocklist
chrome.storage.sync.get(["blocklist", "schedule"], (data) => {
  const blocklist = data.blocklist || [];
  blocklist.forEach(addToBlocklistUI);

  const schedule = data.schedule || [];
  schedule.forEach(addToScheduleUI);
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

// Schedule website blockage
document.getElementById("schedule-block").addEventListener("click", () => {
  const website = document.getElementById("schedule-website").value.trim();
  const days = document.getElementById("days").value.split(",").map(Number);
  const startHour = parseInt(document.getElementById("start-hour").value, 10);
  const endHour = parseInt(document.getElementById("end-hour").value, 10);

  if (website && days.length > 0 && !isNaN(startHour) && !isNaN(endHour)) {
    const rule = { hostname: website, days, startHour, endHour };
    chrome.runtime.sendMessage(
      { command: "schedule_blockage", rule },
      (response) => {
        if (response.status === "success") {
          addToScheduleUI(rule);
        }
      }
    );
  }
});

function addToScheduleUI(rule) {
  const listItem = document.createElement("li");
  listItem.textContent = `${rule.hostname} on days ${rule.days.join(
    ","
  )} from ${rule.startHour}:00 to ${rule.endHour}:00`;
  document.getElementById("schedule-list").appendChild(listItem);
}
