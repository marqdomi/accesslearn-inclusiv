# 🚀 Guía de Configuración de Crowdin - Fase 2

**Fecha:** 2025-01-24  
**Estado:** Configuración lista, pendiente de activación

---

## 📋 Resumen

Esta guía te ayudará a configurar Crowdin para gestionar las traducciones de Kaido de forma colaborativa y automática.

**Beneficios:**
- ✅ Gestión de traducciones en la nube
- ✅ Traducción automática (DeepL/Google Translate)
- ✅ Colaboración con traductores profesionales
- ✅ Sincronización automática con GitHub
- ✅ Detección automática de nuevas claves
- ✅ Gratis hasta 10,000 strings

---

## 🎯 Paso 1: Crear Cuenta y Proyecto en Crowdin

### 1.1 Crear Cuenta

1. Ve a [crowdin.com](https://crowdin.com)
2. Haz clic en **"Sign Up"** o **"Get Started"**
3. Crea una cuenta (puedes usar GitHub para registro rápido)

### 1.2 Crear Proyecto

1. Una vez dentro, haz clic en **"Create Project"**
2. Configura el proyecto:
   - **Nombre:** `Kaido Platform`
   - **Source Language:** `Spanish (es)`
   - **Target Languages:** `English (en)`
   - **Visibility:** Private (recomendado) o Public
3. Haz clic en **"Create"**

### 1.3 Obtener Credenciales

1. Ve a **Settings** → **API**
2. Copia el **Project ID** (lo necesitarás para `crowdin.yml`)
3. Genera un **Personal Access Token**:
   - Ve a **Settings** → **API** → **Personal Access Tokens**
   - Haz clic en **"Create Token"**
   - Nombre: `Kaido GitHub Actions`
   - Permisos: `Project Manager` (o `Owner`)
   - Copia el token (solo se muestra una vez)

---

## 🔧 Paso 2: Configurar el Proyecto Local

### 2.1 Actualizar `crowdin.yml`

1. Abre `crowdin.yml` en la raíz del proyecto
2. Reemplaza `project_id: ""` con tu Project ID:

```yaml
project_id: "123456"  # Tu Project ID aquí
```

### 2.2 Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Agrega los siguientes secrets:

   **`CROWDIN_PROJECT_ID`**
   - Valor: Tu Project ID (ej: `123456`)

   **`CROWDIN_PERSONAL_TOKEN`**
   - Valor: Tu Personal Access Token

### 2.3 Configurar Variables de Entorno (Opcional - para uso local)

Si quieres usar los scripts de sincronización manual:

```bash
# macOS/Linux
export CROWDIN_PERSONAL_TOKEN="tu_token_aqui"

# O agregar a ~/.zshrc o ~/.bashrc
echo 'export CROWDIN_PERSONAL_TOKEN="tu_token_aqui"' >> ~/.zshrc
```

---

## 📤 Paso 3: Subir Traducciones Iniciales

### Opción A: Usando Script NPM (Recomendado)

```bash
npm run crowdin:upload
```

### Opción B: Usando Crowdin CLI Directamente

```bash
npx crowdin upload sources
```

### Opción C: Desde la Web UI

1. Ve a tu proyecto en Crowdin
2. **Upload** → **Files**
3. Sube manualmente los archivos desde `public/locales/es/`

---

## ⚙️ Paso 4: Configurar Traducción Automática

1. Ve a tu proyecto en Crowdin
2. **Settings** → **Translations** → **Machine Translation**
3. Habilita **Machine Translation**
4. Selecciona el proveedor:
   - **DeepL** (mejor calidad, requiere cuenta)
   - **Google Translate** (gratis, buena calidad)
   - **Crowdin Translate** (gratis, calidad básica)

**Recomendación:** Empieza con **Crowdin Translate** (gratis) y luego migra a DeepL si necesitas mejor calidad.

---

## 🔄 Paso 5: Configurar Sincronización Automática

### GitHub Actions

El workflow ya está configurado en `.github/workflows/crowdin-sync.yml`. Se ejecutará automáticamente cuando:

- Hagas push a `main` con cambios en `public/locales/es/**`
- Ejecutes manualmente desde **Actions** → **Crowdin Sync** → **Run workflow**
- Se ejecute diariamente a las 2 AM UTC (cron job)

### Verificar que Funciona

1. Haz un cambio en cualquier archivo de `public/locales/es/`
2. Haz commit y push a `main`
3. Ve a **Actions** en GitHub
4. Deberías ver el workflow **Crowdin Sync** ejecutándose
5. Las traducciones se subirán automáticamente a Crowdin

---

## 📥 Paso 6: Descargar Traducciones

### Automático (GitHub Actions)

Las traducciones se descargan automáticamente cuando:
- Se ejecuta el workflow de sincronización
- Hay nuevas traducciones aprobadas en Crowdin

### Manual

```bash
# Descargar todas las traducciones
npm run crowdin:download

# O sincronizar completo (upload + download)
npm run crowdin:sync
```

---

## 👥 Paso 7: Invitar Traductores (Opcional)

1. Ve a tu proyecto en Crowdin
2. **Members** → **Invite Members**
3. Agrega el email del traductor
4. Selecciona el rol:
   - **Translator** - Puede traducir
   - **Proofreader** - Puede revisar y aprobar
   - **Manager** - Puede gestionar el proyecto

---

## 🔍 Verificación

### Verificar Configuración

```bash
# Verificar que crowdin.yml está correcto
cat crowdin.yml

# Probar conexión (requiere token configurado)
npx crowdin status
```

### Verificar GitHub Actions

1. Ve a **Actions** en GitHub
2. Deberías ver el workflow **Crowdin Sync**
3. Si hay errores, revisa los logs

---

## 📊 Flujo de Trabajo

### Desarrollo Normal

```
1. Desarrollador agrega nueva clave en código
   → t('newFeature.title')

2. Ejecuta: npm run i18n:extract (si está configurado)
   → Agrega clave a public/locales/es/common.json

3. Commit y push a GitHub
   → GitHub Action detecta cambios

4. GitHub Action sube archivos a Crowdin
   → Nueva clave aparece en Crowdin

5. Crowdin traduce automáticamente (o traductor humano)
   → Traducción lista en Crowdin

6. GitHub Action descarga traducciones
   → public/locales/en/common.json actualizado

7. Build automático incluye nuevas traducciones
   → App actualizada con traducciones
```

### Trabajo Manual

```bash
# 1. Agregar nueva clave manualmente
# Editar public/locales/es/common.json

# 2. Subir a Crowdin
npm run crowdin:upload

# 3. Traducir en Crowdin (web UI o automático)

# 4. Descargar traducciones
npm run crowdin:download

# 5. Commit cambios
git add public/locales/
git commit -m "feat: agregar nuevas traducciones"
```

---

## 🛠️ Comandos Útiles

```bash
# Subir archivos fuente a Crowdin
npm run crowdin:upload

# Descargar traducciones desde Crowdin
npm run crowdin:download

# Sincronizar completo (upload + download)
npm run crowdin:sync

# Ver estado del proyecto
npx crowdin status

# Verificar configuración
npx crowdin list project
```

---

## 🐛 Solución de Problemas

### Error: "Project ID not found"

- Verifica que `project_id` en `crowdin.yml` sea correcto
- Obtén el ID en: Settings → API → Project ID

### Error: "Invalid API token"

- Verifica que `CROWDIN_PERSONAL_TOKEN` esté configurado en GitHub Secrets
- Genera un nuevo token si es necesario

### Error: "File not found"

- Verifica que los archivos existan en `public/locales/es/`
- Verifica las rutas en `crowdin.yml`

### GitHub Actions no se ejecuta

- Verifica que los secrets estén configurados
- Revisa los logs en **Actions** → **Crowdin Sync**
- Verifica que el workflow esté en `.github/workflows/`

### Traducciones no se descargan

- Verifica que haya traducciones aprobadas en Crowdin
- Revisa la configuración de `export_only_approved` en `crowdin.yml`
- Ejecuta manualmente: `npm run crowdin:download`

---

## 📚 Recursos

- [Crowdin Documentation](https://support.crowdin.com/)
- [Crowdin CLI Documentation](https://support.crowdin.com/cli-tool/)
- [GitHub Action for Crowdin](https://github.com/crowdin/github-action)
- [Crowdin API Reference](https://developer.crowdin.com/api/v2/)

---

## ✅ Checklist de Configuración

- [ ] Cuenta creada en Crowdin
- [ ] Proyecto "Kaido Platform" creado
- [ ] Project ID obtenido y configurado en `crowdin.yml`
- [ ] Personal Access Token generado
- [ ] Secrets configurados en GitHub (`CROWDIN_PROJECT_ID`, `CROWDIN_PERSONAL_TOKEN`)
- [ ] Traducciones iniciales subidas
- [ ] Traducción automática configurada
- [ ] GitHub Actions funcionando
- [ ] Scripts de sincronización probados

---

**¡Listo!** Una vez completado este checklist, tu integración con Crowdin estará funcionando. 🎉

