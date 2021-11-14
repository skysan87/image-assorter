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

        <div class="mt-1 flex items-center">
          <span v-if="hasPreview" class="inline-block text-center w-6">←</span>
          <img v-if="imagePath !== ''" :src="'file:///' + imagePath" alt="text" class="img-view">
          <span v-if="hasNext" class="inline-block text-center w-6">→</span>
        </div>

        <div class="mt-1 flex flex-row w-full">
          <div class="flex-1 flex items-center">
            <span class="mr-1">番号で出力先を選択:</span>
            <div
              v-for="(path, index) in folderList"
              :key="index"
              :title="path"
              class="number-box mr-1"
              tabindex="-1"
            >
              <span>{{ index + 1 }}</span>
            </div>
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
    hasNext: false
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
      switch (ev.key) {
        case 'ArrowLeft':
          await this.showNext(-1)
          return
        case 'ArrowRight':
          await this.showNext(1)
          return
        default:
          break
      }

      if (this.isNumber(ev.key)) {
        await this.assort(ev.key)
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

    isNumber (val) {
      var pattern = /^([1-9]\d*|0)$/
      return pattern.test(val)
    },

    setFileInfo (data) {
      this.imagePath = data.input
      this.outputFolder = data.output
      this.hasNext = data.hasNext
      this.hasPreview = data.hasPrev
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
  @apply bg-yellow-500 text-white;
}
</style>
