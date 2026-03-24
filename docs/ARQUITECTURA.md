# 🏗️ Arquitectura de EasyCole

## Visión General

EasyCole es una PWA (Progressive Web App) moderna construida con una arquitectura serverless que combina:
- Frontend: Vanilla JavaScript moderno + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth)
- IA: Claude API (Anthropic)
- Hosting: Vercel (Edge Functions)

```
┌─────────────────────────────────────────────────────────┐
│                    PWA (Cliente)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Dashboard  │  │  Backpack   │  │  Schedule   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Tasks    │  │StudyPlanner │  │    Auth     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           State Management (Store)                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│               Servicios y Utilidades                    │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│  │ Supabase  │  │    AI     │  │   Utils   │          │
│  │  Client   │  │  Service  │  │  (Date,   │          │
│  └───────────┘  └───────────┘  │ Backpack) │          │
└─────────────────────────────────────────────────────────┘
        ▼                    ▼                 ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Supabase   │    │Vercel Edge   │    │Service Worker│
│  (Backend)   │    │  Functions   │    │   (PWA)      │
│              │    │              │    │              │
│ • Auth       │    │ • Analyze    │    │ • Caché      │
│ • PostgreSQL │    │   Syllabus   │    │ • Offline    │
│ • RLS        │    │ • Extract    │    │ • Push       │
│ • Real-time  │    │   PDF/DOCX   │    │   Notif.     │
└──────────────┘    └──────────────┘    └──────────────┘
                            ▼
                    ┌──────────────┐
                    │ Anthropic    │
                    │ Claude API   │
                    │ (Sonnet 4)   │
                    └──────────────┘
```

---

## 📦 Componentes Principales

### Frontend (Cliente)

#### 1. **Componentes UI**
Cada componente es una clase JavaScript que maneja:
- Renderizado HTML (template strings)
- Gestión de estado local
- Eventos y acciones del usuario
- Integración con el store global

**Componentes:**
- `Auth.js` - Login/Registro
- `Dashboard.js` - Vista principal con widget de mochila
- `Backpack.js` - Checklist completo de mochila
- `Schedule.js` - Gestión de horarios
- `Tasks.js` - Gestión de tareas/proyectos/TCU
- `StudyPlanner.js` - Planificación con IA

#### 2. **State Management**
Patrón Observer para reactividad:
```javascript
store.subscribe('schedules', (newValue) => {
  // Actualizar UI cuando cambian los horarios
})
```

#### 3. **Service Worker**
- Caché de assets estáticos
- Estrategia Network-First para datos
- Push Notifications
- Funciona offline

### Backend (Serverless)

#### 1. **Supabase**
Base de datos PostgreSQL con:
- Row Level Security (RLS)
- Auth integrado (Email + Google OAuth)
- Triggers automáticos
- APIs REST generadas automáticamente

**Tablas:**
- `schedules` - Horarios de clases
- `tasks` - Tareas, proyectos, TCU
- `exams` - Exámenes
- `reminders` - Recordatorios
- `user_profiles` - Perfiles extendidos

#### 2. **Vercel Edge Functions**
Funciones serverless que corren en el edge:

**`analyze-syllabus.js`**
- Recibe temario (texto)
- Llama a Claude API
- Retorna plan de estudio estructurado

**`extract-pdf.js` / `extract-docx.js`**
- Procesan archivos subidos
- Extraen texto
- Retornan contenido limpio

#### 3. **Claude API (Anthropic)**
Modelo: `claude-sonnet-4-20250514`
- Analiza temarios
- Genera planes de estudio
- Optimiza distribución de tiempo
- Responde en JSON estructurado

---

## 🔄 Flujos de Datos

### Flujo 1: Checklist de Mochila (Determinístico)

```
Usuario → Schedule Component → Guarda horario en Supabase
                                        ↓
Dashboard Component → Lee horarios del Store
                                        ↓
backpackAssistant.generateChecklist(schedules, fecha)
                                        ↓
Lógica JS: Filtra horarios del día → Extrae materiales
                                        ↓
Retorna checklist con items únicos
                                        ↓
Dashboard renderiza widget con progreso
```

### Flujo 2: Plan de Estudio con IA

