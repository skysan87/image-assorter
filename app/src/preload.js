const { contextBridge, ipcRenderer } = require('electron')

// rendererプロセスで呼ぶIPC通信処理を書く
// ex) window.electron.メソッド名(引数)
contextBridge.exposeInMainWorld(
  'electron', {
    openFileDialog: async (args) => await ipcRenderer.invoke('ipc-open-file-dialog', args),

    setConfig: async (args) => await ipcRenderer.invoke('ipc-set-config', args),

    assortImage: async (args) => await ipcRenderer.invoke('ipc-assort-image', args),

    moveImages: async () => await ipcRenderer.invoke('ipc-move-images')
  }
)
