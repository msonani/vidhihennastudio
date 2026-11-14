(function () {
  "use strict";
  var S = window.SITE || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function waLink(text) {
    return "https://wa.me/" + String(S.whatsapp || "").replace(/\D/g, "") + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  // ---- Plain text fields ----
  $$("[data-site]").forEach(function (el) { el.textContent = S[el.getAttribute("data-site")] || ""; });

  // ---- Contact links ----
  var links = {
    phone: { href: "tel:" + String(S.phone || "").replace(/[^\d+]/g, ""), text: S.phone },
    whatsapp: { href: waLink("Hi! I'd like to know more about your henna services.") },
    email: { href: "mailto:" + (S.email || ""), text: S.email },
    instagram: { href: "https://instagram.com/" + (S.instagram || ""), text: "@" + (S.instagram || "") },
  };
  $$("[data-site-link]").forEach(function (el) {
    var l = links[el.getAttribute("data-site-link")];
    if (!l) return;
    el.href = l.href;
    if (l.text && !el.textContent.trim()) el.textContent = l.text;
  });

  // ---- Services ----
  var grid = $("#services-grid"), select = $("#b-service");
  (S.services || []).forEach(function (s) {
    grid.insertAdjacentHTML("beforeend",
      '<article class="service reveal"><h3>' + esc(s.name) + '</h3><p class="price">' + esc(s.price) +
      "</p><p>" + esc(s.desc) + "</p></article>");
    var o = document.createElement("option");
    o.textContent = s.name;
    select.appendChild(o);
  });
  select.insertAdjacentHTML("beforeend", "<option>Not sure yet</option>");

  // ---- Portfolio ----
  var gallery = $("#gallery");
  var items = S.portfolio || [];
  items.forEach(function (p, i) {
    gallery.insertAdjacentHTML("beforeend",
      '<button class="gallery-item" data-index="' + i + '" data-category="' + esc(p.category) + '">' +
      '<img src="' + esc(p.src) + '" alt="' + esc(p.title) + '" loading="lazy">' +
      '<span class="cap">' + esc(p.title) + "</span></button>");
  });

  $$(".filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".filter").forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      var f = btn.getAttribute("data-filter");
      $$(".gallery-item").forEach(function (g) {
        g.hidden = f !== "all" && g.getAttribute("data-category") !== f;
      });
    });
  });

  // ---- Lightbox ----
  var lb = $("#lightbox"), lbImg = $("#lb-img"), lbCap = $("#lb-cap"), current = 0, lastFocus = null;
  function visibleIndexes() {
    return $$(".gallery-item").filter(function (g) { return !g.hidden; })
      .map(function (g) { return +g.getAttribute("data-index"); });
  }
  function show(i) {
    current = i;
    lbImg.src = items[i].src;
    lbImg.alt = items[i].title;
    lbCap.textContent = items[i].title;
  }
  function openLb(i) { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = "hidden"; $(".lb-close").focus(); }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
  function step(d) {
    var v = visibleIndexes(), pos = v.indexOf(current);
    show(v[(pos + d + v.length) % v.length]);
  }
  gallery.addEventListener("click", function (e) {
    var b = e.target.closest(".gallery-item");
    if (b) openLb(+b.getAttribute("data-index"));
  });
  $(".lb-close").addEventListener("click", closeLb);
  $(".lb-prev").addEventListener("click", function () { step(-1); });
  $(".lb-next").addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // ---- Reviews (only shown if any are added) ----
  if ((S.testimonials || []).length) {
    $("#reviews").hidden = false;
    S.testimonials.forEach(function (t) {
      $("#reviews-grid").insertAdjacentHTML("beforeend",
        '<figure class="review reveal"><blockquote>“' + esc(t.text) + '”</blockquote><figcaption><strong>' +
        esc(t.name) + "</strong>" + (t.event ? " · " + esc(t.event) : "") + "</figcaption></figure>");
    });
  }

  // ---- Hours ----
  var hours = $("#hours");
  (S.hours || []).forEach(function (h) {
    hours.insertAdjacentHTML("beforeend", "<tr><td>" + esc(h[0]) + "</td><td>" + esc(h[1]) + "</td></tr>");
  });

  // ---- Booking form ----
  var form = $("#booking-form"), err = $("#form-error"), dateInput = $("#b-date");
  var today = new Date();
  dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  var sendVia = "whatsapp";
  $$("[data-send]", form).forEach(function (b) {
    b.addEventListener("click", function () { sendVia = b.getAttribute("data-send"); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var missing = [];
    $$("[required]", form).forEach(function (f) {
      var bad = !f.value.trim() || (f.type === "date" && f.min && f.value < f.min);
      f.classList.toggle("invalid", bad);
      if (bad) missing.push(form.querySelector('label[for="' + f.id + '"]').textContent.replace(" *", ""));
    });
    if (missing.length) {
      err.textContent = "Please fill in: " + missing.join(", ") + ".";
      return;
    }
    err.textContent = "";
    var d = new FormData(form);
    var date = new Date(d.get("date") + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    var msg = [
      "Hello " + (S.studioName || "") + "! I'd like to book an appointment.",
      "",
      "Name: " + d.get("name"),
      "Phone: " + d.get("phone"),
      "Service: " + d.get("service"),
      "Number of people: " + (d.get("people") || 1),
      "Date: " + date,
      "Time: " + d.get("time"),
    ];
    if (d.get("notes").trim()) msg.push("Notes: " + d.get("notes").trim());
    var text = msg.join("\n");

    if (sendVia === "email") {
      window.location.href = "mailto:" + S.email + "?subject=" + encodeURIComponent("Henna booking request – " + d.get("name")) +
        "&body=" + encodeURIComponent(text);
    } else {
      window.open(waLink(text), "_blank", "noopener");
    }
  });
  $$("input, select, textarea", form).forEach(function (f) {
    f.addEventListener("input", function () { f.classList.remove("invalid"); });
  });

  // ---- Mobile menu ----
  var toggle = $(".nav-toggle"), menu = $("#nav-menu");
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  $$("a", menu).forEach(function (a) {
    a.addEventListener("click", function () {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // ---- Footer year ----
  $("#year").textContent = today.getFullYear();

  // ---- Reveal on scroll ----
  $$(".section-head, .about > *, .gallery-item, .book > *, .contact > *").forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
