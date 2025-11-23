# ✅ Checklist Rápido de Testing Manual - AccessLearn

**Versión:** 1.0.0  
**Fecha:** 23 de Noviembre, 2025  
**Propósito:** Checklist rápido para testing manual antes de demo o release

---

## 🎯 TESTING RÁPIDO (30-45 minutos)

### 🔐 Autenticación (5 min)
- [ ] Login exitoso con diferentes roles
- [ ] Logout funciona
- [ ] Cambio de contraseña
- [ ] Edición de perfil

### 📚 Cursos (10 min)
- [ ] Crear curso completo (5 pasos)
- [ ] Editar curso existente
- [ ] Publicar curso
- [ ] Ver catálogo de cursos
- [ ] Inscribirse en curso

### 📈 Progreso (10 min)
- [ ] Completar lección
- [ ] Completar quiz
- [ ] Completar curso completo
- [ ] Ver progreso actualizado

### 🎮 Gamificación (5 min)
- [ ] XP se otorga correctamente
- [ ] Nivel se actualiza
- [ ] Achievement se desbloquea
- [ ] Leaderboard funciona

### 🏆 Certificados (3 min)
- [ ] Certificado se genera al completar curso
- [ ] Descargar PDF funciona
- [ ] Información es correcta

### 💬 Foros (5 min)
- [ ] Publicar pregunta
- [ ] Responder pregunta
- [ ] Marcar mejor respuesta
- [ ] Upvote funciona

### ⚙️ Admin (5 min)
- [ ] Configurar branding
- [ ] Ver analytics
- [ ] Ver panel de seguridad

### ♿ Accesibilidad (2 min)
- [ ] Navegación por teclado funciona
- [ ] Panel de accesibilidad funciona
- [ ] Cambios se aplican

---

## 🎯 TESTING COMPLETO (2-3 horas)

### Preparación
- [ ] Limpiar caché del navegador
- [ ] Abrir DevTools (F12)
- [ ] Verificar conexión backend/frontend
- [ ] Tener credenciales de prueba listas

### Autenticación y Usuarios
- [ ] TC-AUTH-001: Login exitoso
- [ ] TC-AUTH-002: Login con credenciales incorrectas
- [ ] TC-AUTH-003: Logout
- [ ] TC-AUTH-004: Cambio de contraseña
- [ ] TC-AUTH-005: Edición de perfil

### Gestión de Cursos
- [ ] TC-COURSE-001: Crear curso completo
- [ ] TC-COURSE-002: Editar curso existente
- [ ] TC-COURSE-003: Publicar curso
- [ ] TC-COURSE-004: Ver catálogo
- [ ] TC-COURSE-005: Inscribirse en curso

### Progreso y Completado
- [ ] TC-PROGRESS-001: Completar lección
- [ ] TC-PROGRESS-002: Completar quiz
- [ ] TC-PROGRESS-003: Completar curso completo
- [ ] TC-PROGRESS-004: Ver progreso

### Gamificación
- [ ] TC-GAMIFY-001: Sistema de XP
- [ ] TC-GAMIFY-002: Subida de nivel
- [ ] TC-GAMIFY-003: Desbloquear achievement
- [ ] TC-GAMIFY-004: Ver leaderboard

### Certificados
- [ ] TC-CERT-001: Generación automática
- [ ] TC-CERT-002: Descargar PDF
- [ ] TC-CERT-003: Verificar certificado

### Foros Q&A
- [ ] TC-FORUM-001: Publicar pregunta
- [ ] TC-FORUM-002: Responder pregunta
- [ ] TC-FORUM-003: Marcar mejor respuesta
- [ ] TC-FORUM-004: Upvote

### Mentoría
- [ ] TC-MENTOR-001: Solicitar mentoría
- [ ] TC-MENTOR-002: Aceptar solicitud
- [ ] TC-MENTOR-003: Completar sesión

