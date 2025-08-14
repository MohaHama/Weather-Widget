// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('windowControls', {
    close: () => ipcRenderer.invoke('window:close'),
});
