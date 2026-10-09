/**
 * NPB Guide — scripts
 * - Mobile hamburger menu
 * - Header shadow on scroll
 * - Scroll-reveal animations (IntersectionObserver)
 * - Newsletter signup (demo)
 * - Footer year
 */
(function () {
  "use strict";

  /* ===== Mobile menu ===== */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    function closeMenu() {
      navMenu.classList.remove("is-open");
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
    }

    navToggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("is-open");
      navToggle.classList.toggle("is-active", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ===== Header on scroll ===== */
  var header = document.getElementById("header");
  var ticking = false;

  function updateHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  updateHeader();

  /* ===== Scroll reveal ===== */
  var revealTargets = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ===== Newsletter (demo) ===== */
  var form = document.getElementById("newsletterForm");
  var note = document.getElementById("formNote");

  if (form && note) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = form.elements["email"].value.trim();
      if (!email || email.indexOf("@") === -1) {
        note.textContent = "Please enter a valid email address.";
        return;
      }
      note.textContent = "Thanks, " + email + "! You're on the list. (Demo — no email is actually sent.)";
      form.reset();
    });
  }

  /* ===== Footer year ===== */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
