/**
 * Backpack Component - Vista completa del checklist de mochila
 */

import { store } from '../services/store.js'
import { dateUtils } from '../utils/date.js'
import { backpackAssistant } from '../utils/backpack.js'
import { notificationUtils } from '../utils/notifications.js'

export class BackpackComponent {
  constructor() {
    this.selectedDate = null
    this.weeklyData = []
    this.currentChecklist = null
  }

  render() {
    const state = store.getState()
    
    // Si no hay fecha seleccionada, usar mañana
    if (!this.selectedDate) {
      this.selectedDate = new Date()
      this.selectedDate.setDate(this.selectedDate.getDate() + 1)
    }

    // Generar datos para toda la semana
    this.weeklyData = backpackAssistant.generateWeeklyChecklist(state.schedules)
    
    // Obtener checklist del día seleccionado
    this.currentChecklist = backpackAssistant.generateChecklist(state.schedules, this.selectedDate)
    
    // Cargar estado guardado
    const savedState = backpackAssistant.loadChecklistState(dateUtils.toInputDate(this.selectedDate))
    if (savedState) {
      this.currentChecklist.checklist = savedState
    }
    
    const progress = backpackAssistant.getChecklistProgress(this.currentChecklist.checklist)

    return `
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header -->
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📦 Mi Mochila
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Organiza tus materiales de forma inteligente
          </p>
        </div>

        <!-- Date Selector - Week Pills -->
        <div class="card mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Selecciona un día</h3>
          <div class="grid grid-cols-7 gap-2">
            ${this.weeklyData.map((day, index) => {
              const isSelected = dateUtils.toInputDate(day.date) === dateUtils.toInputDate(this.selectedDate)
              const isToday = dateUtils.isToday(day.date)
              const isTomorrow = dateUtils.isTomorrow(day.date)
              
              return `
                <button 
                  onclick="window.backpackComponent.selectDate('${dateUtils.toInputDate(day.date)}')"
                  class="flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-primary text-white shadow-lg scale-105' 
                      : day.hasClasses
                      ? 'bg-gray-100 dark:bg-dark-card hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      : 'bg-gray-50 dark:bg-dark-bg text-gray-400 dark:text-gray-600'
                  }"
                >
                  <span class="text-xs font-medium mb-1">
                    ${day.dayName.substring(0, 3)}
                  </span>
                  <span class="text-xl font-bold">
                    ${day.date.getDate()}
                  </span>
                  ${isToday ? '<span class="text-xs mt-1">Hoy</span>' : ''}
                  ${isTomorrow ? '<span class="text-xs mt-1">Mañana</span>' : ''}
                  ${day.hasClasses ? `
                    <span class="w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'} mt-1"></span>
                  ` : ''}
                </button>
              `
            }).join('')}
          </div>
        </div>

        <!-- Main Backpack Card -->
        <div class="card">
          <!-- Header with Date -->
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-dark-border">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                ${this.currentChecklist.dayName}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ${dateUtils.formatDate(this.selectedDate)}
              </p>
            </div>
            ${this.currentChecklist.hasClasses ? `
              <div class="text-right">
                <div class="text-3xl font-bold text-primary">${progress.percentage}%</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">completo</div>
              </div>
            ` : ''}
          </div>

          ${this.currentChecklist.hasClasses ? `
            <!-- Progress Bar -->
            <div class="mb-6">
              <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>${progress.checked} de ${progress.total} elementos</span>
                <span>${progress.pending} pendientes</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress.percentage}%"></div>
              </div>
            </div>

            <!-- Classes Info -->
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
              <h4 class="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Horario del día (${this.currentChecklist.classes.length} clases)
              </h4>
              <div class="space-y-2">
                ${this.currentChecklist.classes.map(cls => `
                  <div class="flex items-center justify-between bg-white dark:bg-dark-card rounded-lg p-3">
                    <div>
                      <div class="font-semibold text-gray-900 dark:text-white">${cls.subject}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">${cls.teacher || 'Sin profesor asignado'}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm font-medium text-primary">${cls.time}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">${cls.classroom || 'Sin aula'}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Materials by Category -->
            <div class="space-y-4 mb-6">
              ${this.currentChecklist.stats.books > 0 ? `
                <div>
                  <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    📚 Libros (${this.currentChecklist.stats.books})
                  </h4>
                  <div class="space-y-2">
                    ${this.currentChecklist.checklist
                      .filter(item => item.type === 'book')
                      .map(item => this.renderChecklistItem(item))
                      .join('')}
                  </div>
                </div>
              ` : ''}

              ${this.currentChecklist.stats.notebooks > 0 ? `
                <div>
                  <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    📓 Cuadernos (${this.currentChecklist.stats.notebooks})
                  </h4>
                  <div class="space-y-2">
                    ${this.currentChecklist.checklist
                      .filter(item => item.type === 'notebook')
                      .map(item => this.renderChecklistItem(item))
                      .join('')}
                  </div>
                </div>
              ` : ''}

              ${this.currentChecklist.stats.other > 0 ? `
                <div>
                  <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    ✏️ Otros materiales (${this.currentChecklist.stats.other})
                  </h4>
                  <div class="space-y-2">
                    ${this.currentChecklist.checklist
                      .filter(item => item.type === 'other')
                      .map(item => this.renderChecklistItem(item))
                      .join('')}
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button 
                onclick="window.backpackComponent.resetChecklist()"
                class="btn btn-outline flex-1"
              >
                <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Reiniciar
              </button>
              <button 
                onclick="window.backpackComponent.shareChecklist()"
                class="btn btn-primary flex-1"
              >
                <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
                Compartir
              </button>
            </div>

            ${progress.isComplete ? `
              <div class="mt-6 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl p-6 text-center">
                <div class="text-5xl mb-3">🎉</div>
                <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  ¡Mochila lista!
                </h4>
                <p class="text-gray-600 dark:text-gray-400">
                  Has preparado todo lo necesario para mañana
                </p>
              </div>
            ` : ''}

          ` : `
            <!-- No Classes -->
            <div class="text-center py-12">
              <div class="text-6xl mb-4">🎉</div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ¡No tienes clases este día!
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Disfruta tu tiempo libre
              </p>
              <button onclick="window.app.navigate('schedule')" class="btn btn-primary">
                Ver mi horario completo
              </button>
            </div>
          `}
        </div>

        <!-- Weekly Overview -->
        <div class="card mt-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resumen Semanal
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-primary/10 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-primary mb-1">
                ${this.weeklyData.filter(d => d.hasClasses).length}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Días con clases</div>
            </div>
            <div class="bg-secondary/10 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-secondary mb-1">
                ${this.weeklyData.reduce((sum, d) => sum + (d.classes?.length || 0), 0)}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Total de clases</div>
            </div>
            <div class="bg-accent/10 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-accent-dark mb-1">
                ${backpackAssistant.getMaterialsFrequency(state.schedules).length}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Materiales únicos</div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  renderChecklistItem(item) {
    return `
      <label class="flex items-center space-x-3 bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-4 cursor-pointer transition-all group">
        <input 
          type="checkbox" 
          class="checkbox" 
          ${item.checked ? 'checked' : ''}
          onchange="window.backpackComponent.toggleItem('${item.id}')"
        >
        <span class="flex-1 ${item.checked ? 'line-through opacity-60' : ''} text-gray-900 dark:text-white font-medium">
          ${item.icon} ${item.name}
        </span>
        ${item.checked ? `
          <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        ` : ''}
      </label>
    `
  }

  selectDate(dateString) {
    this.selectedDate = dateUtils.fromInputDate(dateString)
    this.refresh()
  }

  toggleItem(itemId) {
    const item = this.currentChecklist.checklist.find(i => i.id === itemId)
    if (item) {
      item.checked = !item.checked
      
      // Guardar estado
      backpackAssistant.saveChecklistState(
        dateUtils.toInputDate(this.selectedDate),
        this.currentChecklist.checklist
      )
      
      const progress = backpackAssistant.getChecklistProgress(this.currentChecklist.checklist)
      
      if (progress.isComplete) {
        notificationUtils.showToast('¡Mochila completa! 🎉', 'success')
      }
      
      this.refresh()
    }
  }

  resetChecklist() {
    if (confirm('¿Estás seguro de que quieres reiniciar el checklist?')) {
      this.currentChecklist.checklist.forEach(item => item.checked = false)
      backpackAssistant.saveChecklistState(
        dateUtils.toInputDate(this.selectedDate),
        this.currentChecklist.checklist
      )
      notificationUtils.showToast('Checklist reiniciado', 'info')
      this.refresh()
    }
  }

  async shareChecklist() {
    const text = `📦 Mi mochila para ${this.currentChecklist.dayName}:\n\n${
      this.currentChecklist.checklist.map(item => 
        `${item.checked ? '✅' : '⬜'} ${item.icon} ${item.name}`
      ).join('\n')
    }\n\nGenerado con EasyCole by NelSystems`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi mochila - EasyCole',
          text: text,
        })
        notificationUtils.showToast('¡Compartido exitosamente!', 'success')
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error)
        }
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(text)
        notificationUtils.showToast('Copiado al portapapeles', 'success')
      } catch (error) {
        console.error('Error copying:', error)
        notificationUtils.showToast('No se pudo compartir', 'error')
      }
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
    window.backpackComponent = this
  }
}

export default BackpackComponent
