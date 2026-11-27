/* Plano de Ação — processo principal do app (Electron).
   Os dados ficam em: Documentos\Plano de Ação\plano-de-acao.json
   Backup automático 1x por dia em: Documentos\Plano de Ação\backups (guarda os últimos 30). */
const { app, BrowserWindow, ipcMain, shell, Menu } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

const DATA_DIR = path.join(app.getPath("documents"), "Plano de Ação");
const DATA_FILE = path.join(DATA_DIR, "plano-de-acao.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const KEEP_BACKUPS = 30;

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
  return true;
}

ipcMain.on("plano:load-sync", (e) => { const r = readData(); e.returnValue = { ...r, path: DATA_FILE, dir: DATA_DIR }; });
ipcMain.handle("plano:save", (_e, json) => writeData(json));
ipcMain.on("plano:save-sync", (e, json) => { try { e.returnValue = writeData(json); } catch { e.returnValue = false; } });
ipcMain.handle("plano:open-folder", () => { fs.mkdirSync(DATA_DIR, { recursive: true }); return shell.openPath(DATA_DIR); });

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
});
app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.on("window-all-closed", () => app.quit());
