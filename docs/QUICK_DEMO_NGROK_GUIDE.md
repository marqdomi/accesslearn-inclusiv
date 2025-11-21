# 🚀 Demo Inmediato con ngrok - Setup Rápido (2 horas)
## Opción para demostrar ANTES del deployment en Azure

**Cuándo usar esto:** Si necesitas hacer demo hoy o mañana sin esperar el setup de Azure.

---

## 📋 Prerrequisitos

```bash
✅ Backend funcionando localmente (port 3000)
✅ Frontend funcionando localmente (port 5000)
✅ Cosmos DB local o Azure Cosmos DB ya configurado
✅ Cuenta de ngrok (gratis)
```

---

## 🔧 Setup Paso a Paso

### **Paso 1: Instalar ngrok (5 minutos)**

#### macOS:
```bash
brew install ngrok
```

#### Windows:
```bash
# Descargar de https://ngrok.com/download
# Descomprimir y agregar al PATH
```

#### Linux:
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok
```

#### Registrarse:
```bash
# Ir a https://dashboard.ngrok.com/signup
# Copiar tu authtoken
ngrok config add-authtoken <tu-token-aqui>
```

---

### **Paso 2: Crear Tenant y Usuarios (30 minutos)**

```bash
# En terminal 1: Asegurarse que Cosmos DB está corriendo
# (Local Emulator o Azure)

# En terminal 2: Crear tenant Dra. Amayrani
cd backend
npm run setup-dra-amayrani
```

**Resultado esperado:**
```
🎉 SETUP COMPLETADO EXITOSAMENTE!
📋 RESUMEN:
   Tenant: Dra. Amayrani Gómez - Capacitación Médica
   Slug: dra-amayrani
   Usuarios creados: 6 (1 admin + 5 estudiantes)

🔐 CREDENCIALES:
   👩‍⚕️ ADMINISTRADOR:
   Email: amayrani.gomez@gmail.com
   Password: AmayTemp2024!

   🎓 ESTUDIANTES:
   1. maria.garcia@hospital.com
   2. juan.martinez@hospital.com
   3. ana.lopez@hospital.com
   4. carlos.rodriguez@hospital.com
   5. lucia.fernandez@hospital.com
   Password (todos): ResidenteTemp2024!
```

---

### **Paso 3: Iniciar Backend (5 minutos)**

```bash
# Terminal 1: Backend
cd backend
npm run server

# Debería decir:
# ✅ Server running on http://localhost:3000
# ✅ Connected to Cosmos DB
```

---

### **Paso 4: Exponer Backend con ngrok (5 minutos)**

```bash
# Terminal 2: ngrok para backend
ngrok http 3000
```

**Salida esperada:**
```
ngrok                                                                                              
                                                                                                   
Session Status                online                                                              
Account                       Marco Dominguez (Plan: Free)                                        
Version                       3.5.0                                                               
Region                        United States (us)                                                  
Latency                       45ms                                                                
Web Interface                 http://127.0.0.1:4040                                              
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000                   

Connections                   ttl     opn     rt1     rt5     p50     p90                        
                              0       0       0.00    0.00    0.00    0.00                       
```

**⚠️ IMPORTANTE:** Copia la URL de forwarding (ej: `https://abc123.ngrok.io`)

---

### **Paso 5: Configurar Frontend para usar ngrok (10 minutos)**

#### Crear archivo `.env.local`:
```bash
cd .. # Volver a root del proyecto
cat > .env.local << EOF
VITE_API_BASE_URL=https://abc123.ngrok.io/api
EOF
```

**Reemplaza** `abc123.ngrok.io` con tu URL real de ngrok.

#### Reiniciar Frontend:
```bash
# Terminal 3: Frontend
npm run dev

# Debería decir:
# ➜  Local:   http://localhost:5000/
# ➜  Network: use --host to expose
```

---

### **Paso 6: Exponer Frontend con ngrok (5 minutos)**

```bash
# Terminal 4: ngrok para frontend
ngrok http 5000
```

