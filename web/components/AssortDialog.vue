<template>
  <div v-show="isShown" class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container max-w-sm">
        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />

        <div class="mx-2 mb-6">
          <img v-if="imagePath !== ''" :src="'file:///' + imagePath" alt="text">
        </div>

        <div class="mx-2">
          {{ outputFolder }}
        </div>

        <div class="flex flex-row-reverse mx-2">
          <button ref="closeBtn" class="btn btn-outline mx-1" @click="close">
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
    maxCount: {
      type: Number,
      require: true,
      default: 0
    }
  },

  data: () => ({
    inputText: '',
    isShown: false,
    imagePath: '',
    outputFolder: ''
  }),

  methods: {
    open (path) {
      this.isShown = true
      document.addEventListener('focusin', this.checkFocus, false)
      document.addEventListener('keydown', this.moveFile, false)

      this.imagePath = path.input
      this.outputFolder = path.output
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

    async moveFile (ev) {
      if (isNaN(ev.key)) {
        return
      }

      const index = parseInt(ev.key)

      if (index <= 0 || this.maxCount < index) {
        return
      }

      const nextPath = await window.electron.assortImage({
        outputIndex: index - 1,
        path: this.imagePath
      })

      if (nextPath !== null) {
        this.imagePath = nextPath.input
        this.outputFolder = nextPath.output
      } else {
        alert('done')
        this.close()
      }
    }
  }
}
</script>
