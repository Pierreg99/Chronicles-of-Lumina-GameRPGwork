// desktop/preload.js — secure bridge between Electron main and renderer.
// Currently exposes nothing; the game is pure web and uses no Node APIs.
contextBridge.exposeInMainWorld('luminaDesktop', {
  platform: process.platform,
  versions: { electron: process.versions.electron, node: process.versions.node },
});
