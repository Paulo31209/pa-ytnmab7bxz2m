/* Ponte segura entre a página e o computador: só estas funções ficam disponíveis. */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  load: () => ipcRenderer.sendSync("plano:load-sync"),
  save: (json) => ipcRenderer.invoke("plano:save", json),
  saveSync: (json) => ipcRenderer.sendSync("plano:save-sync", json),
  openFolder: () => ipcRenderer.invoke("plano:open-folder"),
  pubInfo: () => ipcRenderer.invoke("plano:pub-info"),
  pubNow: () => ipcRenderer.invoke("plano:pub-now"),
  onPubStatus: (cb) => ipcRenderer.on("plano:pub-status", (_e, st) => cb(st)),
});
