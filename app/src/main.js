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

  return getFileInfo(index, 1)
})

/**
 * 次の画像を表示する
 */
ipcMain.handle('ipc-go-to-next-image', (ev, args) => {
  const index = outputList.findIndex(v => v.input === args.current)

  const offset = args.offset

  return getFileInfo(index, offset)
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

  return getFileInfo(0)
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

/**
 * 表示する画像のファイルパスと前後のファイルがあるかを計算する
 * @param {Number} currentIndex 表示しているファイルIndex
 * @param {Number} offset 表示しているファイルIndexからの差
 * @returns {Object} {input, output, hasNext, hasPrev}
 */
const getFileInfo = (currentIndex, offset=0) => {
  if (outputList.length == 0) {
    return null
  }

  const totalSize = outputList.length
  const actualOffset = offset % totalSize

  let nextIndex
  if (actualOffset >= 0 ) {
    nextIndex = (currentIndex + actualOffset) % totalSize
  } else if (actualOffset < 0) {
    nextIndex = (currentIndex + (totalSize - actualOffset)) % totalSize
  }

  return {
    ...outputList[nextIndex]
    , hasNext: nextIndex + 1 < totalSize
    , hasPrev: nextIndex - 1 >= 0
  }
}