const { contextBridge, ipcRenderer } = require('electron')

// rendererプロセスで呼ぶIPC通信処理を書く
// ex) window.electron.メソッド名(引数)
contextBridge.exposeInMainWorld(
  'electron', {
    openFileDialog: async (properties) => await ipcRenderer.invoke('ipc-open-file-dialog', properties),

    isOutputListEmpty: async () => await ipcRenderer.invoke('ipc-is-output-list-empty'),

    setConfig: async (args) => await ipcRenderer.invoke('ipc-set-config', args),

    assortImage: async (args) => await ipcRenderer.invoke('ipc-assort-image', args),

    trashImage: async (args) => await ipcRenderer.invoke('ipc-trash-image', args),

    goToNextImage: async (args) => await ipcRenderer.invoke('ipc-go-to-next-image', args),

    moveImages: async () => await ipcRenderer.invoke('ipc-move-images'),

    cancelOutput: async (args) => await ipcRenderer.invoke('ipc-cancel-output', args)
  }
)
