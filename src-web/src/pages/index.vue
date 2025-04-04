<script setup lang="ts">
import AssortDialog from '@/components/AssortDialog.vue';
import { useConfig } from '@/composables/useConfig';
import { useFile } from '@/composables/useFile';
import { confirm, message } from '@tauri-apps/plugin-dialog';

const { inputFolder, outputFolders, saveConfig, fetchConfig, validate } = useConfig()
const { initSetting, isAssorted, moveImages, openFolderDialog, openMultipleFolderDialog } = useFile()

const dialog = ref<InstanceType<typeof AssortDialog>>()

const selectInputFolder = async () => {
  const result = await openFolderDialog()
  if (!result) {
    return
  }

  if (outputFolders.value.includes(result)) {
    await message('出力先と重複してます!')
    return
  }

  inputFolder.value = result

  saveConfig()
}

const selectOutputFolder = async () => {
  const result = await openMultipleFolderDialog()
  if (!result || result.length === 0) {
    return
  }

  if ((outputFolders.value.length + result.length) >= 9) {
    await message('これ以上登録できません。')
    return
  }

  for (const filepath of result) {
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

  if (isAssorted()) {
    if (!await confirm('仕分け先指定を再度設定しますか？')) {
      return
    }
  }
  try {
    const assortState = await initSetting(
      inputFolder.value,
      outputFolders.value
    )
    await dialog.value!.open(outputFolders.value, assortState)
  } catch (error: any) {
    await message(error.message)
  }
}

const move = async () => {
  if (!validate()) {
    return
  }

  try {
    await moveImages()
    await message('done')
  } catch (error: any) {
    await message(error.message)
  }
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