# 📦 EasyCole by NelSystems

**Asistente Personal Proactivo con IA para Estudiantes**

Una Progressive Web App (PWA) completa que ayuda a estudiantes a organizarse mejor automatizando la gestión de su mochila y optimizando el tiempo de estudio con inteligencia artificial.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ Características Principales

### 🎒 Asistente de Mochila Proactivo
- **Checklist automático diario**: La app genera automáticamente la lista de materiales necesarios según tu horario
- **Vista semanal**: Visualiza todos tus días de clase de un vistazo
- **Progreso visual**: Marca items conforme los preparas
- **Compartir**: Comparte tu checklist con amigos o familia

### 📅 Gestión de Horarios
- Administra tu horario semanal completo
- Asocia libros, cuadernos y materiales a cada clase
- Vista por día de la semana con estadísticas

### ✅ Gestión de Tareas y Proyectos
- **Tipos de tareas**: Tareas regulares, Proyectos, TCU (Trabajo Comunal Universitario)
- **Estados**: Pendiente, En Progreso, Completado
- **Barra de progreso** para proyectos
- **Vista Kanban** o lista según preferencias
- **Sistema de recordatorios**: 15, 7, 3 y 1 día antes

### 🎓 Planificador de Estudio Inteligente con IA
- **Análisis de temarios** con Claude API
- **Sube archivos**: PDF, DOCX o imágenes de tus apuntes
- **Planes personalizados**: Divididos por días según tu tiempo disponible
- **Optimización inteligente**: La IA distribuye temas de forma eficiente

### 🌓 Diseño Moderno
- Modo claro y oscuro
- Paleta fresca y educativa (Turquesa, Verde Menta, Amarillo)
- 100% responsivo (Mobile-first)
- Animaciones fluidas

---

## 🚀 Instalación y Despliegue

### Prerrequisitos

