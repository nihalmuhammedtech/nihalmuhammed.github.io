/* Nihal's Portfolio — interactions */
(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");

  function closeNav() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
  }

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Menu";
  });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") closeNav(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* ---------- Highlight the current section in the nav ---------- */
  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  var map = {};
  links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && map[entry.target.id]) {
          links.forEach(function (a) { a.classList.remove("active"); });
          map[entry.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  /* ---------- Hero: network topology canvas ---------- */
  var canvas = document.getElementById("net");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var nodes = [];
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pointer = { x: -9999, y: -9999 };
    var running = true;
    var LINK = 150;

    function size() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(22, Math.min(64, Math.round((w * h) / 21000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
          r: Math.random() * 1.4 + 1.1
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var i, j, a, b, dx, dy, d, alpha;

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (!reduce) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
        }
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            alpha = (1 - d / LINK) * .32;
            ctx.strokeStyle = "rgba(167,139,250," + alpha + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        /* nodes near the pointer light up and connect to it */
        dx = a.x - pointer.x; dy = a.y - pointer.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < 170) {
          alpha = (1 - d / 170) * .6;
          ctx.strokeStyle = "rgba(196,181,253," + alpha + ")";
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
        }
        ctx.fillStyle = d < 170 ? "rgba(221,214,254,.95)" : "rgba(167,139,250,.75)";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    function loop() {
      if (running) draw();
      if (!reduce) requestAnimationFrame(loop);
    }

    var hero = canvas.parentElement;
    hero.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
      if (reduce) draw();
    });
    hero.addEventListener("pointerleave", function () { pointer.x = pointer.y = -9999; if (reduce) draw(); });

    /* pause when the hero is off-screen */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { running = en[0].isIntersecting; }).observe(hero);
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { size(); if (reduce) draw(); }, 150);
    });

    size();
    draw();
    if (!reduce) requestAnimationFrame(loop);
  }

  /* ---------- Animated graphics ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* SVG packet animation ignores the CSS setting, so pause it here */
  if (reduceMotion) {
    Array.prototype.forEach.call(document.querySelectorAll("svg.anim"), function (svg) {
      if (svg.pauseAnimations) svg.pauseAnimations();
    });
  }

  /* Terminal types itself once, when it scrolls into view */
  var term = document.querySelector(".terminal");
  if (term) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      term.classList.add("run");
    } else {
      var termObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          term.classList.add("run");
          termObs.disconnect();
        }
      }, { threshold: 0.4 });
      termObs.observe(term);
    }
  }

  /* ---------- Contact form (opens the visitor's email app) ---------- */
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  var TO = "alnih1814@gmail.com";

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name, email = form.elements.email, msg = form.elements.message;
      var ok = true;

      [name, email, msg].forEach(function (f) {
        var bad = !f.value.trim() || (f === email && !/^\S+@\S+\.\S+$/.test(f.value.trim()));
        f.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad) ok = false;
      });

      if (!ok) {
        status.textContent = "Please fill in your name, a valid email and a message.";
        return;
      }

      var subject = "Portfolio message from " + name.value.trim();
      var body = msg.value.trim() + "\n\n" + name.value.trim() + "\n" + email.value.trim();
      window.location.href = "mailto:" + TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      status.textContent = "Opening your email app with the message ready to send.";
      form.reset();
    });
  }
})();