### Analytics
- [ ] TC-ANALYTICS-001: Dashboard principal
- [ ] TC-ANALYTICS-002: Reporte de usuarios
- [ ] TC-ANALYTICS-003: Reporte de cursos

### Configuración Admin
- [ ] TC-ADMIN-001: Configurar branding
- [ ] TC-ADMIN-002: Configurar notificaciones
- [ ] TC-ADMIN-003: Ver panel de seguridad

### Accesibilidad
- [ ] TC-ACC-001: Navegación por teclado
- [ ] TC-ACC-002: Panel de accesibilidad
- [ ] TC-ACC-003: Screen reader

### Multi-Navegador
- [ ] TC-BROWSER-001: Chrome
- [ ] TC-BROWSER-002: Firefox
- [ ] TC-BROWSER-003: Safari
- [ ] TC-BROWSER-004: Mobile

---

## 🚨 VERIFICACIONES CRÍTICAS

### Antes de Demo/Release
- [ ] ✅ No hay errores en consola
- [ ] ✅ Todas las funcionalidades core funcionan
- [ ] ✅ Performance aceptable (< 3s carga)
- [ ] ✅ Responsive design funciona
- [ ] ✅ Accesibilidad básica funciona
- [ ] ✅ Multi-navegador compatible

### Errores Críticos a Reportar Inmediatamente
- [ ] ❌ Login no funciona
- [ ] ❌ Cursos no se cargan
- [ ] ❌ Progreso no se guarda
- [ ] ❌ Certificados no se generan
- [ ] ❌ Errores 500 en API
- [ ] ❌ Aplicación no carga

---

## 📊 MÉTRICAS DE ÉXITO

### Funcionalidad
- **Tasa de Éxito:** > 95% de casos de prueba pasan
- **Bugs Críticos:** 0
- **Bugs Altos:** < 3
- **Bugs Totales:** < 10

### Performance
- **Tiempo de Carga:** < 3 segundos
- **Tiempo de Respuesta API:** < 500ms
- **Interactividad:** < 100ms

### Accesibilidad
- **WCAG Compliance:** 2.1 Level AA
- **Keyboard Navigation:** 100%
- **Screen Reader:** Compatible

---

## 📝 NOTAS RÁPIDAS

**Fecha de Testing:** _______________  
**Tester:** _______________  
**Ambiente:** ⬜ Local / ⬜ Staging / ⬜ Producción  
**Navegador Principal:** _______________

**Bugs Encontrados:** _______________  
**Funcionalidades No Probadas:** _______________  
**Observaciones:** _______________

---

## 🔑 CREDENCIALES RÁPIDAS

**Tenant:** `kainet`  
**Password (todos):** `Demo123!`

| Rol | Email |
|-----|-------|
| Super Admin | `ana.lopez@kainet.mx` |
| Tenant Admin | `admin.tenant@kainet.mx` |
| Content Manager | `carlos.content@kainet.mx` |
| User Manager | `laura.users@kainet.mx` |
| Analytics Viewer | `pedro.analytics@kainet.mx` |
| Instructor | `maria.instructor@kainet.mx` |
| Mentor | `carlos.mentor@kainet.mx` |
| Student | `juan.student@kainet.mx` |

**Ver detalles completos:** [CREDENCIALES_TEST_USUARIOS.md](./CREDENCIALES_TEST_USUARIOS.md)

---

## 🔗 REFERENCIAS

- **Guía Completa:** [TESTING_MANUAL_GUIA_COMPLETA.md](./TESTING_MANUAL_GUIA_COMPLETA.md)
- **Checklist de Demo:** [DEMO_READINESS_CHECKLIST.md](./DEMO_READINESS_CHECKLIST.md)
- **Credenciales Completas:** [CREDENCIALES_TEST_USUARIOS.md](./CREDENCIALES_TEST_USUARIOS.md)

---

**Última Actualización:** 23 de Noviembre, 2025

