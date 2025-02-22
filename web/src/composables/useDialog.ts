const CLOSE_REASON_OK = ''
const CLOSE_REASON_CANCEL = 'cancel'

export const useDialog = () => {
  const dialog = ref<HTMLDialogElement>()

  return {
    dialog,

    open: (onOpen: () => void = () => { }, onClose: (isCancel: boolean) => any = () => null) => {
      if (!dialog.value) {
        throw new Error('dialog is empty')
      }

      return new Promise<any>((resolve, reject) => {
        try {
          dialog.value!.showModal()
          onOpen()
        } catch (error) {
          reject(error)
        }
        dialog.value!.addEventListener('close', () => {
          try {
            const isCancel = dialog.value!.returnValue === CLOSE_REASON_CANCEL
            const returnValue = onClose(isCancel)
            resolve(returnValue)
          } catch (error) {
            reject(error)
          }
        }, { once: true })
      })
    },

    cancel: () => {
      dialog.value?.close(CLOSE_REASON_CANCEL)
    },

    submit: () => {
      dialog.value?.close(CLOSE_REASON_OK)
    }
  }
}