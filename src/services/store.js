/**
 * Simple State Management System
 * Patrón Observer para reactividad
 */

class StateManager {
  constructor(initialState = {}) {
    this.state = { ...initialState }
    this.listeners = new Map()
  }

  // Obtener estado actual
  getState() {
    return { ...this.state }
  }

  // Actualizar estado
  setState(updates) {
    const oldState = { ...this.state }
    this.state = { ...this.state, ...updates }
    this.notify(oldState, this.state)
  }

  // Suscribirse a cambios
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }
    this.listeners.get(key).push(callback)

    // Retornar función de desuscripción
    return () => {
      const callbacks = this.listeners.get(key)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // Notificar a suscriptores
  notify(oldState, newState) {
    this.listeners.forEach((callbacks, key) => {
      if (oldState[key] !== newState[key]) {
        callbacks.forEach(callback => callback(newState[key], oldState[key]))
      }
    })

    // Notificar listeners globales
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(callback => callback(newState, oldState))
    }
  }

  // Reset state
  reset(initialState = {}) {
    this.state = { ...initialState }
    this.notify({}, this.state)
  }
}

// Estado inicial de la aplicación
const initialState = {
  // Usuario
  user: null,
  isAuthenticated: false,
  userProfile: null,

  // UI
  currentView: 'dashboard',
  theme: localStorage.getItem('theme') || 'light',
  sidebarOpen: false,
  loading: false,

  // Datos
  schedules: [],
  tasks: [],
  exams: [],
  reminders: [],
  
  // Caché
  backpackChecklistCache: null,
  studyPlanCache: {},
}

// Crear instancia global
export const store = new StateManager(initialState)

// Helpers para acciones comunes
export const actions = {
  // Auth
  setUser(user) {
    store.setState({
      user,
      isAuthenticated: !!user,
    })
  },

  setUserProfile(profile) {
    store.setState({ userProfile: profile })
  },

  logout() {
    store.setState({
      user: null,
      isAuthenticated: false,
      userProfile: null,
      schedules: [],
      tasks: [],
      exams: [],
      reminders: [],
    })
  },

  // UI
  setView(view) {
    store.setState({ currentView: view })
  },

  toggleTheme() {
    const currentTheme = store.getState().theme
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', newTheme)
    store.setState({ theme: newTheme })
    
    // Aplicar tema al DOM
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },

  setTheme(theme) {
    localStorage.setItem('theme', theme)
    store.setState({ theme })
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },

  toggleSidebar() {
    const current = store.getState().sidebarOpen
    store.setState({ sidebarOpen: !current })
  },

  setLoading(loading) {
    store.setState({ loading })
  },

  // Data
  setSchedules(schedules) {
    store.setState({ schedules })
  },

  addSchedule(schedule) {
    const schedules = store.getState().schedules
    store.setState({ schedules: [...schedules, schedule] })
  },

  updateSchedule(id, updates) {
    const schedules = store.getState().schedules
    store.setState({
      schedules: schedules.map(s => s.id === id ? { ...s, ...updates } : s)
    })
  },

  deleteSchedule(id) {
    const schedules = store.getState().schedules
    store.setState({
      schedules: schedules.filter(s => s.id !== id)
    })
  },

  setTasks(tasks) {
    store.setState({ tasks })
  },

  addTask(task) {
    const tasks = store.getState().tasks
    store.setState({ tasks: [...tasks, task] })
  },

  updateTask(id, updates) {
    const tasks = store.getState().tasks
    store.setState({
      tasks: tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    })
  },

  deleteTask(id) {
    const tasks = store.getState().tasks
    store.setState({
      tasks: tasks.filter(t => t.id !== id)
    })
  },

  setExams(exams) {
    store.setState({ exams })
  },

  addExam(exam) {
    const exams = store.getState().exams
    store.setState({ exams: [...exams, exam] })
  },

  updateExam(id, updates) {
    const exams = store.getState().exams
    store.setState({
      exams: exams.map(e => e.id === id ? { ...e, ...updates } : e)
    })
  },

  deleteExam(id) {
    const exams = store.getState().exams
    store.setState({
      exams: exams.filter(e => e.id !== id)
    })
  },

  setReminders(reminders) {
    store.setState({ reminders })
  },

  // Cache
  setBackpackChecklist(checklist) {
    store.setState({ backpackChecklistCache: checklist })
  },

  setStudyPlan(examId, plan) {
    const cache = store.getState().studyPlanCache
    store.setState({
      studyPlanCache: { ...cache, [examId]: plan }
    })
  },
}

// Inicializar tema
actions.setTheme(initialState.theme)

export default store
