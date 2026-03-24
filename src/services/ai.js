/**
 * AI Service - Integración con Claude API para análisis de temarios
 */

const AI_API_URL = '/api/analyze-syllabus'

export const aiService = {
  /**
   * Analiza un temario y genera un plan de estudio
   * @param {Object} params - Parámetros del análisis
   * @param {string} params.syllabusContent - Contenido del temario
   * @param {Date} params.examDate - Fecha del examen
   * @param {number} params.hoursPerDay - Horas disponibles por día
   * @param {string} params.subjectName - Nombre de la asignatura
   * @param {Date} params.startDate - Fecha de inicio del estudio
   * @returns {Promise<Object>} Plan de estudio generado
   */
  async analyzeSyllabus({ syllabusContent, examDate, hoursPerDay, subjectName, startDate }) {
    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syllabus: syllabusContent,
          examDate: examDate.toISOString(),
          hoursPerDay,
          subjectName,
          startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al analizar el temario')
      }

      const data = await response.json()
      return data.studyPlan
    } catch (error) {
      console.error('Error en AI Service:', error)
      throw error
    }
  },

  /**
   * Extrae texto de un archivo PDF
   * @param {File} file - Archivo PDF
   * @returns {Promise<string>} Texto extraído
   */
  async extractTextFromPDF(file) {
    // Esta función se implementará en el frontend usando pdf.js o similar
    // Por ahora retornamos un placeholder
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          // Aquí iría la lógica de extracción con pdf.js
          // Por simplicidad, asumimos que enviaremos el archivo al backend
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await fetch('/api/extract-pdf', {
            method: 'POST',
            body: formData,
          })
          
          if (!response.ok) {
            throw new Error('Error al extraer texto del PDF')
          }
          
          const data = await response.json()
          resolve(data.text)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'))
      reader.readAsArrayBuffer(file)
    })
  },

  /**
   * Extrae texto de un archivo DOCX
   * @param {File} file - Archivo DOCX
   * @returns {Promise<string>} Texto extraído
   */
  async extractTextFromDOCX(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await fetch('/api/extract-docx', {
            method: 'POST',
            body: formData,
          })
          
          if (!response.ok) {
            throw new Error('Error al extraer texto del DOCX')
          }
          
          const data = await response.json()
          resolve(data.text)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'))
      reader.readAsArrayBuffer(file)
    })
  },

  /**
   * Extrae texto de una imagen (OCR)
   * @param {File} file - Archivo de imagen
   * @returns {Promise<string>} Texto extraído
   */
  async extractTextFromImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await fetch('/api/extract-image', {
            method: 'POST',
            body: formData,
          })
          
          if (!response.ok) {
            throw new Error('Error al extraer texto de la imagen')
          }
          
          const data = await response.json()
          resolve(data.text)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'))
      reader.readAsDataURL(file)
    })
  },

  /**
   * Procesa un archivo y extrae su contenido de texto
   * @param {File} file - Archivo a procesar
   * @returns {Promise<string>} Texto extraído
   */
  async processFile(file) {
    const fileType = file.type
    const fileName = file.name.toLowerCase()

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await this.extractTextFromPDF(file)
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await this.extractTextFromDOCX(file)
    } else if (fileType.startsWith('image/')) {
      return await this.extractTextFromImage(file)
    } else if (fileType === 'text/plain') {
      return await file.text()
    } else {
      throw new Error('Tipo de archivo no soportado')
    }
  },
}

export default aiService
