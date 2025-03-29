interface ConfigParams {
  media: string[]
  inputFolder: string
  outputFolders: string[]
}

interface AssortState {
  input: string
  output: string
  hasNext: boolean
  hasPrev: boolean
}

/**
 * IPC通信先のメソッド
 */
interface Window {
  ClientApp: {
    openFileDialog(options?: string[]): Promise<any>
    isAssorted(): Promise<boolean>
    setConfig(config: ConfigParams): Promise<any>
    moveImages(): Promise<any>
    cancelOutput({ current }: { current: string }): Promise<any>
    goToNextImage({ offset, current }: { offset: number, current: string }): Promise<AssortState>
    assortImage({ outputIndex, path }: { outputIndex: number, path: string }): Promise<AssortState>
    trashImage({ path }: { path: string }): Promise<AssortState>
  }
}