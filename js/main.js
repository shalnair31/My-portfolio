/* ============================================================
   Shalini Nair — Portfolio interactions
   ============================================================ */
(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  /* ---------- Theme toggle ---------- */
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "light"
          : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ---------- Sticky header ---------- */
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  navToggle.addEventListener("click", function () {
    var open = mainNav.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  });

  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mainNav.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  /* ---------- Marquee: duplicate track for seamless loop ---------- */
  var track = document.querySelector(".marquee-track");
  if (track) {
    track.innerHTML = track.innerHTML + track.innerHTML;
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll(".stat-num[data-count]");
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString("en-US");
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("en-US");
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxClose = document.getElementById("lightboxClose");
  function openLightbox(img) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lightboxImg.src = "";
  }
  if (lightbox) {
    document.querySelectorAll(".award-figure img").forEach(function (img) {
      img.addEventListener("click", function () { openLightbox(img); });
    });
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* ---------- Testimonials slider ---------- */
  var slider = document.getElementById("tstSlider");
  if (slider) {
    var slides = slider.querySelectorAll(".tst-slide");
    var dotsWrap = document.getElementById("tstDots");
    var prevBtn = document.getElementById("tstPrev");
    var nextBtn = document.getElementById("tstNext");
    var index = 0;
    var timer = null;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.className = "tst-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); restart(); });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll(".tst-dot");

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("active", k === index); });
      dots.forEach(function (d, k) { d.classList.toggle("active", k === index); });
    }

    function step(delta) { goTo(index + delta); }

    function restart() {
      if (reducedMotion) return;
      clearInterval(timer);
      timer = setInterval(function () { step(1); }, 7000);
    }

    prevBtn.addEventListener("click", function () { step(-1); restart(); });
    nextBtn.addEventListener("click", function () { step(1); restart(); });

    var touchX = null;
    slider.addEventListener("touchstart", function (e) {
      touchX = e.changedTouches[0].clientX;
    }, { passive: true });
    slider.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 48) { step(dx < 0 ? 1 : -1); restart(); }
      touchX = null;
    }, { passive: true });

    slider.addEventListener("mouseenter", function () { clearInterval(timer); });
    slider.addEventListener("mouseleave", restart);

    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { step(-1); restart(); }
      if (e.key === "ArrowRight") { step(1); restart(); }
    });

    goTo(0);
    restart();
  }

  /* ---------- Active nav link on scroll ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = mainNav.querySelectorAll("a[href^='#']");
  var navObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach(function (s) { navObserver.observe(s); });
})();