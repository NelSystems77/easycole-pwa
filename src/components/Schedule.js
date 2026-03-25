/**
 * Schedule Component - Gestión de horarios académicos
 * Incluye funcionalidad de upload de imágenes con OCR
 */

import { store, actions } from '../services/store.js'
import { db } from '../services/supabase.js'
import { notificationUtils } from '../utils/notifications.js'

export class ScheduleComponent {
  constructor() {
    this.editingSchedule = null
    this.showModal = false
    this.showUploadModal = false      // ← NUEVO
    this.extractedClasses = null       // ← NUEVO
    this.isProcessingImage = false     // ← NUEVO
  }

  render() {
    const state = store.getState()
    const schedules = state.schedules

    // Agrupar por día de la semana
    const schedulesByDay = {
      1: [], // Lunes
      2: [], // Martes
      3: [], // Miércoles
      4: [], // Jueves
      5: [], // Viernes
      6: [], // Sábado
      0: [], // Domingo
    }

    schedules.forEach(schedule => {
      schedulesByDay[schedule.day_of_week].push(schedule)
    })

    // Ordenar por hora de inicio
    Object.keys(schedulesByDay).forEach(day => {
      schedulesByDay[day].sort((a, b) => a.start_time.localeCompare(b.start_time))
    })

    const days = [
      { num: 1, name: 'Lunes' },
      { num: 2, name: 'Martes' },
      { num: 3, name: 'Miércoles' },
      { num: 4, name: 'Jueves' },
      { num: 5, name: 'Viernes' },
      { num: 6, name: 'Sábado' },
    ]

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📅 Mi Horario
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Gestiona tus clases y materiales
            </p>
          </div>
          
          <!-- Botones de Acción -->
          <div class="flex gap-3">
            <button 
              onclick="window.scheduleComponent.openUploadModal()"
              class="btn btn-secondary"
            >
              <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Subir Foto
            </button>
            
            <button 
              onclick="window.scheduleComponent.openModal()"
              class="btn btn-primary"
            >
              <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Agregar Manual
            </button>
          </div>
        </div>

        ${schedules.length === 0 ? `
          <!-- Empty State -->
          <div class="card text-center py-16">
            <div class="text-6xl mb-4">📚</div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No tienes clases registradas
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Agrega tus clases para que EasyCole pueda ayudarte a organizar tu mochila
            </p>
            <div class="flex gap-3 justify-center">
              <button onclick="window.scheduleComponent.openUploadModal()" class="btn btn-secondary">
                📸 Subir Foto
              </button>
              <button onclick="window.scheduleComponent.openModal()" class="btn btn-primary">
                Agregar mi primera clase
              </button>
            </div>
          </div>
        ` : `
          <!-- Schedule Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            ${days.map(day => `
              <div class="card">
                <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-dark-border">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                    ${day.name}
                  </h3>
                  <span class="badge badge-primary">
                    ${schedulesByDay[day.num].length} clases
                  </span>
                </div>

                ${schedulesByDay[day.num].length === 0 ? `
                  <div class="text-center py-8 text-gray-400">
                    <p class="text-sm">Sin clases</p>
                  </div>
                ` : `
                  <div class="space-y-3">
                    ${schedulesByDay[day.num].map(schedule => `
                      <div class="bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div class="flex items-start justify-between mb-2">
                          <div class="flex-1">
                            <h4 class="font-semibold text-gray-900 dark:text-white">
                              ${schedule.subject_name}
                            </h4>
                            <p class="text-sm text-primary font-medium mt-1">
                              ${schedule.start_time} - ${schedule.end_time}
                            </p>
                          </div>
                          <div class="flex space-x-1">
                            <button 
                              onclick="window.scheduleComponent.editSchedule('${schedule.id}')"
                              class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button 
                              onclick="window.scheduleComponent.deleteSchedule('${schedule.id}')"
                              class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div class="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          ${schedule.teacher ? `<p>👨‍🏫 ${schedule.teacher}</p>` : ''}
                          ${schedule.classroom ? `<p>🚪 ${schedule.classroom}</p>` : ''}
                          ${schedule.books && schedule.books.length > 0 ? `
                            <p class="mt-2 font-medium">📚 Libros: ${schedule.books.join(', ')}</p>
                          ` : ''}
                          ${schedule.notebooks && schedule.notebooks.length > 0 ? `
                            <p class="font-medium">📓 Cuadernos: ${schedule.notebooks.join(', ')}</p>
                          ` : ''}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            `).join('')}
          </div>

          <!-- Summary Card -->
          <div class="card mt-6 bg-gradient-to-r from-primary/10 to-primary/5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de clases</p>
                <p class="text-3xl font-bold text-primary">${schedules.length}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Horas semanales</p>
                <p class="text-3xl font-bold text-primary">${this.calculateTotalHours(schedules)}</p>
              </div>
              <div class="text-6xl">📊</div>
            </div>
          </div>
        `}

        ${this.showUploadModal ? this.renderUploadModal() : ''}
        ${this.showModal ? this.renderModal() : ''}
      </div>
    `
  }

  renderModal() {
    const days = [
      { value: 1, label: 'Lunes' },
      { value: 2, label: 'Martes' },
      { value: 3, label: 'Miércoles' },
      { value: 4, label: 'Jueves' },
      { value: 5, label: 'Viernes' },
      { value: 6, label: 'Sábado' },
      { value: 0, label: 'Domingo' },
    ]

    return `
      <div class="modal-backdrop animate-fade-in" onclick="window.scheduleComponent.closeModal(event)">
        <div class="modal-content animate-slide-in-up" onclick="event.stopPropagation()">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                ${this.editingSchedule ? 'Editar Clase' : 'Nueva Clase'}
              </h3>
              <button onclick="window.scheduleComponent.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form id="schedule-form" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Materia -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Materia *
                  </label>
                  <input 
                    type="text" 
                    id="subject-name"
                    class="input" 
                    placeholder="Ej: Matemáticas, Historia, etc."
                    value="${this.editingSchedule?.subject_name || ''}"
                    required
                  >
                </div>

                <!-- Día -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Día de la semana *
                  </label>
                  <select id="day-of-week" class="input" required>
                    <option value="">Selecciona un día</option>
                    ${days.map(day => `
                      <option value="${day.value}" ${this.editingSchedule?.day_of_week === day.value ? 'selected' : ''}>
                        ${day.label}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <!-- Aula -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aula
                  </label>
                  <input 
                    type="text" 
                    id="classroom"
                    class="input" 
                    placeholder="Ej: Aula 201"
                    value="${this.editingSchedule?.classroom || ''}"
                  >
                </div>

                <!-- Hora inicio -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hora de inicio *
                  </label>
                  <input 
                    type="time" 
                    id="start-time"
                    class="input"
                    value="${this.editingSchedule?.start_time || ''}"
                    required
                  >
                </div>

                <!-- Hora fin -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hora de fin *
                  </label>
                  <input 
                    type="time" 
                    id="end-time"
                    class="input"
                    value="${this.editingSchedule?.end_time || ''}"
                    required
                  >
                </div>

                <!-- Profesor -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profesor(a)
                  </label>
                  <input 
                    type="text" 
                    id="teacher"
                    class="input" 
                    placeholder="Nombre del profesor"
                    value="${this.editingSchedule?.teacher || ''}"
                  >
                </div>

                <!-- Libros -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Libros
                  </label>
                  <input 
                    type="text" 
                    id="books"
                    class="input" 
                    placeholder="Separados por comas"
                    value="${this.editingSchedule?.books?.join(', ') || ''}"
                  >
                </div>

                <!-- Cuadernos -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cuadernos
                  </label>
                  <input 
                    type="text" 
                    id="notebooks"
                    class="input" 
                    placeholder="Separados por comas"
                    value="${this.editingSchedule?.notebooks?.join(', ') || ''}"
                  >
                </div>

                <!-- Otros materiales -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Otros materiales
                  </label>
                  <input 
                    type="text" 
                    id="other-materials"
                    class="input" 
                    placeholder="Separados por comas"
                    value="${this.editingSchedule?.other_materials?.join(', ') || ''}"
                  >
                </div>
              </div>

              <div class="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onclick="window.scheduleComponent.closeModal()"
                  class="btn btn-outline flex-1"
                >
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary flex-1">
                  ${this.editingSchedule ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `
  }

  // ============================================
  // NUEVOS MÉTODOS: Upload de Imágenes con OCR
  // ============================================

  renderUploadModal() {
    if (this.extractedClasses) {
      return this.renderExtractedClassesPreview()
    }

    return `
      <div class="modal-backdrop animate-fade-in" onclick="window.scheduleComponent.closeUploadModal(event)">
        <div class="modal-content animate-slide-in-up max-w-2xl" onclick="event.stopPropagation()">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                📸 Subir Horario
              </h3>
              <button onclick="window.scheduleComponent.closeUploadModal()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
              <div class="flex items-start">
                <svg class="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1">
                    ¿Cómo funciona?
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Sube una foto de tu horario escolar. La IA extraerá automáticamente 
                    todas tus clases con sus horarios, profesores y aulas. Podrás revisar 
                    y editar antes de guardar.
                  </p>
                </div>
              </div>
            </div>

            <form id="upload-schedule-form" class="space-y-6">
              <div class="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl p-12 text-center hover:border-primary transition-colors">
                <input 
                  type="file" 
                  id="schedule-image" 
                  class="hidden" 
                  accept="image/*"
                  onchange="window.scheduleComponent.handleImageSelect(this)"
                >
                <label for="schedule-image" class="cursor-pointer block">
                  <svg class="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p class="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Arrastra tu horario aquí
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    o haz clic para seleccionar
                  </p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-3">
                    Formatos soportados: JPG, PNG
                  </p>
                </label>
                
                <div id="image-preview" class="hidden mt-6">
                  <img id="preview-img" class="max-h-64 mx-auto rounded-lg shadow-lg" alt="Preview">
                  <p class="text-sm text-primary mt-3 font-medium" id="image-name"></p>
                </div>
              </div>

              <div class="flex gap-3">
                <button 
                  type="button" 
                  onclick="window.scheduleComponent.closeUploadModal()"
                  class="btn btn-outline flex-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  class="btn btn-primary flex-1"
                  id="process-btn"
                  ${this.isProcessingImage ? 'disabled' : ''}
                >
                  ${this.isProcessingImage ? `
                    <svg class="animate-spin w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  ` : `
                    <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Extraer Clases con IA
                  `}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `
  }

  renderExtractedClassesPreview() {
    const groupedByDay = {}
    
    this.extractedClasses.forEach(cls => {
      if (!groupedByDay[cls.day]) {
        groupedByDay[cls.day] = []
      }
      groupedByDay[cls.day].push(cls)
    })

    const dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

    return `
      <div class="modal-backdrop animate-fade-in" onclick="event.stopPropagation()">
        <div class="modal-content animate-slide-in-up max-w-4xl" onclick="event.stopPropagation()">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                ✅ ${this.extractedClasses.length} Clases Encontradas
              </h3>
              <button onclick="window.scheduleComponent.closeUploadModal()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Revisa las clases extraídas. Puedes eliminar las que no necesites o editarlas después de guardar.
              </p>
            </div>

            <div class="max-h-96 overflow-y-auto space-y-4 mb-6">
              ${dayOrder.map(day => {
                if (!groupedByDay[day] || groupedByDay[day].length === 0) return ''
                
                return `
                  <div class="border border-gray-200 dark:border-dark-border rounded-lg p-4">
                    <h4 class="font-bold text-lg text-gray-900 dark:text-white mb-3">
                      ${day} (${groupedByDay[day].length} clases)
                    </h4>
                    <div class="space-y-2">
                      ${groupedByDay[day].map((cls, idx) => `
                        <div class="flex items-start justify-between p-3 bg-gray-50 dark:bg-dark-card rounded-lg">
                          <div class="flex-1">
                            <div class="font-medium text-gray-900 dark:text-white">
                              ${cls.subject}
                            </div>
                            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              ⏰ ${cls.start_time.substring(0, 5)} - ${cls.end_time.substring(0, 5)}
                              ${cls.professor ? `| 👨‍🏫 ${cls.professor}` : ''}
                              ${cls.classroom ? `| 🚪 ${cls.classroom}` : ''}
                            </div>
                          </div>
                          <button 
                            onclick="window.scheduleComponent.removeExtractedClass('${day}', ${idx})"
                            class="ml-3 text-red-500 hover:text-red-700"
                            title="Eliminar"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `
              }).join('')}
            </div>

            <div class="flex gap-3">
              <button 
                onclick="window.scheduleComponent.discardExtractedClasses()"
                class="btn btn-outline flex-1"
              >
                Descartar
              </button>
              <button 
                onclick="window.scheduleComponent.saveExtractedClasses()"
                class="btn btn-primary flex-1"
              >
                <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Guardar Todas (${this.extractedClasses.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  }

  openUploadModal() {
    this.showUploadModal = true
    this.extractedClasses = null
    this.refresh()
    
    setTimeout(() => {
      const form = document.getElementById('upload-schedule-form')
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault()
          this.processScheduleImage()
        })
      }
      this.setupImageDragAndDrop()
    }, 100)
  }

  closeUploadModal(event = null) {
    if (event) event.stopPropagation()
    this.showUploadModal = false
    this.extractedClasses = null
    this.isProcessingImage = false
    this.refresh()
  }

  handleImageSelect(input) {
    const file = input.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const preview = document.getElementById('image-preview')
      const img = document.getElementById('preview-img')
      const name = document.getElementById('image-name')
      
      if (preview && img && name) {
        img.src = e.target.result
        name.textContent = file.name
        preview.classList.remove('hidden')
      }
    }
    reader.readAsDataURL(file)
  }

