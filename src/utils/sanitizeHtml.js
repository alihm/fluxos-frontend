import DOMPurify from 'dompurify'

export default {
  mounted(el, binding) {
    el.innerHTML = DOMPurify.sanitize(binding.value)
  },
  updated(el, binding) {
    el.innerHTML = DOMPurify.sanitize(binding.value)
  },
}
