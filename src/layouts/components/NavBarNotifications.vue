<script setup>
import logo from '@images/update.png'
import { onMounted, ref } from 'vue'

const notifications = ref([])
const currentVersion = import.meta.env.VITE_APP_VERSION

// Load notifications from localStorage
const loadNotifications = () => {
  const storedNotifications = localStorage.getItem('notifications')
  if (storedNotifications) {
    try {
      return JSON.parse(storedNotifications)
    } catch (error) {
      console.error('Error parsing notifications:', error)
    }
  }
  
  return []
}

const saveNotifications = () => {
  localStorage.setItem('notifications', JSON.stringify(notifications.value))
}

const checkNewVersion = async () => {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch('https://raw.githubusercontent.com/RunOnFlux/flux/master/package.json', {
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const latestVersion = data.version

    notifications.value = notifications.value.map(notification => {
      notification.time = formatTime(notification.created)

      return notification
    })

    if (compareVersions(currentVersion, latestVersion)) {
      const existingNotification = JSON.parse(localStorage.getItem('new-version-notified'))

      if (!existingNotification || existingNotification.version !== latestVersion) {
        notifications.value.push({
          id: notifications.value.length + 1,
          img: logo,
          title: 'Update Available! 🚀',
          subtitle: `A new version ${latestVersion} is available.`,
          time: formatTime(new Date().toISOString()),
          created: new Date().toISOString(),
          isSeen: false,
          color: 'info',
        })
        saveNotifications()
        localStorage.setItem('new-version-notified', JSON.stringify({ version: latestVersion }))
      }
    }
  } catch (error) {
    // Silently handle network errors - version checking is not critical functionality
    if (error.name === 'AbortError') {
      console.warn('Version check timed out - this is normal if GitHub is not accessible')
    } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_RESET')) {
      // Network connectivity issues - don't spam console
      console.warn('Unable to check for updates - network connectivity issue')
    } else {
      console.warn('Version check failed:', error.message)
    }
  }
}

const formatTime = isoString => {
  const now = new Date()
  const notificationTime = new Date(isoString)
  const diffInSeconds = Math.floor((now - notificationTime) / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  
  return `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) > 1 ? 's' : ''} ago`
}

const compareVersions = (current, latest) => {
  const currentParts = current.split('.').map(num => parseInt(num, 10))
  const latestParts = latest.split('.').map(num => parseInt(num, 10))

  for (let i = 0; i < 3; i++) {
    if (latestParts[i] > currentParts[i]) return true
    if (latestParts[i] < currentParts[i]) return false
  }
  
  return false
}

// Remove a specific notification
const removeNotification = notificationId => {
  notifications.value = notifications.value.filter(item => item.id !== notificationId)
  saveNotifications()
}

const removeAllNotifications = () => {
  notifications.value = []
  saveNotifications()
}

// Mark all notifications as read
const markRead = () => {
  console.log('Marking all notifications as read')
  notifications.value = notifications.value.map(notification => {
    notification.isSeen = true
    
    return notification
  })
  saveNotifications()
}

// Mark all notifications as unread
const markUnRead = () => {
  notifications.value = notifications.value.map(notification => {
    notification.isSeen = false
    
    return notification
  })
  saveNotifications()
}

// Mark a specific notification as read based on its id
const markNotificationRead = notificationId => {
  const notification = notifications.value.find(item => item.id === notificationId)
  if (notification) {
    notification.isSeen = true
    saveNotifications()
  }
}

// Mark a specific notification as unread based on its id
const markNotificationUnRead = notificationId => {
  const notification = notifications.value.find(item => item.id === notificationId)
  if (notification) {
    notification.isSeen = false
    saveNotifications()
  }
}

// Handle notification click (mark specific notification as read)
const handleNotificationClick = notification => {
  if (!notification.isSeen) {
    markNotificationRead(notification.id)
  } else {
    markNotificationUnRead(notification.id) 
  }
}

onMounted(() => {
  notifications.value = loadNotifications()
  checkNewVersion()
})

const totalUnseenNotifications = computed(() => {
  return notifications.value.filter(item => !item.isSeen).length
})

const badgeProps = computed(() => ({
  content: totalUnseenNotifications.value > 0 ? totalUnseenNotifications.value : '',
  color: 'error',
  offsetX: 8,
  offsetY: 5, 
}))
</script>

<template>
  <div>
    <Notifications
      :notifications="notifications"
      :badge-props="badgeProps"
      @remove="removeNotification"
      @remove-all="removeAllNotifications"
      @read="markRead"
      @unread="markUnRead"
      @click:notification="handleNotificationClick"
    />
  </div>
</template>

