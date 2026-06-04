// ============================================================
//  APP.JS — Recursos Esri EC
// ============================================================

// ---------- STATE ----------
const state = {
  recursos:    [],
  filtered:    [],
  activeTag:   "all",
  searchQuery: "",
  sort:        "recent",
  isDemo:      false,
};

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  buildTagsFilter();
  buildTagsSelector();
  setupSearch();
  setupNavigation();
  setupSort();

  // Auth
  Auth.onChange(onAuthChange);
  Auth.init();

  // Load resources (public read)
  loadRecursos();
});

// ---------- AUTH ----------
function onAuthChange({ user }) {
  const btnLogin  = document.getElementById("btn-login");
  const userPill  = document.getElementById("user-pill");
  const authLoading = document.getElementById("auth-loading");
  const userName  = document.getElementById("user-name");
  const userAv    = document.getElementById("user-avatar");

  authLoading.classList.add("hidden");

  if (user) {
    btnLogin.classList.add("hidden");
    userPill.classList.remove("hidden");
    userName.textContent = user.fullName || user.username;
    userAv.textContent   = (user.fullName || user.username).charAt(0).toUpperCase();

    if (user.thumbnailUrl) {
      const img = document.createElement("img");
      img.src = user.thumbnailUrl;
      img.alt = user.fullName;
      img.style.cssText = "width:100%;height:100%;border-radius:50%;object-fit:cover;";
      userAv.innerHTML = "";
      userAv.appendChild(img);
    }

    // Show form if we're on agregar view
    updateAgregarView(true);
  } else {
    btnLogin.classList.remove("hidden");
    userPill.classList.add("hidden");
    updateAgregarView(false);
  }
}

function updateAgregarView(isLogged) {
  const wall    = document.getElementById("login-wall");
  const wrapper = document.getElementById("form-wrapper");
  if (!wall || !wrapper) return;
  if (isLogged) {
    wall.classList.add("hidden");
    wrapper.classList.remove("hidden");
  } else {
    wall.classList.remove("hidden");
    wrapper.classList.add("hidden");
  }
}

function login()  { Auth.login();  }
function logout() { Auth.logout(); }

// ---------- NAVIGATION ----------
function setupNavigation() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      document.querySelectorAll(".nav-btn").forEach(b => {
        b.classList.remove("active");
        b.removeAttribute("aria-current");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-current", "page");
      showView(view);
    });
  });
}

function showView(name) {
  document.querySelectorAll(".view").forEach(v => {
    v.classList.add("hidden");
    v.classList.remove("active");
  });
  const el = document.getElementById("view-" + name);
  if (el) { el.classList.remove("hidden"); el.classList.add("active"); }

  if (name === "agregar") {
    updateAgregarView(Auth.isLoggedIn());
  }
}

function goToView(name) {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === name);
    if (btn.dataset.view === name) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
  showView(name);
}

// ---------- TAGS ----------
function buildTagsFilter() {
  const container = document.getElementById("tags-filter");
  document.querySelector('#tags-filter [data-tag="all"]').addEventListener("click", () => {
    filterByTag("all", document.querySelector('#tags-filter [data-tag="all"]'));
  });
  CONFIG.TAGS.forEach(tag => {
    const btn = document.createElement("button");
    btn.className = `tag-chip tag-${tag.color}`;
    btn.dataset.tag = tag.id;
    btn.textContent = tag.label;
    btn.addEventListener("click", () => filterByTag(tag.id, btn));
    container.appendChild(btn);
  });
}

function buildTagsSelector() {
  const container = document.getElementById("tags-selector");
  CONFIG.TAGS.forEach(tag => {
    const label = document.createElement("label");
    label.className = "tag-check-label";
    label.innerHTML = `
      <input type="checkbox" value="${tag.id}" class="tag-checkbox" />
      <span class="tag-chip tag-${tag.color}">${tag.label}</span>
    `;
    container.appendChild(label);
  });
}

function filterByTag(tagId, btn) {
  state.activeTag = tagId;
  document.querySelectorAll("#tags-filter .tag-chip").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  applyFilters();
}

