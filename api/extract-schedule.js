/**
 * Vercel Edge Function - Extract Schedule from Image using Groq Vision
 * Procesa imágenes de horarios escolares y extrae las clases automáticamente
 */

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    )
  }

  try {
    const { image } = await req.json()

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers }
      )
    }

    const groqApiKey = process.env.GROQ_API_KEY

    if (!groqApiKey) {
      console.error('GROQ_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers }
      )
    }

    // Prompt optimizado para horarios escolares de Costa Rica
    const prompt = `Eres un asistente que extrae información de horarios escolares.

Analiza esta imagen de un horario escolar y extrae TODAS las clases.

INSTRUCCIONES CRÍTICAS:
1. Extrae CADA clase que veas en el horario
2. Ignora períodos de "RECREO" o "Receso" - NO los incluyas
3. Para cada clase extrae:
   - Materia (nombre de la asignatura)
   - Día de la semana
   - Hora de inicio (formato 24h: HH:MM)
   - Hora de fin (formato 24h: HH:MM)
   - Profesor (si está visible, sino null)
   - Aula (si está visible, sino null)

4. Los días deben ser EXACTAMENTE uno de: "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"
5. Si una materia aparece con "/A" o "/B" (como "Física Matemática A/B"), divídela en dos entradas separadas
6. Si el horario tiene secciones de "MAÑANA" y "TARDE", procesa ambas
7. Si un día no tiene clases, omítelo del JSON

Responde ÚNICAMENTE con un objeto JSON válido en este formato exacto:
{
  "classes": [
    {
      "subject": "Matemáticas",
      "day": "Lunes",
      "start_time": "07:00",
      "end_time": "08:20",
      "professor": "SOLANO MEYRIETH",
      "classroom": "Aula 5"
    }
  ]
}

NO incluyas markdown, NO incluyas explicaciones, SOLO el JSON puro.`

    console.log('Calling Groq Vision API...')
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: image, // Base64 data URL
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
        max_tokens: 2048,
        temperature: 0.1, // Muy bajo para mayor precisión
      }),
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error('Groq Vision API Error:', errorText)
      
      if (groqResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: 'API Key de Groq inválida' }),
          { status: 500, headers }
        )
      } else if (groqResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Límite de requests alcanzado. Intenta de nuevo en unos minutos.' }),
          { status: 429, headers }
        )
      }
      
      return new Response(
        JSON.stringify({ error: 'Error al procesar la imagen con IA' }),
        { status: 500, headers }
      )
    }

    const groqData = await groqResponse.json()
    
    if (!groqData.choices || !groqData.choices[0] || !groqData.choices[0].message) {
      console.error('Unexpected Groq response format:', groqData)
      return new Response(
        JSON.stringify({ error: 'Formato de respuesta inesperado' }),
        { status: 500, headers }
      )
    }

    const responseText = groqData.choices[0].message.content
    console.log('Groq Vision response received, parsing JSON...')

    // Parse JSON response
    let schedule
    try {
      let jsonText = responseText.trim()
      
      // Limpiar markdown si existe
      jsonText = jsonText.replace(/```json\n?/g, '')
      jsonText = jsonText.replace(/```\n?/g, '')
      jsonText = jsonText.trim()
      
      schedule = JSON.parse(jsonText)
      
      // Validar estructura
      if (!schedule.classes || !Array.isArray(schedule.classes)) {
        throw new Error('Invalid schedule structure - missing classes array')
      }

      // Validar y limpiar cada clase
      schedule.classes = schedule.classes.filter(cls => {
        // Validar campos requeridos
        if (!cls.subject || !cls.day || !cls.start_time || !cls.end_time) {
          console.warn('Skipping invalid class:', cls)
          return false
        }

        // Normalizar día
        const validDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
        if (!validDays.includes(cls.day)) {
          console.warn('Invalid day:', cls.day)
          return false
        }

        // Normalizar tiempos (agregar segundos si falta)
        if (cls.start_time.length === 5) cls.start_time += ':00'
        if (cls.end_time.length === 5) cls.end_time += ':00'

        // Limpiar campos opcionales
        cls.professor = cls.professor || null
        cls.classroom = cls.classroom || null

        return true
      })

      console.log(`Successfully parsed ${schedule.classes.length} classes`)
      
    } catch (parseError) {
      console.error('Error parsing Groq Vision response:', parseError)
      console.error('Raw response:', responseText.substring(0, 500))
      return new Response(
        JSON.stringify({ 
          error: 'Error al procesar la respuesta de IA. El modelo no generó un JSON válido.',
          details: parseError.message 
        }),
        { status: 500, headers }
      )
    }

    // Agregar metadata
    schedule.metadata = {
      extractedAt: new Date().toISOString(),
      totalClasses: schedule.classes.length,
      model: 'llama-3.2-90b-vision-preview',
      provider: 'Groq',
    }

    return new Response(
      JSON.stringify({ schedule }),
      { status: 200, headers }
    )
  } catch (error) {
    console.error('Error in extract-schedule:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      }),
      { status: 500, headers }
    )
  }
}
