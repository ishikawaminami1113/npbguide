/**
 * NPB Guide — cookie consent (ePrivacy / GDPR)
 *
 * Why this exists:
 *   This site currently sets no cookies and runs no trackers. The banner is
 *   installed in advance so that advertising cookies (Google AdSense) are
 *   never written to a visitor's browser without an explicit opt-in.
 *
 * Behaviour:
 *   - No stored choice  -> banner is shown.
 *   - "Accept all"      -> stores "all"; advertising cookies become allowed.
 *   - "Essential only"  -> stores "essential"; advertising cookies stay off.
 *   - Either choice     -> banner is hidden until the visitor opens
 *                          "Cookie Settings" in the footer.
 *   - The choice is stored in localStorage under KEY (a first-party,
 *     non-tracking value). Nothing is sent anywhere.
 *
 * Wiring for ad code later:
 *   Listen for the "npb:consent" event, detail is "all" | "essential".
 *   window.NPBCONSENT is the current value (or null when undecided).
 */
(function () {
  "use strict";

  var KEY = "npb_consent";
  var BANNER_ID = "consentBanner";
  var EVENT = "npb:consent";

  /* Read the stored choice. Returns "all" | "essential" | null. */
  function read() {
    try {
      var v = window.localStorage.getItem(KEY);
      return v === "all" || v === "essential" ? v : null;
    } catch (err) {
      return null;
    }
  }

  /* Persist the choice. localStorage may be blocked; fail quietly. */
  function store(value) {
    try {
      window.localStorage.setItem(KEY, value);
    } catch (err) {
      /* private mode / storage disabled — banner will simply reappear */
    }
  }

  function announce(value) {
    window.NPBCONSENT = value;
    try {
      window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
    } catch (err) {
      /* very old browsers: no event, ads simply do not auto-load */
    }
  }

  function banner() {
    return document.getElementById(BANNER_ID);
  }

  function show() {
    var el = banner();
    if (el) el.hidden = false;
  }

  function hide() {
    var el = banner();
    if (el) el.hidden = true;
  }

  function choose(value) {
    store(value);
    announce(value);
    hide();
  }

  function bind() {
    var el = banner();
    if (el) {
      var accept = document.getElementById("consentAccept");
      var essential = document.getElementById("consentEssential");
      if (accept) accept.addEventListener("click", function () { choose("all"); });
      if (essential) essential.addEventListener("click", function () { choose("essential"); });
    }

    /* "Cookie Settings" triggers in the footer — reopen the banner. */
    var triggers = document.querySelectorAll("[data-open-consent]");
    Array.prototype.forEach.call(triggers, function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        show();
      });
    });
  }

  function init() {
    window.NPBCONSENT = read();
    window.npbSetConsent = choose; /* programmatic access for ad code */
    bind();
    if (window.NPBCONSENT === null) show();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
