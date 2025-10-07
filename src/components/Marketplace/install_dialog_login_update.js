const fs = require('fs')

const file = 'InstallDialog.vue'
let content = fs.readFileSync(file, 'utf8')

// 1. Add Login component import
const importSection = content.indexOf("import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'")
if (importSection > -1) {
  content = content.slice(0, importSection) + 
    "import Login from '@/@core/components/Login.vue'\n" +
    content.slice(importSection)
}

// 2. Add Login Dialog in template (before </template>)
const templateEnd = content.lastIndexOf('</template>')
const loginDialog = `
  <!-- Login Dialog -->
  <VDialog
    v-model="showLoginDialog"
    max-width="900"
    persistent
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span>Login Required</span>
        <VBtn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="closeLoginDialog"
        />
      </VCardTitle>
      <VCardText>
        <Login />
      </VCardText>
    </VCard>
  </VDialog>
`

content = content.slice(0, templateEnd) + loginDialog + '\n' + content.slice(templateEnd)

// 3. Add showLoginDialog ref (after other refs like popupBlockedDialog)
const popupBlockedPos = content.indexOf('const popupBlockedDialog = ref(false)')
if (popupBlockedPos > -1) {
  const insertPos = content.indexOf('\n', popupBlockedPos) + 1
  content = content.slice(0, insertPos) + 
    'const showLoginDialog = ref(false)\n' +
    content.slice(insertPos)
}

// 4. Add isLoggedIn computed (after other computed properties)
const computedSection = content.indexOf('const isOpen = computed({')
if (computedSection > -1) {
  // Find next blank line after isOpen definition
  let insertPos = content.indexOf('})', computedSection)
  insertPos = content.indexOf('\n\n', insertPos) + 2
  
  const isLoggedInComputed = `// Check if user is logged in
const isLoggedIn = computed(() => {
  const zelidauth = localStorage.getItem('zelidauth')
  return zelidauth && zelidauth.length > 0
})

`
  content = content.slice(0, insertPos) + isLoggedInComputed + content.slice(insertPos)
}

// 5. Add closeLoginDialog function
const closeDialogPos = content.indexOf('const closeDialog = () =>')
if (closeDialogPos > -1) {
  const insertPos = content.indexOf('}', closeDialogPos) + 1
  const closeLoginFunc = `

const closeLoginDialog = () => {
  showLoginDialog.value = false
  // Also close the install dialog
  isOpen.value = false
}
`
  content = content.slice(0, insertPos) + closeLoginFunc + content.slice(insertPos)
}

// 6. Add watch for login status
const watchSection = content.lastIndexOf('}, { immediate: true })')
if (watchSection > -1) {
  const insertPos = content.indexOf('\n', watchSection) + 1
  const loginWatch = `
// Watch for login status - close login dialog when user logs in
watch(isLoggedIn, (newValue) => {
  if (newValue && showLoginDialog.value) {
    showLoginDialog.value = false
  }
})

// Check login status when dialog opens
watch(() => props.modelValue, (newValue, oldValue) => {
  if (oldValue === false && newValue === true) {
    // Dialog is opening - check if user is logged in
    if (!isLoggedIn.value) {
      // User not logged in - show login dialog instead
      showLoginDialog.value = true
      // Close the install dialog
      isOpen.value = false
    }
  }
}, { immediate: false })
`
  content = content.slice(0, insertPos) + loginWatch + content.slice(insertPos)
}

fs.writeFileSync(file, content)
console.log('✅ InstallDialog updated with login functionality')
