/**
 * NPB Guide — Google Analytics (GA4), consent-gated.
 *
 * How it works:
 *   - gtag.js is injected ONLY after the visitor chooses "Accept all"
 *     in the cookie banner (the "npb:consent" event with detail "all",
 *     or a stored choice from an earlier visit).
 *   - Until then: no script, no cookie, no request. "Essential only"
 *     never loads analytics at all.
 *   - The event fires from js/consent.js; this file only listens.
 *
 * The measurement ID is configured below; without consent this file does nothing.
 */
(function () {
  "use strict";

  var GA_ID = "G-0H3HZK4Q0V"; /* measurement ID (GA4 property "NPB Guide") */

  var started = false;

  function start() {
    if (started) return;
    if (window.NPBCONSENT !== "all") return;
    if (!/^G-[A-Z0-9]{4,}$/.test(GA_ID) || GA_ID === "G-PENDING") return;
    started = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(script);
  }

  /* Returning visitor who already chose "all". */
  start();
  /* consent.js resolves a stored choice on DOMContentLoaded (runs first). */
  document.addEventListener("DOMContentLoaded", start);
  /* First-time visitor pressing "Accept all". */
  window.addEventListener("npb:consent", function (event) {
    if (event && event.detail === "all") start();
  });
})();
