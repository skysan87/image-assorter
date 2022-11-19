<template>
  <div class="flex flex-col h-screen">
    <div class="flex-none py-1">
      <button class="btn btn-regular" @click="selectInputFolder">
        移動先フォルダを設定
      </button>
      {{ inputFolder !== '' ? inputFolder : '(NOT SELECTED)' }}
    </div>
    <div class="flex-1 flex justify-center items-center">
      <div
        class="drop_area"
        :class="{ enter: isEnter }"
        @dragenter="dragEnter"
        @dragleave="dragLeave"
        @dragover.prevent
        @drop.prevent="dropFile($event)"
      >
        ドロップしたファイルをナンバリング
        <br>
        ※複数のファイルは不可
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    isEnter: false,
    inputFolder: ''
  }),

  methods: {
    dragEnter () {
      this.isEnter = true
    },
    dragLeave () {
      this.isEnter = false
    },
    async dropFile (e) {
      try {
        const files = e.dataTransfer.files
        if (files.length !== 1) {
          throw new Error('操作できません')
        }

        if (this.inputFolder === '') {
          throw new Error('移動先フォルダを選択してください')
        }

        await window.electron.numberFile({
          file: files[0].path,
          dir: this.inputFolder
        })
      } catch (error) {
        alert(error.message)
      } finally {
        this.isEnter = false
      }
    },
    async selectInputFolder () {
      const result = await window.electron.openFileDialog()
      if (result.canceled || result.filePaths.length === 0) {
        return
      }
      this.inputFolder = result.filePaths[0]
    }
  }
}

</script>

<style scoped>
.drop_area {
  color: gray;
  font-weight: bold;
  font-size: 1.2em;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 500px;
  height: 300px;
  border: 5px solid gray;
  border-radius: 15px;
}

.enter {
  border: 10px dotted powderblue;
}
</style>
