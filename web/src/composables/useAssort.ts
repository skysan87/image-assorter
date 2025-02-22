import { MEDIA_TYPE } from '~/const/const'

/**
 * ファイル仕分け
 * TODO: electronと連動しない場合はmock
 */
export const useAssort = () => {
  const config = useRuntimeConfig()

  const imagePath = ref<string>('')
  const outputFolder = ref<string>('')
  const hasPreview = ref(false)
  const hasNext = ref(false)
  const mediaType = ref<number | null>(null)
  const _folderList = ref<string[]>([])

  const IMAGE_EXT = config.public.image as string[]
  const MOVIE_EXT = config.public.movie as string[]

  function checkMediaType(filepath: string) {
    if (!filepath || filepath === '') {
      return MEDIA_TYPE.NONE
    }

    const extension = filepath.substring(filepath.lastIndexOf('.')).toLowerCase()

    if (IMAGE_EXT.includes(extension)) {
      return MEDIA_TYPE.IMAGE
    } else if (MOVIE_EXT.includes(extension)) {
      return MEDIA_TYPE.MOVIE
    } else {
      return MEDIA_TYPE.NONE
    }
  }

  function setFileInfo(data: AssortState) {
    imagePath.value = data.input
    outputFolder.value = data.output
    hasNext.value = data.hasNext
    hasPreview.value = data.hasPrev
    mediaType.value = checkMediaType(data.input)
  }

  return {
    folderList: readonly(_folderList),

    imagePath: readonly(imagePath),

    outputFolder: readonly(outputFolder),

    hasPreview: readonly(hasPreview),

    hasNext: readonly(hasNext),

    mediaType: readonly(mediaType),

    filePath: computed(() => 'file:///' + imagePath.value),

    init: async (folderList: string[], info: AssortState) => {
      _folderList.value = [...folderList]
      setFileInfo(info)
    },

    isNumber: (val: string) => {
      var pattern = /^([1-9]\d*|0)$/
      return pattern.test(val)
    },

    cancelOutput: async () => {
      const result = await window.ClientApp.cancelOutput({ current: imagePath.value })
      if (result) {
        outputFolder.value = ''
      }
    },

    showNext: async (offset: number) => {
      const nextPath = await window.ClientApp.goToNextImage({
        offset,
        current: imagePath.value
      })
      if (nextPath !== null) {
        setFileInfo(nextPath)
      }
    },

    assort: async (key: string | number) => {

      const index = typeof key === 'number' ? key : parseInt(key)

      if (index <= 0 || _folderList.value.length < index) {
        return
      }

      const nextPath = await window.ClientApp.assortImage({
        outputIndex: index - 1,
        path: imagePath.value
      })

      if (!hasNext.value) {
        outputFolder.value = _folderList.value[index - 1]
        return
      }

      if (nextPath !== null) {
        setFileInfo(nextPath)
      }
    },

    trashImage: async () => {
      const nextPath = await window.ClientApp.trashImage({
        path: imagePath.value
      })

      if (!hasNext.value) {
        outputFolder.value = '[Trash]'
        return
      }

      if (nextPath !== null) {
        setFileInfo(nextPath)
      }
    }
  }
}