<script setup lang="ts">
import { useAssort } from '~/composables/useAssort'
import { useDialog } from '~/composables/useDialog'
import { MEDIA_TYPE } from '~/const/const'

const { dialog, open: _open, cancel: _cancel, submit } = useDialog()
const {
  folderList, imagePath, outputFolder, hasPreview, hasNext, mediaType, filePath,
  init, cancelOutput, showNext, trashImage, assort, isNumber
} = useAssort()

const moviePlayable = ref(false)

const cancel = async () => {
  await cancelOutput()
  _cancel()
}

const moveFile = async (ev: KeyboardEvent) => {
  if (ev.key === 'Escape') {
    // escape連打でdaialogで閉じるのを抑制
    ev.preventDefault()
    ev.stopPropagation();
  }

  if (ev.key === 'ArrowLeft') {
    await showNext(-1)
  } else if (ev.key === 'ArrowRight') {
    await showNext(1)
  } else if (ev.key === 'd') {
    await trashImage()
  } else if (isNumber(ev.key)) {
    await assort(ev.key)
  } else {
    return
  }
}

defineExpose({
  open: (_folderList: string[] = [], info: AssortState): Promise<boolean> => {
    return _open(() => {
      init(_folderList, info)
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

      <div class="relative img-box">
        <div v-if="hasPreview" class="absolute inset-y-0 left-0 top-1/2 cursor-pointer" @click="showNext(-1)">
          <span class="arrow-text text-2xl">←</span>
        </div>

        <img v-if="mediaType === MEDIA_TYPE.IMAGE" :src="filePath" alt="text" class="img-view">
        <video v-if="mediaType === MEDIA_TYPE.MOVIE" class="img-view" :src="filePath" :controls="moviePlayable" muted
          controlslist="nofullscreen" disablePictureInPicture disableRemotePlayback />

        <div v-if="hasNext" class="absolute inset-y-0 right-0 top-1/2 cursor-pointer" @click="showNext(1)">
          <span class="arrow-text text-2xl">→</span>
        </div>
      </div>

      <div class="footer flex-none">
        <div class="w-full text-center">
          <label>
            <input v-model="moviePlayable" type="checkbox">
            <span>動画を再生する</span>
          </label>
        </div>

        <div class="flex flex-row w-full">
          <div class="flex-1 flex items-center">
            <span class="mr-1">番号で出力先を選択:</span>
            <button class="block py-1 px-2 text-sm mr-1 bg-red-500 text-white" title="ゴミ箱" tabindex="-1"
              @click="trashImage">
              D
            </button>
            <button v-for="(path, index) in folderList" :key="index" :title="path"
              class="block py-1 px-2 text-sm mr-1 bg-yellow-500 text-white" tabindex="-1" @click="assort(index + 1)">
              {{ index + 1 }}
            </button>
          </div>
          <button ref="cancelBtn" class="flex-none btn btn-outline__red mr-2" @click="cancel">
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
.img-box {
  max-height: 75vh;
}

.img-view {
  width: auto;
  max-height: 75vh;
  margin: auto;
}

.arrow-text {
  background-color: rgba(255, 255, 255, 0.5);
}
</style>