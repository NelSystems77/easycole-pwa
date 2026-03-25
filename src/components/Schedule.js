/**
 * Schedule Component - Gestión de horarios académicos
 */

import { store, actions } from '../services/store.js'
import { db } from '../services/supabase.js'
import { notificationUtils } from '../utils/notifications.js'

export class ScheduleComponent {
  constructor() {
    this.editingSchedule = null
    this.showModal = false
    this.showUploadModal = false
    this.extractedClasses = null
    this.isProcessingImage = false
    
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
            <button onclick="window.scheduleComponent.openModal()" class="btn btn-primary">
              Agregar mi primera clase
            </button>
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

          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div class="card text-center">
              <div class="text-3xl font-bold text-primary mb-1">${schedules.length}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Total clases</div>
            </div>
            <div class="card text-center">
              <div class="text-3xl font-bold text-secondary mb-1">
                ${new Set(schedules.map(s => s.subject_name)).size}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Asignaturas</div>
            </div>
            <div class="card text-center">
              <div class="text-3xl font-bold text-accent-dark mb-1">
                ${days.filter(d => schedulesByDay[d.num].length > 0).length}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Días activos</div>
            </div>
            <div class="card text-center">
              <div class="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-1">
                ${this.calculateTotalHours(schedules)}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Horas/semana</div>
            </div>
          </div>
        `}
      </div>

      ${this.showUploadModal ? this.renderUploadModal() : ''}
      ${this.showModal ? this.renderModal() : ''}
    `
  }

  renderModal() {
    const isEditing = !!this.editingSchedule
    const schedule = this.editingSchedule || {}

    return `
      <div class="modal-backdrop animate-fade-in" onclick="window.scheduleComponent.closeModal(event)">
        <div class="modal-content animate-slide-in-up" onclick="event.stopPropagation()">
          <div class="p-6">
            <!-- Modal Header -->
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                ${isEditing ? 'Editar Clase' : 'Agregar Nueva Clase'}
              </h3>
              <button onclick="window.scheduleComponent.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form id="schedule-form" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Subject Name -->
                <div class="md:col-span-2">
                  <label class="label">Nombre de la asignatura *</label>
                  <input 
                    type="text" 
                    id="subject-name" 
                    class="input" 
                    placeholder="Ej: Matemáticas, Historia, etc."
                    value="${schedule.subject_name || ''}"
                    required
                  >
                </div>

                <!-- Day of Week -->
                <div>
                  <label class="label">Día de la semana *</label>
                  <select id="day-of-week" class="select" required>
                    <option value="">Selecciona un día</option>
                    <option value="1" ${schedule.day_of_week === 1 ? 'selected' : ''}>Lunes</option>
                    <option value="2" ${schedule.day_of_week === 2 ? 'selected' : ''}>Martes</option>
                    <option value="3" ${schedule.day_of_week === 3 ? 'selected' : ''}>Miércoles</option>
                    <option value="4" ${schedule.day_of_week === 4 ? 'selected' : ''}>Jueves</option>
                    <option value="5" ${schedule.day_of_week === 5 ? 'selected' : ''}>Viernes</option>
                    <option value="6" ${schedule.day_of_week === 6 ? 'selected' : ''}>Sábado</option>
                  </select>
                </div>

                <!-- Classroom -->
                <div>
                  <label class="label">Aula</label>
                  <input 
                    type="text" 
                    id="classroom" 
                    class="input" 
                    placeholder="Ej: A-101"
                    value="${schedule.classroom || ''}"
                  >
                </div>

                <!-- Start Time -->
                <div>
                  <label class="label">Hora de inicio *</label>
                  <input 
                    type="time" 
                    id="start-time" 
                    class="input" 
                    value="${schedule.start_time || ''}"
                    required
                  >
                </div>

                <!-- End Time -->
                <div>
                  <label class="label">Hora de finalización *</label>
                  <input 
                    type="time" 
                    id="end-time" 
                    class="input" 
                    value="${schedule.end_time || ''}"
                    required
                  >
                </div>

                <!-- Teacher -->
                <div class="md:col-span-2">
                  <label class="label">Profesor/a</label>
                  <input 
                    type="text" 
                    id="teacher" 
                    class="input" 
                    placeholder="Nombre del profesor"
                    value="${schedule.teacher || ''}"
                  >
                </div>

                <!-- Books -->
                <div class="md:col-span-2">
                  <label class="label">Libros necesarios</label>
                  <input 
                    type="text" 
                    id="books" 
                    class="input" 
                    placeholder="Separa múltiples libros con comas"
                    value="${schedule.books ? schedule.books.join(', ') : ''}"
                  >
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Ej: Álgebra Vol. 1, Geometría Avanzada
                  </p>
                </div>

                <!-- Notebooks -->
                <div class="md:col-span-2">
                  <label class="label">Cuadernos necesarios</label>
                  <input 
                    type="text" 
                    id="notebooks" 
                    class="input" 
                    placeholder="Separa múltiples cuadernos con comas"
                    value="${schedule.notebooks ? schedule.notebooks.join(', ') : ''}"
                  >
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Ej: Cuaderno cuadriculado, Cuaderno de dibujo
                  </p>
                </div>

                <!-- Other Materials -->
                <div class="md:col-span-2">
                  <label class="label">Otros materiales</label>
                  <input 
                    type="text" 
                    id="other-materials" 
                    class="input" 
                    placeholder="Calculadora, regla, compás, etc."
                    value="${schedule.other_materials ? schedule.other_materials.join(', ') : ''}"
                  >
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onclick="window.scheduleComponent.closeModal()"
                  class="btn btn-outline flex-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  class="btn btn-primary flex-1"
                >
                  ${isEditing ? 'Guardar Cambios' : 'Agregar Clase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `
  }

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
    
