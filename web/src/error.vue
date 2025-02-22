<script setup>
const error = useError()

const handleError = () => {
  clearError({
    redirect: '/'
  })
}

// NOTE:
// electron用の設定: generateしたindex.htmlをelectron側で開くと失敗するため、リダイレクトする
// それ以外は無限ループの可能性があるので注意
onMounted(handleError)
</script>

<template>
  <div class="flex h-screen justify-center items-center flex-col">
    <!-- <h1 class="text-9xl">{{ error.statusCode }}</h1>
    <p class="mt-7 text-4xl">{{ error.message }}</p> -->
    <button @click="handleError" class="rounded mt-7 text-2xl bg-blue-400 px-7 py-4 text-white">
      Go To TOP
    </button>
  </div>
</template>