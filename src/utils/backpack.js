/**
 * Backpack Assistant - Lógica determinística para generar checklist de mochila
 */

import { dateUtils } from './date.js'

export const backpackAssistant = {
  /**
   * Genera el checklist de mochila para un día específico
   * @param {Array} schedules - Array de horarios del usuario
   * @param {Date} targetDate - Fecha objetivo (por defecto mañana)
   * @returns {Object} Checklist con materiales necesarios
   */
  generateChecklist(schedules, targetDate = null) {
    // Si no se especifica fecha, usar mañana
    if (!targetDate) {
      targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + 1)
    }

    const dayOfWeek = targetDate.getDay()
    
    // Filtrar horarios del día objetivo
    const daySchedules = schedules.filter(schedule => {
      return schedule.day_of_week === dayOfWeek
    })

    if (daySchedules.length === 0) {
      return {
        date: targetDate,
        dayName: dateUtils.getDayName(dayOfWeek),
        hasClasses: false,
        message: '¡No tienes clases este día! 🎉',
        classes: [],
        materials: [],
        checklist: [],
      }
    }

    // Agrupar materiales por asignatura
    const materialsBySubject = {}
    const allMaterials = new Set()
    
    daySchedules.forEach(schedule => {
      const materials = []
      
      // Agregar libros
      if (schedule.books && schedule.books.length > 0) {
        schedule.books.forEach(book => {
          materials.push({
            type: 'book',
            name: book,
            icon: '📚',
          })
          allMaterials.add(JSON.stringify({ type: 'book', name: book }))
        })
      }
      
      // Agregar cuadernos
      if (schedule.notebooks && schedule.notebooks.length > 0) {
        schedule.notebooks.forEach(notebook => {
          materials.push({
            type: 'notebook',
            name: notebook,
            icon: '📓',
          })
          allMaterials.add(JSON.stringify({ type: 'notebook', name: notebook }))
        })
      }
      
      // Agregar materiales adicionales
      if (schedule.other_materials && schedule.other_materials.length > 0) {
        schedule.other_materials.forEach(material => {
          materials.push({
            type: 'other',
            name: material,
            icon: '✏️',
          })
          allMaterials.add(JSON.stringify({ type: 'other', name: material }))
        })
      }
      
      materialsBySubject[schedule.subject_name] = materials
    })

    // Convertir Set a Array y parsear
    const uniqueMaterials = Array.from(allMaterials).map(item => JSON.parse(item))

    // Crear checklist interactivo
    const checklist = uniqueMaterials.map((material, index) => ({
      id: `item-${index}`,
      ...material,
      checked: false,
    }))

    return {
      date: targetDate,
      dayName: dateUtils.getDayName(dayOfWeek),
      hasClasses: true,
      message: `Prepara tu mochila para el ${dateUtils.getDayName(dayOfWeek)}`,
      classes: daySchedules.map(s => ({
        subject: s.subject_name,
        time: `${s.start_time} - ${s.end_time}`,
        classroom: s.classroom,
        teacher: s.teacher,
      })),
      materials: materialsBySubject,
      checklist,
      stats: {
        total: checklist.length,
        books: checklist.filter(m => m.type === 'book').length,
        notebooks: checklist.filter(m => m.type === 'notebook').length,
        other: checklist.filter(m => m.type === 'other').length,
      },
    }
  },

  /**
   * Genera checklist para toda la semana
   * @param {Array} schedules - Array de horarios
   * @returns {Array} Array de checklists por día
   */
  generateWeeklyChecklist(schedules) {
    const today = new Date()
    const weekly = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      weekly.push(this.generateChecklist(schedules, date))
    }
    
    return weekly
  },

  /**
   * Obtiene un resumen de materiales más usados
   * @param {Array} schedules - Array de horarios
   * @returns {Array} Array de materiales con frecuencia
   */
  getMaterialsFrequency(schedules) {
    const frequency = {}
    
    schedules.forEach(schedule => {
      // Contar libros
      if (schedule.books) {
        schedule.books.forEach(book => {
          frequency[book] = (frequency[book] || 0) + 1
        })
      }
      
      // Contar cuadernos
      if (schedule.notebooks) {
        schedule.notebooks.forEach(notebook => {
          frequency[notebook] = (frequency[notebook] || 0) + 1
        })
      }
      
      // Contar otros materiales
      if (schedule.other_materials) {
        schedule.other_materials.forEach(material => {
          frequency[material] = (frequency[material] || 0) + 1
        })
      }
    })
    
    // Convertir a array y ordenar por frecuencia
    return Object.entries(frequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  },

  /**
   * Guarda el estado del checklist en localStorage
   * @param {string} date - Fecha en formato ISO
   * @param {Array} checklist - Checklist con estados
   */
  saveChecklistState(date, checklist) {
    const key = `checklist-${date}`
    localStorage.setItem(key, JSON.stringify(checklist))
  },

  /**
   * Carga el estado del checklist desde localStorage
   * @param {string} date - Fecha en formato ISO
   * @returns {Array|null} Checklist guardado o null
   */
  loadChecklistState(date) {
    const key = `checklist-${date}`
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : null
  },

  /**
   * Calcula el progreso del checklist
   * @param {Array} checklist - Checklist actual
   * @returns {Object} Estadísticas de progreso
   */
  getChecklistProgress(checklist) {
    const total = checklist.length
    const checked = checklist.filter(item => item.checked).length
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0
    
    return {
      total,
      checked,
      pending: total - checked,
      percentage,
      isComplete: checked === total && total > 0,
    }
  },
}

export default backpackAssistant
