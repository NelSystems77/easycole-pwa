/**
 * Main Application Entry Point
 */

import './styles/main.css'
import { auth, db } from './services/supabase.js'
import { store, actions } from './services/store.js'
import { notificationUtils } from './utils/notifications.js'
import { AuthComponent } from './components/Auth.js'
import { DashboardComponent } from './components/Dashboard.js'
import { BackpackComponent } from './components/Backpack.js'
import { ScheduleComponent } from './components/Schedule.js'
import { TasksComponent } from './components/Tasks.js'
import { StudyPlannerComponent } from './components/StudyPlanner.js'

class EasyColeApp {
  constructor() {
    this.components = {
      auth: new AuthComponent(),
      dashboard: new DashboardComponent(),
      backpack: new BackpackComponent(),
      schedule: new ScheduleComponent(),
      tasks: new TasksComponent(),
      studyPlanner: new StudyPlannerComponent(),
    }
    
    this.currentView = null
  }

  async init() {
    console.log('🚀 Initializing EasyCole...')
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js')
        console.log('✅ Service Worker registered:', registration)
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              notificationUtils.showToast(
                'Nueva versión disponible. Recarga la página para actualizar.',
                'info',
                10000
              )
            }
          })
        })
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error)
      }
    }

    // Setup auth listener
    auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await this.handleSignIn(session.user)
      } else if (event === 'SIGNED_OUT') {
        this.handleSignOut()
      }
    })

    // Check initial auth state
    try {
      const user = await auth.getCurrentUser()
      if (user) {
        await this.handleSignIn(user)
      } else {
        this.showAuth()
      }
    } catch (error) {
      console.error('Auth check error:', error)
      this.showAuth()
    }

    // Setup navigation
    this.setupNavigation()
    
    // Setup theme toggle
    this.setupThemeToggle()
    
    // Request notification permission
    await notificationUtils.requestNotificationPermission()
    
    // Show install prompt if available
    this.setupInstallPrompt()
    
    console.log('✅ EasyCole initialized')
  }

  async handleSignIn(user) {
    console.log('👤 User signed in:', user.email)
    actions.setUser(user)
    
    // Load user data
    try {
      const [schedules, tasks, exams] = await Promise.all([
        db.getSchedules(user.id),
        db.getTasks(user.id),
        db.getExams(user.id),
      ])
      
      actions.setSchedules(schedules)
      actions.setTasks(tasks)
      actions.setExams(exams)
      
      console.log('📊 User data loaded:', {
        schedules: schedules.length,
        tasks: tasks.length,
        exams: exams.length,
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      notificationUtils.showToast('Error al cargar tus datos', 'error')
    }
    
    // Hide loading, show app
    document.getElementById('loading-screen').style.display = 'none'
    document.getElementById('app-header').classList.remove('hidden')
    document.getElementById('app-content').classList.remove('hidden')
    document.getElementById('bottom-nav').classList.remove('hidden')
    
    // Set user initials
    const initials = user.user_metadata?.full_name
      ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)
      : user.email[0].toUpperCase()
    document.getElementById('user-initials').textContent = initials
    
    // Navigate to dashboard
    this.navigate('dashboard')
  }

  handleSignOut() {
    console.log('👋 User signed out')
    actions.logout()
    this.showAuth()
  }

  showAuth() {
    document.getElementById('loading-screen').style.display = 'none'
    document.getElementById('app-header').classList.add('hidden')
    document.getElementById('app-content').classList.remove('hidden')
    document.getElementById('bottom-nav').classList.add('hidden')
    
    const content = document.getElementById('app-content')
    content.innerHTML = this.components.auth.render()
    this.components.auth.mount()
  }

  navigate(view, params = {}) {
    console.log(`🧭 Navigating to: ${view}`, params)
    
    this.currentView = view
    actions.setView(view)
    
    const content = document.getElementById('app-content')
    const component = this.components[view]
    
    if (component) {
      content.innerHTML = component.render()
      component.mount()
      
      // Update navigation active states
      document.querySelectorAll('.nav-item').forEach(item => {
        const itemView = item.getAttribute('data-view')
        if (itemView === view) {
          item.classList.remove('text-gray-400')
          item.classList.add('text-primary')
        } else {
          item.classList.remove('text-primary')
          item.classList.add('text-gray-400')
        }
      })
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      console.error(`Unknown view: ${view}`)
    }
  }

  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(button => {
      button.addEventListener('click', () => {
        const view = button.getAttribute('data-view')
        this.navigate(view)
      })
    })

    // User menu
    document.getElementById('user-menu-button')?.addEventListener('click', () => {
      this.showUserMenu()
    })
  }

  setupThemeToggle() {
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      actions.toggleTheme()
    })
  }

  setupInstallPrompt() {
    let deferredPrompt
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      
      // Show install prompt
      const prompt = document.createElement('div')
      prompt.id = 'install-prompt'
      prompt.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-1">
              Instalar EasyCole
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Accede más rápido desde tu pantalla de inicio
            </p>
          </div>
          <div class="flex gap-2 ml-4">
            <button id="install-dismiss" class="btn btn-ghost text-sm">
              Después
            </button>
            <button id="install-accept" class="btn btn-primary text-sm">
              Instalar
            </button>
          </div>
        </div>
      `
      document.body.appendChild(prompt)
      
      document.getElementById('install-accept').addEventListener('click', async () => {
        prompt.remove()
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log(`Install prompt outcome: ${outcome}`)
        deferredPrompt = null
      })
      
      document.getElementById('install-dismiss').addEventListener('click', () => {
        prompt.remove()
      })
    })

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed successfully')
      notificationUtils.showToast('¡EasyCole instalado exitosamente!', 'success')
    })
  }

  showUserMenu() {
    const modal = document.createElement('div')
    modal.className = 'modal-backdrop animate-fade-in'
    modal.innerHTML = `
      <div class="modal-content max-w-sm animate-slide-in-up" onclick="event.stopPropagation()">
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Mi Cuenta
          </h3>
          
          <div class="space-y-3">
            <button onclick="window.app.closeUserMenu(); window.app.navigate('schedule')" class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div class="font-medium text-gray-900 dark:text-white">Mi Horario</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Gestionar clases</div>
            </button>
            
            <button onclick="window.app.closeUserMenu(); window.app.showSettings()" class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div class="font-medium text-gray-900 dark:text-white">Configuración</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Preferencias y notificaciones</div>
            </button>
            
            <button onclick="window.app.closeUserMenu(); window.app.handleSignOut()" class="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400">
              <div class="font-medium">Cerrar Sesión</div>
            </button>
          </div>
        </div>
      </div>
    `
    
    modal.addEventListener('click', () => {
      modal.remove()
    })
    
    document.body.appendChild(modal)
  }

  closeUserMenu() {
    document.querySelector('.modal-backdrop')?.remove()
  }

  showSettings() {
    notificationUtils.showToast('Configuración próximamente disponible', 'info')
  }

  async handleSignOut() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      try {
        await auth.signOut()
        notificationUtils.showToast('Sesión cerrada', 'success')
      } catch (error) {
        console.error('Sign out error:', error)
        notificationUtils.showToast('Error al cerrar sesión', 'error')
      }
    }
  }
}

// Initialize app
const app = new EasyColeApp()
window.app = app

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init())
} else {
  app.init()
}

// Handle errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  notificationUtils.showToast('Ha ocurrido un error. Recarga la página.', 'error')
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  notificationUtils.showToast('Error de conexión. Verifica tu internet.', 'error')
})

export default app
