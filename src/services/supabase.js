import { createClient } from '@supabase/supabase-js'

// Variables de entorno (configurar en Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
})

// Auth helpers
export const auth = {
  async signUp(email, password, profile = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profile,
      },
    })
    if (error) throw error
    return data
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async updateProfile(updates) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    })
    if (error) throw error
    return data
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Database helpers
export const db = {
  // Schedules
  async getSchedules(userId) {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', userId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })
    if (error) throw error
    return data
  },

  async createSchedule(schedule) {
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedule)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateSchedule(id, updates) {
    const { data, error } = await supabase
      .from('schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteSchedule(id) {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // Tasks
  async getTasks(userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true })
    if (error) throw error
    return data
  },

  async createTask(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateTask(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteTask(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // Exams
  async getExams(userId) {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('user_id', userId)
      .order('exam_date', { ascending: true })
    if (error) throw error
    return data
  },

  async createExam(exam) {
    const { data, error } = await supabase
      .from('exams')
      .insert(exam)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateExam(id, updates) {
    const { data, error } = await supabase
      .from('exams')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteExam(id) {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // Reminders
  async getReminders(userId) {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('sent', false)
      .order('reminder_date', { ascending: true })
    if (error) throw error
    return data
  },

  async createReminder(reminder) {
    const { data, error } = await supabase
      .from('reminders')
      .insert(reminder)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async markReminderAsSent(id) {
    const { data, error } = await supabase
      .from('reminders')
      .update({ sent: true })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

export default supabase
