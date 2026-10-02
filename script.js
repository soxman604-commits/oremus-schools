/* =====================================================================
   OREMUS SCHOOLS LTD - SITE CONFIG
   Fill these in when the school's details are confirmed, then redeploy.
   - phones:   list of { display, tel } (tel in international format)
   - whatsapp: international format, digits only, e.g. "260971234567"
               (PROVISIONAL: 260968304574, not yet confirmed as a WhatsApp number)
   - email:    e.g. "info@oremusschools.com"
   - hours:    office hours text (use <br> for new lines)
   Leave a value as "" to keep the "Coming soon" placeholder; related
   buttons (Call / WhatsApp / Email) stay hidden or fall back gracefully.
   ===================================================================== */
const CONFIG = {
  schoolName: "Oremus Schools Ltd",
  phones: [
    { display: "096 830 4574", tel: "+260968304574" },
    { display: "096 830 4575", tel: "+260968304575" }
  ],
  whatsapp: "260968304574", // provisional, confirm this number is on WhatsApp
  email: "oremusschoolsltd@gmail.com",
  hours: "Monday – Friday: 07:20 – 17:00<br>Saturday &amp; Sunday: Closed", // e.g. "Monday – Friday: 07:30 – 16:30<br>Saturday: 08:00 – 12:00"
  address: "Mapanza Street, Ndola, Zambia",
  // Staff shown in "Our principal & staff" (leave empty to show none), e.g.
  // staff: [{ name: "Jane Doe", title: "Principal" }, { name: "John Doe", title: "Deputy Head" }]
  staff: []
};
/* ===================================================================== */