    // Mount form handler después de renderizar
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

    // Validar
    if (!formData.subject_name || !formData.day_of_week || !formData.start_time || !formData.end_time) {
      notificationUtils.showToast('Por favor completa los campos requeridos', 'error')
      return
    }

    try {
      const state = store.getState()
      formData.user_id = state.user.id

      if (this.editingSchedule) {
        // Actualizar
        const updated = await db.updateSchedule(this.editingSchedule.id, formData)
        actions.updateSchedule(this.editingSchedule.id, updated)
        notificationUtils.showToast('Clase actualizada', 'success')
      } else {
        // Crear nuevo
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

  this.isProcessingImage = true
  this.refresh()

  try {
    const base64 = await this.fileToBase64(file)
    
    notificationUtils.showToast('Procesando imagen con IA...', 'info', 5000)

    const response = await fetch('/api/extract-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al procesar la imagen')
    }

    const data = await response.json()
    
    if (!data.schedule || !data.schedule.classes || data.schedule.classes.length === 0) {
      throw new Error('No se encontraron clases en la imagen')
    }

    this.extractedClasses = data.schedule.classes
    this.isProcessingImage = false
    this.refresh()
    
    notificationUtils.showToast(
      `✅ ${this.extractedClasses.length} clases encontradas!`,
      'success'
    )
  } catch (error) {
    console.error('Error processing schedule image:', error)
    this.isProcessingImage = false
    this.refresh()
    notificationUtils.showToast(
      error.message || 'Error al procesar la imagen',
      'error'
    )
  }
}

fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
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
        subject: cls.subject,
        day_of_week: dayMap[cls.day],
        start_time: cls.start_time,
        end_time: cls.end_time,
        professor: cls.professor,
        classroom: cls.classroom,
        books: null,
        notebooks: null
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
                  Sube una foto o PDF de tu horario escolar. La IA extraerá automáticamente 
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
                accept="image/*,.pdf"
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
                  Formatos soportados: JPG, PNG, PDF
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