- Node.js 18+ y npm
- Cuenta de [Supabase](https://supabase.com)
- Cuenta de [Vercel](https://vercel.com)
- API Key de [Groq](https://console.groq.com) (recomendado - más rápido y barato)
  - O alternativamente: [Anthropic (Claude)](https://console.anthropic.com)

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd easycole-pwa
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Supabase

#### 3.1. Crear Proyecto en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia la URL y la Anon Key

#### 3.2. Ejecutar el Schema SQL
1. En Supabase, ve a **SQL Editor**
2. Abre el archivo `docs/database-schema.sql`
3. Copia todo el contenido y ejecútalo en el SQL Editor
4. Verifica que todas las tablas se crearon correctamente

#### 3.3. Configurar Autenticación
1. Ve a **Authentication > Providers**
2. Habilita **Email** (ya está habilitado por defecto)
3. Opcional: Habilita **Google OAuth**:
   - Sigue las instrucciones de Supabase
   - Configura las URLs de redirección

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key

# Groq API (Recomendado - 10x más rápido y barato)
GROQ_API_KEY=gsk_tu-groq-api-key-aqui

# Alternativa: Anthropic Claude API
# ANTHROPIC_API_KEY=sk-ant-api-key-aqui
```

**📝 Nota**: El proyecto viene configurado por defecto para usar **Groq** (Llama 3.3 70B).
- ✅ **Más rápido**: ~1 segundo vs 5-10 con Claude
- ✅ **Más barato**: $0.27/1M tokens vs $3/1M con Claude  
- ✅ **Plan gratis**: 14,400 requests/día

Ver `docs/CONFIGURACION-GROQ.md` para más detalles.

### 5. Desarrollo Local

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 6. Desplegar en Vercel

#### 6.1. Preparar el Proyecto

```bash
npm run build
```

#### 6.2. Desplegar con Vercel CLI

```bash
# Instalar Vercel CLI si no lo tienes
npm install -g vercel

# Iniciar sesión
vercel login

# Desplegar
vercel --prod
```

#### 6.3. Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings > Environment Variables**
3. Agrega las siguientes variables:

```
VITE_SUPABASE_URL = https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY = tu-anon-key
GROQ_API_KEY = gsk_tu-groq-api-key-aqui
```

**💡 Tip**: Groq es más rápido y barato que Claude. Obtén tu key gratis en [console.groq.com](https://console.groq.com)

4. Redeploy el proyecto para que tome las variables

#### 6.4. Configurar Dominios (Opcional)

1. En Vercel, ve a **Settings > Domains**
2. Agrega tu dominio personalizado
3. Sigue las instrucciones de configuración DNS

### 7. Configurar Íconos PWA

1. Usa el archivo `icon-512.png` que subiste
2. Genera íconos de diferentes tamaños:
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
3. Guárdalos en `/public/icons/`
4. Actualiza `manifest.json` si es necesario

Puedes usar herramientas como:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

```bash
npx pwa-asset-generator public/icons/icon-512.png public/icons
```

---

## 📁 Estructura del Proyecto

```
easycole-pwa/
├── public/
│   ├── icons/                  # Íconos PWA
│   ├── manifest.json           # Manifest PWA
│   └── service-worker.js       # Service Worker
├── src/
│   ├── components/             # Componentes UI
│   │   ├── Auth.js
│   │   ├── Dashboard.js
│   │   ├── Backpack.js
│   │   ├── Schedule.js
│   │   ├── Tasks.js
│   │   └── StudyPlanner.js
│   ├── services/               # Servicios
│   │   ├── supabase.js
│   │   ├── store.js
│   │   └── ai.js
│   ├── utils/                  # Utilidades
│   │   ├── date.js
│   │   ├── backpack.js
│   │   └── notifications.js
│   ├── styles/
│   │   └── main.css
│   └── main.js                 # Entry point
├── functions/                  # Vercel Edge Functions
│   ├── analyze-syllabus.js
│   ├── extract-pdf.js
│   └── extract-docx.js
├── docs/
│   └── database-schema.sql
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── vercel.json
```

---

## 🔧 Configuración Avanzada

### Notificaciones Push

Para habilitar notificaciones push reales:

1. Genera VAPID keys en Supabase
2. Configura Firebase Cloud Messaging (opcional)
3. Actualiza el Service Worker con las keys

### Personalización de Colores

Edita `tailwind.config.js` para cambiar la paleta:

```javascript
colors: {
  primary: {
    DEFAULT: '#06B6D4', // Tu color
  }
}
```

### Analytics (Opcional)

Agrega Google Analytics o Vercel Analytics:

```javascript
// En main.js
import { Analytics } from '@vercel/analytics/react'
```

---

## 🐛 Solución de Problemas

### Error: "Supabase connection failed"
- Verifica que las variables de entorno estén correctas
- Asegúrate de que el proyecto de Supabase esté activo
- Revisa que las políticas RLS estén habilitadas

### Error: "AI service not configured"
- Verifica que `ANTHROPIC_API_KEY` esté configurada en Vercel
- Asegúrate de tener créditos en tu cuenta de Anthropic
- Revisa los logs en Vercel Functions

### PWA no se instala
- Verifica que el `manifest.json` sea válido
- Asegúrate de que todos los íconos existan
- Usa HTTPS (Vercel lo hace automáticamente)

---

## 📱 Uso de la Aplicación

### Primer Uso

1. **Registro**: Crea tu cuenta con email o Google
2. **Horario**: Agrega tus clases semanales con los materiales necesarios
3. **Mochila**: ¡Listo! La app generará automáticamente tu checklist
4. **Tareas**: Agrega tus pendientes, proyectos y TCU
5. **Exámenes**: Registra exámenes y genera planes de estudio con IA

### Generar Plan de Estudio

1. Ve a **Planificador de Estudio**
2. Crea un nuevo examen
3. Haz clic en "Generar Plan con IA"
4. Sube tu temario (PDF, DOCX o imagen) o pégalo como texto
5. Define cuántas horas puedes estudiar por día
6. ¡La IA generará un plan personalizado!

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Desarrollado por NelSystems

**EasyCole** - Reduciendo la carga cognitiva del estudiante, un checklist a la vez.

### Contacto

- Website: [nelsystems.com](#)
- Email: [info@nelsystems.com](#)

---

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) - Backend como servicio
- [Anthropic Claude](https://anthropic.com) - IA para análisis de temarios
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [Vercel](https://vercel.com) - Hosting y Edge Functions
- [Vite](https://vitejs.dev) - Build tool

---

## 📸 Screenshots

*(Agrega aquí screenshots de la aplicación en uso)*

---

## 🗺️ Roadmap

- [ ] Integración con Google Calendar
- [ ] Modo offline completo
- [ ] Sincronización multi-dispositivo en tiempo real
- [ ] Estadísticas de productividad
- [ ] Gamificación (puntos, logros)
- [ ] Modo grupo (para estudiar con amigos)
- [ ] App móvil nativa (iOS/Android)

---

**¡Gracias por usar EasyCole!** 🎉

Si te gusta el proyecto, dale una ⭐ en GitHub.
