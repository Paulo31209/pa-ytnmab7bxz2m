/* Plano de Ação — processo principal do app (Electron).
   Os dados ficam em: Documentos\Plano de Ação\plano-de-acao.json
   Backup automático 1x por dia em: Documentos\Plano de Ação\backups (guarda os últimos 30). */
const { app, BrowserWindow, ipcMain, shell, Menu } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

const { execFile } = require("node:child_process");
const { toProgresso } = require("./progresso.js");

const DATA_DIR = path.join(app.getPath("documents"), "Plano de Ação");
const DATA_FILE = path.join(DATA_DIR, "plano-de-acao.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const PUB_FILE = path.join(DATA_DIR, "publicar.json");
const KEEP_BACKUPS = 30;

/* ---------- Link público ao vivo ----------
   A cada alteração (15 s depois da última), envia só o progresso (sem anotações,
   inventário ou diário) para o GitHub. A página pública lê esse arquivo.
   Configuração em Documentos\Plano de Ação\publicar.json ("ativo": false desliga). */
const PUB_DEFAULT = {
  ativo: true,
  repo: "Paulo31209/pa-ytnmab7bxz2m",
  branch: "dados",
  arquivo: "progresso.json",
  contaGitHub: "Paulo31209",
  linkPublico: "https://paulo31209.github.io/pa-ytnmab7bxz2m/",
};
function pubConfig() {
  try { return { ...PUB_DEFAULT, ...JSON.parse(fs.readFileSync(PUB_FILE, "utf8")) }; }
  catch (e) {
    if (e.code === "ENOENT") { try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(PUB_FILE, JSON.stringify(PUB_DEFAULT, null, 2)); } catch {} }
    return { ...PUB_DEFAULT };
  }
}

let pubTimer = null, pubPending = null, pubBusy = false, pubAgain = false;
let pubSha = null, pubKey = null, pubToken = null, lastStatus = null;

function sendStatus(st) { lastStatus = st; if (win && !win.isDestroyed()) win.webContents.send("plano:pub-status", st); }

function ghToken(user) {
  const tryRun = (bin) => new Promise((res, rej) =>
    execFile(bin, ["auth", "token", "--user", user], { windowsHide: true, timeout: 15000 }, (err, out) => err ? rej(err) : res(String(out).trim())));
  return tryRun("gh").catch(() => tryRun(path.join(process.env.ProgramFiles || "C:\\Program Files", "GitHub CLI", "gh.exe")));
}

