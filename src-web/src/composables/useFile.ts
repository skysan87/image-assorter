import { open } from '@tauri-apps/plugin-dialog'
import { readDir, exists, rename, remove, type DirEntry } from '@tauri-apps/plugin-fs'
import { join, basename, resolve } from '@tauri-apps/api/path';
import { outputList } from '@/util/store'

/**
 * ファイル操作
 */
export const useFile = () => {
  const DELETE_INDEX = '[Trash]'

  const config = useRuntimeConfig()

  function tauriWapper(api: () => Promise<any>) {
    return api()
      .then(result => result)
      .catch(error => { new Error(error) })
  }

  function getExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.')).toLowerCase()
  }

  async function checkExists(folders: string[]): Promise<void> {
    const results = await Promise.all(folders.map(folder => exists(folder)))
      .then(result => result)
      .catch(error => { throw new Error(error) })

    const message: string[] = []
    results.forEach((result, i) => {
      if (!result) {
        message.push(folders[i])
      }
    })
    if (message.length > 0) {
      throw new Error(`${message.join(',')}は存在しません。`)
    }
  }

  /**
   * 表示する画像のファイルパスと前後のファイルがあるかを計算する
   * @param currentIndex 表示しているファイルIndex
   * @param offset 表示しているファイルIndexからの差
   * @return
   */
  const getFileInfo = (currentIndex: number, offset: number = 0): AssortState => {
    if (outputList.length == 0) {
      return {
        input: '',
        output: '',
        hasNext: false,
        hasPrev: false
      }
    }

    const totalSize = outputList.length
    const actualOffset = offset % totalSize

    let nextIndex: number = 0
    if (actualOffset >= 0) {
      nextIndex = (currentIndex + actualOffset) % totalSize
    } else if (actualOffset < 0) {
      nextIndex = (currentIndex + (totalSize + actualOffset)) % totalSize
    }

    return {
      input: outputList[nextIndex].input,
      output: outputList[nextIndex].output,
      hasNext: nextIndex + 1 < totalSize,
      hasPrev: nextIndex - 1 >= 0
    }
  }

  return {
    openFolderDialog: (): Promise<string | null> => {
      // キャンセル時はnull
      return tauriWapper(() => open(
        {
          multiple: false,
          directory: true
        }
      ))
    },

    openMultipleFolderDialog: (): Promise<string[] | null> => {
      // キャンセル時はnull
      return tauriWapper(() => open(
        {
          multiple: true,
          directory: true
        }
      ))
    },

    /**
     * すでに仕分け先を設定済みか
     */
    isAssorted: (): boolean => {
      return outputList.some(item => item.output !== '')
    },

    initSetting: async (inputFolder: string, outputFolders: string[]): Promise<AssortState> => {
      const IMAGE_EXT = config.public.image as string[]
      const MOVIE_EXT = config.public.movie as string[]
      const medias = [...IMAGE_EXT, ...MOVIE_EXT]

      await checkExists([inputFolder, ...outputFolders])

      const entries: DirEntry[] = await tauriWapper(() => readDir(inputFolder))
      const result = await Promise.all(entries
        .filter(entry => {
          if (entry.isSymlink || entry.isDirectory) {
            return false
          }
          return medias.includes(getExtension(entry.name))
        })
        .map(async entry => {
          return {
            input: await join(inputFolder, entry.name),
            output: ''
          } as OutputInfo
        }))

      if (result.length === 0) {
        throw new Error('対象のファイルが存在しません')
      }

      outputList.length = 0
      outputList.push(...result)

      return getFileInfo(0)!
    },

    /**
     * 仕分け実行
     */
    moveImages: async (): Promise<boolean> => {
      const promisslist: Array<Promise<any>> = []
      outputList.forEach(async v => {
        if (v.output === '') {
          // DO NOTHING
        } else if (v.output === DELETE_INDEX) {
          // 削除
          promisslist.push(remove(v.input))
        } else {
          const src = v.input
          const dist = await join(v.output, (await basename(v.input)))
          promisslist.push(rename(src, dist))
        }
      })
      return Promise.all(promisslist)
        .then(() => {
          outputList.length = 0
          return true
        })
        .catch(error => { throw new Error(error) })
    },

    /**
     * 出力キャンセル
     * @param currentPath 現在表示しているファイルパス
     */
    cancelOutput: (currentPath: string): void => {
      const index = outputList.findIndex(v => v.input === currentPath)
      if (index >= 0) {
        outputList[index].output = ''
      }
    },

    /**
     * 次の画像を表示する
     * @param currentPath 現在表示しているファイルパス
     * @param offset
     * @returns
     */
    goToNextImage: (currentPath: string, offset: number): AssortState => {
      const index = outputList.findIndex(v => v.input === currentPath)
      return getFileInfo(index, offset)
    },

    /**
     * 画像の出力先を仕分ける
     * @param path ファイルパス
     * @param outputFolder 出力先
     * @returns
     */
    assortImage: (path: string, outputFolder: string): AssortState => {
      const index = outputList.findIndex(v => v.input === path)
      outputList[index].output = outputFolder
      return getFileInfo(index, 1)
    },

    /**
     * 画像の仕分け先をゴミ箱に設定する
     * @param path ファイルパス
     * @returns
     */
    trashImage: (path: string): AssortState => {
      const index = outputList.findIndex(v => v.input === path)
      outputList[index].output = DELETE_INDEX
      return getFileInfo(index, 1)
    }
  }
}