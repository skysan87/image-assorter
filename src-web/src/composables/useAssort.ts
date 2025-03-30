import { MEDIA_TYPE } from '~/const/const'
import { convertFileSrc } from '@tauri-apps/api/core'

/**
 * ファイル仕分け
 */
export const useAssort = () => {
  const config = useRuntimeConfig()

  const imagePath = ref<string>('')
  const outputFolder = ref<string>('')
  const hasPreview = ref(false)
  const hasNext = ref(false)
  const mediaType = ref<number | null>(null)
  const src = ref<string>('')
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
    // @see https://v2.tauri.app/ja/reference/javascript/api/namespacecore/#convertfilesrc
    src.value = convertFileSrc(data.input)
  }

  return {
    folderList: readonly(_folderList),

    imagePath: readonly(imagePath),

    outputFolder: readonly(outputFolder),

    hasPreview: readonly(hasPreview),

    hasNext: readonly(hasNext),

    mediaType: readonly(mediaType),

    filePath: readonly(src),

    init: (info: AssortState) => {
      setFileInfo(info)
    },

    isNumber: (val: string) => {
      const pattern = /^([1-9]\d*|0)$/
      return pattern.test(val)
    }
  }
}