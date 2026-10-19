const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = (k, v) => { try { if (v !== undefined) localStorage.setItem(k, v); return localStorage.getItem(k); } catch (e) { return null; } };

/* Language */
let lang = store("lang") || ((navigator.language || "en").toLowerCase().startsWith("ru") ? "ru" : "en");
const t = k => I18N[lang][k] ?? I18N.en[k] ?? k;
const L = o => o[lang] || o.en;

function applyStatic() {
  document.documentElement.lang = lang;
  document.title = t("meta.title");
  $('meta[name="description"]').content = t("meta.desc");
  $$("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
  $$("[data-i18n-ph]").forEach(el => el.placeholder = t(el.dataset.i18nPh));
  $$("[data-i18n-aria]").forEach(el => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  $$(".langsw button").forEach(b => b.setAttribute("aria-pressed", b.dataset.l === lang));
}
$(".langsw").onclick = e => {
  const b = e.target.closest("button"); if (!b || b.dataset.l === lang) return;
  lang = b.dataset.l; store("lang", lang); applyStatic(); renderAll();
};

/* Theme, menu, progress, active section */
$("#theme").onclick = () => { const d = document.documentElement, n = d.dataset.theme === "dark" ? "light" : "dark"; d.dataset.theme = n; store("theme", n); };
const menu = $("#menu"), burger = $("#burger");
burger.onclick = () => { const o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); };
menu.onclick = e => { if (e.target.closest("a")) { menu.classList.remove("open"); burger.setAttribute("aria-expanded", false); } };
addEventListener("scroll", () => {
  const h = document.documentElement;
  $("#progress").style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%";
}, { passive: true });
const secObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) $$("#menu a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => secObs.observe(s));

/* Reveal and counters */
const rvObs = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in"); rvObs.unobserve(e.target);
  const n = $("[data-count]", e.target);
  if (e.target.classList.contains("stat") && n) count(n);
}), { threshold: .2 });
function observeRv(list) { list.forEach((el, i) => { el.classList.add("rv"); el.style.transitionDelay = (i % 4) * 70 + "ms"; rvObs.observe(el); }); }
function count(el) {
  const to = +el.dataset.count, t0 = performance.now();
  (function tick(now) { const k = Math.min((now - t0) / 1100, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + (k === 1 ? "+" : ""); if (k < 1) requestAnimationFrame(tick); })(t0);
}
observeRv($$(".stat, .steps li"));

/* Hero cards (parallax) and marquee */
const hero = $("#hero");
hero.addEventListener("pointermove", e => {
  const r = hero.getBoundingClientRect();
  hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width - .5).toFixed(3));
  hero.style.setProperty("--my", ((e.clientY - r.top) / r.height - .5).toFixed(3));
});
function renderHero() {
  const d = [14, 26, 40];
  $("#heroStack").innerHTML = PROJECTS.slice(0, 3).map((p, i) => `
    <div class="shot s${i}" style="--d:${d[i]}"><div class="face" style="background:linear-gradient(145deg,${p.c1},${p.c2})">
      ${p.img ? `<img src="${p.img}" alt="">` : ""}<small>${t("type." + p.type)}</small><b>${L(p.title)}</b></div></div>`).join("");
  const row = t("words").split("|").map(w => `<span>${w}</span>`).join("");
  $("#track").innerHTML = row + row;
}

