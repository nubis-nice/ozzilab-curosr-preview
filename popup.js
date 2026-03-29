/* global chrome */

const DEFAULT_BRIDGE = "http://127.0.0.1:17373";

async function load() {
  const s = await chrome.storage.sync.get(["bridgeBase", "previewToken"]);
  document.getElementById("bridgeBase").value =
    typeof s.bridgeBase === "string" && s.bridgeBase ? s.bridgeBase : DEFAULT_BRIDGE;
  document.getElementById("previewToken").value =
    typeof s.previewToken === "string" ? s.previewToken : "";
}

document.getElementById("save").addEventListener("click", async () => {
  const bridgeBase = document.getElementById("bridgeBase").value.trim() || DEFAULT_BRIDGE;
  const previewToken = document.getElementById("previewToken").value;
  await chrome.storage.sync.set({ bridgeBase, previewToken });
});

document.getElementById("pick").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return;
  }
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: false },
      files: ["content-picker.js"],
    });
    window.close();
  } catch (e) {
    alert(String(e));
  }
});

load();