```
Usuario sube temario → StudyPlanner Component
                                ↓
Procesa archivo (PDF/DOCX) → extract-pdf.js
                                ↓
Extrae texto del archivo
                                ↓
Llama a analyze-syllabus.js con:
  • texto del temario
  • fecha del examen
  • horas/día disponibles
                                ↓
Edge Function → Claude API (Anthropic)
                                ↓
Claude analiza y genera JSON:
  {
    totalDays, totalHours,
    topics: [...],
    schedule: [
      { day, date, hours, topics: [...] }
    ]
  }
                                ↓
Retorna plan → StudyPlanner lo muestra
                                ↓
Usuario guarda → Se almacena en Supabase
```

### Flujo 3: Autenticación

```
Usuario → Auth Component
            ↓
    Email + Password
            ↓
Supabase Auth (JWT)
            ↓
Trigger: on_auth_user_created
            ↓
Crea user_profiles automáticamente
            ↓
Store actualiza estado (user, isAuthenticated)
            ↓
App carga datos del usuario (schedules, tasks, exams)
            ↓
Dashboard se renderiza
```

---

## 🔐 Seguridad

### Row Level Security (RLS)
Todas las tablas tienen políticas RLS:
```sql
CREATE POLICY "Users can view own schedules"
  ON schedules FOR SELECT
  USING (auth.uid() = user_id);
```

### API Keys
- Supabase Anon Key: Segura en cliente (RLS protege datos)
- Anthropic API Key: Solo en Edge Functions (server-side)

### CORS
Edge Functions configuradas con CORS apropiados

---

## 📊 Base de Datos

### Esquema Relacional

```
users (auth.users)
  ├── user_profiles (1:1)
  ├── schedules (1:N)
  ├── tasks (1:N)
  │     └── reminders (1:N)
  └── exams (1:N)
        └── reminders (1:N)
```

### Índices
Optimizados para queries comunes:
- `user_id` en todas las tablas
- `day_of_week` en schedules
- `due_date` en tasks
- `exam_date` en exams

---

## 🚀 Despliegue

### Build Process
```bash
npm run build → Vite bundler
  ↓
Optimiza assets (minify, tree-shake)
  ↓
Genera /dist con:
  • HTML, CSS, JS optimizados
  • Service Worker
  • Manifest.json
```

### Vercel Deployment
```
Git Push → Vercel detecta cambios
              ↓
  Build automático (npm run build)
              ↓
  Deploy a Edge Network (CDN global)
              ↓
  Edge Functions disponibles en /api/*
```

---

## 🔧 Tecnologías Utilizadas

### Frontend
- **Vanilla JS ES6+**: Sin frameworks pesados
- **Tailwind CSS**: Utility-first CSS
- **Vite**: Build tool rápido

### Backend
- **Supabase**: PostgreSQL + Auth + Real-time
- **Vercel**: Serverless functions + Hosting

### IA
- **Anthropic Claude**: Modelo Sonnet 4

### Librerías
- `pdf-parse`: Extracción de PDF
- `mammoth`: Extracción de DOCX
- `date-fns`: Utilidades de fecha

---

## 📈 Performance

### Métricas Objetivo
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

### Optimizaciones
- Lazy loading de componentes
- Caché agresiva (Service Worker)
- CSS minificado inline
- JS code-splitting

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Registro/Login funciona
- [ ] CRUD de horarios
- [ ] Checklist de mochila se genera
- [ ] CRUD de tareas
- [ ] Plan de estudio con IA funciona
- [ ] Notificaciones funcionan
- [ ] Funciona offline
- [ ] Instalable como PWA

---

## 🔮 Futuro

### Mejoras Planificadas
1. **Real-time collaboration**: Múltiples usuarios editando
2. **Gamificación**: Puntos, logros, streaks
3. **Analytics**: Dashboard de productividad
4. **ML local**: Predicciones sin llamar API
5. **Voice input**: Agregar tareas por voz

---

## 📚 Referencias

- [Supabase Docs](https://supabase.com/docs)
- [Anthropic API](https://docs.anthropic.com)
- [Vercel Docs](https://vercel.com/docs)
- [PWA Best Practices](https://web.dev/pwa)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Arquitectura diseñada para:** Escalabilidad, Mantenibilidad, Performance
