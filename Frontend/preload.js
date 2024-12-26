const { contextBridge, ipcRenderer } = require('electron');

// Expose sendToServer method to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    sendToServer: (request) => ipcRenderer.invoke('send-to-server', request),
});
