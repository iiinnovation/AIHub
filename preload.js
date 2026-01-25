const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Providers
  getProviders: () => ipcRenderer.invoke('get-providers'),
  getExtractionScript: (providerId) => ipcRenderer.invoke('get-extraction-script', providerId),
  getInjectScript: () => ipcRenderer.invoke('get-inject-script'),
  
  // Clipboard
  clipboardRead: () => ipcRenderer.invoke('clipboard-read'),
  clipboardWrite: (text) => ipcRenderer.invoke('clipboard-write', text),
  
  // Templates
  getTemplates: () => ipcRenderer.invoke('templates-get-all'),
  saveTemplates: (templates) => ipcRenderer.invoke('templates-save', templates),
  exportTemplates: (templates) => ipcRenderer.invoke('templates-export', templates),
  importTemplates: () => ipcRenderer.invoke('templates-import'),
  
  // Settings
  saveLastProvider: (providerId) => ipcRenderer.invoke('save-last-provider', providerId),
  getLastProvider: () => ipcRenderer.invoke('get-last-provider')
});
