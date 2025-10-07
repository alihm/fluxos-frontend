import { ref } from 'vue'

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 3000,
  icon: '',
})

export function useSnackbar() {
  const showSnackbar = (message, color = 'success', timeout = 3000, icon = '') => {
    snackbar.value = {
      show: true,
      message,
      color,
      icon,
      timeout,
    }
  }

  const hideSnackbar = () => {
    snackbar.value.show = false
  }

  return {
    snackbar,
    showSnackbar,
    hideSnackbar,
  }
}