(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const phones = (CONFIG.phones || []).filter(p => p && p.tel);
  const toTel = t => "tel:" + String(t).replace(/[^\d+]/g, "");
  const telHref = phones.length ? toTel(phones[0].tel) : "";
  const wa = (CONFIG.whatsapp || "").replace(/\D/g, "");
  const email = (CONFIG.email || "").trim();

  // Year
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  // Contact details / placeholders
  const setContact = (key, html, href) => {
    $$('[data-contact="' + key + '"]').forEach(el => {
      if (html) { el.innerHTML = href ? '<a href="' + href + '">' + html + "</a>" : html; el.classList.remove("pending"); }
      else el.classList.add("pending");
    });
  };
  $$('[data-contact="phone"]').forEach(el => {
    if (!phones.length) { el.classList.add("pending"); return; }
    el.textContent = "";
    phones.forEach((p, i) => {
      if (i) el.appendChild(document.createTextNode(" / "));
      const a = document.createElement("a"); a.href = toTel(p.tel); a.textContent = p.display || p.tel; el.appendChild(a);
    });
    el.classList.remove("pending");
  });
  // Extra call buttons, one per number (contact section)
  const callWrap = $("[data-call-list]");
  if (callWrap) phones.forEach(p => {
    const a = document.createElement("a"); a.className = "btn btn-maroon"; a.href = toTel(p.tel); a.textContent = "Call " + (p.display || p.tel); callWrap.appendChild(a);
  });
  const waPhone = phones.find(p => String(p.tel).replace(/\D/g, "") === wa);
  setContact("whatsapp", wa ? (waPhone ? waPhone.display : "+" + wa) : "", wa ? "https://wa.me/" + wa : "");
  setContact("email", email, email ? "mailto:" + email : "");
  if (CONFIG.hours) setContact("hours", CONFIG.hours); else $$('[data-contact="hours"]').forEach(e => e.classList.add("pending"));

  // Call buttons: hero one falls back to "Contact us" (#contact); others hidden
  $$("[data-call]").forEach(el => {
    if (telHref) { el.href = telHref; el.hidden = false; el.textContent = "Call us"; el.setAttribute("aria-label", "Call " + phones[0].display); }
    else if (el.closest(".hero")) { el.href = "#contact"; el.textContent = "Contact us"; }
    else el.hidden = true;
  });
  // WhatsApp buttons: hidden until number is set
  $$("[data-wa]").forEach(el => {
    if (wa) { el.href = "https://wa.me/" + wa + "?text=" + encodeURIComponent("Hello " + CONFIG.schoolName + ", I would like to enquire about admissions."); el.hidden = false; }
    else el.hidden = true;
  });

  // Staff list
  const dl = $(".staff-list");
  if (dl && Array.isArray(CONFIG.staff) && CONFIG.staff.length) {
    CONFIG.staff.forEach(d => {
      const li = document.createElement("li");
      const n = document.createElement("strong"); n.textContent = d.name || ""; li.appendChild(n);
      if (d.title) { const t = document.createElement("span"); t.textContent = d.title; li.appendChild(t); }
      dl.appendChild(li);
    });
    dl.hidden = false;
  }

  // Mobile menu
  const btn = $(".menu-btn"), menu = $("#menu");
  const closeMenu = () => { menu.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-label", "Open menu"); };
  btn.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  $$("a", menu).forEach(a => a.addEventListener("click", closeMenu));
  document.addEventListener("click", e => { if (!e.target.closest(".nav")) closeMenu(); });

  // Enquiry form
  const form = $("#enquiry");
  const errEl = $(".form-error", form);
  const fallback = $(".form-fallback", form);
  const copyBtn = $(".copy-btn", form);
  const waBtn = $('[data-via="whatsapp"]', form);
  const emBtn = $('[data-via="email"]', form);
  if (!wa) waBtn.hidden = true;
  if (!email) emBtn.hidden = true;
  if (!wa && !email) {
    fallback.hidden = false;
    copyBtn.hidden = false;
  }

  const buildMessage = () => {
    const d = new FormData(form);
    const lines = [
      "Admissions enquiry - " + CONFIG.schoolName,
      "Pupil name: " + (d.get("pupil") || "").trim(),
      "Grade applying for: " + (d.get("grade") || ""),
      "Candidate type: " + (d.get("type") || ""),
      "Parent/guardian name: " + (d.get("parent") || "").trim(),
      "Parent/guardian phone: " + (d.get("phone") || "").trim()
    ];
    const msg = (d.get("msg") || "").trim();
    if (msg) lines.push("Message: " + msg);
    return lines.join("\n");
  };
  const validate = () => {
    let ok = true;
    ["pupil", "grade", "parent", "phone"].forEach(n => {
      const el = form.elements[n];
      const bad = !String(el.value).trim() || (n === "phone" && String(el.value).replace(/\D/g, "").length < 9);
      el.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    errEl.hidden = ok;
    if (!ok) errEl.textContent = "Please fill in the pupil's name, grade, parent/guardian name and a valid phone number.";
    return ok;
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!validate()) return;
    const via = (e.submitter && e.submitter.dataset.via) || (wa ? "whatsapp" : "email");
    const text = buildMessage();
    if (via === "whatsapp" && wa) {
      window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    } else if (via === "email" && email) {
      const pupil = form.elements.pupil.value.trim();
      window.location.href = "mailto:" + email + "?subject=" + encodeURIComponent("Admissions enquiry: " + pupil) + "&body=" + encodeURIComponent(text);
    } else {
      fallback.hidden = false; copyBtn.hidden = false;
    }
  });
  form.addEventListener("input", e => { if (e.target.classList.contains("invalid")) e.target.classList.remove("invalid"); });

  copyBtn.addEventListener("click", async () => {
    if (!validate()) return;
    const text = buildMessage();
    try { await navigator.clipboard.writeText(text); copyBtn.textContent = "Copied ✓"; }
    catch (_) { window.prompt("Copy your details:", text); }
    setTimeout(() => { copyBtn.textContent = "Copy my details"; }, 2500);
  });

  // Lightbox
  const items = $$(".g-item");
  const lb = $(".lightbox"), lbImg = $("img", lb), lbCap = $("figcaption", lb);
  const webp = document.createElement("canvas").toDataURL("image/webp").indexOf("data:image/webp") === 0;
  let idx = 0, lastFocus = null;
  const show = i => {
    idx = (i + items.length) % items.length;
    const it = items[idx];
    lbImg.src = webp ? it.dataset.full : it.dataset.fallback;
    lbImg.alt = $("img", it).alt;
    lbCap.textContent = it.dataset.caption || "";
  };
  const open = i => { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = "hidden"; $(".lb-close", lb).focus(); };
  const close = () => { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
  items.forEach((it, i) => it.addEventListener("click", () => open(i)));
  $(".lb-close", lb).addEventListener("click", close);
  $(".lb-prev", lb).addEventListener("click", () => show(idx - 1));
  $(".lb-next", lb).addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", e => { if (e.target === lb) close(); });
  document.addEventListener("keydown", e => {
    if (lb.hidden) { if (e.key === "Escape") closeMenu(); return; }
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  let sx = null;
  lb.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (sx === null) return; const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1)); sx = null;
  });
})();
