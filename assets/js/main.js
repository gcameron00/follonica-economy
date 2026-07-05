/* main.js — shared site behaviour (no dependencies)
   - mobile nav toggle
   - light/dark theme switch (persisted)
   - reveal-on-scroll
   - footer year
*/
(function () {
  "use strict";

  /* ---- Theme ---------------------------------------------------------- */
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  if (stored === "light" || stored === "dark") root.setAttribute("data-theme", stored);

  function currentTheme() {
    var attr = root.getAttribute("data-theme");
    if (attr) return attr;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function paintToggle(btn) {
    var dark = currentTheme() === "dark";
    btn.textContent = dark ? "☀" : "☾";
    btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }

  document.addEventListener("DOMContentLoaded", function () {
    /* Theme toggle */
    var toggle = document.querySelector(".theme-toggle");
    if (toggle) {
      paintToggle(toggle);
      toggle.addEventListener("click", function () {
        var next = currentTheme() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("theme", next); } catch (e) {}
        paintToggle(toggle);
        document.dispatchEvent(new CustomEvent("themechange", { detail: next }));
      });
    }

    /* Mobile nav */
    var navToggle = document.querySelector(".nav-toggle");
    var navLinks = document.querySelector(".nav-links");
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function () {
        var open = navLinks.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    /* Footer year */
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();

    /* Reveal on scroll */
    var revealables = document.querySelectorAll(".reveal");
    if (revealables.length) {
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
          });
        }, { threshold: 0.12 });
        revealables.forEach(function (el) { io.observe(el); });
      } else {
        revealables.forEach(function (el) { el.classList.add("in"); });
      }
    }
  });
})();
