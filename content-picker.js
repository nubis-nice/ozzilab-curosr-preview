/* eslint-disable no-undef */
(function browserPreviewPicker() {
  const FLAG = "__bppPickerActive_v1";
  if (window[FLAG]) {
    return;
  }
  window[FLAG] = true;

  const OVERLAY_ID = "bpp-picker-overlay-styles";

  function injectStyles() {
    if (document.getElementById(OVERLAY_ID)) {
      return;
    }
    const style = document.createElement("style");
    style.id = OVERLAY_ID;
    style.textContent = `
      .bpp-hover { outline: 2px solid #2563eb !important; outline-offset: 2px !important; cursor: crosshair !important; }
      .bpp-banner {
        position: fixed; z-index: 2147483646; left: 0; right: 0; top: 0;
        padding: 10px 16px; font: 14px/1.4 system-ui, sans-serif;
        background: #1e293b; color: #f8fafc; text-align: center;
        box-shadow: 0 2px 12px rgba(0,0,0,0.35);
      }
      .bpp-banner kbd { background: #334155; padding: 2px 6px; border-radius: 4px; }
    `;
    document.documentElement.appendChild(style);
  }

  function cssEscape(s) {
    if (typeof CSS !== "undefined" && CSS.escape) {
      return CSS.escape(s);
    }
    return s.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function buildCssSelector(el) {
    if (!(el instanceof Element)) {
      return "";
    }
    if (el.id) {
      return `#${cssEscape(el.id)}`;
    }
    const parts = [];
    let cur = el;
    let depth = 0;
    while (cur && cur.nodeType === 1 && depth < 6) {
      let part = cur.tagName.toLowerCase();
      if (cur.classList && cur.classList.length) {
        const c = Array.from(cur.classList)
          .slice(0, 2)
          .map((x) => `.${cssEscape(x)}`)
          .join("");
        part += c;
      }
      const parent = cur.parentElement;
      if (parent) {
        const same = Array.from(parent.children).filter(
          (n) => n.tagName === cur.tagName,
        );
        if (same.length > 1) {
          const idx = same.indexOf(cur) + 1;
          part += `:nth-of-type(${idx})`;
        }
      }
      parts.unshift(part);
      cur = parent;
      depth += 1;
    }
    return parts.join(" > ");
  }

  function buildXPath(el) {
    if (!(el instanceof Element)) {
      return "";
    }
    const parts = [];
    let cur = el;
    while (cur && cur.nodeType === 1 && parts.length < 8) {
      let ix = 1;
      let sib = cur.previousElementSibling;
      while (sib) {
        if (sib.tagName === cur.tagName) {
          ix += 1;
        }
        sib = sib.previousElementSibling;
      }
      parts.unshift(`${cur.tagName.toLowerCase()}[${ix}]`);
      cur = cur.parentElement;
    }
    return "/" + parts.join("/");
  }

  function pickComputed(el) {
    const keys = [
      "display",
      "position",
      "font-size",
      "font-weight",
      "color",
      "background-color",
      "width",
      "height",
      "margin",
      "padding",
      "border",
      "flex",
      "flex-direction",
      "align-items",
      "justify-content",
      "grid-template-columns",
      "gap",
      "opacity",
      "visibility",
    ];
    const win = el.ownerDocument.defaultView;
    if (!win) {
      return {};
    }
    const cs = win.getComputedStyle(el);
    const out = {};
    for (const k of keys) {
      const v = cs.getPropertyValue(k);
      if (v) {
        out[k] = v.trim();
      }
    }
    return out;
  }

  function attrsRecord(el) {
    const out = {};
    if (!el.attributes) {
      return out;
    }
    for (const a of el.attributes) {
      out[a.name] = a.value;
    }
    return out;
  }

  function rectOf(el) {
    const r = el.getBoundingClientRect();
    return {
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    };
  }

  function cleanup(hoverTarget, banner, onMove, onClick, onKey) {
    document.removeEventListener("mousemove", onMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKey, true);
    if (hoverTarget) {
      hoverTarget.classList.remove("bpp-hover");
    }
    if (banner && banner.parentNode) {
      banner.parentNode.removeChild(banner);
    }
    delete window[FLAG];
  }

  injectStyles();

  const banner = document.createElement("div");
  banner.className = "bpp-banner";
  banner.innerHTML =
    "Tryb wyboru: najedź i kliknij element. <kbd>Esc</kbd> — anuluj. → Cursor MCP: <code>browser_preview_get_last</code>";
  document.documentElement.appendChild(banner);

  let hoverTarget = null;

  function onMove(ev) {
    const el = document.elementFromPoint(ev.clientX, ev.clientY);
    if (!el || el === banner || banner.contains(el)) {
      return;
    }
    if (hoverTarget && hoverTarget !== el) {
      hoverTarget.classList.remove("bpp-hover");
    }
    hoverTarget = el;
    hoverTarget.classList.add("bpp-hover");
  }

  function onClick(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const el = hoverTarget;
    if (!el) {
      return;
    }
    const payload = {
      schemaVersion: 1,
      capturedAt: new Date().toISOString(),
      pageUrl: location.href,
      pageTitle: document.title || "",
      tagName: el.tagName,
      id: el.id || null,
      classNames: el.classList ? Array.from(el.classList) : [],
      attributes: attrsRecord(el),
      outerHTML: el.outerHTML,
      innerHTML: el.innerHTML,
      textContent: (el.textContent || "").slice(0, 50000),
      cssSelector: buildCssSelector(el),
      xpath: buildXPath(el),
      rect: rectOf(el),
      computedStyles: pickComputed(el),
    };

    cleanup(hoverTarget, banner, onMove, onClick, onKey);

    chrome.runtime.sendMessage({ type: "bpp-capture", payload }, (resp) => {
      if (chrome.runtime.lastError) {
        alert(`ozzilb-browser-preview: ${chrome.runtime.lastError.message}`);
        return;
      }
      if (!resp?.ok) {
        const msg = resp?.error || "Nie udało się wysłać";
        alert(`ozzilb-browser-preview: ${msg}`);
        return;
      }
      const note = document.createElement("div");
      note.className = "bpp-banner";
      note.textContent = "Wysłano do Cursor. W czacie poproś agenta o wywołanie narzędzia browser_preview_get_last.";
      document.documentElement.appendChild(note);
      setTimeout(() => {
        if (note.parentNode) {
          note.parentNode.removeChild(note);
        }
      }, 4000);
    });
  }

  function onKey(ev) {
    if (ev.key === "Escape") {
      ev.preventDefault();
      cleanup(hoverTarget, banner, onMove, onClick, onKey);
    }
  }

  document.addEventListener("mousemove", onMove, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKey, true);
})();
