const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
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

const DELETE_INDEX = '[Trash]'

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
 * 画像の仕分け先をゴミ箱に設定する
 */
ipcMain.handle('ipc-trash-image', (ev, args) => {
  const filepath = args.path

  const index = outputList.findIndex(v => v.input === filepath)

  outputList[index].output = DELETE_INDEX

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
 * すでに仕分け先を設定済みか
 */
ipcMain.handle('ipc-is-assorted', () => {
  return outputList.some(o => o.output !== '')
})

/**
 * 入出力先を設定する
 */
ipcMain.handle('ipc-set-config', (ev, args) => {
  const media = args.media
  inputFolder = args.inputFolder
  outputList = []

  try {
    args.outputFolders.forEach(folder => {
      if (!fs.existsSync(folder)) {
        throw new Error(`${folder}は存在しません`)
      }
    })
    outputFolders = args.outputFolders

    fs.readdirSync(inputFolder)
      .forEach(file => {
        const ext = path.extname(file).toLowerCase()
        if (media.includes(ext)) {
          outputList.push({
            input: path.join(inputFolder, file),
            output: ''
          })
        }
      })
  } catch (error) {
    return {
      status: false,
      data: error.message
    }
  }

  if (outputList.length > 0) {
    return {
      status: true,
      data: getFileInfo(0)
    }
  } else {
    return {
      status: false,
      data: '対象のファイルが存在しません'
    }
  }
})

/**
 * ファイル移動
 */
ipcMain.handle('ipc-move-images', async (ev) => {
  const promisslist = []
  const resultList = []

  outputList.forEach(v => {

    const src = v.input
    const dist = path.join(v.output, path.basename(v.input))

    if (v.output === '') {
      // DO NOTHING
    } else if (v.output === DELETE_INDEX) {
      // ゴミ箱に移動
      promisslist.push(shell.trashItem(src))
    } else {
      const p = new Promise((resolve) => {
        // NOTE: macOSでは名前が重複した場合、自動で別名をナンバリング
        fs.rename(src, dist, (error) => {
          const filename = path.basename(src)
          const outDir = path.dirname(dist)

          if (error) {
            resultList.push({ result: 'NG', detail: error.message, in: filename, out: outDir })
          } else {
            resultList.push({ result: 'OK', in: filename, out: outDir })
          }
          resolve()
        })
      })
      promisslist.push(p)
    }
  })

  await Promise.all(promisslist)

  return resultList
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

ipcMain.handle('ipc-number-file', async (_, { file, dir }) => {
  return new Promise((resolve, reject) => {
    const srcExt = path.extname(file)
    const dist = path.join(dir, `${getNextIndex(dir)}${srcExt}`)
    // NOTE: macOSでは名前が重複した場合、自動で別名をナンバリング
    fs.rename(file, dist, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
})

/**
 * 表示する画像のファイルパスと前後のファイルがあるかを計算する
 * @param {Number} currentIndex 表示しているファイルIndex
 * @param {Number} offset 表示しているファイルIndexからの差
 * @returns {Object} {input, output, hasNext, hasPrev}
 */
const getFileInfo = (currentIndex, offset = 0) => {
  if (outputList.length == 0) {
    return null
  }

  const totalSize = outputList.length
  const actualOffset = offset % totalSize

  let nextIndex
  if (actualOffset >= 0) {
    nextIndex = (currentIndex + actualOffset) % totalSize
  } else if (actualOffset < 0) {
    nextIndex = (currentIndex + (totalSize + actualOffset)) % totalSize
  }

  return {
    ...outputList[nextIndex]
    , hasNext: nextIndex + 1 < totalSize
    , hasPrev: nextIndex - 1 >= 0
  }
}

/**
 * 追加されたファイルを自動採番する(同フォルダ内で最大値)
 * @param {String} dir
 * @returns {Number}
 */
const getNextIndex = (dir) => {
  const list = fs.readdirSync(dir, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .map(({ name }) => {
      // 1文字以上の連続した数字
      const index = name.match(/\d+/)
      return index ? parseInt(index[0]) : 0
    })
  return list.length > 0 ? Math.max(...list) + 1 : 1
}