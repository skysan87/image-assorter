/**
 * ファイル操作
 * TODO: electronと連動しない場合はmock
 */
export const useFile = () => {
  const config = useRuntimeConfig()

  return {
    openFileDialog: (option?: string[]): Promise<any> => {
      return window.ClientApp.openFileDialog(option)
    },

    isAssorted: (): Promise<boolean> => {
      return window.ClientApp.isAssorted()
    },

    initSetting: (inputFolder: string, outputFolders: string[]): Promise<any> => {
      const IMAGE_EXT = config.public.image as string[]
      const MOVIE_EXT = config.public.movie as string[]

      return window.ClientApp.setConfig({
        media: [...IMAGE_EXT, ...MOVIE_EXT],
        inputFolder: inputFolder,
        outputFolders: [...outputFolders]
      })
    },

    moveImages: (): Promise<any> => {
      return window.ClientApp.moveImages()
    }
  }
}