/**
 * Study Planner Component - Planificación inteligente con IA
 */

import { store, actions } from '../services/store.js'
import { db } from '../services/supabase.js'
import { aiService } from '../services/ai.js'
import { dateUtils } from '../utils/date.js'
import { notificationUtils } from '../utils/notifications.js'

export class StudyPlannerComponent {
  constructor() {
    this.editingExam = null
    this.showModal = false
    this.showPlanModal = false
    this.selectedExam = null
    this.studyPlan = null
    this.isGeneratingPlan = false
  }

  render() {
    const state = store.getState()
    const exams = state.exams.sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date))
    
    const upcoming = exams.filter(e => new Date(e.exam_date) >= new Date())
    const past = exams.filter(e => new Date(e.exam_date) < new Date())

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🎓 Planificador de Estudio
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Prepara tus exámenes con planes de estudio inteligentes
            </p>
          </div>
          <button 
            onclick="window.studyPlannerComponent.openModal()"
            class="btn btn-primary"
          >
            <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Nuevo Examen
          </button>
        </div>

        ${exams.length === 0 ? `
          <!-- Empty State -->
          <div class="card text-center py-16">
            <div class="text-6xl mb-4">📚</div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No tienes exámenes registrados
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Agrega tus exámenes y genera planes de estudio personalizados con IA
            </p>
            <button onclick="window.studyPlannerComponent.openModal()" class="btn btn-primary">
              Agregar mi primer examen
            </button>
          </div>
        ` : `
          <!-- Upcoming Exams -->
          ${upcoming.length > 0 ? `
            <div class="mb-8">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Próximos Exámenes
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${upcoming.map(exam => this.renderExamCard(exam)).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Past Exams -->
          ${past.length > 0 ? `
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Exámenes Pasados
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${past.map(exam => this.renderExamCard(exam, true)).join('')}
              </div>
            </div>
          ` : ''}
        `}
      </div>

      ${this.showModal ? this.renderModal() : ''}
      ${this.showPlanModal ? this.renderPlanModal() : ''}
    `
  }

  renderExamCard(exam, isPast = false) {
    const daysUntil = dateUtils.daysUntil(exam.exam_date)
    const hasPlan = !!store.getState().studyPlanCache[exam.id]

    return `
      <div class="card ${isPast ? 'opacity-60' : ''} hover:shadow-lg transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
              ${exam.subject}
            </h4>
            <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>📅 ${dateUtils.formatDate(exam.exam_date)}</p>
              ${exam.exam_time ? `<p>🕐 ${exam.exam_time}</p>` : ''}
              ${!isPast ? `
                <p class="font-semibold ${
                  daysUntil <= 3 ? 'text-red-500' : 
                  daysUntil <= 7 ? 'text-accent-dark' : 
                  'text-primary'
                }">
                  ${daysUntil === 0 ? '¡Hoy!' : daysUntil === 1 ? '¡Mañana!' : `En ${daysUntil} días`}
                </p>
              ` : ''}
            </div>
          </div>
          
          <div class="flex gap-1">
            <button 
              onclick="window.studyPlannerComponent.editExam('${exam.id}')"
              class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Editar"
            >
              <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button 
              onclick="window.studyPlannerComponent.deleteExam('${exam.id}')"
              class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Eliminar"
            >
              <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>

        ${!isPast ? `
          <div class="pt-4 border-t border-gray-200 dark:border-dark-border space-y-2">
            ${hasPlan ? `
              <button 
                onclick="window.studyPlannerComponent.viewPlan('${exam.id}')"
                class="btn btn-secondary w-full text-sm"
              >
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Ver Plan de Estudio
              </button>
            ` : `
              <button 
                onclick="window.studyPlannerComponent.createPlan('${exam.id}')"
                class="btn btn-primary w-full text-sm"
              >
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                Generar Plan con IA
              </button>
            `}
          </div>
        ` : ''}
      </div>
    `
  }

  renderModal() {
    const isEditing = !!this.editingExam
    const exam = this.editingExam || {}

    return `
      <div class="modal-backdrop animate-fade-in" onclick="window.studyPlannerComponent.closeModal(event)">
        <div class="modal-content animate-slide-in-up max-w-xl" onclick="event.stopPropagation()">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                ${isEditing ? 'Editar Examen' : 'Nuevo Examen'}
              </h3>
              <button onclick="window.studyPlannerComponent.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form id="exam-form" class="space-y-4">
              <div>
                <label class="label">Asignatura *</label>
                <input 
                  type="text" 
                  id="exam-subject" 
                  class="input" 
                  placeholder="Ej: Matemáticas"
                  value="${exam.subject || ''}"
                  required
                >
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="label">Fecha del examen *</label>
                  <input 
                    type="date" 
                    id="exam-date" 
                    class="input" 
                    value="${exam.exam_date ? dateUtils.toInputDate(exam.exam_date) : ''}"
                    required
                  >
                </div>

                <div>
                  <label class="label">Hora</label>
                  <input 
                    type="time" 
                    id="exam-time" 
                    class="input" 
                    value="${exam.exam_time || ''}"
                  >
                </div>
              </div>

              <div>
                <label class="label">Notas adicionales</label>
                <textarea 
                  id="exam-notes" 
                  class="input" 
                  rows="3"
                  placeholder="Temas importantes, formato del examen, etc."
                >${exam.notes || ''}</textarea>
              </div>

              <div class="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onclick="window.studyPlannerComponent.closeModal()"
                  class="btn btn-outline flex-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  class="btn btn-primary flex-1"
                >
                  ${isEditing ? 'Guardar' : 'Crear Examen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `
  }

  renderPlanModal() {
    if (!this.selectedExam) return ''

    return `
      <div class="modal-backdrop animate-fade-in" onclick="window.studyPlannerComponent.closePlanModal(event)">
        <div class="modal-content animate-slide-in-up max-w-4xl" onclick="event.stopPropagation()">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                ${this.studyPlan ? `Plan de Estudio - ${this.selectedExam.subject}` : 'Generar Plan de Estudio'}
              </h3>
              <button onclick="window.studyPlannerComponent.closePlanModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            ${this.studyPlan ? this.renderStudyPlan() : this.renderPlanGenerator()}
          </div>
        </div>
      </div>
    `
  }

  renderPlanGenerator() {
    return `
      <form id="generate-plan-form" class="space-y-6">
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
                Sube tu temario (PDF, DOCX o imagen) o pégalo como texto. 
                La IA analizará el contenido y generará un plan de estudio personalizado 
                dividido por días, optimizado según el tiempo que tienes disponible.
              </p>
            </div>
          </div>
        </div>

        <!-- Study Hours -->
        <div>
          <label class="label">Horas de estudio por día *</label>
          <div class="flex items-center gap-4">
            <input 
              type="range" 
              id="hours-per-day" 
              class="flex-1" 
              min="0.5" 
              max="8" 
              step="0.5"
              value="2"
              oninput="document.getElementById('hours-value').textContent = this.value + 'h'"
            >
            <span id="hours-value" class="text-lg font-bold text-primary w-16 text-right">2h</span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ¿Cuántas horas puedes dedicar al estudio cada día?
          </p>
        </div>

        <!-- Upload Methods -->
        <div>
          <label class="label">Temario del examen *</label>
          
          <!-- Tabs -->
          <div class="flex border-b border-gray-200 dark:border-dark-border mb-4">
            <button 
              type="button"
              class="tab tab-active"
              id="tab-upload"
              onclick="window.studyPlannerComponent.switchUploadTab('upload')"
            >
              Subir archivo
            </button>
            <button 
              type="button"
              class="tab"
              id="tab-text"
              onclick="window.studyPlannerComponent.switchUploadTab('text')"
            >
              Pegar texto
            </button>
          </div>

          <!-- Upload Tab -->
          <div id="upload-content">
            <div class="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl p-8 text-center hover:border-primary transition-colors">
              <input 
                type="file" 
                id="syllabus-file" 
                class="hidden" 
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                onchange="window.studyPlannerComponent.handleFileSelect(this)"
              >
              <label for="syllabus-file" class="cursor-pointer block">
                <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p class="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  Arrastra tu archivo aquí
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  o haz clic para seleccionar
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  PDF, DOCX o imágenes (JPG, PNG)
                </p>
              </label>
              <div id="file-info" class="hidden mt-4 p-3 bg-primary/10 rounded-lg">
                <p class="text-sm font-medium text-primary" id="file-name"></p>
              </div>
            </div>
          </div>

          <!-- Text Tab -->
          <div id="text-content" class="hidden">
            <textarea 
              id="syllabus-text" 
              class="input" 
              rows="10"
              placeholder="Pega aquí el temario completo del examen..."
            ></textarea>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Copia y pega el contenido del temario directamente aquí
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <button 
            type="button" 
            onclick="window.studyPlannerComponent.closePlanModal()"
            class="btn btn-outline flex-1"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            class="btn btn-primary flex-1"
            id="generate-btn"
            ${this.isGeneratingPlan ? 'disabled' : ''}
          >
            ${this.isGeneratingPlan ? `
              <svg class="animate-spin w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando...
            ` : `
              <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Generar Plan con IA
            `}
          </button>
        </div>
      </form>
    `
  }

  renderStudyPlan() {
    if (!this.studyPlan) return ''

    return `
      <div class="space-y-6">
        <!-- Plan Info -->
        <div class="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-primary mb-1">${this.studyPlan.totalDays}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Días de estudio</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-secondary mb-1">${this.studyPlan.totalHours}h</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Horas totales</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-accent-dark mb-1">${this.studyPlan.topics.length}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Temas a estudiar</div>
            </div>
          </div>
        </div>

        <!-- Daily Plan -->
        <div class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          ${this.studyPlan.schedule.map((day, index) => `
            <div class="card">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">
                    Día ${index + 1} - ${dateUtils.formatDate(day.date)}
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    ${day.hours} horas de estudio
                  </p>
                </div>
                <span class="badge badge-primary">${day.topics.length} temas</span>
              </div>
              
              <div class="space-y-2">
                ${day.topics.map(topic => `
                  <div class="bg-gray-50 dark:bg-dark-bg rounded-lg p-3">
                    <h5 class="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      📖 ${topic.title}
                    </h5>
                    ${topic.description ? `
                      <p class="text-xs text-gray-600 dark:text-gray-400">
                        ${topic.description}
                      </p>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
          <button 
            onclick="window.studyPlannerComponent.savePlan()"
            class="btn btn-secondary flex-1"
          >
            <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
            </svg>
            Guardar Plan
          </button>
          <button 
            onclick="window.studyPlannerComponent.regeneratePlan()"
            class="btn btn-outline flex-1"
          >
            <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Regenerar
          </button>
        </div>
      </div>
    `
  }

  switchUploadTab(tab) {
    document.getElementById('tab-upload').classList.toggle('tab-active', tab === 'upload')
    document.getElementById('tab-text').classList.toggle('tab-active', tab === 'text')
    document.getElementById('upload-content').classList.toggle('hidden', tab !== 'upload')
    document.getElementById('text-content').classList.toggle('hidden', tab !== 'text')
  }

  handleFileSelect(input) {
    const file = input.files[0]
    if (file) {
      document.getElementById('file-info').classList.remove('hidden')
      document.getElementById('file-name').textContent = file.name
    }
  }

  openModal(examId = null) {
    if (examId) {
      const state = store.getState()
      this.editingExam = state.exams.find(e => e.id === examId)
    } else {
      this.editingExam = null
    }
    this.showModal = true
    this.refresh()
    
    setTimeout(() => {
      document.getElementById('exam-form')?.addEventListener('submit', (e) => {
        e.preventDefault()
        this.handleSubmit()
      })
    }, 0)
  }

  closeModal(event = null) {
    if (event) event.stopPropagation()
    this.showModal = false
    this.editingExam = null
    this.refresh()
  }

  editExam(examId) {
    this.openModal(examId)
  }

  async deleteExam(examId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este examen?')) return

    try {
      await db.deleteExam(examId)
      actions.deleteExam(examId)
      notificationUtils.showToast('Examen eliminado', 'success')
    } catch (error) {
      console.error('Error deleting exam:', error)
      notificationUtils.showToast('Error al eliminar el examen', 'error')
    }
  }

  async handleSubmit() {
    const formData = {
      subject: document.getElementById('exam-subject').value.trim(),
      exam_date: document.getElementById('exam-date').value,
      exam_time: document.getElementById('exam-time').value || null,
      notes: document.getElementById('exam-notes').value.trim() || null,
    }

    if (!formData.subject || !formData.exam_date) {
      notificationUtils.showToast('Por favor completa los campos requeridos', 'error')
      return
    }

    try {
      const state = store.getState()
      formData.user_id = state.user.id

      if (this.editingExam) {
        const updated = await db.updateExam(this.editingExam.id, formData)
        actions.updateExam(this.editingExam.id, updated)
        notificationUtils.showToast('Examen actualizado', 'success')
      } else {
        const created = await db.createExam(formData)
        actions.addExam(created)
        notificationUtils.showToast('Examen agregado exitosamente', 'success')
      }

      this.closeModal()
    } catch (error) {
      console.error('Error saving exam:', error)
      notificationUtils.showToast('Error al guardar el examen', 'error')
    }
  }

  createPlan(examId) {
    const state = store.getState()
    this.selectedExam = state.exams.find(e => e.id === examId)
    this.studyPlan = null
    this.showPlanModal = true
    this.refresh()
    
    setTimeout(() => {
      document.getElementById('generate-plan-form')?.addEventListener('submit', (e) => {
        e.preventDefault()
        this.generatePlan()
      })
    }, 0)
  }

  viewPlan(examId) {
    const state = store.getState()
    this.selectedExam = state.exams.find(e => e.id === examId)
    this.studyPlan = state.studyPlanCache[examId]
    this.showPlanModal = true
    this.refresh()
  }

  closePlanModal(event = null) {
    if (event) event.stopPropagation()
    this.showPlanModal = false
    this.selectedExam = null
    this.studyPlan = null
    this.refresh()
  }

  async generatePlan() {
    this.isGeneratingPlan = true
    this.refresh()

    try {
      // Get form data
      const hoursPerDay = parseFloat(document.getElementById('hours-per-day').value)
      const file = document.getElementById('syllabus-file').files[0]
      const text = document.getElementById('syllabus-text').value.trim()

      let syllabusContent = ''

      if (file) {
        // Process file
        notificationUtils.showToast('Procesando archivo...', 'info', 5000)
        syllabusContent = await aiService.processFile(file)
      } else if (text) {
        syllabusContent = text
      } else {
        notificationUtils.showToast('Por favor proporciona un temario', 'error')
        this.isGeneratingPlan = false
        this.refresh()
        return
      }

      if (!syllabusContent || syllabusContent.length < 50) {
        notificationUtils.showToast('El temario es muy corto o no se pudo procesar', 'error')
        this.isGeneratingPlan = false
        this.refresh()
        return
      }

      // Call AI service
      notificationUtils.showToast('Generando plan de estudio con IA... ✨', 'info', 10000)
      
      const plan = await aiService.analyzeSyllabus({
        syllabusContent,
        examDate: new Date(this.selectedExam.exam_date),
        hoursPerDay,
        subjectName: this.selectedExam.subject,
        startDate: new Date(),
      })

      this.studyPlan = plan
      actions.setStudyPlan(this.selectedExam.id, plan)
      
      notificationUtils.showToast('¡Plan generado exitosamente! 🎉', 'success')
      
    } catch (error) {
      console.error('Error generating plan:', error)
      notificationUtils.showToast(
        error.message || 'Error al generar el plan. Intenta de nuevo.',
        'error'
      )
    } finally {
      this.isGeneratingPlan = false
      this.refresh()
    }
  }

  async savePlan() {
    try {
      await db.updateExam(this.selectedExam.id, {
        has_study_plan: true,
        study_plan: this.studyPlan,
      })
      
      actions.updateExam(this.selectedExam.id, {
        has_study_plan: true,
        study_plan: this.studyPlan,
      })
      
      notificationUtils.showToast('Plan guardado exitosamente', 'success')
      this.closePlanModal()
    } catch (error) {
      console.error('Error saving plan:', error)
      notificationUtils.showToast('Error al guardar el plan', 'error')
    }
  }

  regeneratePlan() {
    this.studyPlan = null
    this.refresh()
  }

  refresh() {
    const content = document.getElementById('app-content')
    if (content) {
      content.innerHTML = this.render()
      this.mount()
    }
  }

  mount() {
    window.studyPlannerComponent = this
  }
}

export default StudyPlannerComponent
