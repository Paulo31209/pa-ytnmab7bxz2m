/* Plano de Ação — app local estilo Notion. Tudo fica salvo no navegador (localStorage).
   Use "Backup" para baixar um .json e "Importar" para carregar em outro PC/navegador. */
(function () {
  "use strict";

  const KEY = "plano-acao-v1";
  const $ = (s, el = document) => el.querySelector(s);
  const main = $("#main");
  const uid = () => Math.random().toString(36).slice(2, 10);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const PRIO_BADGE = { "Crítica": "badge-destructive", "Alta": "badge-warning", "Média": "badge-info", "Baixa": "badge-outline" };
  const PRIO_ORDER = { "Crítica": 0, "Alta": 1, "Média": 2, "Baixa": 3 };
  const COLS = ["nome", "funcao", "ip", "provedor", "so", "servicos", "dominios", "ssl", "backup", "custo", "obs"];
  const COL_LABEL = { nome: "Nome", funcao: "Função", ip: "IP / acesso", provedor: "Provedor", so: "Sistema", servicos: "Serviços / portas", dominios: "Domínios", ssl: "SSL vence em", backup: "Backup", custo: "Custo/mês", obs: "Observações" };

  /* ---------------- Estado ---------------- */
  const fromDefault = (d) => ({
    id: uid(), key: d.key, num: d.num, icon: d.icon, title: d.title, summary: d.summary,
    priority: d.priority, status: d.status, area: d.area, depends: d.depends,
    owner: "", due: "", notes: "",
    tasks: d.tasks.map((t) => ({ id: uid(), text: t, done: false })),
  });
  function makeDefaults() {
    return {
      v: 1,
      demandas: DEFAULT_DEMANDAS.map(fromDefault),
      seeded: DEFAULT_DEMANDAS.map((d) => d.key),
      servers: DEFAULT_SERVERS.map((s) => ({ id: uid(), ...s })),
      diario: [],
    };
  }
  // No app instalado (window.desktop) os dados ficam num arquivo em Documentos;
  // aberto no navegador, ficam no localStorage.
  const DESK = window.desktop || null;
  let dataInfo = null;
  function load() {
    try {
      let raw = null;
      if (DESK) { dataInfo = DESK.load(); raw = dataInfo.data; }
      if (!raw) raw = localStorage.getItem(KEY);
      if (raw) { const s = JSON.parse(raw); if (s && Array.isArray(s.demandas)) return normalize(s); }
    } catch (e) { /* armazenamento indisponível: usa o padrão */ }
    return makeDefaults();
  }
  function normalize(s) {
    s.servers = Array.isArray(s.servers) ? s.servers : [];
    s.diario = Array.isArray(s.diario) ? s.diario : [];
    s.demandas.forEach((d) => { d.id ||= uid(); d.tasks = Array.isArray(d.tasks) ? d.tasks : []; d.tasks.forEach((t) => (t.id ||= uid())); });
    s.servers.forEach((r) => (r.id ||= uid()));
    s.diario.forEach((r) => (r.id ||= uid()));
    // Demandas novas do plano entram sozinhas, sem mexer no que já foi editado
    // (e sem recriar as que a pessoa excluiu de propósito).
    if (!Array.isArray(s.seeded)) s.seeded = s.demandas.map((d) => d.key).filter(Boolean);
    DEFAULT_DEMANDAS.forEach((d) => {
      if (s.seeded.includes(d.key)) return;
      s.seeded.push(d.key);
      if (!s.demandas.some((x) => x.key === d.key)) { s.demandas.push(fromDefault(d)); s._added = true; }
    });
    return s;
  }
  let state = load();
  const addedOnLoad = !!state._added; delete state._added;

  let saveTimer, savedTimer, pending = false;
  const SAVE_FAIL = "⚠ Não foi possível salvar — use Backup";
  function writeNow(sync) {
    pending = false; clearTimeout(saveTimer);
    state.updated = new Date().toISOString();
    const json = JSON.stringify(state, null, 2);
    if (DESK) {
      if (sync) return DESK.saveSync(json);
      DESK.save(json).then(() => flashSaved("Salvo no computador ✓"), () => flashSaved(SAVE_FAIL));
      return;
    }
    try { localStorage.setItem(KEY, json); flashSaved("Salvo ✓"); }
    catch (e) { flashSaved(SAVE_FAIL); }
  }
  function save() {
    pending = true; clearTimeout(saveTimer);
    saveTimer = setTimeout(() => writeNow(false), 300);
  }
  // Ao fechar a janela, grava o que ainda estiver pendente.
  window.addEventListener("beforeunload", () => { if (pending) writeNow(true); });
  function flashSaved(msg) {
    const el = $("#saved"); el.textContent = msg; el.classList.add("show");
    clearTimeout(savedTimer); savedTimer = setTimeout(() => el.classList.remove("show"), 1600);
  }

  const byId = (id) => state.demandas.find((d) => d.id === id);
  const prog = (d) => { const t = d.tasks.length, k = d.tasks.filter((x) => x.done).length; return { t, k, p: t ? Math.round((k / t) * 100) : 0 }; };
  const statusOf = (id) => STATUS.find((s) => s.id === id) || STATUS[0];
  const statusBadge = (id) => { const s = statusOf(id); return `<span class="badge ${s.badge}">${esc(s.label)}</span>`; };
  const prioBadge = (p) => `<span class="badge ${PRIO_BADGE[p] || "badge-outline"}">${esc(p)}</span>`;
  const numOf = (d) => { const n = parseFloat(d.num); return isNaN(n) ? 999 : n; };
  const sorted = () => [...state.demandas].sort((a, b) => numOf(a) - numOf(b));

  /* ---------------- Rotas ---------------- */
  function route() {
    const h = location.hash.replace(/^#\/?/, "");
    const [a, b] = h.split("/");
    if (a === "d" && b && byId(b)) return { name: "demanda", id: b };
    if (a === "quadro") return { name: "quadro" };
    if (a === "servidores") return { name: "servidores" };
    if (a === "diario") return { name: "diario" };
    return { name: "inicio" };
  }

  function render() {
    const r = route();
    main.classList.toggle("wide", r.name === "quadro" || r.name === "servidores");
    if (r.name === "demanda") viewDemanda(byId(r.id));
    else if (r.name === "quadro") viewQuadro();
    else if (r.name === "servidores") viewServidores();
    else if (r.name === "diario") viewDiario();
    else viewInicio();
    renderSide();
    $("#shell").removeAttribute("data-nav");
  }

  /* ---------------- Barra lateral ---------------- */
  function renderSide() {
    const r = route();
    const q = $("#search").value.trim().toLowerCase();
    const cur = (cond) => (cond ? ' aria-current="page"' : "");
    const match = (d) => !q || [d.title, d.summary, d.num, d.area, d.notes, ...d.tasks.map((t) => t.text)].join(" ").toLowerCase().includes(q);
    const list = sorted().filter(match);
    $("#sideNav").innerHTML = `
      <a class="side-link" href="#/"${cur(r.name === "inicio")}><span class="ico">🏠</span><span class="txt">Visão geral</span></a>
      <a class="side-link" href="#/quadro"${cur(r.name === "quadro")}><span class="ico">🗃️</span><span class="txt">Quadro (kanban)</span></a>
      <div class="side-label">Demandas <button class="side-add" data-action="new-demanda" title="Nova demanda" aria-label="Nova demanda">＋</button></div>
      ${list.map((d) => { const p = prog(d); return `
        <a class="side-link ${d.status === "done" ? "is-done" : ""}" href="#/d/${d.id}"${cur(r.id === d.id)} title="${esc(d.title)}">
          <span class="ico">${esc(d.icon)}</span><span class="txt">${esc(d.num)} · ${esc(d.title)}</span><span class="pct">${p.p}%</span>
        </a>`; }).join("") || `<div class="side-empty">Nada encontrado para “${esc(q)}”.</div>`}
      <div class="side-label">Registros</div>
      <a class="side-link" href="#/servidores"${cur(r.name === "servidores")}><span class="ico">🖥️</span><span class="txt">Inventário de servidores</span></a>
      <a class="side-link" href="#/diario"${cur(r.name === "diario")}><span class="ico">📝</span><span class="txt">Diário / ligações</span></a>`;
  }

  function crumbs(parts) {
    $("#crumbs").innerHTML = parts.map((p, i) => (i === parts.length - 1 ? `<b>${esc(p[0])}</b>` : `<a href="${p[1]}">${esc(p[0])}</a>`)).join(" / ");
    document.title = parts[parts.length - 1][0] + " · Plano de Ação";
  }

  /* ---------------- Visão geral ---------------- */
  function viewInicio() {
    crumbs([["Visão geral"]]);
    const ds = sorted();
    const all = ds.flatMap((d) => d.tasks), feitas = all.filter((t) => t.done).length;
    const pct = all.length ? Math.round((feitas / all.length) * 100) : 0;
    const concl = ds.filter((d) => d.status === "done").length;
    const andamento = ds.filter((d) => d.status === "doing").length;
    const criticas = ds.filter((d) => d.priority === "Crítica" && d.status !== "done").length;
    const bloq = ds.filter((d) => d.status === "blocked").length;

    const proximas = ds.filter((d) => d.status !== "done")
      .sort((a, b) => (PRIO_ORDER[a.priority] ?? 9) - (PRIO_ORDER[b.priority] ?? 9) || (b.status === "doing") - (a.status === "doing"))
      .map((d) => ({ d, t: d.tasks.find((t) => !t.done) })).filter((x) => x.t).slice(0, 7);

    main.innerHTML = `
      <h1 class="hero-h">Plano de Ação</h1>
      <p class="hero-p">Rede, servidores, live redundante, apps nas lojas e alertas — tudo num lugar só. Clique em qualquer coisa para editar.</p>

      <div class="stats">
        <div class="stat"><div class="k">Progresso geral</div><div class="v">${pct}%</div><div class="progress ${pct === 100 ? "done" : ""}" style="margin-top:.5rem"><span style="--value:${pct}%"></span></div></div>
        <div class="stat"><div class="k">Tarefas feitas</div><div class="v">${feitas}<small> / ${all.length}</small></div></div>
        <div class="stat"><div class="k">Demandas concluídas</div><div class="v">${concl}<small> / ${ds.length}</small></div></div>
        <div class="stat"><div class="k">Em andamento</div><div class="v">${andamento}</div></div>
        <div class="stat"><div class="k">Críticas abertas</div><div class="v">${criticas}${bloq ? `<small> · ${bloq} bloqueada${bloq > 1 ? "s" : ""}</small>` : ""}</div></div>
      </div>

      <section class="sec">
        <div class="sec-h"><h2>Próximas ações</h2><span class="hint">A próxima tarefa de cada demanda, por prioridade</span></div>
        ${proximas.length ? `<ul class="next">${proximas.map(({ d, t }) => `
          <li><input type="checkbox" data-quick="${d.id}|${t.id}" aria-label="Concluir: ${esc(t.text)}">
            <a class="t" href="#/d/${d.id}">${esc(t.text)}<small>${esc(d.icon)} ${esc(d.num)} · ${esc(d.title)}</small></a>
            ${prioBadge(d.priority)}</li>`).join("")}</ul>` : `<div class="empty-note">🎉 Nenhuma tarefa pendente.</div>`}
      </section>

      <section class="sec">
        <div class="sec-h"><h2>Demandas</h2><button class="btn btn-sm btn-outline" data-action="new-demanda">＋ Nova demanda</button></div>
        <div class="cards">${ds.map(cardHtml).join("")}</div>
      </section>

      <section class="sec">
        <div class="sec-h"><h2>Roteiro sugerido</h2><span class="hint">Ordem que reduz risco primeiro</span></div>
        <div class="roadmap">${ROTEIRO.map((f) => `
          <div class="phase"><div class="f">${esc(f.fase)}</div><h4>${esc(f.titulo)}</h4><ul>${f.itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}
        </div>
      </section>`;
  }

  function cardHtml(d) {
    const p = prog(d);
    return `<a class="dcard" href="#/d/${d.id}" draggable="true" data-card="${d.id}">
      <div class="top"><span class="ico">${esc(d.icon)}</span><span class="num-tag">${esc(d.num)}</span>${d.area ? `<span class="eyebrow">${esc(d.area)}</span>` : ""}</div>
      <h3>${esc(d.title)}</h3>
      <p>${esc(d.summary)}</p>
      <div class="meta">${statusBadge(d.status)} ${prioBadge(d.priority)}${d.owner ? ` <span class="badge badge-outline">👤 ${esc(d.owner)}</span>` : ""}${d.due ? ` <span class="badge badge-outline">📅 ${fmtDate(d.due)}</span>` : ""}</div>
      <div class="foot"><div class="progress ${p.p === 100 ? "done" : ""}"><span style="--value:${p.p}%"></span></div>${p.k}/${p.t}</div>
    </a>`;
  }
  const fmtDate = (iso) => { if (!iso) return ""; const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };

  /* ---------------- Quadro ---------------- */
  function viewQuadro() {
    crumbs([["Visão geral", "#/"], ["Quadro"]]);
    main.innerHTML = `
      <h1 class="hero-h">Quadro</h1>
      <p class="hero-p">Arraste os cartões entre as colunas para mudar o status.</p>
      <div class="board">${STATUS.map((s) => { const ds = sorted().filter((d) => d.status === s.id); return `
        <div class="col" data-col="${s.id}">
          <div class="col-h"><span class="badge ${s.badge}">${esc(s.label)}</span><span class="count">${ds.length}</span></div>
          ${ds.map(cardHtml).join("")}
        </div>`; }).join("")}
      </div>`;
  }

  /* ---------------- Página de demanda ---------------- */
  function viewDemanda(d) {
    crumbs([["Visão geral", "#/"], [`${d.num} · ${d.title}`]]);
    const p = prog(d);
    const guide = d.key && GUIDES[d.key];
    let guideOpen = true;
    try { guideOpen = localStorage.getItem("guide-open-" + d.id) !== "0"; } catch (e) {}
    main.innerHTML = `
      <article data-did="${d.id}">
        <button class="page-icon" data-action="icon" title="Trocar ícone">${esc(d.icon)}</button>
        <div class="eyebrow"><span class="num-tag">Demanda ${esc(d.num)}</span></div>
        <h1 class="page-title" contenteditable="plaintext-only" spellcheck="true" data-field="title" data-placeholder="Sem título">${esc(d.title)}</h1>
        <p class="page-sub" contenteditable="plaintext-only" data-field="summary" data-placeholder="Escreva um resumo…">${esc(d.summary)}</p>

        <dl class="props">
          <dt>◉ Status</dt><dd><select class="prop-input" data-field="status">${STATUS.map((s) => `<option value="${s.id}"${s.id === d.status ? " selected" : ""}>${esc(s.label)}</option>`).join("")}</select></dd>
          <dt>⚑ Prioridade</dt><dd><select class="prop-input" data-field="priority">${PRIORIDADES.map((x) => `<option${x === d.priority ? " selected" : ""}>${x}</option>`).join("")}</select></dd>
          <dt>👤 Responsável</dt><dd><input class="prop-input" data-field="owner" value="${esc(d.owner)}" placeholder="Vazio"></dd>
          <dt>📅 Prazo</dt><dd><input class="prop-input" type="date" data-field="due" value="${esc(d.due)}"></dd>
          <dt># Número</dt><dd><input class="prop-input" data-field="num" value="${esc(d.num)}" style="max-width:6rem"></dd>
          <dt>▦ Área</dt><dd><input class="prop-input" data-field="area" value="${esc(d.area)}" placeholder="Vazio"></dd>
          <dt>⇠ Depende de</dt><dd><input class="prop-input" data-field="depends" value="${esc(d.depends)}" placeholder="Nº de outras demandas"></dd>
        </dl>

        <div class="progress-row">
          <div class="progress ${p.p === 100 ? "done" : ""}" id="pbar"><span style="--value:${p.p}%"></span></div>
          <span class="txt" id="ptxt">${p.k} de ${p.t} · ${p.p}%</span>
        </div>

        <section class="sec">
          <div class="sec-h"><h2>Checklist</h2><span class="hint">Enter adiciona · clique no texto para editar</span></div>
          <ul class="tasks" id="tasks">${d.tasks.map(taskHtml).join("")}</ul>
          <div class="task-add"><span aria-hidden="true">＋</span><input id="newTask" placeholder="Adicionar tarefa e apertar Enter" aria-label="Nova tarefa"></div>
        </section>

        <section class="sec">
          <div class="sec-h"><h2>Anotações</h2><span class="hint">Salva sozinho</span></div>
          <textarea class="notes" data-field="notes" placeholder="Contatos, números de protocolo, valores de cotação, decisões…">${esc(d.notes)}</textarea>
        </section>

        ${guide ? `<section class="sec"><details class="guide" id="guide"${guideOpen ? " open" : ""}><summary>📖 Como fazer</summary><div class="guide-body">${guide}</div></details></section>` : ""}

        <div class="danger-zone"><button class="btn btn-sm btn-ghost" data-action="del-demanda">🗑 Excluir demanda</button></div>
      </article>`;
    main.querySelectorAll(".guide-body table.mini").forEach((t) => { const w = document.createElement("div"); w.className = "table-scroll"; t.replaceWith(w); w.append(t); });
    const g = $("#guide");
    if (g) g.addEventListener("toggle", () => { try { localStorage.setItem("guide-open-" + d.id, g.open ? "1" : "0"); } catch (e) {} });
  }

  const taskHtml = (t) => `
    <li class="task ${t.done ? "done" : ""}" data-tid="${t.id}">
      <input type="checkbox" ${t.done ? "checked" : ""} data-task-toggle aria-label="Concluída">
      <input class="task-text" value="${esc(t.text)}" data-task-text aria-label="Tarefa">
      <button class="del" data-action="del-task" title="Excluir tarefa" aria-label="Excluir tarefa">✕</button>
    </li>`;

  function refreshProgress(d) {
    const p = prog(d);
    const bar = $("#pbar"), txt = $("#ptxt");
    if (bar) { bar.firstElementChild.style.setProperty("--value", p.p + "%"); bar.classList.toggle("done", p.p === 100); }
    if (txt) txt.textContent = `${p.k} de ${p.t} · ${p.p}%`;
    renderSide();
  }

  /* ---------------- Inventário ---------------- */
  function viewServidores() {
    crumbs([["Visão geral", "#/"], ["Inventário de servidores"]]);
    main.innerHTML = `
      <h1 class="hero-h">🖥️ Inventário de servidores</h1>
      <p class="hero-p">Uma linha por máquina. Senhas ficam no cofre de senhas — aqui anote só onde estão.</p>
      <div class="toolbar">
        <button class="btn btn-sm btn-primary" data-action="add-server">＋ Adicionar máquina</button>
        <button class="btn btn-sm btn-outline" data-action="csv">⤓ Exportar planilha (.csv)</button>
      </div>
      <div class="grid-table-wrap">
        <table class="grid-table">
          <thead><tr>${COLS.map((c) => `<th>${COL_LABEL[c]}</th>`).join("")}<th></th></tr></thead>
          <tbody>${state.servers.map((s) => `<tr data-sid="${s.id}">${COLS.map((c) => `<td><input data-col="${c}" value="${esc(s[c])}" aria-label="${COL_LABEL[c]}"></td>`).join("")}<td class="act"><button data-action="del-server" title="Remover" aria-label="Remover máquina">✕</button></td></tr>`).join("")}</tbody>
        </table>
      </div>
      ${state.servers.length ? "" : `<div class="empty-note" style="margin-top:1rem">Nenhuma máquina ainda.</div>`}
      <section class="sec"><details class="guide"><summary>📖 Comandos para levantar as informações</summary><div class="guide-body">${GUIDES.inventario}</div></details></section>`;
  }

  /* ---------------- Diário ---------------- */
  function viewDiario() {
    crumbs([["Visão geral", "#/"], ["Diário / ligações"]]);
    const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const items = [...state.diario].sort((a, b) => (b.when || "").localeCompare(a.when || ""));
    main.innerHTML = `
      <h1 class="hero-h">📝 Diário / ligações</h1>
      <p class="hero-p">Registre ligações, protocolos, decisões e incidentes. Fica tudo em ordem de data.</p>
      <form class="log-form" id="logForm">
        <textarea class="input notes" name="text" placeholder="Ex.: Liguei para a Apple — protocolo 123456, conta ativa até 03/2027…" required></textarea>
        <div class="row">
          <input class="input" type="datetime-local" name="when" value="${now.toISOString().slice(0, 16)}" style="max-width:14rem">
          <select class="input select" name="ref" style="max-width:22rem"><option value="">Sem demanda</option>${sorted().map((d) => `<option value="${d.id}">${esc(d.num)} · ${esc(d.title)}</option>`).join("")}</select>
          <button class="btn btn-primary" type="submit">Registrar</button>
        </div>
      </form>
      ${items.length ? `<ul class="log">${items.map((it) => { const d = it.ref && byId(it.ref); return `
        <li data-lid="${it.id}">
          <div class="when">${fmtWhen(it.when)}${d ? ` · <a href="#/d/${d.id}">${esc(d.icon)} ${esc(d.num)} · ${esc(d.title)}</a>` : ""} <button class="rm" data-action="del-log">excluir</button></div>
          <div class="body">${esc(it.text)}</div>
        </li>`; }).join("")}</ul>` : `<div class="empty-note">Nenhum registro ainda.</div>`}`;
  }
  const fmtWhen = (w) => { if (!w) return ""; const [d, t] = w.split("T"); return `${fmtDate(d)} ${t || ""}`; };

  /* ---------------- Ações ---------------- */
  function newDemanda() {
    const nums = state.demandas.map((d) => parseInt(d.num, 10)).filter((n) => !isNaN(n));
    const d = { id: uid(), key: "", num: String((nums.length ? Math.max(...nums) : 0) + 1), icon: "📌", title: "", summary: "", priority: "Média", status: "todo", area: "", depends: "", owner: "", due: "", notes: "", tasks: [] };
    state.demandas.push(d); save();
    location.hash = "#/d/" + d.id;
    setTimeout(() => $(".page-title")?.focus(), 30);
  }

  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const stamp = () => new Date().toISOString().slice(0, 10);

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const act = el.dataset.action;
    const art = el.closest("[data-did]"), d = art && byId(art.dataset.did);

    if (act === "toggle-mode") window.ds ? ds.toggleMode() : null;
    else if (act === "open-nav") $("#shell").dataset.nav = "open";
    else if (act === "close-nav") $("#shell").removeAttribute("data-nav");
    else if (act === "new-demanda") { e.preventDefault(); newDemanda(); }
    else if (act === "export") { download(`plano-de-acao-${stamp()}.json`, JSON.stringify(state, null, 2), "application/json"); flashSaved("Backup baixado ✓"); }
    else if (act === "import") $("#importFile").click();
    else if (act === "open-folder" && DESK) DESK.openFolder();
    else if (act === "reset") {
      if (confirm(`Voltar ao plano original?\n\nTudo o que você editou (tarefas, anotações, inventário e diário) será apagado${DESK ? "" : " deste navegador"}. ${DESK ? "O app guarda um backup automático por dia na pasta dos dados." : "Faça um Backup antes se quiser guardar."}`)) {
        state = makeDefaults(); save(); location.hash = "#/"; render();
      }
    }
    else if (act === "icon" && d) {
      const v = prompt("Novo ícone (cole um emoji):", d.icon);
      if (v && v.trim()) { d.icon = v.trim().slice(0, 4); el.textContent = d.icon; save(); renderSide(); }
    }
    else if (act === "del-demanda" && d) {
      if (confirm(`Excluir a demanda “${d.title || "sem título"}”? Isso não pode ser desfeito (a não ser por um Backup).`)) {
        state.demandas = state.demandas.filter((x) => x !== d); save(); location.hash = "#/";
      }
    }
    else if (act === "del-task" && d) {
      const li = el.closest("[data-tid]");
      d.tasks = d.tasks.filter((t) => t.id !== li.dataset.tid); li.remove(); save(); refreshProgress(d);
    }
    else if (act === "add-server") {
      state.servers.push({ id: uid(), ...Object.fromEntries(COLS.map((c) => [c, ""])) }); save(); viewServidores();
      main.querySelector("tbody tr:last-child input")?.focus();
    }
    else if (act === "del-server") {
      const tr = el.closest("[data-sid]"), s = state.servers.find((x) => x.id === tr.dataset.sid);
      if (!s || (Object.values(s).some((v) => v && v !== s.id) && !confirm(`Remover “${s.nome || "máquina sem nome"}” do inventário?`))) return;
      state.servers = state.servers.filter((x) => x !== s); save(); viewServidores();
    }
    else if (act === "csv") {
      const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const rows = [COLS.map((c) => q(COL_LABEL[c])).join(";"), ...state.servers.map((s) => COLS.map((c) => q(s[c])).join(";"))];
      download(`inventario-servidores-${stamp()}.csv`, "﻿" + rows.join("\r\n"), "text/csv;charset=utf-8");
    }
    else if (act === "del-log") {
      const li = el.closest("[data-lid]");
      if (confirm("Excluir este registro do diário?")) { state.diario = state.diario.filter((x) => x.id !== li.dataset.lid); save(); viewDiario(); }
    }
  });

  // Edição de campos (sem re-renderizar a página, para não perder o cursor)
  let sideTimer;
  const sideLater = () => { clearTimeout(sideTimer); sideTimer = setTimeout(renderSide, 300); };
  main.addEventListener("input", (e) => {
    const el = e.target;
    const art = el.closest("[data-did]"), d = art && byId(art.dataset.did);
    if (d && el.dataset.field) {
      d[el.dataset.field] = el.isContentEditable ? el.innerText.replace(/\n+/g, " ").trim() : el.value;
      if (el.dataset.field === "title" || el.dataset.field === "num") { crumbs([["Visão geral", "#/"], [`${d.num} · ${d.title}`]]); sideLater(); }
      save(); return;
    }
    if (d && el.matches("[data-task-text]")) {
      const t = d.tasks.find((x) => x.id === el.closest("[data-tid]").dataset.tid); if (t) { t.text = el.value; save(); }
      return;
    }
    const tr = el.closest("[data-sid]");
    if (tr && el.dataset.col) { const s = state.servers.find((x) => x.id === tr.dataset.sid); if (s) { s[el.dataset.col] = el.value; save(); } }
  });

  main.addEventListener("change", (e) => {
    const el = e.target;
    const art = el.closest("[data-did]"), d = art && byId(art.dataset.did);
    if (d && el.matches("[data-task-toggle]")) {
      const li = el.closest("[data-tid]"), t = d.tasks.find((x) => x.id === li.dataset.tid);
      t.done = el.checked; li.classList.toggle("done", t.done);
      if (d.status === "todo" && t.done) { d.status = "doing"; const sel = $('select[data-field="status"]'); if (sel) sel.value = "doing"; }
      save(); refreshProgress(d); return;
    }
    if (d && (el.dataset.field === "status" || el.dataset.field === "priority")) { renderSide(); return; }
    if (el.dataset.quick) {
      const [did, tid] = el.dataset.quick.split("|"), dd = byId(did), t = dd?.tasks.find((x) => x.id === tid);
      if (t) { t.done = true; if (dd.status === "todo") dd.status = "doing"; save(); setTimeout(viewInicio, 250); renderSide(); }
    }
  });

  main.addEventListener("keydown", (e) => {
    const el = e.target;
    if (el.id === "newTask" && e.key === "Enter" && el.value.trim()) {
      const d = byId(el.closest("[data-did]").dataset.did);
      const t = { id: uid(), text: el.value.trim(), done: false };
      d.tasks.push(t); el.value = "";
      $("#tasks").insertAdjacentHTML("beforeend", taskHtml(t)); save(); refreshProgress(d);
    } else if (el.isContentEditable && e.key === "Enter") { e.preventDefault(); el.blur(); }
    else if (el.matches("[data-task-text]") && e.key === "Enter") { e.preventDefault(); $("#newTask")?.focus(); }
  });

  main.addEventListener("paste", (e) => {
    if (!e.target.isContentEditable) return;
    e.preventDefault();
    document.execCommand("insertText", false, (e.clipboardData.getData("text/plain") || "").replace(/\s*\n\s*/g, " "));
  });

  main.addEventListener("submit", (e) => {
    if (e.target.id !== "logForm") return;
    e.preventDefault();
    const f = new FormData(e.target), text = String(f.get("text") || "").trim();
    if (!text) return;
    state.diario.push({ id: uid(), when: String(f.get("when") || ""), ref: String(f.get("ref") || ""), text });
    save(); viewDiario();
  });

  // Kanban: arrastar e soltar
  let dragId = null;
  main.addEventListener("dragstart", (e) => { const c = e.target.closest?.("[data-card]"); if (!c || route().name !== "quadro") return; dragId = c.dataset.card; c.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", dragId); });
  main.addEventListener("dragend", (e) => { e.target.closest?.("[data-card]")?.classList.remove("dragging"); main.querySelectorAll(".col.over").forEach((c) => c.classList.remove("over")); });
  main.addEventListener("dragover", (e) => { const col = e.target.closest(".col"); if (!col || !dragId) return; e.preventDefault(); main.querySelectorAll(".col.over").forEach((c) => c !== col && c.classList.remove("over")); col.classList.add("over"); });
  main.addEventListener("drop", (e) => { const col = e.target.closest(".col"); if (!col || !dragId) return; e.preventDefault(); const d = byId(dragId); dragId = null; if (d) { d.status = col.dataset.col; save(); viewQuadro(); renderSide(); } });

  // Importar backup
  $("#importFile").addEventListener("change", async (e) => {
    const file = e.target.files[0]; e.target.value = "";
    if (!file) return;
    try {
      const s = JSON.parse(await file.text());
      if (!s || !Array.isArray(s.demandas)) throw new Error("formato");
      if (!confirm(`Carregar o backup “${file.name}”? O conteúdo atual será substituído.`)) return;
      state = normalize(s); save(); location.hash = "#/"; render(); flashSaved("Backup carregado ✓");
    } catch (err) { alert("Esse arquivo não é um backup válido do Plano de Ação."); }
  });

  // Busca
  $("#search").addEventListener("input", renderSide);
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#shell").dataset.nav = "open"; $("#search").focus(); $("#search").select(); }
    if (e.key === "Escape") $("#shell").removeAttribute("data-nav");
  });

  window.addEventListener("hashchange", () => { render(); main.focus({ preventScroll: true }); window.scrollTo(0, 0); });
  // Rodapé do app instalado: onde os dados estão + botão para abrir a pasta.
  if (DESK && dataInfo) {
    const foot = $(".side-foot");
    foot.insertAdjacentHTML("beforeend", `
      <button class="btn btn-ghost btn-sm" data-action="open-folder" style="grid-column:1/-1" title="${esc(dataInfo.path)}">📁 Abrir pasta dos dados</button>
      <small class="data-where" style="grid-column:1/-1">Salvo em Documentos › Plano de Ação · backup automático diário</small>`);
    $("#brandSub").textContent = "App do computador";
    if (!dataInfo.data) save(); // primeira abertura: já cria o arquivo
    if (dataInfo.recovered) setTimeout(() => alert("O arquivo de dados estava danificado. O app carregou o último backup automático e guardou uma cópia do arquivo danificado na pasta dos dados."), 400);
  }

  render();
  if (addedOnLoad) { save(); setTimeout(() => flashSaved("Nova demanda adicionada ao plano ✓"), 300); }
})();