// ---------- SEARCH ----------
function setupSearch() {
  const input = document.getElementById("search-input");
  let debounce;
  input.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      state.searchQuery = input.value.trim().toLowerCase();
      applyFilters();
    }, 200);
  });
  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); input.focus(); input.select(); }
    if (e.key === "Escape") { closeModal(); input.blur(); }
  });
}

// ---------- SORT ----------
function setupSort() {
  document.getElementById("sort-select").addEventListener("change", e => {
    state.sort = e.target.value;
    applyFilters();
  });
}

// ---------- LOAD ----------
async function loadRecursos() {
  const isConfigured = CONFIG.FEATURE_LAYER_URL && CONFIG.FEATURE_LAYER_URL !== "TU_FEATURE_LAYER_URL_AQUI";

  if (!isConfigured) {
    state.recursos = CONFIG.DEMO_DATA;
    state.isDemo   = true;
    showDemoBanner();
    updateHeroStats();
    applyFilters();
    return;
  }

  try {
    const features = await FeatureAPI.query();
    state.recursos  = features;
    state.isDemo    = false;
    updateHeroStats();
    applyFilters();
  } catch (err) {
    console.error(err);
    showErrorBanner("No se pudo conectar con la Feature Layer. Mostrando datos de ejemplo.");
    state.recursos = CONFIG.DEMO_DATA;
    state.isDemo   = true;
    updateHeroStats();
    applyFilters();
  }
}

// ---------- FILTER & RENDER ----------
function applyFilters() {
  const F = CONFIG.FIELDS;
  let data = [...state.recursos];

  if (state.searchQuery) {
    const q = state.searchQuery;
    data = data.filter(r =>
      (r[F.TITULO]      || "").toLowerCase().includes(q) ||
      (r[F.DESCRIPCION] || "").toLowerCase().includes(q) ||
      (r[F.ETIQUETAS]   || "").toLowerCase().includes(q) ||
      (r[F.TIPO]        || "").toLowerCase().includes(q)
    );
  }

  if (state.activeTag !== "all") {
    data = data.filter(r =>
      (r[F.ETIQUETAS] || "").split(",").map(t => t.trim()).includes(state.activeTag)
    );
  }

  if (state.sort === "alpha") {
    data.sort((a, b) => (a[F.TITULO] || "").localeCompare(b[F.TITULO] || ""));
  } else if (state.sort === "tipo") {
    data.sort((a, b) => (a[F.TIPO] || "").localeCompare(b[F.TIPO] || ""));
  } else {
    // recent: ya vienen ordenados por fecha DESC desde la API, revertimos para demo
    if (state.isDemo) data.reverse();
  }

  state.filtered = data;
  renderGrid(data);
  updateStats(data.length);
}

function renderGrid(data) {
  const grid    = document.getElementById("recursos-grid");
  const loading = document.getElementById("loading-state");
  const empty   = document.getElementById("empty-state");

  loading.classList.add("hidden");
  grid.querySelectorAll(".resource-card").forEach(c => c.remove());

  if (data.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  data.forEach(r => grid.appendChild(buildCard(r)));
}

function buildCard(r) {
  const F = CONFIG.FIELDS;
  const tags = (r[F.ETIQUETAS] || "").split(",").map(t => t.trim()).filter(Boolean);
  const tagObjs = tags.map(tid => CONFIG.TAGS.find(t => t.id === tid)).filter(Boolean);

  const card = document.createElement("article");
  card.className = "resource-card";
  card.setAttribute("role", "listitem");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", r[F.TITULO]);

  card.innerHTML = `
    <div class="card-header">
      <div class="card-tipo ${getTipoClass(r[F.TIPO])}">
        ${getTipoIcon(r[F.TIPO])}
        ${r[F.TIPO] || "Recurso"}
      </div>
      <a href="${r[F.URL]}" target="_blank" rel="noopener noreferrer" class="card-ext-link" aria-label="Abrir en nueva pestaña" tabindex="-1">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>
    </div>
    <h3 class="card-title">${esc(r[F.TITULO])}</h3>
    <p class="card-desc">${esc(r[F.DESCRIPCION])}</p>
    <div class="card-footer">
      <div class="card-tags">
        ${tagObjs.slice(0, 3).map(t => `<span class="tag-pill tag-${t.color}">${t.label}</span>`).join("")}
        ${tagObjs.length > 3 ? `<span class="tag-pill tag-gray">+${tagObjs.length - 3}</span>` : ""}
      </div>
      <div class="card-meta">
        ${r[F.FECHA] ? `<span class="card-date">${fmtDate(r[F.FECHA])}</span>` : ""}
        ${r[F.AUTOR] ? `<span class="card-author">${esc(r[F.AUTOR])}</span>` : ""}
      </div>
    </div>
  `;

  card.addEventListener("click", e => { if (!e.target.closest("a")) openModal(r); });
  card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(r); } });
  return card;
}

