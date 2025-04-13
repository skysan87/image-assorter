<script setup lang="ts">
import { useAssort } from '~/composables/useAssort'
import { useDialog } from '~/composables/useDialog'
import { MEDIA_TYPE, DELETE_INDEX } from '~/const/const'

const { dialog, open: _open, cancel: _cancel, submit } = useDialog()
const {
  imagePath, outputFolder, hasPreview, hasNext, mediaType, filePath,
  init, isNumber
} = useAssort()
const {
  cancelOutput, goToNextImage, trashImage, assortImage
} = useFile()

const moviePlayable = ref(false)

const folderList = ref<string[]>([])

const closeBtn = ref<HTMLButtonElement>()

const cancel = async () => {
  cancelOutput(imagePath.value)
  _cancel()
}

const assort = async (key: string | number) => {
  const index = typeof key === 'number' ? key : parseInt(key)
  if (index <= 0 || folderList.value.length < index) {
    return
  }
  const outputFolder: string = folderList.value[index - 1]
  const nextPath = assortImage(imagePath.value, outputFolder)
  if (!hasNext.value) {
    // 最後の状態を表示
    init({
      hasNext: hasNext.value,
      hasPrev: hasPreview.value,
      input: imagePath.value,
      output: outputFolder
    } as AssortState)

    // closeにフォーカス
    closeBtn.value?.focus()
    return
  } else {
    init(nextPath)
  }
}

const showPreview = () => {
  init(goToNextImage(imagePath.value, -1))
}

const showNext = () => {
  init(goToNextImage(imagePath.value, 1))
}

const trash = () => {
  const nextPath = trashImage(imagePath.value)
  if (!hasNext.value) {
    // 最後の状態を表示
    init({
      hasNext: hasNext.value,
      hasPrev: hasPreview.value,
      input: imagePath.value,
      output: DELETE_INDEX
    } as AssortState)

    // closeにフォーカス
    closeBtn.value?.focus()
    return
  } else {
    init(nextPath)
  }
}

const moveFile = (ev: KeyboardEvent) => {
  if (ev.key === 'Escape') {
    // escape連打でdaialogで閉じるのを抑制
    ev.preventDefault()
    ev.stopPropagation();
  }

  if (ev.key === 'ArrowLeft') {
    showPreview()
  } else if (ev.key === 'ArrowRight') {
    showNext()
  } else if (ev.key === 'd') {
    trash()
  } else if (isNumber(ev.key)) {
    assort(ev.key)
  } else {
    return
  }
}

defineExpose({
  open: (_folderList: string[] = [], info: AssortState): Promise<boolean> => {
    return _open(() => {
      folderList.value = [..._folderList]
      init(info)

      document.addEventListener('keydown', moveFile, false)
    }, (isCancel) => {
      document.removeEventListener('keydown', moveFile, false)
      return !isCancel
    })
  }
})

</script>

<template>
  <dialog ref="dialog" @cancel.prevent class="p-0 m-0 rounded-lg">
    <div class="h-full flex flex-col p-2">
      <div class="header flex-none">
        <div>{{ imagePath }}</div>
        <div>
          <span class="text-xl font-bold mr-2">→</span>{{ outputFolder }}
        </div>
      </div>

      <div class="content flex-1 relative">
        <div v-if="hasPreview" class="absolute inset-y-0 left-0 top-1/2 cursor-pointer" @click="showPreview">
          <span class="arrow-text text-2xl">←</span>
        </div>

        <img v-if="mediaType === MEDIA_TYPE.IMAGE" :src="filePath" alt="img" class="img-view">
        <video v-if="mediaType === MEDIA_TYPE.MOVIE" class="img-view" :src="filePath" :controls="moviePlayable" muted
          controlslist="nofullscreen" disablePictureInPicture disableRemotePlayback />

        <div v-if="hasNext" class="absolute inset-y-0 right-0 top-1/2 cursor-pointer" @click="showNext">
          <span class="arrow-text text-2xl">→</span>
        </div>
      </div>

      <div class="footer flex-none">
        <div class="w-full text-center">
          <label>
            <input v-model="moviePlayable" type="checkbox">
            <span class="ml-1 select-none">動画を再生する</span>
          </label>
        </div>

        <div class="flex flex-row w-full">
          <div class="flex-1 flex items-center">
            <span class="mr-1">番号で出力先を選択:</span>
            <button class="block py-1 px-2 text-sm mr-1 bg-red-500 text-white" title="ゴミ箱" tabindex="-1" @click="trash">
              D
            </button>
            <button v-for="(path, index) in folderList" :key="index" :title="path"
              class="block py-1 px-2 text-sm mr-1 bg-yellow-500 text-white" tabindex="-1" @click="assort(index + 1)">
              {{ index + 1 }}
            </button>
          </div>
          <button class="flex-none btn btn-outline__red mr-2" @click="cancel">
            Cancel
          </button>
          <button ref="closeBtn" class="flex-none btn btn-outline" @click="submit">
            Close
          </button>
        </div>
      </div>

    </div>
  </dialog>
</template>

<style scoped>
.header {
  height: 52px;
}

.content {
  height: calc(100% - 52px - 54px) !important;
}

.footer {
  height: 54px;
}

.img-view {
  width: auto;
  margin: auto;
  object-fit: contain;
  height: 100%;
}

.arrow-text {
  background-color: rgba(255, 255, 255, 0.5);
}
</style>