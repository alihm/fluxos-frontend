import { ref } from 'vue'

const showLoginSheet = ref(false)

export function useLoginSheet() {
  const openLoginBottomSheet = () => {
    showLoginSheet.value = true
  }

  const closeLoginBottomSheet = () => {
    showLoginSheet.value = false
  }

  return {
    showLoginSheet,
    openLoginBottomSheet,
    closeLoginBottomSheet,
  }
}