**Salida esperada:**
```
Forwarding                    https://xyz789.ngrok.io -> http://localhost:5000
```

**⚠️ IMPORTANTE:** Copia esta URL para compartir con la Dra. Amayrani.

---

### **Paso 7: Configurar CORS en Backend (10 minutos)**

Editar `backend/src/server.ts`:

```typescript
// Agregar en la sección de CORS
app.use(cors({
  origin: [
    'http://localhost:5000',
    'https://xyz789.ngrok.io', // TU URL de ngrok frontend
  ],
  credentials: true,
}))
```

**Reiniciar backend** (Terminal 1):
```bash
# Ctrl+C y luego:
npm run server
```

---

### **Paso 8: Testing Rápido (15 minutos)**

#### Test 1: Health Check
```bash
curl https://abc123.ngrok.io/api/health
```

**Esperado:**
```json
{
  "status": "OK",
  "message": "AccessLearn Backend API",
  "timestamp": "2025-11-21T..."
}
```

#### Test 2: Login
Abrir navegador en: `https://xyz789.ngrok.io`

**Login como Admin:**
```
Email: amayrani.gomez@gmail.com
Password: AmayTemp2024!
Tenant: dra-amayrani
```

**Debe:**
1. ✅ Redirigir a cambio de contraseña
2. ✅ Después al dashboard
3. ✅ Ver opción "Mis Cursos"

#### Test 3: Crear Curso
1. Click en "Mis Cursos"
2. Click en "+ Crear Curso"
3. Llenar Paso 1: Detalles del Curso
4. Guardar borrador

**Debe:**
- ✅ Guardarse sin errores
- ✅ Aparecer en la lista de borradores

---

### **Paso 9: Compartir con Dra. Amayrani (5 minutos)**

#### Email / WhatsApp Template:

```
Hola Amayrani! 👋

Ya tengo lista la plataforma de capacitación para ti. Aquí está el acceso:

🌐 URL: https://xyz789.ngrok.io
👤 Usuario: amayrani.gomez@gmail.com
🔑 Contraseña temporal: AmayTemp2024!
🏢 Tenant: dra-amayrani

📝 Primer Login:
1. Te va a pedir cambiar la contraseña
2. Usa una contraseña segura que recuerdes
3. Después vas a ver tu dashboard

🎓 Crear tu primer curso:
1. Ve a "Mis Cursos" en el menú
2. Click en "+ Crear Curso"
3. Sigue los 5 pasos del wizard
4. Puedes guardar borradores en cualquier momento

👨‍⚕️ Usuarios para tus residentes:
Ya creé 5 cuentas de prueba:
- maria.garcia@hospital.com
- juan.martinez@hospital.com
- ana.lopez@hospital.com
- carlos.rodriguez@hospital.com
- lucia.fernandez@hospital.com

Contraseña temporal (todos): ResidenteTemp2024!

⚠️ IMPORTANTE:
- Esta es una demo temporal
- Mi computadora debe estar prendida
- Si ves errores, avísame inmediatamente
- Planeo mover esto a Azure la próxima semana para que sea permanente

¿Tienes alguna duda? ¡Estoy disponible! 📱

Saludos,
Marco
```

---

## 📊 Monitoreo Durante el Demo

### **ngrok Web Interface:**
Abrir en navegador: `http://localhost:4040`

**Podrás ver:**
- ✅ Todas las peticiones HTTP en tiempo real
- ✅ Request/Response bodies
- ✅ Tiempos de respuesta
- ✅ Errores si los hay

---

## ⚠️ Limitaciones del Demo con ngrok

### **Pros:**
- ✅ Setup súper rápido (2 horas)
- ✅ Sin costos ($0)
- ✅ Demo funcional inmediato
- ✅ Validar producto antes de Azure

### **Contras:**
- ❌ Tu laptop debe estar prendida 24/7
- ❌ URL cambia cada vez que reinicias ngrok
- ❌ Plan gratis: 40 conexiones/minuto límite
- ❌ No es producción real
- ❌ Latencia mayor (tunneling)
- ❌ No es escalable

---