  setupImageDragAndDrop() {
    const dropZone = document.querySelector('#upload-schedule-form > div')
    if (!dropZone) return

    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault()
        e.stopPropagation()
      })
    })

    ;['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('border-primary', 'bg-primary/5')
      })
    })

    ;['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('border-primary', 'bg-primary/5')
      })
    })

    dropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files
      if (files.length > 0) {
        const input = document.getElementById('schedule-image')
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(files[0])
        input.files = dataTransfer.files
        this.handleImageSelect(input)
      }
    })
  }

  async processScheduleImage() {
    const fileInput = document.getElementById('schedule-image')
    const file = fileInput.files[0]
    
    if (!file) {
      notificationUtils.showToast('Por favor selecciona una imagen', 'error')
      return
    }

    console.log('🚀 Iniciando extracción de horario...')
    this.isProcessingImage = true
    this.refresh()

    try {
      // Verificar Tesseract
      if (typeof window.Tesseract === 'undefined') {
        throw new Error('Tesseract no está cargado. Verifica index.html')
      }

      // Verificar API Key
      const apiKey = import.meta.env.VITE_GROQ_API_KEY
      if (!apiKey) {
        throw new Error('VITE_GROQ_API_KEY no configurada')
      }

      // PASO 1: Preprocesar imagen
      notificationUtils.showToast('Preparando imagen...', 'info', 3000)
      const preprocessedImage = await this.preprocessImageForOCR(file)
      console.log('✅ Imagen preprocesada')

      // PASO 2: OCR optimizado
      notificationUtils.showToast('Extrayendo texto del horario...', 'info', 5000)
      
      const { createWorker } = window.Tesseract
      const worker = await createWorker('spa', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR: ${Math.round(m.progress * 100)}%`)
          }
        }
      })

      await worker.setParameters({
        tessedit_pageseg_mode: '6',
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÁÉÍÓÚáéíóúñÑ0123456789:/-() ',
        preserve_interword_spaces: '1'
      })

      const { data } = await worker.recognize(preprocessedImage)
      await worker.terminate()

      const extractedText = data.text
      console.log('📝 Texto extraído:', extractedText)
      console.log('📏 Longitud:', extractedText.length, 'caracteres')
      console.log('🎯 Confianza OCR:', Math.round(data.confidence), '%')

      if (!extractedText || extractedText.trim().length < 100) {
        throw new Error('No se pudo extraer suficiente texto. Intenta con una imagen más clara.')
      }

      // PASO 3: Procesar con Groq
      notificationUtils.showToast('Analizando horario con IA...', 'info', 5000)
      
      const prompt = this.buildScheduleExtractionPrompt(extractedText)
      
      console.log('🤖 Llamando a Groq...')
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.1,
          max_tokens: 4096
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Error de Groq:', error)
        throw new Error('Error al procesar con IA')
      }

      const data2 = await response.json()
      let jsonText = data2.choices[0].message.content.trim()
      
      console.log('🤖 Respuesta de Groq:', jsonText.substring(0, 200) + '...')
      
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      const schedule = JSON.parse(jsonText)
      console.log('📦 Clases parseadas:', schedule.classes.length)

      if (!schedule.classes || schedule.classes.length === 0) {
        throw new Error('No se encontraron clases en el horario')
      }

      // PASO 4: Validar y normalizar
      const dayMap = {
        'lunes': 'Lunes', 'martes': 'Martes', 'miércoles': 'Miércoles', 
        'miercoles': 'Miércoles', 'jueves': 'Jueves', 'viernes': 'Viernes'
      }

      this.extractedClasses = schedule.classes
        .map(cls => {
          const dayLower = (cls.day || '').toLowerCase().trim()
          cls.day = dayMap[dayLower] || cls.day

          if (cls.subject) {
            cls.subject = cls.subject.replace(/\s+/g, ' ').trim().substring(0, 100)
          }

          if (cls.start_time && cls.start_time.length === 5) {
            cls.start_time += ':00'
          }
          if (cls.end_time && cls.end_time.length === 5) {
            cls.end_time += ':00'
          }

          cls.professor = cls.professor && cls.professor !== 'No especificado' ? cls.professor : null
          cls.classroom = cls.classroom && cls.classroom !== 'No especificado' ? cls.classroom : null

          return cls
        })
        .filter(cls => {
          if (!cls.subject || !cls.day || !cls.start_time || !cls.end_time) {
            console.warn('⚠️ Clase inválida:', cls)
            return false
          }

          const validDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
          if (!validDays.includes(cls.day)) {
            console.warn('⚠️ Día inválido:', cls.day)
            return false
          }

          const subject = cls.subject.toLowerCase()
          if (subject.includes('recreo') || subject.includes('receso')) {
            console.log('🚫 Filtrado recreo:', cls.subject)
            return false
          }

          return true
        })

      console.log('✅ Clases válidas:', this.extractedClasses.length)

      this.isProcessingImage = false
      this.refresh()

      if (this.extractedClasses.length === 0) {
        throw new Error('No se encontraron clases válidas. Verifica la imagen.')
      }

      notificationUtils.showToast(
        `✅ ${this.extractedClasses.length} clases encontradas!`,
        'success'
      )

    } catch (error) {
      console.error('💥 Error:', error)
      this.isProcessingImage = false
      this.refresh()
      notificationUtils.showToast(
        error.message || 'Error al procesar la imagen',
        'error'
      )
    }
  }

  preprocessImageForOCR(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const img = new Image()
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          let width = img.width
          let height = img.height
          const maxDimension = 2000
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension
              width = maxDimension
            } else {
              width = (width / height) * maxDimension
              height = maxDimension
            }
          }
          
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          
          const imageData = ctx.getImageData(0, 0, width, height)
          const data = imageData.data
          
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
            const value = avg > 128 ? 255 : 0
            data[i] = data[i + 1] = data[i + 2] = value
          }
          
          ctx.putImageData(imageData, 0, 0)
          
          canvas.toBlob((blob) => {
            resolve(blob)
          }, 'image/png')
        }
        
        img.onerror = reject
        img.src = e.target.result
      }
      
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  buildScheduleExtractionPrompt(text) {
    return `Eres un experto en analizar horarios escolares de Costa Rica.

TEXTO EXTRAÍDO DE UN HORARIO ESCOLAR:
${text}

TAREA:
Extrae TODAS las clases del horario. Los horarios pueden tener formato de tabla con días (Lunes, Martes, etc.) y horas.

REGLAS CRÍTICAS:
1. Extrae CADA clase que encuentres
2. IGNORA completamente períodos de "RECREO", "RECESO" o similares
3. Si una materia tiene "/A" y "/B" (como "Física A/B"), créalas como DOS clases separadas
4. Los días deben ser exactamente: Lunes, Martes, Miércoles, Jueves, Viernes
5. Las horas deben estar en formato HH:MM (24 horas)
6. Si no encuentras profesor o aula, usa null
7. Si el horario tiene secciones MAÑANA y TARDE, procesa AMBAS

EJEMPLOS DE FORMATO:
- "7:00-7:40 Español" → start_time: "07:00", end_time: "07:40", subject: "Español"
- "Matemática A/B" → DOS clases: "Matemática A" y "Matemática B"
- "NAVARRO DINA" → professor: "NAVARRO DINA"

RESPONDE SOLO CON ESTE JSON (sin markdown, sin explicaciones):
{
  "classes": [
    {
      "subject": "Nombre exacto de la materia",
      "day": "Lunes",
      "start_time": "07:00",
      "end_time": "08:20",
      "professor": "NOMBRE APELLIDO o null",
      "classroom": "Aula X o null"
    }
  ]
}

IMPORTANTE: 
- Incluye TODAS las clases que encuentres
- NO inventes información
- Si algo no está claro, usa null
- NO incluyas recreos`
  }

  removeExtractedClass(day, index) {
    const classesForDay = this.extractedClasses.filter(c => c.day === day)
    const classToRemove = classesForDay[index]
    
    this.extractedClasses = this.extractedClasses.filter(c => c !== classToRemove)
    
    if (this.extractedClasses.length === 0) {
      this.discardExtractedClasses()
    } else {
      this.refresh()
    }
  }

  discardExtractedClasses() {
    this.extractedClasses = null
    this.closeUploadModal()
  }

  async saveExtractedClasses() {
    if (!this.extractedClasses || this.extractedClasses.length === 0) {
      notificationUtils.showToast('No hay clases para guardar', 'error')
      return
    }

    try {
      const state = store.getState()
      const userId = state.user.id

      const dayMap = {
        'Lunes': 1,
        'Martes': 2,
        'Miércoles': 3,
        'Jueves': 4,
        'Viernes': 5
      }

      const promises = this.extractedClasses.map(async (cls) => {
        const scheduleData = {
          user_id: userId,
          subject_name: cls.subject,        // ← Nombre correcto
          day_of_week: dayMap[cls.day],
          start_time: cls.start_time,
          end_time: cls.end_time,
          teacher: cls.professor,            // ← Nombre correcto
          classroom: cls.classroom,
          books: null,
          notebooks: null,
          other_materials: null
        }

        const created = await db.createSchedule(scheduleData)
        actions.addSchedule(created)
        return created
      })

      await Promise.all(promises)

      notificationUtils.showToast(
        `✅ ${this.extractedClasses.length} clases guardadas exitosamente!`,
        'success'
      )
      
      this.closeUploadModal()
    } catch (error) {
      console.error('Error saving extracted classes:', error)
      notificationUtils.showToast('Error al guardar las clases', 'error')
    }
  }

  // ============================================
  // MÉTODOS ORIGINALES (sin cambios)
  // ============================================

  calculateTotalHours(schedules) {
    let totalMinutes = 0
    schedules.forEach(schedule => {
      const start = schedule.start_time.split(':')
      const end = schedule.end_time.split(':')
      const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1])
      const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1])
      totalMinutes += (endMinutes - startMinutes)
    })
    return Math.round(totalMinutes / 60)
  }

  openModal(scheduleId = null) {
    if (scheduleId) {
      const state = store.getState()
      this.editingSchedule = state.schedules.find(s => s.id === scheduleId)
    } else {
      this.editingSchedule = null
    }
    this.showModal = true
    this.refresh()
    
    setTimeout(() => {
      document.getElementById('schedule-form')?.addEventListener('submit', (e) => {
        e.preventDefault()
        this.handleSubmit()
      })
    }, 0)
  }

  closeModal(event = null) {
    if (event) event.stopPropagation()
    this.showModal = false
    this.editingSchedule = null
    this.refresh()
  }

  editSchedule(scheduleId) {
    this.openModal(scheduleId)
  }

  async deleteSchedule(scheduleId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta clase?')) return

    try {
      await db.deleteSchedule(scheduleId)
      actions.deleteSchedule(scheduleId)
      notificationUtils.showToast('Clase eliminada', 'success')
    } catch (error) {
      console.error('Error deleting schedule:', error)
      notificationUtils.showToast('Error al eliminar la clase', 'error')
    }
  }

  async handleSubmit() {
    const formData = {
      subject_name: document.getElementById('subject-name').value.trim(),
      day_of_week: parseInt(document.getElementById('day-of-week').value),
      start_time: document.getElementById('start-time').value,
      end_time: document.getElementById('end-time').value,
      classroom: document.getElementById('classroom').value.trim() || null,
      teacher: document.getElementById('teacher').value.trim() || null,
      books: document.getElementById('books').value
        .split(',')
        .map(b => b.trim())
        .filter(b => b),
      notebooks: document.getElementById('notebooks').value
        .split(',')
        .map(n => n.trim())
        .filter(n => n),
      other_materials: document.getElementById('other-materials').value
        .split(',')
        .map(m => m.trim())
        .filter(m => m),
    }

    if (!formData.subject_name || !formData.day_of_week || !formData.start_time || !formData.end_time) {
      notificationUtils.showToast('Por favor completa los campos requeridos', 'error')
      return
    }

    try {
      const state = store.getState()
      formData.user_id = state.user.id

      if (this.editingSchedule) {
        const updated = await db.updateSchedule(this.editingSchedule.id, formData)
        actions.updateSchedule(this.editingSchedule.id, updated)
        notificationUtils.showToast('Clase actualizada', 'success')
      } else {
        const created = await db.createSchedule(formData)
        actions.addSchedule(created)
        notificationUtils.showToast('Clase agregada exitosamente', 'success')
      }

      this.closeModal()
    } catch (error) {
      console.error('Error saving schedule:', error)
      notificationUtils.showToast('Error al guardar la clase', 'error')
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
    window.scheduleComponent = this
  }
}

export default ScheduleComponent
