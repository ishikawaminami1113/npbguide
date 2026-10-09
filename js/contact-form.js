/**
 * NPB Guide — contact form (demo)
 * Client-side validation only. Nothing is transmitted anywhere.
 */
(function () {
  "use strict";

  var form = document.getElementById("contactForm");
  var note = document.getElementById("contactNote");
  if (!form || !note) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements["name"].value.trim();
    var email = form.elements["email"].value.trim();
    var msg = form.elements["message"].value.trim();

    if (!name || !email || email.indexOf("@") === -1 || !msg) {
      note.textContent = "Please fill in all fields with a valid email.";
      return;
    }
    note.textContent = "Thanks, " + name + "! Your message was noted. (Demo form — no email is actually sent.)";
    form.reset();
  });
})();
