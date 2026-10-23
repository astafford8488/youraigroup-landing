(function () {
  "use strict";

  if (document.getElementById("yaig-chat-root")) return;

  var API_URL = "https://www.chuhching.com/api/public/site-chat";
  var VISITOR_KEY = "yaig_chat_visitor_v1";

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    var bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    return Array.from(bytes, function (byte, index) {
      var value = byte.toString(16).padStart(2, "0");
      return index === 4 || index === 6 || index === 8 || index === 10 ? "-" + value : value;
    }).join("");
  }

  function visitorId() {
    try {
      var existing = window.localStorage.getItem(VISITOR_KEY);
      if (existing && /^[A-Za-z0-9_-]{16,80}$/.test(existing)) return existing;
      var created = uuid();
      window.localStorage.setItem(VISITOR_KEY, created);
      return created;
    } catch (_) {
      return uuid();
    }
  }

  var stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/chat-widget.css?v=1";
  document.head.appendChild(stylesheet);

  var root = document.createElement("div");
  root.id = "yaig-chat-root";
  root.innerHTML =
    '<button class="yaig-chat-launcher" type="button" aria-label="Chat with Your AI Group" aria-expanded="false">' +
      '<span aria-hidden="true">✦</span><span>Ask YAIG</span>' +
    '</button>' +
    '<section class="yaig-chat-panel" role="dialog" aria-modal="false" aria-label="Your AI Group website assistant" hidden>' +
      '<header class="yaig-chat-header">' +
        '<div><strong>Your AI Group</strong><span>AI website assistant</span></div>' +
        '<button class="yaig-chat-close" type="button" aria-label="Close chat">×</button>' +
      '</header>' +
      '<div class="yaig-chat-messages" role="log" aria-live="polite" aria-relevant="additions"></div>' +
      '<div class="yaig-chat-actions">' +
        '<button type="button" data-quick="What services do you offer?">Services</button>' +
        '<button type="button" data-quick="What does it cost?">Pricing</button>' +
        '<button type="button" data-quick="I want to speak with Andrew.">Talk to a person</button>' +
      '</div>' +
      '<form class="yaig-chat-form">' +
        '<label class="yaig-chat-sr-only" for="yaig-chat-input">Your question</label>' +
        '<textarea id="yaig-chat-input" maxlength="1500" rows="2" placeholder="Ask about AI automation…" required></textarea>' +
        '<button type="submit" aria-label="Send message">Send</button>' +
      '</form>' +
      '<p class="yaig-chat-note">AI assistant. Don’t share passwords, payment details, or sensitive information.</p>' +
    '</section>';
  document.body.appendChild(root);

  var launcher = root.querySelector(".yaig-chat-launcher");
  var panel = root.querySelector(".yaig-chat-panel");
  var close = root.querySelector(".yaig-chat-close");
  var messages = root.querySelector(".yaig-chat-messages");
  var form = root.querySelector(".yaig-chat-form");
  var input = root.querySelector("textarea");
  var submit = form.querySelector('button[type="submit"]');
  var actions = root.querySelector(".yaig-chat-actions");
  var sending = false;

  function addMessage(role, text, pending) {
    var item = document.createElement("div");
    item.className = "yaig-chat-message yaig-chat-message--" + role;
    if (pending) item.classList.add("yaig-chat-message--pending");
    item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  }

  addMessage(
    "assistant",
    "Hi — I’m the YAIG website assistant. Ask me about our voice agents, chatbots, automation, setup, or pricing."
  );

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) {
      // Opening chat is already a high-intent action. Suppress the separate
      // exit popup so two conversion overlays can never cover each other.
      try { window.sessionStorage.setItem("exit-popup-dismissed", "1"); } catch (_) {}
      var exitPopup = document.getElementById("exit-popup");
      if (exitPopup) exitPopup.classList.add("hidden");
      window.setTimeout(function () { input.focus(); }, 0);
    } else {
      launcher.focus();
    }
  }

  launcher.addEventListener("click", function () { setOpen(panel.hidden); });
  close.addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });

  async function send(text) {
    text = text.trim();
    if (!text || sending) return;
    sending = true;
    input.value = "";
    input.disabled = true;
    submit.disabled = true;
    actions.hidden = true;
    addMessage("user", text);
    var pending = addMessage("assistant", "Thinking…", true);

    try {
      var response = await fetch(API_URL, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_id: visitorId(),
          request_id: uuid(),
          text: text,
          page_url: window.location.href
        })
      });
      var payload = await response.json().catch(function () { return {}; });
      if (!response.ok || !payload.reply) {
        throw new Error(payload.error || "Chat request failed");
      }
      pending.textContent = payload.reply;
      pending.classList.remove("yaig-chat-message--pending");
    } catch (_) {
      pending.textContent =
        "Chat is temporarily unavailable. Call or text us at +1 757-209-7126, or use the booking form on this site.";
      pending.classList.remove("yaig-chat-message--pending");
      pending.classList.add("yaig-chat-message--error");
    } finally {
      sending = false;
      input.disabled = false;
      submit.disabled = false;
      input.focus();
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    send(input.value);
  });
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  actions.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-quick]");
    if (button) send(button.getAttribute("data-quick") || "");
  });
})();
