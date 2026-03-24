/**
 * Dashboard Component - Vista principal con widget de mochila
 */

import { store } from '../services/store.js'
import { dateUtils } from '../utils/date.js'
import { backpackAssistant } from '../utils/backpack.js'

export class DashboardComponent {
  constructor() {
    this.backpackData = null
  }

  render() {
    const state = store.getState()
    const user = state.user
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Estudiante'
    
    // Generar checklist de mochila
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    this.backpackData = backpackAssistant.generateChecklist(state.schedules, tomorrow)
    
    // Cargar estado guardado si existe
    const savedState = backpackAssistant.loadChecklistState(dateUtils.toInputDate(tomorrow))
    if (savedState) {
      this.backpackData.checklist = savedState
    }
    
    const progress = backpackAssistant.getChecklistProgress(this.backpackData.checklist)

    // Próximas tareas
    const upcomingTasks = state.tasks
      .filter(task => task.status !== 'completed')
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 3)

    // Próximos exámenes
    const upcomingExams = state.exams
      .filter(exam => new Date(exam.exam_date) >= new Date())
      .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date))
      .slice(0, 2)

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <!-- Welcome Section -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Hola, ${userName}! 👋
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            ${this.getGreeting()}
          </p>
        </div>

        <!-- Backpack Widget (Destacado) -->
        <div class="card gradient-primary text-white">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-2xl font-bold mb-1">📦 Mi Mochila</h3>
              <p class="text-white/90">${this.backpackData.message}</p>
              <p class="text-sm text-white/80 mt-1">${this.backpackData.dayName}</p>
            </div>
            ${this.backpackData.hasClasses ? `
              <div class="text-right">
                <div class="text-3xl font-bold">${progress.checked}/${progress.total}</div>
                <div class="text-sm text-white/80">completo</div>
              </div>
            ` : ''}
          </div>

          ${this.backpackData.hasClasses ? `
            <!-- Progress Bar -->
            <div class="mb-6">
              <div class="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-white rounded-full transition-all duration-500" 
                  style="width: ${progress.percentage}%"
                ></div>
              </div>
            </div>

            <!-- Classes for Tomorrow -->
            <div class="bg-white/10 rounded-xl p-4 mb-4">
              <h4 class="font-semibold mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Clases de mañana
              </h4>
              <div class="space-y-2">
                ${this.backpackData.classes.map(cls => `
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-medium">${cls.subject}</span>
                    <span class="text-white/80">${cls.time}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Checklist Preview -->
            <div class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              ${this.backpackData.checklist.slice(0, 5).map((item, index) => `
                <label class="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg p-3 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    class="checkbox text-white border-white/30" 
                    ${item.checked ? 'checked' : ''}
                    onchange="window.dashboardComponent.toggleChecklistItem('${item.id}')"
                  >
                  <span class="flex-1 ${item.checked ? 'line-through opacity-60' : ''}">
                    ${item.icon} ${item.name}
                  </span>
                </label>
              `).join('')}
              ${this.backpackData.checklist.length > 5 ? `
                <button 
                  onclick="window.app.navigate('backpack')"
                  class="w-full text-center py-2 text-sm text-white/80 hover:text-white transition-colors"
                >
                  Ver ${this.backpackData.checklist.length - 5} más...
                </button>
              ` : ''}
            </div>
          ` : `
            <div class="text-center py-8">
              <div class="text-6xl mb-4">🎉</div>
              <p class="text-xl font-semibold">¡Día libre!</p>
              <p class="text-white/80 mt-2">Disfruta tu descanso</p>
            </div>
          `}
        </div>

        <!-- Grid Layout for Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Upcoming Tasks -->
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <svg class="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Próximas Tareas
              </h3>
              <button onclick="window.app.navigate('tasks')" class="text-primary hover:text-primary-dark text-sm font-medium">
                Ver todas →
              </button>
            </div>
            
            ${upcomingTasks.length > 0 ? `
              <div class="space-y-3">
                ${upcomingTasks.map(task => {
                  const daysUntil = dateUtils.daysUntil(task.due_date)
                  const urgency = daysUntil <= 1 ? 'text-red-500' : daysUntil <= 3 ? 'text-accent-dark' : 'text-gray-500'
                  return `
                    <div class="border-l-4 ${daysUntil <= 1 ? 'border-red-500' : 'border-primary'} pl-4 py-2">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <h4 class="font-semibold text-gray-900 dark:text-white">${task.title}</h4>
                          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${task.subject}</p>
                        </div>
                        <span class="badge ${daysUntil <= 1 ? 'badge-accent' : 'badge-gray'} ml-2">
                          ${daysUntil === 0 ? '¡Hoy!' : daysUntil === 1 ? 'Mañana' : `${daysUntil} días`}
                        </span>
                      </div>
                    </div>
                  `
                }).join('')}
              </div>
            ` : `
              <div class="text-center py-8 text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>¡Todo al día!</p>
              </div>
            `}
          </div>

          <!-- Upcoming Exams -->
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <svg class="w-6 h-6 mr-2 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Próximos Exámenes
              </h3>
              <button onclick="window.app.navigate('study-planner')" class="text-secondary hover:text-secondary-dark text-sm font-medium">
                Ver todos →
              </button>
            </div>
            
            ${upcomingExams.length > 0 ? `
              <div class="space-y-4">
                ${upcomingExams.map(exam => {
                  const daysUntil = dateUtils.daysUntil(exam.exam_date)
                  return `
                    <div class="bg-gradient-to-r from-secondary/10 to-transparent rounded-xl p-4 border-l-4 border-secondary">
                      <div class="flex items-start justify-between mb-2">
                        <h4 class="font-bold text-gray-900 dark:text-white">${exam.subject}</h4>
                        <span class="badge badge-secondary">${daysUntil} días</span>
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        📅 ${dateUtils.formatDate(exam.exam_date)}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        🕐 ${exam.exam_time || 'Hora por definir'}
                      </p>
                      ${exam.has_study_plan ? `
                        <button onclick="window.app.navigate('study-planner', {examId: '${exam.id}'})" class="mt-3 text-sm text-secondary hover:text-secondary-dark font-medium">
                          Ver plan de estudio →
                        </button>
                      ` : `
                        <button onclick="window.app.navigate('study-planner', {createPlanFor: '${exam.id}'})" class="mt-3 text-sm text-accent-dark hover:text-accent font-medium">
                          Crear plan de estudio →
                        </button>
                      `}
                    </div>
                  `
                }).join('')}
              </div>
            ` : `
              <div class="text-center py-8 text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>No hay exámenes próximos</p>
              </div>
            `}
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="card text-center">
            <div class="text-3xl font-bold text-primary mb-1">${state.schedules.length}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Clases</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-secondary mb-1">${state.tasks.filter(t => t.status !== 'completed').length}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Pendientes</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-accent-dark mb-1">${state.tasks.filter(t => t.status === 'in_progress').length}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">En Progreso</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-1">${state.exams.length}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Exámenes</div>
          </div>
        </div>
      </div>
    `
  }

  getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días ☀️'
    if (hour < 18) return 'Buenas tardes 🌤️'
    return 'Buenas noches 🌙'
  }

  toggleChecklistItem(itemId) {
    const item = this.backpackData.checklist.find(i => i.id === itemId)
    if (item) {
      item.checked = !item.checked
      
      // Guardar estado
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      backpackAssistant.saveChecklistState(
        dateUtils.toInputDate(tomorrow),
        this.backpackData.checklist
      )
      
      // Refrescar vista
      this.refresh()
    }
  }

  refresh() {
    const content = document.getElementById('app-content')
    if (content) {
      content.innerHTML = this.render()
      this.mount()
    }
  }

  mount() {
    window.dashboardComponent = this
    
    // Suscribirse a cambios en el store
    store.subscribe('schedules', () => this.refresh())
    store.subscribe('tasks', () => this.refresh())
    store.subscribe('exams', () => this.refresh())
  }
}

export default DashboardComponent