async function gh(cfg, method, body) {
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${cfg.arquivo}` + (method === "GET" ? `?ref=${encodeURIComponent(cfg.branch)}` : "");
  const r = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${pubToken}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "plano-de-acao-app" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, j };
}

function schedulePublish(json, delay = 15000) {
  pubPending = json;
  clearTimeout(pubTimer);
  pubTimer = setTimeout(() => { pubTimer = null; publishNow(); }, delay);
}

async function publishNow() {
  if (pubBusy) { pubAgain = true; return; }
  const cfg = pubConfig();
  if (!cfg.ativo || !pubPending) return;
  pubBusy = true;
  try {
    const prog = toProgresso(JSON.parse(pubPending));
    const key = JSON.stringify(prog.demandas);
    if (key === pubKey) { sendStatus({ ok: true, when: Date.now(), link: cfg.linkPublico, unchanged: true }); return; }
    if (!pubToken) pubToken = await ghToken(cfg.contaGitHub);
    if (pubSha === null) {
      const g = await gh(cfg, "GET");
      if (g.status === 200) {
        pubSha = g.j.sha;
        try { pubKey = JSON.stringify(JSON.parse(Buffer.from(g.j.content, "base64").toString("utf8")).demandas); } catch {}
        if (key === pubKey) { sendStatus({ ok: true, when: Date.now(), link: cfg.linkPublico }); return; }
      } else if (g.status === 404) pubSha = "";
      else throw new Error(`GitHub respondeu ${g.status}`);
    }
    const all = prog.demandas.flatMap((d) => d.tasks), k = all.filter((t) => t.done).length;
    const put = (sha) => gh(cfg, "PUT", {
      message: `Andamento: ${k}/${all.length} tarefas feitas`,
      content: Buffer.from(JSON.stringify(prog, null, 1), "utf8").toString("base64"),
      branch: cfg.branch,
      ...(sha ? { sha } : {}),
    });
    let p = await put(pubSha);
    if (p.status === 409 || p.status === 422) { // versão mudou no GitHub: busca a atual e tenta de novo
      const g = await gh(cfg, "GET"); pubSha = g.status === 200 ? g.j.sha : ""; p = await put(pubSha);
    }
    if (p.status === 401) { pubToken = null; throw new Error("login do GitHub expirou (rode: gh auth login)"); }
    if (p.status !== 200 && p.status !== 201) throw new Error(p.j.message || `GitHub respondeu ${p.status}`);
    pubSha = p.j.content.sha; pubKey = key;
    sendStatus({ ok: true, when: Date.now(), link: cfg.linkPublico });
  } catch (e) {
    const msg = /ENOENT/.test(String(e)) ? "GitHub CLI (gh) não encontrado neste computador" : (e.message || String(e));
    sendStatus({ ok: false, when: Date.now(), link: cfg.linkPublico, msg });
  } finally {
    pubBusy = false;
    if (pubAgain) { pubAgain = false; publishNow(); }
  }
}

if (!app.requestSingleInstanceLock()) { app.quit(); }

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function latestBackup() {
  try {
    return fs.readdirSync(BACKUP_DIR).filter((f) => /^plano-.*\.json$/.test(f)).sort().reverse()
      .map((f) => path.join(BACKUP_DIR, f))[0] || null;
  } catch { return null; }
}

function readData() {
  let raw = null;
  try { raw = fs.readFileSync(DATA_FILE, "utf8"); } catch (e) { if (e.code !== "ENOENT") console.error(e); }
  if (raw === null) return { data: null, recovered: false };
  try { JSON.parse(raw); return { data: raw, recovered: false }; }
  catch {
    // Arquivo corrompido: guarda uma cópia e volta para o último backup.
    try { fs.renameSync(DATA_FILE, DATA_FILE.replace(/\.json$/, `.corrompido-${Date.now()}.json`)); } catch {}
    const b = latestBackup();
    if (b) { try { const r = fs.readFileSync(b, "utf8"); JSON.parse(r); return { data: r, recovered: true }; } catch {} }
    return { data: null, recovered: true };
  }
}

function writeData(json) {
  JSON.parse(json); // não grava nada que não seja JSON válido
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const daily = path.join(BACKUP_DIR, `plano-${today()}.json`);
  if (!fs.existsSync(daily) && fs.existsSync(DATA_FILE)) {
    fs.copyFileSync(DATA_FILE, daily);
    const all = fs.readdirSync(BACKUP_DIR).filter((f) => /^plano-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
    all.slice(0, Math.max(0, all.length - KEEP_BACKUPS)).forEach((f) => { try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch {} });
  }
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, json, "utf8");
  fs.renameSync(tmp, DATA_FILE); // troca de uma vez: não deixa arquivo pela metade
  schedulePublish(json);
  return true;
}

ipcMain.on("plano:load-sync", (e) => { const r = readData(); e.returnValue = { ...r, path: DATA_FILE, dir: DATA_DIR }; });
ipcMain.handle("plano:save", (_e, json) => writeData(json));
ipcMain.on("plano:save-sync", (e, json) => { try { e.returnValue = writeData(json); } catch { e.returnValue = false; } });
ipcMain.handle("plano:open-folder", () => { fs.mkdirSync(DATA_DIR, { recursive: true }); return shell.openPath(DATA_DIR); });
ipcMain.handle("plano:pub-info", () => { const c = pubConfig(); return { ativo: c.ativo, link: c.linkPublico, status: lastStatus }; });
ipcMain.handle("plano:pub-now", () => { if (pubPending) { clearTimeout(pubTimer); pubTimer = null; pubKey = null; return publishNow(); } });

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1320, height: 860, minWidth: 380, minHeight: 500,
    title: "Plano de Ação",
    icon: path.join(__dirname, "build", "icon.png"),
    backgroundColor: "#0f1115",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
    },
  });
  win.webContents.session.setSpellCheckerLanguages(["pt-BR"]);
  win.once("ready-to-show", () => win.show());
  win.loadFile(path.join(__dirname, "index.html"));

  // Links externos abrem no navegador; o app nunca sai da própria página.
  const external = (url) => /^https?:\/\//i.test(url) && shell.openExternal(url);
  win.webContents.setWindowOpenHandler(({ url }) => { external(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith("file://")) { e.preventDefault(); external(url); } });
}

const menu = Menu.buildFromTemplate([
  { label: "Arquivo", submenu: [
    { label: "Abrir pasta dos dados", click: () => { fs.mkdirSync(DATA_DIR, { recursive: true }); shell.openPath(DATA_DIR); } },
    { type: "separator" },
    { role: "quit", label: "Sair" },
  ] },
  { label: "Editar", submenu: [
    { role: "undo", label: "Desfazer" }, { role: "redo", label: "Refazer" }, { type: "separator" },
    { role: "cut", label: "Recortar" }, { role: "copy", label: "Copiar" }, { role: "paste", label: "Colar" }, { role: "selectAll", label: "Selecionar tudo" },
  ] },
  { label: "Exibir", submenu: [
    { role: "reload", label: "Recarregar" }, { type: "separator" },
    { role: "zoomIn", label: "Aumentar zoom" }, { role: "zoomOut", label: "Diminuir zoom" }, { role: "resetZoom", label: "Zoom normal" },
    { type: "separator" }, { role: "togglefullscreen", label: "Tela cheia" },
  ] },
]);

app.whenReady().then(() => {
  Menu.setApplicationMenu(menu);
  createWindow();
  // Ao abrir: envia o que mudou enquanto o app estava fechado ou sem internet.
  const r = readData();
  if (r.data) schedulePublish(r.data, 4000);
});
app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.on("window-all-closed", () => app.quit());

// Ao fechar com envio pendente: envia antes de sair (espera no máximo 10 s).
let quitting = false;
app.on("before-quit", (e) => {
  if (quitting || (!pubTimer && !pubBusy)) return;
  e.preventDefault(); quitting = true;
  clearTimeout(pubTimer); pubTimer = null;
  const done = () => app.quit();
  Promise.race([publishNow(), new Promise((r) => setTimeout(r, 10000))]).finally(done);
});
