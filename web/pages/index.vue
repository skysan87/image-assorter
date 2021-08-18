<template>
  <div class="flex flex-col h-screen">
    <div class="flex-none py-1">
      <button class="btn btn-regular" @click="selectInputFolder">
        仕分けフォルダを設定
      </button>
      {{ inputFolder !== '' ? inputFolder : '(NOT SELECTED)' }}
    </div>

    <div class="flex-none">
      <button class="btn btn-regular w-full" @click="selectOutputFolder">
        出力先のフォルダを設定 (最大9つまで)
      </button>
    </div>

    <div class="flex-1 overflow-y-scroll">
      <div v-for="(path, index) in outputFolders" :key="index" class="flex w-full pt-1 px-1">
        <span class="flex-1">{{ index + 1 }}. {{ path }}</span>
        <button class="flex-none btn btn-outline" @click="removePath(index)">削除</button>
      </div>
    </div>
    <div class="flex-none">
      <button class="btn bg-green-500 w-full" @click="assort">
        仕分け先指定
      </button>
    </div>
    <div class="flex-none">
      <button class="btn bg-red-500 text-white w-full" @click="moveImages">
        !!! 仕分け実行 !!!
      </button>
    </div>
    <assort-dialog ref="dialog" :max-count="outputFolders.length" />
  </div>
</template>

<script>
import AssortDialog from '@/components/AssortDialog'

export default {
  components: {
    AssortDialog
  },

  data: () => ({
    inputFolder: '',
    outputFolders: []
  }),

  methods: {
    async selectInputFolder () {
      const result = await window.electron.openFileDialog()
      if (result.canceled || result.filePaths.length === 0) {
        return
      }

      if (this.outputFolders.includes(result.filePaths[0])) {
        alert('出力先と重複してます!')
        return
      }

      this.inputFolder = result.filePaths[0]
    },

    async selectOutputFolder () {
      const result = await window.electron.openFileDialog(['multiSelections'])
      if (result.canceled || result.filePaths.length === 0) {
        return
      }

      if ((this.outputFolders.length + result.filePaths.length) >= 9) {
        alert('これ以上登録できません!')
        return
      }

      for (const filepath of result.filePaths) {
        if (this.outputFolders.includes(filepath)) {
          continue
        }

        if (this.inputFolder === filepath) {
          continue
        }

        this.outputFolders.push(filepath)
      }
    },

    removePath (index) {
      this.outputFolders.splice(index, 1)
    },

    async assort () {
      if (!this.validate()) {
        return
      }

      const firstPath = await window.electron.setConfig({
        inputFolder: this.inputFolder,
        outputFolders: this.outputFolders
      })

      if (firstPath !== null) {
        this.$refs.dialog.open(firstPath)
      } else {
        alert('対象ファイルがありません!')
      }
    },

    async moveImages () {
      if (!this.validate()) {
        return
      }

      // TODO: ローディング
      await window.electron.moveImages()

      alert('done')
    },

    validate () {
      if (this.inputFolder === '') {
        return false
      }

      if (this.outputFolders.length === 0) {
        return false
      }

      return true
    }
  }
}
</script>
