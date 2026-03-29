/* global chrome */

const DEFAULT_BRIDGE = "http://127.0.0.1:17373";

async function getSettings() {
  const s = await chrome.storage.sync.get(["bridgeBase", "previewToken"]);
  const bridgeBase = typeof s.bridgeBase === "string" && s.bridgeBase ? s.bridgeBase : DEFAULT_BRIDGE;
  const previewToken = typeof s.previewToken === "string" ? s.previewToken : "";
  return { bridgeBase: bridgeBase.replace(/\/$/, ""), previewToken };
}

async function postCapture(payload) {
  const { bridgeBase, previewToken } = await getSettings();
  const url = `${bridgeBase}/v1/capture`;
  const headers = { "Content-Type": "application/json" };
  if (previewToken) {
    headers["X-Preview-Token"] = previewToken;
  }
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(data.error || res.statusText || "capture_failed");
    err.details = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

async function injectAndPick(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId, allFrames: false },
    files: ["content-picker.js"],
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "bpp-send-selection",
    title: "Wyślij zaznaczony fragment do Cursor (ozzilb-browser-preview)",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "bpp-send-selection" || !tab?.id) {
    return;
  }
  const text = info.selectionText || "";
  const payload = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    pageUrl: tab.url || "",
    pageTitle: tab.title || "",
    tagName: "SELECTION",
    id: null,
    classNames: [],
    attributes: {},
    outerHTML: "",
    innerHTML: "",
    textContent: text,
    cssSelector: "",
    xpath: "",
    rect: undefined,
    computedStyles: {},
    notes: "Zaznaczenie tekstu z menu kontekstowego (bez pełnego DOM).",
  };
  try {
    await postCapture(payload);
    await chrome.action.setBadgeText({ tabId: tab.id, text: "OK" });
    setTimeout(() => chrome.action.setBadgeText({ tabId: tab.id, text: "" }), 2000);
  } catch (e) {
    console.error(e);
    await chrome.action.setBadgeText({ tabId: tab.id, text: "!" });
    setTimeout(() => chrome.action.setBadgeText({ tabId: tab.id, text: "" }), 3000);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "bpp-start-pick") {
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return;
  }
  try {
    await injectAndPick(tab.id);
  } catch (e) {
    console.error(e);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "bpp-capture") {
    postCapture(message.payload)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((e) =>
        sendResponse({
          ok: false,
          error: e?.message || String(e),
          status: e?.status,
          details: e?.details,
        }),
      );
    return true;
  }
  return undefined;
});
