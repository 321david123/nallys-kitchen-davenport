/* =========================================================
   NALLY'S KITCHEN — interactions
   ========================================================= */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Smooth scroll (Lenis) — single rAF driver ---------- */
  var lenis = null;
  if (window.Lenis && !prefersReduced) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  /* ---------- GSAP / ScrollTrigger ---------- */
  var hasGSAP = window.gsap && window.ScrollTrigger;
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) { lenis.on("scroll", ScrollTrigger.update); }
  }

  /* ---------- NAV: transparent -> solid on scroll ---------- */
  var nav = document.getElementById("nav");
  function onScrollNav() {
    if (!nav) return;
    if (window.scrollY > 60) nav.classList.add("is-solid");
    else nav.classList.remove("is-solid");
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- Mobile overlay ---------- */
  var toggle = document.getElementById("navToggle");
  var overlay = document.getElementById("overlay");
  var overlayClose = document.getElementById("overlayClose");
  function openOverlay() {
    if (!overlay) return;
    overlay.classList.add("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (lenis) lenis.stop();
  }
  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lenis) lenis.start();
  }
  if (toggle) toggle.addEventListener("click", openOverlay);
  if (overlayClose) overlayClose.addEventListener("click", closeOverlay);
  if (overlay) {
    overlay.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeOverlay);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeOverlay();
  });

  /* ---------- Smooth anchor scrolling via Lenis ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id === "#" || id === "#top") {
        e.preventDefault();
        if (lenis) lenis.scrollTo(0, { offset: 0 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -70 });
        else target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (hasGSAP && !prefersReduced) {
    revealEls.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: function () { el.classList.add("is-visible"); }
      });
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Hero parallax ---------- */
  var heroImg = document.getElementById("heroImg");
  if (hasGSAP && heroImg && !prefersReduced) {
    gsap.to(heroImg, {
      yPercent: 14, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
  }

  /* ---------- Section image parallax ---------- */
  if (hasGSAP && !prefersReduced) {
    document.querySelectorAll("[data-parallax]").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: img.closest("[data-parallax-wrap]") || img, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  /* ---------- Stat counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target)) return;
    if (prefersReduced || !hasGSAP) {
      el.textContent = target.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
      return;
    }
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.8, ease: "power2.out",
      onUpdate: function () {
        var val = obj.v.toFixed(decimals);
        if (decimals === 0) val = Math.round(obj.v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        el.textContent = val + suffix;
      }
    });
  }
  var statNums = document.querySelectorAll(".stat__num[data-count]");
  if (hasGSAP && statNums.length) {
    ScrollTrigger.create({
      trigger: "#stats", start: "top 85%", once: true,
      onEnter: function () { statNums.forEach(animateCount); }
    });
  } else {
    statNums.forEach(animateCount);
  }

  /* ---------- Menu tabs ---------- */
  var tabs = document.querySelectorAll(".menu__tab");
  var panels = document.querySelectorAll(".menu__panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var name = tab.getAttribute("data-tab");
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === name);
      });
      if (hasGSAP) ScrollTrigger.refresh();
    });
  });

  /* ---------- Gallery Swiper ---------- */
  if (window.Swiper && document.querySelector(".gallery__swiper")) {
    new Swiper(".gallery__swiper", {
      slidesPerView: "auto",
      spaceBetween: 20,
      grabCursor: true,
      navigation: { nextEl: ".gallery__btn--next", prevEl: ".gallery__btn--prev" },
      breakpoints: { 760: { spaceBetween: 28 } }
    });
  }

  /* ---------- Reviews Swiper ---------- */
  if (window.Swiper && document.querySelector(".reviews__swiper")) {
    new Swiper(".reviews__swiper", {
      slidesPerView: 1,
      loop: true,
      autoplay: prefersReduced ? false : { delay: 5500, disableOnInteraction: false },
      pagination: { el: ".reviews__dots", clickable: true },
      effect: "fade",
      fadeEffect: { crossFade: true }
    });
  }

  /* ---------- Highlight current open day in hours ---------- */
  try {
    var hours = document.getElementById("hours");
    if (hours) {
      var rows = hours.querySelectorAll("tr");
      var dayIdx = new Date().getDay(); // 0 Sun .. 6 Sat
      // table order: Mon(0)..Sun(6)
      var map = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
      var rowIndex = map[dayIdx];
      if (rows[rowIndex] && !rows[rowIndex].querySelector(".closed")) {
        var now = new Date();
        var mins = now.getHours() * 60 + now.getMinutes();
        if (mins >= 630 && mins <= 1200) rows[rowIndex].classList.add("is-now"); // 10:30–20:00
      }
    }
  } catch (e) { /* no-op */ }

})();
