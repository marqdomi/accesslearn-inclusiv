# Guía de Contribución - Kaido Platform

## ⚠️ IMPORTANTE: Términos de Colaboración

Este es un proyecto **PROPIETARIO** y **CONFIDENCIAL**. Al contribuir a este proyecto, aceptas los siguientes términos:

### 🔒 Confidencialidad

1. **Toda la información** relacionada con este proyecto es **CONFIDENCIAL**
2. **NO compartas** código, features, arquitectura o información técnica con terceros sin autorización escrita
3. **NO clones** o copies código para uso en otros proyectos sin permiso explícito
4. **NO publiques** información sobre features, arquitectura o implementaciones en blogs, redes sociales o foros públicos

### 📋 Acuerdo de Colaboración

Antes de contribuir, debes:

1. ✅ Firmar un **Acuerdo de Confidencialidad (NDA)** si aún no lo has hecho
2. ✅ Leer y entender esta guía completamente
3. ✅ Aceptar que todo el código que contribuyas será propiedad de Marco Domínguez
4. ✅ Comprometerte a mantener la confidencialidad del proyecto

### 🚫 Restricciones

**NO está permitido:**

- ❌ Hacer fork público del repositorio sin autorización
- ❌ Copiar código o features para proyectos personales o comerciales
- ❌ Compartir credenciales, secrets o información de infraestructura
- ❌ Publicar screenshots o demos sin autorización
- ❌ Usar el código para competir con el proyecto o sus intereses comerciales
- ❌ Reverse engineering o análisis no autorizado del código

## 🤝 Proceso de Contribución

### 1. Configuración Inicial

```bash
# Clonar el repositorio (solo si tienes acceso autorizado)
git clone [repository-url]
cd accesslearn-inclusiv

# Crear una rama para tu feature
git checkout -b feature/nombre-de-tu-feature
```

### 2. Estándares de Código

- **TypeScript**: Usar tipos estrictos, evitar `any`
- **React**: Seguir patrones existentes, usar hooks apropiados
- **Estilo**: Seguir las convenciones del proyecto (Tailwind, shadcn/ui)
- **Accesibilidad**: Todas las features deben cumplir WCAG 2.1 Level AA
- **Commits**: Mensajes descriptivos en español o inglés

### 3. Flujo de Trabajo

1. **Crear una rama** desde `main`:
   ```bash
   git checkout -b feature/mi-feature
   ```

2. **Desarrollar tu feature**:
   - Escribe código limpio y documentado
   - Agrega comentarios donde sea necesario
   - Mantén la consistencia con el código existente

3. **Testing**:
   - Prueba manualmente tu feature
   - Verifica accesibilidad (navegación por teclado, lectores de pantalla)
   - Asegúrate de que no rompas funcionalidad existente

4. **Commit**:
   ```bash
   git add .
   git commit -m "feat: descripción clara de tu cambio"
   ```

5. **Push y Pull Request**:
   ```bash
   git push origin feature/mi-feature
   ```
   - Crea un Pull Request en GitHub
   - Espera revisión y aprobación antes de mergear

### 4. Estructura de Commits

Usa prefijos descriptivos:

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan funcionalidad)
- `refactor:` Refactorización de código
- `perf:` Mejoras de performance
- `test:` Agregar o modificar tests
- `chore:` Cambios en build, dependencias, etc.

### 5. Code Review

- Todas las contribuciones requieren **aprobación** antes de mergear
- Los reviews pueden solicitar cambios
- Responde a los comentarios de manera constructiva
- Mantén el PR actualizado con `main` si hay conflictos

## 📝 Checklist Antes de Contribuir

Antes de enviar tu PR, verifica:

- [ ] He leído y acepto los términos de confidencialidad
- [ ] Mi código sigue los estándares del proyecto
- [ ] He probado mi feature manualmente
- [ ] He verificado accesibilidad (WCAG 2.1 AA)
- [ ] He actualizado documentación si es necesario
- [ ] Mis commits tienen mensajes descriptivos
- [ ] No he incluido secrets, credenciales o información sensible
- [ ] He eliminado código comentado o de debug

## 🔐 Seguridad

### Información Sensible

**NUNCA commits:**

- Credenciales de Azure (Connection Strings, Keys)
- Tokens de API (JWT secrets, Resend keys)
- Passwords o información de usuarios
- URLs de producción con tokens
- Configuraciones de infraestructura sensibles

### Variables de Entorno

- Usa `.env` para configuración local (ya está en `.gitignore`)
- Las variables de producción están en Azure Portal
- No hardcodees valores sensibles

## 📚 Recursos

- **[ONBOARDING_DEVELOPER.md](./docs/ONBOARDING_DEVELOPER.md)** - Guía completa para nuevos desarrolladores
- **[ACCESSIBILITY_STYLE_GUIDE.md](./docs/ACCESSIBILITY_STYLE_GUIDE.md)** - Guía de accesibilidad WCAG 2.1 AA
- **[INDICE_DOCUMENTACION.md](./docs/INDICE_DOCUMENTACION.md)** - Índice completo de documentación

## ❓ Preguntas

Si tienes dudas sobre:
- **Proceso de contribución**: Abre una issue o pregunta en el equipo
- **Arquitectura**: Revisa la documentación en `/docs`
- **Accesibilidad**: Consulta `ACCESSIBILITY_STYLE_GUIDE.md`
- **Licencia o términos**: Contacta directamente a Marco Domínguez

## ⚖️ Violaciones

Las violaciones de estos términos pueden resultar en:
- Revocación inmediata de acceso al repositorio
- Acciones legales según corresponda
- Terminación de cualquier acuerdo de colaboración

---

**Última actualización:** Enero 2025  
**Versión:** 1.0

