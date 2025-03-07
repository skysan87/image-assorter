const { contextBridge, ipcRenderer } = require('electron')

// rendererプロセスで呼ぶIPC通信処理を書く
// ex) window.ClientApp.メソッド名(引数)
contextBridge.exposeInMainWorld(
  'ClientApp',
  {
    openFileDialog: async (properties) => await ipcRenderer.invoke('ipc-open-file-dialog', properties),

    isAssorted: async () => await ipcRenderer.invoke('ipc-is-assorted'),

    setConfig: async (args) => await ipcRenderer.invoke('ipc-set-config', args),

    assortImage: async (args) => await ipcRenderer.invoke('ipc-assort-image', args),

    trashImage: async (args) => await ipcRenderer.invoke('ipc-trash-image', args),

    goToNextImage: async (args) => await ipcRenderer.invoke('ipc-go-to-next-image', args),

    moveImages: async () => await ipcRenderer.invoke('ipc-move-images'),

    cancelOutput: async (args) => await ipcRenderer.invoke('ipc-cancel-output', args),

    numberFile: async (args) => await ipcRenderer.invoke('ipc-number-file', args)
  }
)
