// wormscore.com: highlight the visitor's download, show the latest version, copy the citation.
// The page works without this file: both buttons always link to the newest release.
(function () {
  "use strict";

  // 1. Highlight the button for this computer. Both stay visible; only the colour changes.
  var platform = "";
  try {
    platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.userAgent || "";
  } catch (e) { /* leave both plain */ }
  var mine = /win/i.test(platform) ? "dl-win" : /mac/i.test(platform) ? "dl-mac" : null;
  if (mine && !/iphone|ipad|android/i.test(platform)) {
    var btn = document.getElementById(mine);
    if (btn) btn.classList.add("mine");
  }

  // 2. Latest version from GitHub (60 requests an hour per visitor without a token; kept for the visit).
  function show(rel) {
    var v = String(rel.tag_name || "").replace(/^v/, "");
    if (!/^\d+(\.\d+)*$/.test(v)) return;
    document.getElementById("ver").textContent = "Version " + v;
    document.querySelectorAll(".cite-ver").forEach(function (el) { el.textContent = v; });
    if (/^https:\/\/github\.com\/arjunkai\/wormscore\//.test(rel.html_url || "")) {
      document.getElementById("notes").href = rel.html_url;
    }
  }
  var KEY = "wormscore-latest";
  var cached = null;
  try { cached = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) { /* no storage */ }
  if (cached) {
    show(cached);
  } else if (window.fetch) {
    fetch("https://api.github.com/repos/arjunkai/wormscore/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rel) {
        if (!rel) return;
        var keep = { tag_name: rel.tag_name, html_url: rel.html_url };
        show(keep);
        try { sessionStorage.setItem(KEY, JSON.stringify(keep)); } catch (e) { /* fine */ }
      })
      .catch(function () { /* keep "Latest version" */ });
  }

  // 3. Copy a citation. Without a clipboard (or on plain http) the buttons stay hidden; the text can be selected.
  var status = document.getElementById("copy-status");
  if (navigator.clipboard && window.isSecureContext) {
    document.querySelectorAll("[data-copy]").forEach(function (btn) {
      var timer;
      btn.hidden = false;
      btn.addEventListener("click", function () {
        var text = document.getElementById(btn.getAttribute("data-copy")).textContent.replace(/\s+$/, "");
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = "Copied";
          status.textContent = "Citation copied.";
        }, function () {
          status.textContent = "Could not copy. Select the text and copy it instead.";
        });
        clearTimeout(timer);
        timer = setTimeout(function () { btn.textContent = "Copy"; status.textContent = ""; }, 2500);
      });
    });
  }
})();