function updateStats(count) {
  const isFiltered = state.activeTag !== "all" || state.searchQuery;
  document.getElementById("count-label").textContent = isFiltered
    ? `${count} resultado${count !== 1 ? "s" : ""}`
    : `${count} recurso${count !== 1 ? "s" : ""} disponible${count !== 1 ? "s" : ""}`;
}

// ---------- MODAL ----------
function openModal(r) {
  const F = CONFIG.FIELDS;
  const tags = (r[F.ETIQUETAS] || "").split(",").map(t => t.trim()).filter(Boolean);
  const tagObjs = tags.map(tid => CONFIG.TAGS.find(t => t.id === tid)).filter(Boolean);

  document.getElementById("modal-body").innerHTML = `
    <div class="modal-tipo ${getTipoClass(r[F.TIPO])}">${getTipoIcon(r[F.TIPO])} ${r[F.TIPO] || "Recurso"}</div>
    <h2 id="modal-title" class="modal-title">${esc(r[F.TITULO])}</h2>
    <p class="modal-desc">${esc(r[F.DESCRIPCION])}</p>
    <div class="modal-url-row">
      <a href="${r[F.URL]}" target="_blank" rel="noopener noreferrer" class="btn-primary modal-url-btn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Abrir recurso
      </a>
      <button class="btn-copy" onclick="copyURL('${r[F.URL]}')" aria-label="Copiar URL">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        Copiar URL
      </button>
    </div>
    ${tagObjs.length ? `
    <div class="modal-section">
      <p class="modal-section-label">Aplicaciones</p>
      <div class="modal-tags">${tagObjs.map(t => `<span class="tag-pill tag-${t.color}">${t.label}</span>`).join("")}</div>
    </div>` : ""}
    <div class="modal-info-row">
      ${r[F.AUTOR] ? `<div class="modal-info-item"><span class="modal-info-lbl">Compartido por</span><span>${esc(r[F.AUTOR])}</span></div>` : ""}
      ${r[F.FECHA] ? `<div class="modal-info-item"><span class="modal-info-lbl">Fecha</span><span>${fmtDate(r[F.FECHA])}</span></div>` : ""}
    </div>
  `;

  const overlay = document.getElementById("modal-overlay");
  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => { overlay.querySelector("button, a")?.focus(); }, 50);
}

function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

document.getElementById("modal-overlay").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeModal();
});

