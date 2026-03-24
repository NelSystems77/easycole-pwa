/**
 * Notification & Toast Utilities
 */

export const notificationUtils = {
  /**
   * Muestra un toast notification
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duración en ms (default: 3000)
   */
  showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container')
    if (!container) return

    const toast = document.createElement('div')
    toast.className = `toast-notification animate-slide-in-right ${this.getToastClass(type)}`
    
    const icon = this.getToastIcon(type)
    
    toast.innerHTML = `
      <div class="flex items-start space-x-3 p-4 rounded-xl shadow-lg bg-white dark:bg-dark-card border-l-4 ${this.getToastBorderClass(type)}">
        <div class="flex-shrink-0">
          ${icon}
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white">${message}</p>
        </div>
        <button onclick="this.closest('.toast-notification').remove()" class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `
    
    container.appendChild(toast)
    
    // Auto-remove después de la duración
    setTimeout(() => {
      toast.classList.add('opacity-0')
      setTimeout(() => toast.remove(), 200)
    }, duration)
  },

  getToastClass(type) {
    const classes = {
      success: 'toast-success',
      error: 'toast-error',
      warning: 'toast-warning',
      info: 'toast-info',
    }
    return classes[type] || classes.info
  },

  getToastBorderClass(type) {
    const classes = {
      success: 'border-secondary',
      error: 'border-red-500',
      warning: 'border-accent',
      info: 'border-primary',
    }
    return classes[type] || classes.info
  },

  getToastIcon(type) {
    const icons = {
      success: `<svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      error: `<svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      warning: `<svg class="w-6 h-6 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>`,
      info: `<svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
    }
    return icons[type] || icons.info
  },

  /**
   * Solicita permiso para notificaciones push
   * @returns {Promise<boolean>} True si se concedió el permiso
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  },

  /**
   * Muestra una notificación del navegador
   * @param {string} title - Título de la notificación
   * @param {Object} options - Opciones de la notificación
   */
  async showBrowserNotification(title, options = {}) {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones')
      return
    }

    const hasPermission = await this.requestNotificationPermission()
    if (!hasPermission) {
      console.warn('Permiso de notificaciones denegado')
      return
    }

    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options,
    }

    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Usar Service Worker si está disponible
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(title, defaultOptions)
      } else {
        // Fallback a notificación normal
        new Notification(title, defaultOptions)
      }
    } catch (error) {
      console.error('Error al mostrar notificación:', error)
    }
  },

  /**
   * Programa una notificación para el futuro
   * @param {string} title - Título
   * @param {Object} options - Opciones
   * @param {Date} scheduleDate - Fecha programada
   */
  scheduleNotification(title, options, scheduleDate) {
    const now = new Date()
    const delay = scheduleDate - now

    if (delay > 0) {
      setTimeout(() => {
        this.showBrowserNotification(title, options)
      }, delay)
    }
  },
}

export default notificationUtils
