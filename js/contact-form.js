/**
 * NPB Guide — contact form
 * Sends via Formsubmit (no backend needed) to the editorial inbox.
 */
(function () {
  "use strict";

  var form = document.getElementById("contactForm");
  var note = document.getElementById("contactNote");
  if (!form || !note) return;

  var SUBMIT_URL = "https://formsubmit.co/ajax/ishikawaminami1113@gmail.com";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements["name"].value.trim();
    var email = form.elements["email"].value.trim();
    var msg = form.elements["message"].value.trim();

    if (!name || !email || email.indexOf("@") === -1 || !msg) {
      note.textContent = "Please fill in all fields with a valid email.";
      return;
    }

    note.textContent = "Sending…";
    form.querySelector("button[type=submit]").disabled = true;

    fetch(SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        name: name,
        email: email,
        message: msg,
        _subject: "NPB Guide — message from " + name,
        _captcha: "false"
      })
    })
    .then(function (r) { return r.json().catch(function () { return {}; }); })
    .then(function () {
      note.style.color = "";
      note.textContent = "Thanks, " + name + "! Your message is on its way — we reply within 48 hours.";
      form.reset();
    })
    .catch(function () {
      note.style.color = "var(--red)";
      note.textContent = "Something went wrong. Please try again in a few minutes, or find us on Reddit at r/NPB.";
    })
    .finally(function () {
      form.querySelector("button[type=submit]").disabled = false;
    });
  });
})();
