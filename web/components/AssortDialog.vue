<template>
  <div v-show="isShown" class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container max-w-sm">
        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />

        <div class="">
          {{ imagePath }}
        </div>

        <div class="">
          <span class="text-xl font-bold mr-2">→</span>{{ outputFolder }}
        </div>

        <div class="mt-1 relative">
          <div v-if="hasPreview" class="absolute inset-y-0 left-0 top-1/2 cursor-pointer" @click="showNext(-1)">
            <span class="arrow-text">←</span>
          </div>

          <img v-if="mediaType === MEDIA_TYPE.IMAGE" :src="'file:///' + imagePath" alt="text" class="img-view">
          <video
            v-if="mediaType === MEDIA_TYPE.MOVIE"
            class="img-view"
            :src="'file:///' + imagePath"
            :controls="moviePlayable"
            muted
            controlslist="nofullscreen"
            disablePictureInPicture
            disableRemotePlayback
          />

          <div v-if="hasNext" class="absolute inset-y-0 right-0 top-1/2 cursor-pointer" @click="showNext(1)">
            <span class="arrow-text">→</span>
          </div>
        </div>

        <div class="mt-1 w-full text-center">
          <label>
            <input v-model="moviePlayable" type="checkbox">
            <span>動画を再生する</span>
          </label>
        </div>

        <div class="mt-1 flex flex-row w-full">
          <div class="flex-1 flex items-center">
            <span class="mr-1">番号で出力先を選択:</span>
            <button class="block number-box mr-1 bg-red-500 text-white" title="ゴミ箱" tabindex="-1" @click="trashImage">
              D
            </button>
            <button
              v-for="(path, index) in folderList"
              :key="index"
              :title="path"
              class="block number-box mr-1 bg-yellow-500 text-white"
              tabindex="-1"
              @click="assort(index + 1)"
            >
              {{ index + 1 }}
            </button>
          </div>
          <button ref="cancelBtn" class="flex-none btn btn-outline__red mr-2" @click="cancel">
            Cancel
          </button>
          <button ref="closeBtn" class="flex-none btn btn-outline" @click="close">
            Close
          </button>
        </div>

        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />
      </div>
    </div>
  </div>
</template>

<script>

const IMAGE_EXT = process.env.image
const MOVIE_EXT = process.env.movie

export default {
  name: 'AssortDialog',

  props: {
    folderList: {
      type: Array,
      require: true,
      default: () => []
    }
  },

  data: () => ({
    inputText: '',
    isShown: false,
    imagePath: '',
    outputFolder: '',
    hasPreview: false,
    hasNext: false,
    mediaType: null,
    MEDIA_TYPE: { IMAGE: 0, MOVIE: 1 },
    moviePlayable: false
  }),

  methods: {
    open (path) {
      this.isShown = true
      document.addEventListener('focusin', this.checkFocus, false)
      document.addEventListener('keydown', this.moveFile, false)

      this.setFileInfo(path)

      this.$nextTick(() => {
        if (this.$el) {
          this.$el.focus()
        }
        if (this.$refs.closeBtn) {
          this.$refs.closeBtn.focus()
        }
      })
    },

    close () {
      this.isShown = false
      document.removeEventListener('focusin', this.checkFocus, false)
      document.removeEventListener('keydown', this.moveFile, false)
    },

    checkFocus (ev) {
      if (ev.target !== null && ev.target.className === 'dummy') {
        this.$refs.closeBtn.focus()
      }
    },

    async cancel () {
      const result = await window.electron.cancelOutput({
        current: this.imagePath
      })

      if (result) {
        this.outputFolder = ''
      }
    },

    async moveFile (ev) {
      this.$toast.clear()

      if (ev.key === 'ArrowLeft') {
        await this.showNext(-1)
      } else if (ev.key === 'ArrowRight') {
        await this.showNext(1)
      } else if (ev.key === 'd') {
        await this.trashImage()
      } else if (this.isNumber(ev.key)) {
        await this.assort(ev.key)
      } else {
        return
      }
    },

    async showNext (offset) {
      const nextPath = await window.electron.goToNextImage({
        offset,
        current: this.imagePath
      })

      if (nextPath !== null) {
        this.setFileInfo(nextPath)
      }
    },

    async assort (key) {
      const index = parseInt(key)

      if (index <= 0 || this.folderList.length < index) {
        return
      }

      const nextPath = await window.electron.assortImage({
        outputIndex: index - 1,
        path: this.imagePath
      })

      if (!this.hasNext) {
        this.outputFolder = this.folderList[index - 1]
        return
      }

      if (nextPath !== null) {
        this.setFileInfo(nextPath)
      }
    },

    async trashImage () {
      const nextPath = await window.electron.trashImage({
        path: this.imagePath
      })

      if (!this.hasNext) {
        this.outputFolder = '[Trash]'
        return
      }

      if (nextPath !== null) {
        this.setFileInfo(nextPath)
      }
    },

    isNumber (val) {
      var pattern = /^([1-9]\d*|0)$/
      return pattern.test(val)
    },

    setFileInfo (data) {
      this.imagePath = data.input
      this.outputFolder = data.output
      this.hasNext = data.hasNext
      this.hasPreview = data.hasPrev
      this.mediaType = this.checkMediaType(data.input)
    },

    checkMediaType (filepath) {
      if (filepath === '') {
        return ''
      }

      const extension = filepath.substring(filepath.lastIndexOf('.')).toLowerCase()

      if (IMAGE_EXT.includes(extension)) {
        return this.MEDIA_TYPE.IMAGE
      } else if (MOVIE_EXT.includes(extension)) {
        return this.MEDIA_TYPE.MOVIE
      } else {
        return ''
      }
    }
  }
}
</script>

<style scoped>
.img-view {
  width: auto;
  max-height: 75vh;
  margin: 0 auto;
}

.number-box {
  @apply py-1 px-2 text-sm;
}

.arrow-text {
  @apply text-2xl;
  background-color: rgba(255, 255, 255, 0.5);
}
</style>