// ---------- SUBMIT ----------
async function submitRecurso() {
  if (!Auth.isLoggedIn()) { showToast("Inicia sesión primero."); return; }

  const F = CONFIG.FIELDS;
  const titulo      = document.getElementById("f-titulo").value.trim();
  const url         = document.getElementById("f-url").value.trim();
  const descripcion = document.getElementById("f-descripcion").value.trim();
  const tipo        = document.getElementById("f-tipo").value;
  const selectedTags = [...document.querySelectorAll(".tag-checkbox:checked")].map(cb => cb.value);

  if (!titulo || !url || !descripcion || selectedTags.length === 0) {
    showFeedback("error", "Completa los campos requeridos y selecciona al menos una etiqueta.");
    return;
  }
  if (!isValidURL(url)) {
    showFeedback("error", "La URL no es válida. Asegúrate de incluir https://");
    return;
  }

  const btn = document.getElementById("btn-submit");
  btn.disabled = true;
  btn.textContent = "Guardando…";

  const attrs = {
    [F.TITULO]:      titulo,
    [F.URL]:         url,
    [F.DESCRIPCION]: descripcion,
    [F.TIPO]:        tipo || "Otro",
    [F.ETIQUETAS]:   selectedTags.join(","),
  };

  if (state.isDemo) {
    // Demo mode
    const nuevo = { OBJECTID: Date.now(), ...attrs, [F.AUTOR]: Auth.getUser()?.fullName || "Yo", [F.FECHA]: new Date().toISOString().split("T")[0] };
    state.recursos.unshift(nuevo);
    showFeedback("success", "✅ Recurso guardado (modo demo — configura la Feature Layer para persistir).");
    clearForm();
    setTimeout(() => { goToView("recursos"); applyFilters(); }, 1400);
  } else {
    try {
      await FeatureAPI.addFeature(attrs);
      // Recargar desde la API para reflejar el nuevo recurso
      const features = await FeatureAPI.query();
      state.recursos  = features;
      showFeedback("success", "✅ Recurso guardado en ArcGIS Online.");
      clearForm();
      setTimeout(() => { goToView("recursos"); applyFilters(); }, 1400);
    } catch (err) {
      showFeedback("error", `Error al guardar: ${err.message}`);
    }
  }

  btn.disabled = false;
  btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Guardar recurso`;
}

function showFeedback(type, msg) {
  const el = document.getElementById("form-feedback");
  el.className = `form-feedback form-feedback--${type}`;
  el.textContent = msg;
  el.classList.remove("hidden");
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearForm() {
  ["f-titulo", "f-url", "f-descripcion"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("f-tipo").value = "";
  document.querySelectorAll(".tag-checkbox").forEach(cb => cb.checked = false);
  document.getElementById("form-feedback").classList.add("hidden");
}

// ---------- UTILS ----------
function clearFilters() {
  state.activeTag   = "all";
  state.searchQuery = "";
  document.getElementById("search-input").value = "";
  document.querySelectorAll("#tags-filter .tag-chip").forEach(b => b.classList.remove("active"));
  document.querySelector('#tags-filter [data-tag="all"]').classList.add("active");
  applyFilters();
}

function copyURL(url) {
  navigator.clipboard.writeText(url)
    .then(() => showToast("URL copiada"))
    .catch(() => showToast("No se pudo copiar"));
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add("hidden"), 2500);
}

function showDemoBanner() {
  const b = document.createElement("div");
  b.className = "demo-banner";
  b.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    Modo demo — configura tu Feature Layer en <code>js/config.js</code> para usar datos reales.
    <a href="README.md" target="_blank">Ver instrucciones</a>
  `;
  document.querySelector(".search-hero").insertAdjacentElement("beforebegin", b);
}

function showErrorBanner(msg) {
  const b = document.createElement("div");
  b.className = "demo-banner demo-banner--error";
  b.textContent = msg;
  document.querySelector(".search-hero").insertAdjacentElement("beforebegin", b);
}

function isValidURL(s) { try { new URL(s); return true; } catch { return false; } }
function esc(s) {
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function fmtDate(d) {
  if (!d) return "";
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString("es-EC", { year: "numeric", month: "short", day: "numeric" });
  } catch { return d; }
}

function getTipoClass(tipo) {
  return { Demo:"tipo-demo", Tutorial:"tipo-tutorial", "Documentación":"tipo-doc", "Story Map":"tipo-storymap", App:"tipo-app", Webinar:"tipo-webinar", Notebook:"tipo-notebook", Dashboard:"tipo-dashboard" }[tipo] || "tipo-otro";
}

function getTipoIcon(tipo) {
  const icons = {
    Demo:          `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    Tutorial:      `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>`,
    Documentación: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    "Story Map":   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>`,
    App:           `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    Webinar:       `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
    Notebook:      `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>`,
    Dashboard:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
  };
  return icons[tipo] || `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`;
}

// ---------- HERO STATS ----------
function updateHeroStats() {
  const F = CONFIG.FIELDS;
  if (!state.recursos.length) return;

  const total = state.recursos.length;
  const tipos = [...new Set(
    state.recursos.map(r => r[F.TIPO] || r.tipo || r.Tipo).filter(Boolean)
  )].length;
  const apps = [...new Set(
    state.recursos.flatMap(r => {
      const tags = r[F.ETIQUETAS] || r.etiquetas || r.Etiquetas || "";
      return tags.split(",").map(t => t.trim()).filter(Boolean);
    })
  )].length;

  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  set("stat-total", total);
  set("stat-tipos", tipos);
  set("stat-apps",  apps);
}