/* Projects */
let curType = "all", q = "";
const ext = 'target="_blank" rel="noopener noreferrer"';
const coverHtml = p => {
  const inner = p.img ? `<img src="${p.img}" alt="${L(p.title)}" loading="lazy">` : `<span>${L(p.title).split(/[ :]/)[0]}</span>`;
  const st = `background:linear-gradient(135deg,${p.c1},${p.c2})`;
  return p.live ? `<a class="cover" href="${p.live}" ${ext} style="${st}" aria-label="${t("btn.play")}: ${L(p.title)}">${inner}</a>` : `<div class="cover" style="${st}">${inner}</div>`;
};
function renderProjects() {
  const types = ["all", ...new Set(PROJECTS.map(p => p.type))];
  $("#filters").innerHTML = types.map(k => `<button aria-pressed="${k === curType}" data-t="${k}">${t("type." + k)}</button>`).join("");
  const list = PROJECTS.filter(p => (curType === "all" || p.type === curType) && (L(p.title) + " " + L(p.tags).join(" ")).toLowerCase().includes(q));
  $("#projectGrid").innerHTML = list.map(p => `
    <article class="card">
      ${coverHtml(p)}
      <div class="body"><h3>${L(p.title)}</h3>
        <div class="tags">${L(p.tags).map(x => `<span>${x}</span>`).join("")}</div>
        <p>${L(p.desc)}</p>
        <div class="links">
          ${p.live ? `<a class="btn sm" href="${p.live}" ${ext}>${t("btn.play")}</a>` : ""}
          ${p.repo ? `<a class="btn sm dark" href="${p.repo}" ${ext}>${t("btn.repo")}</a>` : ""}
        </div>
      </div>
    </article>`).join("");
  $("#empty").hidden = list.length > 0;
  observeRv($$("#projectGrid .card"));
}
$("#filters").onclick = e => { const b = e.target.closest("button"); if (b) { curType = b.dataset.t; renderProjects(); } };
$("#search").oninput = e => { q = e.target.value.trim().toLowerCase(); renderProjects(); };

const grid = $("#projectGrid");
grid.addEventListener("pointermove", e => {
  const c = e.target.closest(".card"); if (!c || e.pointerType !== "mouse") return;
  const r = c.getBoundingClientRect();
  c.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 6 + "deg");
  c.style.setProperty("--rx", (.5 - (e.clientY - r.top) / r.height) * 6 + "deg");
});
grid.addEventListener("pointerout", e => { const c = e.target.closest(".card"); if (c) { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); } });

/* Gallery and lightbox */
const hues = ["#2b6cb0", "#d6336c", "#6741d9", "#0b7285", "#e8590c", "#2f9e44", "#c2255c", "#364fc7"];
const tile = (g, i) => g.src ? `<img src="${g.src}" alt="${L(g.alt)}" loading="lazy">` : `<div class="ph" style="background:linear-gradient(135deg,${hues[i % 8]},${hues[(i + 3) % 8]})">${L(g.alt)}</div>`;
const lb = $("#lb"); let li = 0;
function renderGallery() {
  $("#gal").innerHTML = GALLERY.map((g, i) => `<button data-i="${i}" aria-label="${t("aria.open")}: ${L(g.alt)}">${tile(g, i)}</button>`).join("");
  observeRv($$("#gal button"));
}
function showLb(i) { li = (i + GALLERY.length) % GALLERY.length; $("#lbBody").innerHTML = tile(GALLERY[li], li); $("#lbCap").textContent = `${L(GALLERY[li].alt)} · ${li + 1}/${GALLERY.length}`; }
$("#gal").onclick = e => { const b = e.target.closest("button"); if (b) { showLb(+b.dataset.i); lb.showModal(); } };
$(".prev", lb).onclick = () => showLb(li - 1);
$(".next", lb).onclick = () => showLb(li + 1);
lb.addEventListener("click", e => { if (e.target === lb || e.target.classList.contains("x")) lb.close(); });
lb.addEventListener("keydown", e => { if (e.key === "ArrowLeft") showLb(li - 1); if (e.key === "ArrowRight") showLb(li + 1); });

/* Contact form */
const form = $("#leadForm"), msg = $("#msg"), btn = $("#send"), phone = form.phone;
phone.addEventListener("focus", () => { if (!phone.value) phone.value = "+996 "; });
phone.addEventListener("blur", () => { if (phone.value.trim() === "+996") phone.value = ""; });
form.addEventListener("submit", async e => {
  e.preventDefault(); msg.className = "msg";
  if (!form.checkValidity()) { msg.textContent = t("f.invalid"); msg.classList.add("err"); return; }
  btn.disabled = true; btn.textContent = t("f.sending");
  try {
    const r = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    if (!r.ok) throw 0;
    msg.textContent = t("f.ok"); msg.classList.add("ok"); form.reset();
  } catch { msg.textContent = t("f.err"); msg.classList.add("err"); }
  btn.disabled = false; btn.textContent = t("c.btn");
});

function renderAll() { renderHero(); renderProjects(); renderGallery(); msg.textContent = ""; }
applyStatic(); renderAll();
