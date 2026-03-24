# 🚀 Guía de Configuración con Groq

## ¿Por qué Groq?

✅ **10x más rápido** - Genera planes en ~1 segundo (vs 5-10 seg con Claude)  
✅ **10x más barato** - $0.27 por 1M tokens (vs $3 con Claude)  
✅ **Plan gratis generoso** - 14,400 requests/día gratis  
✅ **Excelente calidad** - Llama 3.3 70B es muy capaz  

---

## 📝 Configuración en 3 Pasos

### Paso 1: Obtener API Key de Groq (2 min)

1. Ve a [console.groq.com](https://console.groq.com)
2. Crea una cuenta (gratis)
3. Ve a "API Keys"
4. Crea una nueva API Key
5. Copia la key (empieza con `gsk_...`)

### Paso 2: Configurar Variable de Entorno

**Opción A: Desarrollo Local**

Edita tu archivo `.env`:
```env
# Supabase (igual que antes)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key

# Groq API (NUEVO)
GROQ_API_KEY=gsk_tu-api-key-aqui
```

**Opción B: En Vercel**

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Settings → Environment Variables
3. Agrega:
   - **Key**: `GROQ_API_KEY`
   - **Value**: `gsk_tu-api-key-aqui`
4. Save y redeploy

### Paso 3: ¡Listo!

El código ya está actualizado para usar Groq. Solo necesitas las variables de entorno.

---

## 🔄 ¿Ya Tenías Claude Configurado?

Si ya tenías `ANTHROPIC_API_KEY` configurado:

1. **En Vercel**: Simplemente agrega `GROQ_API_KEY` (puedes dejar Claude también)
2. **En local**: Agrega `GROQ_API_KEY` a tu `.env`
3. El código usará automáticamente Groq

---

## 🎯 Modelos Disponibles en Groq

El código usa por defecto **`llama-3.3-70b-versatile`** (recomendado).

### Alternativas (edita `functions/analyze-syllabus.js`):

```javascript
// Línea 90 - Cambia el modelo si quieres:

// 1. Llama 3.3 70B (Recomendado) ⭐
model: 'llama-3.3-70b-versatile',

// 2. Mixtral 8x7B (Más rápido, context window 32K)
model: 'mixtral-8x7b-32768',

// 3. Llama 3.1 70B (Versión anterior, confiable)
model: 'llama-3.1-70b-versatile',

// 4. Llama 3.1 8B (Ultra rápido, para temarios simples)
model: 'llama-3.1-8b-instant',
```

---

## 💰 Límites del Plan Gratuito

### Groq Free Tier:
- **14,400 requests por día** (600/hora)
- **~2M tokens por día**
- Sin tarjeta de crédito requerida

### Para EasyCole:
- Cada plan de estudio usa ~500-2000 tokens
- **Puedes generar cientos de planes gratis por día**

---

## 🆚 Comparación: Claude vs Groq

| Métrica | Claude Sonnet 4 | Groq Llama 3.3 70B |
|---------|-----------------|---------------------|
| **Velocidad** | 5-10 segundos | ~1 segundo ⚡ |
| **Costo** | $3 / 1M tokens | $0.27 / 1M tokens 💰 |
| **Plan Gratis** | $5 crédito inicial | 14,400 req/día |
| **Calidad IA** | Excelente | Muy buena |
| **Context Window** | 200K tokens | 8K-32K tokens |

### ¿Cuál elegir?

**Groq** si quieres:
- ✅ Velocidad extrema
- ✅ Costos mínimos
- ✅ Plan gratis generoso

**Claude** si necesitas:
- ✅ Máxima calidad de análisis
- ✅ Context window gigante (temarios muy largos)
- ✅ Mejor seguimiento de instrucciones complejas

---

## 🔧 Configuración Avanzada

### Ajustar Temperature

En `functions/analyze-syllabus.js` línea 91:

```javascript
temperature: 0.3, // Más determinístico (0.0-2.0)
// 0.3 = Consistente y predecible (recomendado)
// 0.7 = Más creativo
// 1.0 = Balance
```

### Timeout

Si tienes temarios muy largos, puedes ajustar el timeout en Vercel:

En `vercel.json`:
```json
{
  "functions": {
    "functions/**/*.js": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  }
}
```

---

## 🐛 Troubleshooting

### Error: "GROQ_API_KEY not configured"
**Solución**: Agrega la variable de entorno en Vercel y redeploy

### Error: "API Key de Groq inválida"
**Solución**: Verifica que copiaste la key correctamente (debe empezar con `gsk_`)

### Error: "Límite de requests alcanzado"
**Solución**: Espera unos minutos o actualiza a plan pagado

### Respuestas lentas
**Solución**: Cambia a modelo más rápido:
```javascript
model: 'llama-3.1-8b-instant', // Ultra rápido
```

---

## 📊 Monitorear Uso

1. Ve a [console.groq.com](https://console.groq.com)
2. Dashboard → Usage
3. Verás:
   - Requests por día
   - Tokens consumidos
   - Latencia promedio

---

## ✅ Verificación

Para verificar que Groq está funcionando:

1. Despliega la app
2. Crea un examen
3. Genera un plan de estudio
4. Si funciona en ~1 segundo = ✅ Groq activo

---

## 🎯 Resumen

```bash
# 1. Obtener key
console.groq.com → API Keys → Create

# 2. Agregar a Vercel
Settings → Environment Variables
GROQ_API_KEY = gsk_...

# 3. Redeploy
vercel --prod

# 4. ¡Listo! 🚀
```

---

## 💡 Tip Pro

**Usa ambos**: Puedes tener configurados Claude Y Groq al mismo tiempo.

Para cambiar entre ellos, solo edita `functions/analyze-syllabus.js`:

```javascript
// Usar Groq (rápido y barato)
const apiKey = process.env.GROQ_API_KEY
const url = 'https://api.groq.com/openai/v1/chat/completions'

// O usar Claude (máxima calidad)
const apiKey = process.env.ANTHROPIC_API_KEY
const url = 'https://api.anthropic.com/v1/messages'
```

---

**¡Groq configurado! Disfruta de planes de estudio ultra rápidos.** ⚡

*Velocidad: 10x más rápido | Costo: 10x más barato*
