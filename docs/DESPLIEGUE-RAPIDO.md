# 🚀 Guía Rápida de Despliegue - EasyCole

## ⚡ Despliegue en 10 Minutos

### Paso 1: Supabase (3 min)

1. Ve a [supabase.com](https://supabase.com) → New Project
2. Copia **Project URL** y **anon public key**
3. Ve a SQL Editor
4. Pega el contenido de `docs/database-schema.sql`
5. Ejecuta el script ✅

### Paso 2: Anthropic API (2 min)

1. Ve a [console.anthropic.com](https://console.anthropic.com)
2. Genera una API Key
3. Copia la key (empieza con `sk-ant-...`)

### Paso 3: Vercel (5 min)

1. Ve a [vercel.com](https://vercel.com)
2. **Import Git Repository** (o arrastra la carpeta)
3. Configura las variables de entorno:
   ```
   VITE_SUPABASE_URL = [tu-url-de-supabase]
   VITE_SUPABASE_ANON_KEY = [tu-anon-key]
   ANTHROPIC_API_KEY = [tu-api-key-de-claude]
   ```
4. Deploy! 🚀

### Paso 4: Probar

1. Abre tu URL de Vercel
2. Regístrate con un email
3. Agrega una clase en "Mi Horario"
4. ¡Ve a "Mi Mochila" y verás el checklist automático!

---

## 🎯 Checklist de Verificación

- [ ] Base de datos creada en Supabase
- [ ] Todas las tablas están en la base de datos
- [ ] Variables de entorno configuradas en Vercel
- [ ] App desplegada y funcionando
- [ ] Puedes registrarte
- [ ] Puedes agregar horarios
- [ ] El checklist de mochila funciona
- [ ] Puedes crear tareas
- [ ] Puedes generar planes de estudio con IA

---

## 🆘 Problemas Comunes

### "Cannot connect to Supabase"
→ Verifica las variables de entorno en Vercel

### "AI service not configured"
→ Verifica que ANTHROPIC_API_KEY esté en Vercel

### "No se puede registrar"
→ En Supabase, verifica que Email Auth esté habilitado

---

## 📞 Soporte

Si tienes problemas, revisa:
1. Logs en Vercel Dashboard
2. Network tab en DevTools del navegador
3. Console de errores en el navegador

---

**¡Listo!** Tu PWA educativa con IA está en producción 🎉
