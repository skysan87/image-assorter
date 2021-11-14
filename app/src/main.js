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
    await win.loadFile(path.resolve(__dirname, '../dist/index.html'))
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

// ==============================
//            IPC通信
// ==============================

/**
 * フォルダ選択ダイアログを表示する
 */
ipcMain.handle('ipc-open-file-dialog', async (ev, properties) => {
  const props = ['openDirectory']
  if (!!properties && properties.length > 0) {
    props.push(...properties)
  }
  const path = await dialog.showOpenDialog(win, {
    properties: props,
    title: 'フォルダを選択'
  })
  return path
})

/**
 * 画像の出力先を仕分ける
 */
ipcMain.handle('ipc-assort-image', (ev, args) => {
  const outputIndex = args.outputIndex
  const filepath = args.path

  const index = outputList.findIndex(v => v.input === filepath)

  outputList[index].output = outputFolders[outputIndex]

  // 次のパス
  return (outputList.length > index + 1) ? outputList[index + 1] : null
})

/**
 * 次の画像を表示する
 */
ipcMain.handle('ipc-go-to-next-image', (ev, args) => {
  const index = outputList.findIndex(v => v.input === args.current)

  const offset = args.offset

  if (outputList.length === 0) {
    return null
  }

  if (index + offset >= 0 && outputList.length > index + offset) {
    return outputList[index + offset]
  } else if (index + offset < 0) {
    return outputList[outputList.length - 1]
  } else {
    return outputList[0]
  }
})

/**
 * 入出力先を設定する
 */
ipcMain.handle('ipc-set-config', (ev, args) => {
  const medid = args.media
  inputFolder = args.inputFolder
  outputFolders = args.outputFolders
  outputList = []

  fs.readdirSync(inputFolder)
    .forEach(file => {
      const ext = path.extname(file).toLowerCase()
      if (medid.includes(ext)) {
        outputList.push({
          input: path.join(inputFolder ,file),
          output: ''
        })
      }
    })

  return (outputList.length > 0 ) ? outputList[0] : null
})

/**
 * ファイル移動
 */
ipcMain.handle('ipc-move-images', async (ev) => {
  const promisslist = []

  outputList.forEach(v => {

    const src = v.input
    const dist = path.join(v.output, path.basename(v.input))

    const p = new Promise((resolve) => {
      if (v.output === '') {
        resolve()
      } else {
        // NOTE: macOSでは名前が重複した場合、自動で別名をナンバリング
        fs.rename(src, dist, (error) => {
            if (error) {
              console.error({ file: path.basename(v.input), error })
            }
            resolve()
        })
      }
    })
    promisslist.push(p)
  })

  await Promise.all(promisslist)

  return true
})

/**
 * 出力キャンセル
 */
ipcMain.handle('ipc-cancel-output', (ev, args) => {
  const index = outputList.findIndex(v => v.input === args.current)

  if (outputList.length === 0) {
    return false
  }

  outputList[index].output = ''

  return true
})
