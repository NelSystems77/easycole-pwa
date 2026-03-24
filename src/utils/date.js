/**
 * Utilidades para manejo de fechas y horas
 */

export const dateUtils = {
  /**
   * Formatea una fecha a string legible en español
   * @param {Date|string} date - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  },

  /**
   * Formatea una fecha en formato corto
   * @param {Date|string} date - Fecha a formatear
   * @returns {string} Fecha formateada (DD/MM/YYYY)
   */
  formatShortDate(date) {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('es-ES')
  },

  /**
   * Formatea una hora
   * @param {string} time - Hora en formato HH:MM
   * @returns {string} Hora formateada
   */
  formatTime(time) {
    if (!time) return ''
    return time
  },

  /**
   * Obtiene el día de la semana
   * @param {Date|string} date - Fecha
   * @returns {number} Día de la semana (0-6, donde 0 es Domingo)
   */
  getDayOfWeek(date) {
    return new Date(date).getDay()
  },

  /**
   * Obtiene el nombre del día de la semana
   * @param {number} dayNumber - Número del día (0-6)
   * @returns {string} Nombre del día
   */
  getDayName(dayNumber) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    return days[dayNumber] || ''
  },

  /**
   * Obtiene el nombre del mes
   * @param {number} monthNumber - Número del mes (0-11)
   * @returns {string} Nombre del mes
   */
  getMonthName(monthNumber) {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[monthNumber] || ''
  },

  /**
   * Calcula días hasta una fecha
   * @param {Date|string} targetDate - Fecha objetivo
   * @returns {number} Días hasta la fecha
   */
  daysUntil(targetDate) {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(targetDate)
    target.setHours(0, 0, 0, 0)
    const diff = target - now
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  },

  /**
   * Verifica si una fecha es hoy
   * @param {Date|string} date - Fecha a verificar
   * @returns {boolean}
   */
  isToday(date) {
    const today = new Date()
    const checkDate = new Date(date)
    return (
      today.getDate() === checkDate.getDate() &&
      today.getMonth() === checkDate.getMonth() &&
      today.getFullYear() === checkDate.getFullYear()
    )
  },

  /**
   * Verifica si una fecha es mañana
   * @param {Date|string} date - Fecha a verificar
   * @returns {boolean}
   */
  isTomorrow(date) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const checkDate = new Date(date)
    return (
      tomorrow.getDate() === checkDate.getDate() &&
      tomorrow.getMonth() === checkDate.getMonth() &&
      tomorrow.getFullYear() === checkDate.getFullYear()
    )
  },

  /**
   * Verifica si una fecha está en esta semana
   * @param {Date|string} date - Fecha a verificar
   * @returns {boolean}
   */
  isThisWeek(date) {
    const now = new Date()
    const checkDate = new Date(date)
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    return checkDate >= weekStart && checkDate < weekEnd
  },

  /**
   * Obtiene fechas entre dos fechas
   * @param {Date|string} startDate - Fecha de inicio
   * @param {Date|string} endDate - Fecha de fin
   * @returns {Date[]} Array de fechas
   */
  getDatesBetween(startDate, endDate) {
    const dates = []
    const current = new Date(startDate)
    const end = new Date(endDate)
    
    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  },

  /**
   * Añade días a una fecha
   * @param {Date|string} date - Fecha base
   * @param {number} days - Días a añadir
   * @returns {Date} Nueva fecha
   */
  addDays(date, days) {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  },

  /**
   * Formatea una fecha para input type="date"
   * @param {Date|string} date - Fecha
   * @returns {string} Fecha en formato YYYY-MM-DD
   */
  toInputDate(date) {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  /**
   * Convierte fecha de input a Date
   * @param {string} inputDate - Fecha en formato YYYY-MM-DD
   * @returns {Date} Objeto Date
   */
  fromInputDate(inputDate) {
    if (!inputDate) return null
    return new Date(inputDate + 'T00:00:00')
  },

  /**
   * Obtiene el rango de fechas de la semana actual
   * @returns {Object} { start: Date, end: Date }
   */
  getCurrentWeekRange() {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay() + 1) // Lunes
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6) // Domingo
    end.setHours(23, 59, 59, 999)
    return { start, end }
  },

  /**
   * Formatea una duración en minutos a string legible
   * @param {number} minutes - Duración en minutos
   * @returns {string} Duración formateada
   */
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  },
}

export default dateUtils