## 🔧 Troubleshooting

### Problema: "502 Bad Gateway"
**Solución:**
```bash
# Verificar que backend esté corriendo
curl http://localhost:3000/api/health

# Si no responde, reiniciar:
cd backend
npm run server
```

### Problema: "CORS Error"
**Solución:**
```typescript
// En backend/src/server.ts, agregar:
app.use(cors({
  origin: '*', // Solo para testing!
}))
```

### Problema: "Cannot find tenant"
**Solución:**
```bash
# Verificar que tenant existe:
cd backend
npm run list-tenants

# Si no existe, crear:
npm run setup-dra-amayrani
```

### Problema: "Invalid credentials"
**Solución:**
```bash
# Resetear contraseñas:
cd backend
npm run update-passwords
```

---

## 🚀 Después del Demo

Si el demo es exitoso y la Dra. Amayrani quiere seguir usando:

### **Opción 1: Continuar con ngrok (temporalmente)**
- Dejar tu laptop prendida 24/7
- Usar un plan ngrok de pago ($8/mes) para URLs estáticas
- Crear un script para auto-reiniciar

### **Opción 2: Mover a Azure (recomendado)**
- Seguir el roadmap de 5 días del documento principal
- Deploy real en producción
- URL permanente
- Sin depender de tu laptop

---

## 📝 Checklist Pre-Demo

```
□ ngrok instalado y configurado
□ Backend corriendo en localhost:3000
□ Frontend corriendo en localhost:5000
□ Tenant dra-amayrani creado
□ 6 usuarios creados (1 admin + 5 estudiantes)
□ Backend expuesto vía ngrok
□ Frontend expuesto vía ngrok
□ CORS configurado con URLs de ngrok
□ Health check funcional
□ Login probado
□ Crear curso probado
□ URLs compartidas con Dra. Amayrani
□ Laptop enchufada y configurada para NO dormir
```

---

## 💡 Pro Tips

1. **Mantén 4 terminales abiertas:**
   - Terminal 1: Backend server
   - Terminal 2: ngrok backend
   - Terminal 3: Frontend dev
   - Terminal 4: ngrok frontend

2. **Prevenir que tu Mac se duerma:**
   ```bash
   caffeinate -d
   ```

3. **Monitorear logs en tiempo real:**
   ```bash
   # En backend:
   tail -f logs/access.log
   ```

4. **Crear alias para reiniciar todo:**
   ```bash
   # En ~/.zshrc o ~/.bashrc:
   alias demo-start="cd ~/Projects/accesslearn-inclusiv && npm run dev & cd backend && npm run server &"
   ```

5. **Tomar screenshots de cada paso:**
   - Para reportar bugs
   - Para documentar feedback
   - Para futuras mejoras

---

## 🎯 Timeline del Demo

**Setup: 2 horas**
- 30 min: Instalar ngrok + crear tenant/usuarios
- 30 min: Configurar ngrok + CORS
- 30 min: Testing
- 30 min: Buffer para troubleshooting

**Demo: 1-2 horas**
- 15 min: Onboarding Dra. Amayrani
- 30 min: Crear primer curso
- 15 min: Onboarding estudiante
- 30 min: Exploración libre

**Total: 3-4 horas del inicio al fin del demo**

---

## ✅ Éxito del Demo

El demo es exitoso si:
- ✅ Dra. Amayrani puede login
- ✅ Puede crear un curso completo
- ✅ Puede publicarlo
- ✅ Estudiantes pueden verlo e inscribirse
- ✅ Estudiantes pueden completar lecciones
- ✅ Sistema de XP funciona
- ✅ Certificados se generan
- ✅ No hay crashes mayores

**Feedback a recolectar:**
- ¿Qué tan intuitivo es el editor de cursos?
- ¿Falta alguna funcionalidad crítica?
- ¿Performance es aceptable?
- ¿La UX es profesional?
- ¿Usarían esto realmente?

---

¡Listo para tu demo inmediato! 🚀

**Siguiente paso:** Ejecutar `npm run setup-dra-amayrani` y comenzar. 💪
