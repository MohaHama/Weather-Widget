const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 260,
    icon: path.join(__dirname, 'assets', 'icon.ico'), // 
    resizable: false,
    frame: false, // ingen systemtitelbar
    transparent: true,
    backgroundColor: '#00000000',
    icon: path.join(__dirname, 'assets', 'icon.ico'), // ← brug dit ikon her
    skipTaskbar: false,           // ← vis i taskbar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  win.setMenuBarVisibility(false);        
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


// IPC-håndtering fra preload -> renderer
ipcMain.handle('window:minimize', () => win?.minimize());
ipcMain.handle('window:toggleMaximize', () => {
  if (!win) return;
  win.isMaximized() ? win.unmaximize() : win.maximize();
});
ipcMain.handle('window:close', () => win?.close());
