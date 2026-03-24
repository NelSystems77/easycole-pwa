/**
 * Tasks Component - Gestión de tareas, proyectos y TCU
 */

import { store, actions } from '../services/store.js'
import { db } from '../services/supabase.js'
import { dateUtils } from '../utils/date.js'
import { notificationUtils } from '../utils/notifications.js'

export class TasksComponent {
  constructor() {
    this.editingTask = null
    this.showModal = false
    this.filterStatus = 'all' // all, pending, in_progress, completed
    this.filterType = 'all' // all, task, project, tcu, other
  }

  render() {
    const state = store.getState()
    let tasks = state.tasks

    // Aplicar filtros
    if (this.filterStatus !== 'all') {
      tasks = tasks.filter(t => t.status === this.filterStatus)
    }
    if (this.filterType !== 'all') {
      tasks = tasks.filter(t => t.type === this.filterType)
    }

    // Ordenar por fecha de entrega
    tasks = tasks.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))

    // Separar por estado
    const pending = tasks.filter(t => t.status === 'pending')
    const inProgress = tasks.filter(t => t.status === 'in_progress')
    const completed = tasks.filter(t => t.status === 'completed')

    // Stats
    const stats = {
      total: state.tasks.length,
      pending: state.tasks.filter(t => t.status === 'pending').length,
      inProgress: state.tasks.filter(t => t.status === 'in_progress').length,
      completed: state.tasks.filter(t => t.status === 'completed').length,
      overdue: state.tasks.filter(t => 
        t.status !== 'completed' && new Date(t.due_date) < new Date()
      ).length,
    }

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ✅ Mis Tareas
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Gestiona tus tareas, proyectos y TCU
            </p>
          </div>
          <button 
            onclick="window.tasksComponent.openModal()"
            class="btn btn-primary"
          >
            <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Nueva Tarea
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div class="card text-center">
            <div class="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-1">${stats.total}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div class="card text-center">
            <div class="text-2xl font-bold text-accent-dark mb-1">${stats.pending}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Pendientes</div>
          </div>
          <div class="card text-center">
            <div class="text-2xl font-bold text-primary mb-1">${stats.inProgress}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">En Progreso</div>
          </div>
          <div class="card text-center">
            <div class="text-2xl font-bold text-secondary mb-1">${stats.completed}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Completadas</div>
          </div>
          <div class="card text-center">
            <div class="text-2xl font-bold text-red-500 mb-1">${stats.overdue}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Atrasadas</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="card mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Status Filter -->
            <div class="flex-1">
              <label class="label text-sm">Filtrar por estado</label>
              <div class="flex gap-2 flex-wrap">
                <button 
                  onclick="window.tasksComponent.setFilter('status', 'all')"
                  class="badge ${this.filterStatus === 'all' ? 'badge-primary' : 'badge-gray'} cursor-pointer hover:opacity-80"
                >
                  Todos
                </button>
                <button 
                  onclick="window.tasksComponent.setFilter('status', 'pending')"
                  class="badge ${this.filterStatus === 'pending' ? 'badge-accent' : 'badge-gray'} cursor-pointer hover:opacity-80"
                >
                  Pendiente
                </button>
                <button 
                  onclick="window.tasksComponent.setFilter('status', 'in_progress')"
                  class="badge ${this.filterStatus === 'in_progress' ? 'badge-primary' : 'badge-gray'} cursor-pointer hover:opacity-80"
                >
                  En Progreso
                </button>
                <button 
                  onclick="window.tasksComponent.setFilter('status', 'completed')"
                  class="badge ${this.filterStatus === 'completed' ? 'badge-secondary' : 'badge-gray'} cursor-pointer hover:opacity-80"
                >
                  Completado
                </button>
              </div>
            </div>

            <!-- Type Filter -->
            <div class="flex-1">
              <label class="label text-sm">Filtrar por tipo</label>
              <div class="flex gap-2 flex-wrap">
                <button 
                  onclick="window.tasksComponent.setFilter('type', 'all')"
                  class="badge ${this.filterType === 'all' ? 'badge-primary' : 'badge-gray'} cursor-pointer hover:opacity-80"
                >
                  Todos
                </button>
                <button 
                  onclick="window.tasksComponent.setFilter('type', 'task')"
                  class="badge ${this.filterType === 'task' ? 'badge-primary' : 'badge-gray'} cursor-pointer hover:opacity-80"
                >
                  Tarea
                </button>
                <button 
                  onclick="window.tasksComponent.setFilter('type', 'project')"
                  class="badge ${this.filterType === 'project' ? 'badge-accent' : 'badge-gray'} cursor-pointer hover:opacity-80"
                >
                  Proyecto
                </button>
                <button 
                  onclick="window.tasksComponent.setFilter('type', 'tcu')"
                  class="badge ${this.filterType === 'tcu' ? 'badge-secondary' : 'badge-gray'} cursor-pointer hover:opacity-80"
                >
                  TCU
                </button>
              </div>
            </div>
          </div>
        </div>

        ${tasks.length === 0 ? `
          <!-- Empty State -->
          <div class="card text-center py-16">
            <div class="text-6xl mb-4">📝</div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ${this.filterStatus !== 'all' || this.filterType !== 'all' ? 'No hay tareas con estos filtros' : 'No tienes tareas registradas'}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              ${this.filterStatus !== 'all' || this.filterType !== 'all' ? 'Intenta cambiar los filtros' : 'Comienza agregando tu primera tarea o proyecto'}
            </p>
            ${this.filterStatus === 'all' && this.filterType === 'all' ? `
              <button onclick="window.tasksComponent.openModal()" class="btn btn-primary">
                Agregar mi primera tarea
              </button>
            ` : ''}
          </div>
        ` : `
          <!-- Tasks Board -->
          <div class="space-y-6">
            ${this.filterStatus === 'all' ? `
              <!-- Kanban Style View -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Pendientes Column -->
                <div class="card bg-accent/5">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span class="w-3 h-3 rounded-full bg-accent mr-2"></span>
                    Pendiente (${pending.length})
                  </h3>
                  <div class="space-y-3">
                    ${pending.map(task => this.renderTaskCard(task)).join('')}
                  </div>
                </div>

                <!-- En Progreso Column -->
                <div class="card bg-primary/5">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span class="w-3 h-3 rounded-full bg-primary mr-2"></span>
                    En Progreso (${inProgress.length})
                  </h3>
                  <div class="space-y-3">
                    ${inProgress.map(task => this.renderTaskCard(task)).join('')}
                  </div>
                </div>

                <!-- Completadas Column -->
                <div class="card bg-secondary/5">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span class="w-3 h-3 rounded-full bg-secondary mr-2"></span>
                    Completado (${completed.length})
                  </h3>
                  <div class="space-y-3">
                    ${completed.map(task => this.renderTaskCard(task)).join('')}
                  </div>
                </div>
              </div>
            ` : `
              <!-- List View -->
              <div class="space-y-3">
                ${tasks.map(task => this.renderTaskCard(task, true)).join('')}
              </div>
            `}
          </div>
        `}
      </div>

      ${this.showModal ? this.renderModal() : ''}
    `
  }

  renderTaskCard(task, fullWidth = false) {
    const daysUntil = dateUtils.daysUntil(task.due_date)
    const isOverdue = task.status !== 'completed' && daysUntil < 0
    const isUrgent = task.status !== 'completed' && daysUntil >= 0 && daysUntil <= 2

    const typeIcons = {
      task: '📝',
      project: '📊',
      tcu: '🤝',
      other: '📌',
    }

    const statusColors = {
      pending: 'border-accent',
      in_progress: 'border-primary',
      completed: 'border-secondary',
    }

    return `
      <div class="bg-white dark:bg-dark-card rounded-xl border-l-4 ${statusColors[task.status]} p-4 hover:shadow-md transition-shadow ${fullWidth ? '' : 'h-full'}">
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xl">${typeIcons[task.type]}</span>
              <span class="badge ${
                task.type === 'tcu' ? 'badge-secondary' : 
                task.type === 'project' ? 'badge-accent' : 
                'badge-primary'
              }">${task.type.toUpperCase()}</span>
              ${isOverdue ? '<span class="badge bg-red-500/10 text-red-500">Atrasada</span>' : ''}
              ${isUrgent ? '<span class="badge bg-accent/10 text-accent-dark">Urgente</span>' : ''}
            </div>
            <h4 class="font-bold text-gray-900 dark:text-white ${task.status === 'completed' ? 'line-through opacity-60' : ''}">
              ${task.title}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${task.subject}</p>
          </div>
          
          <div class="flex gap-1 ml-2">
            <button 
              onclick="window.tasksComponent.editTask('${task.id}')"
              class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Editar"
            >
              <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button 
              onclick="window.tasksComponent.deleteTask('${task.id}')"
              class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Eliminar"
            >
              <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Description -->
        ${task.description ? `
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            ${task.description}
          </p>
        ` : ''}

        <!-- Progress (for projects) -->
        ${task.type === 'project' && task.status !== 'completed' ? `
          <div class="mb-3">
            <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progreso</span>
              <span>${task.progress || 0}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${task.progress || 0}%"></div>
            </div>
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-dark-border">
          <div class="text-xs text-gray-500 dark:text-gray-400">
            📅 ${dateUtils.formatShortDate(task.due_date)}
            ${daysUntil >= 0 ? `(${daysUntil === 0 ? '¡Hoy!' : daysUntil === 1 ? 'Mañana' : `${daysUntil} días`})` : `(${Math.abs(daysUntil)} días atrasada)`}
          </div>
          
          <!-- Status Selector -->
          <select 
            onchange="window.tasksComponent.changeStatus('${task.id}', this.value)"
            class="text-xs px-2 py-1 rounded border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pendiente</option>
            <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>En Progreso</option>
            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completada</option>
          </select>
        </div>
      </div>
    `
  }

  renderModal() {
    const isEditing = !!this.editingTask
    const task = this.editingTask || {}

    return `
      <div class="modal-backdrop animate-fade-in" onclick="window.tasksComponent.closeModal(event)">
        <div class="modal-content animate-slide-in-up max-w-2xl" onclick="event.stopPropagation()">
          <div class="p-6">
            <!-- Modal Header -->
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                ${isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
              </h3>
              <button onclick="window.tasksComponent.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form id="task-form" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Title -->
                <div class="md:col-span-2">
                  <label class="label">Título *</label>
                  <input 
                    type="text" 
                    id="task-title" 
                    class="input" 
                    placeholder="Ej: Entregar informe de laboratorio"
                    value="${task.title || ''}"
                    required
                  >
                </div>

                <!-- Type -->
                <div>
                  <label class="label">Tipo *</label>
                  <select id="task-type" class="select" required>
                    <option value="task" ${task.type === 'task' ? 'selected' : ''}>📝 Tarea</option>
                    <option value="project" ${task.type === 'project' ? 'selected' : ''}>📊 Proyecto</option>
                    <option value="tcu" ${task.type === 'tcu' ? 'selected' : ''}>🤝 TCU</option>
                    <option value="other" ${task.type === 'other' ? 'selected' : ''}>📌 Otro</option>
                  </select>
                </div>

                <!-- Subject -->
                <div>
                  <label class="label">Asignatura *</label>
                  <input 
                    type="text" 
                    id="task-subject" 
                    class="input" 
                    placeholder="Ej: Matemáticas"
                    value="${task.subject || ''}"
                    required
                  >
                </div>

                <!-- Due Date -->
                <div>
                  <label class="label">Fecha de entrega *</label>
                  <input 
                    type="date" 
                    id="task-due-date" 
                    class="input" 
                    value="${task.due_date ? dateUtils.toInputDate(task.due_date) : ''}"
                    required
                  >
                </div>

                <!-- Status -->
                <div>
                  <label class="label">Estado</label>
                  <select id="task-status" class="select">
                    <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                    <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>En Progreso</option>
                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completado</option>
                  </select>
                </div>

                <!-- Progress (for projects) -->
                <div id="progress-field" class="md:col-span-2 ${task.type !== 'project' ? 'hidden' : ''}">
                  <label class="label">Progreso del proyecto (%)</label>
                  <div class="flex items-center gap-4">
                    <input 
                      type="range" 
                      id="task-progress" 
                      class="flex-1" 
                      min="0" 
                      max="100" 
                      step="5"
                      value="${task.progress || 0}"
                      oninput="document.getElementById('progress-value').textContent = this.value + '%'"
                    >
                    <span id="progress-value" class="text-lg font-bold text-primary w-16 text-right">${task.progress || 0}%</span>
                  </div>
                </div>

                <!-- Description -->
                <div class="md:col-span-2">
                  <label class="label">Descripción</label>
                  <textarea 
                    id="task-description" 
                    class="input" 
                    rows="3"
                    placeholder="Detalles adicionales sobre la tarea..."
                  >${task.description || ''}</textarea>
                </div>

                <!-- Reminders -->
                <div class="md:col-span-2">
                  <label class="label">Recordatorios</label>
                  <div class="space-y-2">
                    <label class="flex items-center space-x-2">
                      <input type="checkbox" id="reminder-15" class="checkbox" ${task.reminders?.includes('15_days') ? 'checked' : ''}>
                      <span class="text-sm">15 días antes</span>
                    </label>
                    <label class="flex items-center space-x-2">
                      <input type="checkbox" id="reminder-7" class="checkbox" ${task.reminders?.includes('7_days') ? 'checked' : ''}>
                      <span class="text-sm">7 días antes</span>
                    </label>
                    <label class="flex items-center space-x-2">
                      <input type="checkbox" id="reminder-3" class="checkbox" ${task.reminders?.includes('3_days') ? 'checked' : ''}>
                      <span class="text-sm">3 días antes</span>
                    </label>
                    <label class="flex items-center space-x-2">
                      <input type="checkbox" id="reminder-1" class="checkbox" ${task.reminders?.includes('1_day') ? 'checked' : ''}>
                      <span class="text-sm">1 día antes</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onclick="window.tasksComponent.closeModal()"
                  class="btn btn-outline flex-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  class="btn btn-primary flex-1"
                >
                  ${isEditing ? 'Guardar Cambios' : 'Crear Tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `
  }

  setFilter(filterType, value) {
    if (filterType === 'status') {
      this.filterStatus = value
    } else if (filterType === 'type') {
      this.filterType = value
    }
    this.refresh()
  }

  openModal(taskId = null) {
    if (taskId) {
      const state = store.getState()
      this.editingTask = state.tasks.find(t => t.id === taskId)
    } else {
      this.editingTask = null
    }
    this.showModal = true
    this.refresh()
    
    setTimeout(() => {
      document.getElementById('task-form')?.addEventListener('submit', (e) => {
        e.preventDefault()
        this.handleSubmit()
      })
      
      // Show/hide progress field based on type
      document.getElementById('task-type')?.addEventListener('change', (e) => {
        document.getElementById('progress-field').classList.toggle('hidden', e.target.value !== 'project')
      })
    }, 0)
  }

  closeModal(event = null) {
    if (event) event.stopPropagation()
    this.showModal = false
    this.editingTask = null
    this.refresh()
  }

  editTask(taskId) {
    this.openModal(taskId)
  }

  async deleteTask(taskId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return

    try {
      await db.deleteTask(taskId)
      actions.deleteTask(taskId)
      notificationUtils.showToast('Tarea eliminada', 'success')
    } catch (error) {
      console.error('Error deleting task:', error)
      notificationUtils.showToast('Error al eliminar la tarea', 'error')
    }
  }

  async changeStatus(taskId, newStatus) {
    try {
      await db.updateTask(taskId, { status: newStatus })
      actions.updateTask(taskId, { status: newStatus })
      
      if (newStatus === 'completed') {
        notificationUtils.showToast('¡Tarea completada! 🎉', 'success')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      notificationUtils.showToast('Error al actualizar el estado', 'error')
    }
  }

  async handleSubmit() {
    const formData = {
      title: document.getElementById('task-title').value.trim(),
      type: document.getElementById('task-type').value,
      subject: document.getElementById('task-subject').value.trim(),
      due_date: document.getElementById('task-due-date').value,
      status: document.getElementById('task-status').value,
      description: document.getElementById('task-description').value.trim() || null,
      progress: document.getElementById('task-type').value === 'project' 
        ? parseInt(document.getElementById('task-progress').value) 
        : null,
      reminders: [],
    }

    // Collect reminders
    if (document.getElementById('reminder-15').checked) formData.reminders.push('15_days')
    if (document.getElementById('reminder-7').checked) formData.reminders.push('7_days')
    if (document.getElementById('reminder-3').checked) formData.reminders.push('3_days')
    if (document.getElementById('reminder-1').checked) formData.reminders.push('1_day')

    if (!formData.title || !formData.subject || !formData.due_date) {
      notificationUtils.showToast('Por favor completa los campos requeridos', 'error')
      return
    }

    try {
      const state = store.getState()
      formData.user_id = state.user.id

      if (this.editingTask) {
        const updated = await db.updateTask(this.editingTask.id, formData)
        actions.updateTask(this.editingTask.id, updated)
        notificationUtils.showToast('Tarea actualizada', 'success')
      } else {
        const created = await db.createTask(formData)
        actions.addTask(created)
        notificationUtils.showToast('Tarea creada exitosamente', 'success')
        
        // Crear recordatorios
        if (formData.reminders.length > 0) {
          await this.createReminders(created.id, formData.due_date, formData.reminders)
        }
      }

      this.closeModal()
    } catch (error) {
      console.error('Error saving task:', error)
      notificationUtils.showToast('Error al guardar la tarea', 'error')
    }
  }

  async createReminders(taskId, dueDate, reminders) {
    const state = store.getState()
    const userId = state.user.id
    
    for (const reminder of reminders) {
      const days = parseInt(reminder.split('_')[0])
      const reminderDate = new Date(dueDate)
      reminderDate.setDate(reminderDate.getDate() - days)
      
      try {
        await db.createReminder({
          user_id: userId,
          task_id: taskId,
          reminder_date: reminderDate.toISOString(),
          reminder_type: reminder,
          sent: false,
        })
      } catch (error) {
        console.error('Error creating reminder:', error)
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
    window.tasksComponent = this
  }
}

export default TasksComponent
