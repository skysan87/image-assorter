const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

let win

let inputFolder = ''
let outputFolders = []
let outputList = []

async function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      worldSafeExecuteJavaScript: true,
      webSecurity: false, // ローカルファイルの読込許可
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.MODE === 'dev') {
    win.loadURL('http://localhost:3000/')

    win.webContents.openDevTools()
  } else {
    // production構成時
    await win.loadFile(path.resolve(__dirname, '../../dist/index.html'))
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

ipcMain.handle('ipc-open-file-dialog', async (ev, args) => {
  const path = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
    title: 'フォルダを選択'
  })
  return path
})

ipcMain.handle('ipc-assort-image', async (ev, args) => {
  const outputIndex = args.outputIndex
  const filepath = args.path

  const index = outputList.findIndex(v => v.input === filepath)

  outputList[index].output = outputFolders[outputIndex]

  // 次のパス
  return (outputList.length > index + 1) ? outputList[index + 1] : null
})

ipcMain.handle('ipc-set-config', (ev, args) => {
  inputFolder = args.inputFolder
  outputFolders = args.outputFolders
  outputList = []

  fs.readdirSync(inputFolder)
    .forEach(file => {
      const ext = path.extname(file)
      if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {

        outputList.push({
          input: path.join(inputFolder ,file),
          output: ''
        })
      }
    })

  return (outputList.length > 0 ) ? outputList[0] : null
})

ipcMain.handle('ipc-move-images', async (ev) => {
  const promisslist = []

  outputList.forEach(v => {

    const src = v.input
    const dist = path.join(v.output, path.basename(v.input))

    const p = new Promise((resolve) => {
      fs.rename(src, dist, (error) => {
          if (error) {
            console.error({ file: path.basename(v.input), error })
          }
          resolve()
      })
    })
    promisslist.push(p)
  })

  await Promise.all(promisslist)

  return true
})
