// desktop/main.js — Electron main process.
// Loads the web build into a Chromium window.

const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');

const isDev = !app.isPackaged;
const INDEX_URL = isDev
  ? 'http://localhost:8080'
  : `file://${path.join(__dirname, '..', 'index.html')}`;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#0c1118',
    title: 'Chronicles of Lumina',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL(INDEX_URL);
  win.setMenuBarVisibility(false);

  // Open external links in the OS browser, not in-app
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
