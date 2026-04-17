const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  listKeys: () => ipcRenderer.invoke('fs-list'),
  createKey: (key, data) => ipcRenderer.invoke('fs-create', { key, data }),
  updateKey: (key, data) => ipcRenderer.invoke('fs-update', { key, data }),
  copyText: (text) => ipcRenderer.invoke('clipboard-write', text)
})
