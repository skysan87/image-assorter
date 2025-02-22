import Storage from "~/util/storage"

/**
 * 設定保存
 */
export const useConfig = () => {
  const inputFolder = ref<string>('')
  const outputFolders = ref<string[]>([])

  return {
    inputFolder,

    outputFolders,

    saveConfig: () => {
      Storage.save({
        input_folder: inputFolder.value,
        output_folders: outputFolders.value
      })
    },

    fetchConfig: () => {
      const data = Storage.fetch()
      inputFolder.value = data.input_folder ?? ''
      outputFolders.value = data.output_folders || []
    },

    validate: () => {
      if (inputFolder.value === '') {
        return false
      }
      if (outputFolders.value.length === 0) {
        return false
      }
      return true
    }
  }
}