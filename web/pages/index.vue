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
        <button class="flex-none btn btn-outline" @click="removePath(index)">
          削除
        </button>
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
    <assort-dialog ref="dialog" :folder-list="outputFolders" />
  </div>
</template>

<script>
import Storage from '@/util/storage'
import AssortDialog from '@/components/AssortDialog'

export default {
  components: {
    AssortDialog
  },

  data: () => ({
    inputFolder: '',
    outputFolders: []
  }),

  mounted () {
    this.fetchConfig()
  },

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

      this.saveConfig()
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

      this.saveConfig()
    },

    removePath (index) {
      this.outputFolders.splice(index, 1)
      this.saveConfig()
    },

    async assort () {
      if (!this.validate()) {
        return
      }

      if (await window.electron.isAssorted()) {
        if (!confirm('仕分け先指定を再度設定しますか？')) {
          return
        }
      }

      const result = await window.electron.setConfig({
        media: process.env.media,
        inputFolder: this.inputFolder,
        outputFolders: this.outputFolders
      })

      if (result.status) {
        this.$refs.dialog.open(result.data)
      } else {
        alert(result.data)
      }
    },

    async moveImages () {
      if (!this.validate()) {
        return
      }

      // TODO: ローディング
      const result = await window.electron.moveImages()
      // TODO: NG結果の処理
      console.table(result)

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
    },

    saveConfig () {
      Storage.save({
        input_folder: this.inputFolder,
        output_folders: this.outputFolders
      })
    },

    fetchConfig () {
      const data = Storage.fetch()
      this.inputFolder = data.input_folder || ''
      this.outputFolders = data.output_folders || []
    }
  }
}
</script>
