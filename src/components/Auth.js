/**
 * Auth Component - Login & Registration
 */

import { auth } from '../services/supabase.js'
import { actions } from '../services/store.js'
import { notificationUtils } from '../utils/notifications.js'

export class AuthComponent {
  constructor() {
    this.isLoginMode = true
  }

  render() {
    return `
      <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div class="w-full max-w-md">
          <!-- Logo & Title -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-dark-card rounded-2xl shadow-soft-lg mb-4">
              <img src="/icons/icon-512x512.png" alt="EasyCole" class="w-16 h-16 rounded-xl">
            </div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">EasyCole</h1>
            <p class="text-gray-600 dark:text-gray-400">Tu asistente personal inteligente</p>
            <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">by NelSystems</p>
          </div>

          <!-- Auth Card -->
          <div class="card">
            <!-- Tabs -->
            <div class="flex border-b border-gray-200 dark:border-dark-border mb-6">
              <button 
                id="tab-login" 
                class="tab tab-active flex-1"
                onclick="window.authComponent.switchTab('login')"
              >
                Iniciar Sesión
              </button>
              <button 
                id="tab-register" 
                class="tab flex-1"
                onclick="window.authComponent.switchTab('register')"
              >
                Registrarse
              </button>
            </div>

            <!-- Login Form -->
            <form id="auth-form" class="space-y-4">
              <!-- Name (only for register) -->
              <div id="name-field" class="hidden">
                <label class="label">Nombre completo</label>
                <input 
                  type="text" 
                  id="name-input" 
                  class="input" 
                  placeholder="Tu nombre"
                >
              </div>

              <!-- Email -->
              <div>
                <label class="label">Correo electrónico</label>
                <input 
                  type="email" 
                  id="email-input" 
                  class="input" 
                  placeholder="tu@email.com"
                  required
                >
              </div>

              <!-- Password -->
              <div>
                <label class="label">Contraseña</label>
                <input 
                  type="password" 
                  id="password-input" 
                  class="input" 
                  placeholder="••••••••"
                  required
                >
              </div>

              <!-- Education Level (only for register) -->
              <div id="education-field" class="hidden">
                <label class="label">Nivel educativo</label>
                <select id="education-input" class="select">
                  <option value="">Selecciona tu nivel</option>
                  <option value="primaria">Primaria</option>
                  <option value="secundaria">Secundaria</option>
                  <option value="universidad">Universidad</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                id="submit-button"
                class="btn btn-primary w-full py-3"
              >
                Iniciar Sesión
              </button>
            </form>

            <!-- Divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-200 dark:border-dark-border"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white dark:bg-dark-card text-gray-500">o continúa con</span>
              </div>
            </div>

            <!-- Google Sign In -->
            <button 
              id="google-signin"
              class="btn btn-outline w-full py-3 flex items-center justify-center space-x-2"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
          </div>

          <!-- Footer -->
          <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Al continuar, aceptas nuestros términos y condiciones
          </p>
        </div>
      </div>
    `
  }

  switchTab(mode) {
    this.isLoginMode = mode === 'login'
    
    // Update tabs
    document.getElementById('tab-login').classList.toggle('tab-active', this.isLoginMode)
    document.getElementById('tab-register').classList.toggle('tab-active', !this.isLoginMode)
    
    // Update form fields
    document.getElementById('name-field').classList.toggle('hidden', this.isLoginMode)
    document.getElementById('education-field').classList.toggle('hidden', this.isLoginMode)
    
    // Update submit button text
    document.getElementById('submit-button').textContent = 
      this.isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'
  }

  async mount() {
    window.authComponent = this

    // Form submission
    document.getElementById('auth-form').addEventListener('submit', async (e) => {
      e.preventDefault()
      await this.handleSubmit()
    })

    // Google sign in
    document.getElementById('google-signin').addEventListener('click', async () => {
      await this.handleGoogleSignIn()
    })
  }

  async handleSubmit() {
    const email = document.getElementById('email-input').value
    const password = document.getElementById('password-input').value
    const submitButton = document.getElementById('submit-button')

    // Validate
    if (!email || !password) {
      notificationUtils.showToast('Por favor completa todos los campos', 'error')
      return
    }

    if (password.length < 6) {
      notificationUtils.showToast('La contraseña debe tener al menos 6 caracteres', 'error')
      return
    }

    // Disable button
    submitButton.disabled = true
    submitButton.textContent = this.isLoginMode ? 'Iniciando...' : 'Creando cuenta...'

    try {
      if (this.isLoginMode) {
        // Login
        const { user } = await auth.signIn(email, password)
        actions.setUser(user)
        notificationUtils.showToast('¡Bienvenido de vuelta!', 'success')
      } else {
        // Register
        const name = document.getElementById('name-input').value
        const education = document.getElementById('education-input').value

        if (!name) {
          notificationUtils.showToast('Por favor ingresa tu nombre', 'error')
          submitButton.disabled = false
          submitButton.textContent = 'Crear Cuenta'
          return
        }

        const { user } = await auth.signUp(email, password, {
          full_name: name,
          education_level: education,
        })
        actions.setUser(user)
        notificationUtils.showToast('¡Cuenta creada exitosamente!', 'success')
      }
    } catch (error) {
      console.error('Auth error:', error)
      notificationUtils.showToast(
        error.message || 'Error en la autenticación. Intenta de nuevo.',
        'error'
      )
      submitButton.disabled = false
      submitButton.textContent = this.isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'
    }
  }

  async handleGoogleSignIn() {
    try {
      await auth.signInWithGoogle()
      notificationUtils.showToast('Redirigiendo a Google...', 'info')
    } catch (error) {
      console.error('Google sign in error:', error)
      notificationUtils.showToast('Error al iniciar sesión con Google', 'error')
    }
  }
}

export default AuthComponent
