/**
 * Vercel Edge Function - Analyze Syllabus with Groq API
 * Versión optimizada para Groq (más rápido y económico que Claude)
 */

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  // Handle preflight
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
    const { syllabus, examDate, hoursPerDay, subjectName, startDate } = await req.json()

    // Validación
    if (!syllabus || !examDate || !hoursPerDay || !subjectName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers }
      )
    }

    // Calcular días disponibles
    const exam = new Date(examDate)
    const start = new Date(startDate || new Date())
    const daysUntilExam = Math.ceil((exam - start) / (1000 * 60 * 60 * 24))

    if (daysUntilExam < 1) {
      return new Response(
        JSON.stringify({ error: 'El examen ya pasó o es hoy' }),
        { status: 400, headers }
      )
    }

    // Llamar a Groq API
    const groqApiKey = process.env.GROQ_API_KEY

    if (!groqApiKey) {
      console.error('GROQ_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'AI service not configured. Please add GROQ_API_KEY in Vercel environment variables.' }),
        { status: 500, headers }
      )
    }

    const prompt = `Eres un experto en planificación académica. Analiza el siguiente temario de examen y genera un plan de estudio detallado y realista.

INFORMACIÓN DEL EXAMEN:
- Asignatura: ${subjectName}
- Fecha del examen: ${new Date(examDate).toLocaleDateString('es-ES')}
- Días disponibles: ${daysUntilExam}
- Horas de estudio por día: ${hoursPerDay}
- Horas totales disponibles: ${daysUntilExam * hoursPerDay}

TEMARIO:
${syllabus}

INSTRUCCIONES CRÍTICAS:
1. Divide el temario en temas principales (topics)
2. Asigna cada tema a días específicos de estudio
3. Distribuye el tiempo de manera equilibrada y realista
4. Prioriza temas más complejos al inicio cuando hay más energía
5. Incluye al menos 1-2 días de repaso general al final
6. Cada día debe tener un número razonable de temas (no sobrecargues)

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido. NO incluyas markdown, explicaciones, o texto adicional. Solo el JSON puro.

Formato exacto del JSON:
{
  "totalDays": número,
  "totalHours": número,
  "topics": [
    {
      "title": "Nombre del tema",
      "description": "Descripción breve del tema",
      "estimatedHours": número
    }
  ],
  "schedule": [
    {
      "day": número (1, 2, 3...),
      "date": "YYYY-MM-DD",
      "hours": número,
      "topics": [
        {
          "title": "Tema a estudiar",
          "description": "Qué cubrir específicamente en este tema"
        }
      ]
    }
  ]
}`

    console.log('Calling Groq API...')
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Modelo más inteligente y capaz
        // Alternativas:
        // model: 'mixtral-8x7b-32768', // Más rápido, context window más grande
        // model: 'llama-3.1-70b-versatile', // Versión anterior pero confiable
        max_tokens: 4096,
        temperature: 0.3, // Más determinístico para seguir formato JSON
        top_p: 1,
        stream: false,
        messages: [
          {
            role: 'system',
            content: 'Eres un planificador académico experto. Respondes siempre en formato JSON válido sin markdown ni explicaciones adicionales.'
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error('Groq API Error:', errorText)
      
      // Mensajes de error más específicos
      if (groqResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: 'API Key de Groq inválida. Verifica GROQ_API_KEY en Vercel.' }),
          { status: 500, headers }
        )
      } else if (groqResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Límite de requests alcanzado. Intenta de nuevo en unos minutos.' }),
          { status: 429, headers }
        )
      }
      
      return new Response(
        JSON.stringify({ error: 'Error al comunicarse con el servicio de IA' }),
        { status: 500, headers }
      )
    }

    const groqData = await groqResponse.json()
    
    // Verificar que la respuesta tenga el formato esperado
    if (!groqData.choices || !groqData.choices[0] || !groqData.choices[0].message) {
      console.error('Unexpected Groq response format:', groqData)
      return new Response(
        JSON.stringify({ error: 'Formato de respuesta inesperado de la IA' }),
        { status: 500, headers }
      )
    }

    const responseText = groqData.choices[0].message.content
    console.log('Groq response received, parsing JSON...')

    // Parse JSON response
    let studyPlan
    try {
      // Limpiar la respuesta de posibles markdown code blocks
      let jsonText = responseText.trim()
      
      // Remover markdown code blocks si existen
      jsonText = jsonText.replace(/```json\n?/g, '')
      jsonText = jsonText.replace(/```\n?/g, '')
      jsonText = jsonText.trim()
      
      // Intentar parsear
      studyPlan = JSON.parse(jsonText)
      
      // Validar estructura mínima
      if (!studyPlan.totalDays || !studyPlan.schedule || !Array.isArray(studyPlan.schedule)) {
        throw new Error('Invalid study plan structure')
      }
      
      console.log('Study plan parsed successfully')
    } catch (parseError) {
      console.error('Error parsing Groq response:', parseError)
      console.error('Raw response:', responseText.substring(0, 500))
      return new Response(
        JSON.stringify({ 
          error: 'Error al procesar la respuesta de IA. El modelo no generó un JSON válido.',
          details: parseError.message 
        }),
        { status: 500, headers }
      )
    }

    // Enriquecer con fechas reales
    const currentDate = new Date(startDate || new Date())
    studyPlan.schedule = studyPlan.schedule.map((day, index) => {
      const dayDate = new Date(currentDate)
      dayDate.setDate(currentDate.getDate() + index)
      return {
        ...day,
        date: dayDate.toISOString().split('T')[0],
      }
    })

    // Agregar metadata
    studyPlan.metadata = {
      generatedAt: new Date().toISOString(),
      model: 'llama-3.3-70b-versatile',
      provider: 'Groq',
    }

    console.log('Study plan generated successfully')

    return new Response(
      JSON.stringify({ studyPlan }),
      { status: 200, headers }
    )
  } catch (error) {
    console.error('Error in analyze-syllabus:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      }),
      { status: 500, headers }
    )
  }
}
