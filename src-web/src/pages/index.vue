<script setup lang="ts">
import AssortDialog from '~/components/AssortDialog.vue';
import { useConfig } from '~/composables/useConfig';
import { useFile } from '~/composables/useFile';

const { inputFolder, outputFolders, saveConfig, fetchConfig, validate } = useConfig()
const { initSetting, isAssorted, moveImages, openFileDialog } = useFile()

const dialog = ref<InstanceType<typeof AssortDialog>>()

const selectInputFolder = async () => {
  const result = await openFileDialog()
  if (result.canceld || result.filePaths.length === 0) {
    return
  }

  if (outputFolders.value.includes(result.filePaths[0])) {
    alert('出力先と重複してます!')
    return
  }

  inputFolder.value = result.filePaths[0]

  saveConfig()
}

const selectOutputFolder = async () => {
  const result = await openFileDialog(['multiSelections'])
  if (result.canceled || result.filePaths.length === 0) {
    return
  }

  if ((outputFolders.value.length + result.filePaths.length) >= 9) {
    alert('これ以上登録できません!')
    return
  }

  for (const filepath of result.filePaths) {
    if (outputFolders.value.includes(filepath)) {
      continue
    }
    if (inputFolder.value === filepath) {
      continue
    }
    outputFolders.value.push(filepath)
  }

  saveConfig()
}

const removePath = (index: number) => {
  outputFolders.value.splice(index, 1)
  saveConfig()
}

const assort = async () => {
  if (!validate()) {
    return
  }

  if (await isAssorted()) {
    if (!confirm('仕分け先指定を再度設定しますか？')) {
      return
    }
  }

  const result = await initSetting(
    inputFolder.value,
    outputFolders.value
  )

  if (result.status) {
    await dialog.value!.open(outputFolders.value, result.data)
  } else {
    alert(result.data)
  }
}

const move = async () => {
  if (!validate()) {
    return
  }
  const result = await moveImages()

  // TODO: NG結果の処理
  console.table(result)

  alert('done')
}

onMounted(() => {
  fetchConfig()
})
</script>

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
      <button class="btn bg-red-500 text-white w-full" @click="move">
        仕分け実行
      </button>
    </div>
    <AssortDialog ref="dialog" />
  </div>
</template>