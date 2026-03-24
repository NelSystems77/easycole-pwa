/**
 * Vercel Edge Function - Extract text from PDF
 */

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
}

import pdfParse from 'pdf-parse'

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get file from form data
    const contentType = req.headers['content-type'] || ''
    
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Invalid content type' })
    }

    // Parse multipart form data
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Extract PDF content
    try {
      const data = await pdfParse(buffer)
      const text = data.text.trim()

      if (!text || text.length < 10) {
        return res.status(400).json({ 
          error: 'No se pudo extraer texto del PDF. Asegúrate de que no sea una imagen escaneada.' 
        })
      }

      return res.status(200).json({
        text,
        pages: data.numpages,
        info: data.info,
      })
    } catch (pdfError) {
      console.error('PDF Parse Error:', pdfError)
      return res.status(400).json({ 
        error: 'Error al procesar el PDF. Verifica que el archivo no esté corrupto.' 
      })
    }
  } catch (error) {
    console.error('Error in extract-pdf:', error)
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message,
    })
  }
}
