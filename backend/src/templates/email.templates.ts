/**
 * Professional Email Templates
 * Shared base layout and template functions for consistent branding
 */

export interface EmailBranding {
  tenantName: string
  tenantLogo?: string
  primaryColor?: string
  secondaryColor?: string
}

const DEFAULT_PRIMARY = '#4F46E5'
const DEFAULT_SECONDARY = '#10B981'

/**
 * Base email layout wrapper
 */
export function baseLayout(
  content: string,
  branding: EmailBranding,
  options: {
    headerTitle: string
    headerEmoji?: string
    headerGradientFrom?: string
    headerGradientTo?: string
    footerText?: string
  }
): string {
  const primary = branding.primaryColor || DEFAULT_PRIMARY
  const secondary = branding.secondaryColor || DEFAULT_SECONDARY
  const gradientFrom = options.headerGradientFrom || primary
  const gradientTo = options.headerGradientTo || secondary
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${options.headerTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      -webkit-font-smoothing: antialiased;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-card {
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    }
    .header {
      background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%);
      color: white;
      padding: 32px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .header .emoji {
      font-size: 32px;
      display: block;
      margin-bottom: 8px;
    }
    .logo-img {
      max-height: 40px;
      margin-bottom: 12px;
    }
    .content {
      padding: 32px 30px;
    }
    .content p {
      margin: 0 0 16px 0;
      color: #374151;
    }
    .button-wrap {
      text-align: center;
      margin: 24px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 0.025em;
    }
    .info-box {
      background: #f9fafb;
      border-left: 4px solid ${primary};
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .info-box p {
      margin: 4px 0;
      font-size: 14px;
    }
    .feature-list {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .feature-list ul {
      margin: 8px 0;
      padding-left: 20px;
    }
    .feature-list li {
      margin: 6px 0;
      font-size: 14px;
    }
    .link-fallback {
      color: #6b7280;
      font-size: 13px;
      word-break: break-all;
    }
    .link-fallback a {
      color: ${primary};
    }
    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 24px 0;
    }
    .footer {
      text-align: center;
      padding: 24px 30px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 4px 0;
      color: #9ca3af;
      font-size: 12px;
    }
    .footer a {
      color: ${primary};
      text-decoration: none;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: ${primary}20;
      color: ${primary};
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    @media only screen and (max-width: 620px) {
      .email-wrapper { padding: 12px; }
      .header { padding: 24px 20px; }
      .content { padding: 24px 20px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-card">
      <div class="header">
        ${branding.tenantLogo ? `<img src="${branding.tenantLogo}" alt="${branding.tenantName}" class="logo-img">` : ''}
        ${options.headerEmoji ? `<span class="emoji">${options.headerEmoji}</span>` : ''}
        <h1>${options.headerTitle}</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${year} ${branding.tenantName}</p>
        <p>${options.footerText || 'Plataforma de Capacitación Corporativa'}</p>
        <p>Powered by <a href="https://kainet.mx">Kainet</a></p>
      </div>
    </div>
  </div>
</body>
</html>`
}

/**
 * Invitation Email Template
 */
export function invitationTemplate(data: {
  recipientName: string
  inviterName: string
  tenantName: string
  role: string
  invitationUrl: string
  branding?: EmailBranding
}): { html: string; text: string } {
  const roleLabels: Record<string, string> = {
    'student': 'Estudiante',
    'instructor': 'Instructor',
    'mentor': 'Mentor',
    'content-manager': 'Gestor de Contenido',
    'user-manager': 'Gestor de Usuarios',
    'analytics-viewer': 'Analista',
    'tenant-admin': 'Administrador',
  }
  const roleLabel = roleLabels[data.role] || data.role

  const branding = data.branding || { tenantName: data.tenantName }

  const content = `
    <p><strong>Hola ${data.recipientName},</strong></p>
    <p>${data.inviterName} te ha invitado a unirte a <strong>${data.tenantName}</strong>.</p>
    <div class="info-box">
      <p><strong>Rol asignado:</strong> <span class="badge">${roleLabel}</span></p>
      <p><strong>Organización:</strong> ${data.tenantName}</p>
    </div>
    <p>Para activar tu cuenta, haz clic en el siguiente botón y configura tu contraseña:</p>
    <div class="button-wrap">
      <a href="${data.invitationUrl}" class="button">Activar mi cuenta</a>
    </div>
    <p class="link-fallback">
      O copia y pega este enlace en tu navegador:<br>
      <a href="${data.invitationUrl}">${data.invitationUrl}</a>
    </p>
    <div class="divider"></div>
    <p><strong>&#9200; Nota importante:</strong> Esta invitación expira en 7 días.</p>
    <p style="color: #6b7280; font-size: 13px;">Si no solicitaste esta invitación, puedes ignorar este mensaje de forma segura.</p>
  `

  const html = baseLayout(content, branding, {
    headerTitle: '¡Has sido invitado!',
    headerEmoji: '✉️',
    headerGradientFrom: '#667eea',
    headerGradientTo: '#764ba2',
  })

  const text = `Hola ${data.recipientName},

${data.inviterName} te ha invitado a unirte a ${data.tenantName}.

Rol asignado: ${roleLabel}
Organización: ${data.tenantName}

Para activar tu cuenta, visita:
${data.invitationUrl}

⏰ Esta invitación expira en 7 días.

Si no solicitaste esta invitación, ignora este mensaje.

---
© ${new Date().getFullYear()} ${data.tenantName}
Powered by Kainet`

  return { html, text }
}

/**
 * Welcome Email Template
 */
export function welcomeTemplate(data: {
  recipientName: string
  tenantName: string
  loginUrl: string
  branding?: EmailBranding
}): { html: string; text: string } {
  const branding = data.branding || { tenantName: data.tenantName }

  const content = `
    <p><strong>Hola ${data.recipientName},</strong></p>
    <p>¡Tu cuenta en <strong>${data.tenantName}</strong> ha sido activada exitosamente!</p>
    <p>Ya puedes acceder a la plataforma y comenzar tu experiencia de aprendizaje.</p>
    <div class="feature-list">
      <p><strong>🚀 Lo que puedes hacer ahora:</strong></p>
      <ul>
        <li>📚 Explorar cursos disponibles</li>
        <li>🎯 Completar misiones y ganar XP</li>
        <li>🏆 Desbloquear logros y recompensas</li>
        <li>👥 Conectar con mentores</li>
        <li>📊 Seguir tu progreso en tiempo real</li>
      </ul>
    </div>
    <div class="button-wrap">
      <a href="${data.loginUrl}" class="button">Iniciar Sesión</a>
    </div>
    <p>Si necesitas ayuda, no dudes en contactar al administrador de tu organización.</p>
    <p>¡Que disfrutes tu experiencia de aprendizaje! 🌟</p>
  `

  const html = baseLayout(content, branding, {
    headerTitle: '¡Bienvenido!',
    headerEmoji: '🎉',
    headerGradientFrom: '#f59e0b',
    headerGradientTo: '#d97706',
  })

  const text = `Hola ${data.recipientName},

¡Tu cuenta en ${data.tenantName} ha sido activada exitosamente!

Ya puedes acceder a la plataforma y comenzar tu experiencia de aprendizaje.

🚀 Lo que puedes hacer ahora:
- 📚 Explorar cursos disponibles
- 🎯 Completar misiones y ganar XP
- 🏆 Desbloquear logros y recompensas
- 👥 Conectar con mentores
- 📊 Seguir tu progreso en tiempo real

Inicia sesión aquí: ${data.loginUrl}

---
© ${new Date().getFullYear()} ${data.tenantName}
Powered by Kainet`

  return { html, text }
}

/**
 * Password Reset Email Template
 */
export function passwordResetTemplate(data: {
  recipientName: string
  tenantName: string
  resetUrl: string
  branding?: EmailBranding
}): { html: string; text: string } {
  const branding = data.branding || { tenantName: data.tenantName }

  const content = `
    <p><strong>Hola ${data.recipientName},</strong></p>
    <p>Recibimos una solicitud para restablecer tu contraseña en <strong>${data.tenantName}</strong>.</p>
    <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
    <div class="button-wrap">
      <a href="${data.resetUrl}" class="button">Restablecer Contraseña</a>
    </div>
    <p class="link-fallback">
      O copia y pega este enlace en tu navegador:<br>
      <a href="${data.resetUrl}">${data.resetUrl}</a>
    </p>
    <div class="divider"></div>
    <p><strong>&#9200;</strong> Este enlace expira en 1 hora.</p>
    <div class="info-box">
      <p><strong>&#128274; Consejo de seguridad:</strong></p>
      <p>Si no solicitaste este cambio, ignora este mensaje. Tu contraseña actual permanecerá sin cambios.</p>
    </div>
  `

  const html = baseLayout(content, branding, {
    headerTitle: 'Restablecer Contraseña',
    headerEmoji: '🔐',
    headerGradientFrom: '#ef4444',
    headerGradientTo: '#dc2626',
  })

  const text = `Hola ${data.recipientName},

Recibimos una solicitud para restablecer tu contraseña en ${data.tenantName}.

Para crear una nueva contraseña, visita:
${data.resetUrl}

⏰ Este enlace expira en 1 hora.

Si no solicitaste este cambio, ignora este mensaje.

---
© ${new Date().getFullYear()} ${data.tenantName}
Powered by Kainet`

  return { html, text }
}

/**
 * Course Completion Certificate Email Template
 */
export function certificateTemplate(data: {
  recipientName: string
  tenantName: string
  courseName: string
  certificateUrl: string
  completionDate: string
  branding?: EmailBranding
}): { html: string; text: string } {
  const branding = data.branding || { tenantName: data.tenantName }

  const content = `
    <p><strong>¡Felicidades ${data.recipientName}!</strong></p>
    <p>Has completado exitosamente el curso <strong>"${data.courseName}"</strong> en <strong>${data.tenantName}</strong>.</p>
    <div class="info-box">
      <p><strong>📜 Curso:</strong> ${data.courseName}</p>
      <p><strong>📅 Fecha de completación:</strong> ${data.completionDate}</p>
      <p><strong>🏢 Organización:</strong> ${data.tenantName}</p>
    </div>
    <p>Tu constancia está lista para descargar:</p>
    <div class="button-wrap">
      <a href="${data.certificateUrl}" class="button">Descargar Constancia</a>
    </div>
    <p style="color: #6b7280; font-size: 13px;">Esta constancia es un documento oficial emitido por ${data.tenantName} a través de la plataforma AccessLearn.</p>
  `

  const html = baseLayout(content, branding, {
    headerTitle: '¡Curso Completado!',
    headerEmoji: '🎓',
    headerGradientFrom: '#10b981',
    headerGradientTo: '#059669',
  })

  const text = `¡Felicidades ${data.recipientName}!

Has completado exitosamente el curso "${data.courseName}" en ${data.tenantName}.

Fecha de completación: ${data.completionDate}

Descarga tu constancia aquí: ${data.certificateUrl}

---
© ${new Date().getFullYear()} ${data.tenantName}
Powered by Kainet`

  return { html, text }
}

/**
 * Tenant Onboarding Welcome Email Template
 */
export function tenantOnboardingTemplate(data: {
  adminName: string
  tenantName: string
  plan: string
  loginUrl: string
  branding?: EmailBranding
}): { html: string; text: string } {
  const branding = data.branding || { tenantName: data.tenantName }
  const planLabels: Record<string, string> = {
    'free-trial': 'Prueba Gratuita (14 días)',
    'starter': 'Starter',
    'professional': 'Professional',
    'enterprise': 'Enterprise',
  }

  const content = `
    <p><strong>Hola ${data.adminName},</strong></p>
    <p>¡Tu organización <strong>${data.tenantName}</strong> ha sido creada exitosamente en AccessLearn!</p>
    <div class="info-box">
      <p><strong>🏢 Organización:</strong> ${data.tenantName}</p>
      <p><strong>📋 Plan:</strong> ${planLabels[data.plan] || data.plan}</p>
      <p><strong>👤 Rol:</strong> Administrador</p>
    </div>
    <p><strong>Próximos pasos recomendados:</strong></p>
    <div class="feature-list">
      <ul>
        <li>🎨 Personaliza tu marca (logo, colores)</li>
        <li>👥 Invita a tu equipo</li>
        <li>📚 Crea o importa tu primer curso</li>
        <li>📊 Configura tus métricas y reportes</li>
      </ul>
    </div>
    <div class="button-wrap">
      <a href="${data.loginUrl}" class="button">Ir al Panel de Administración</a>
    </div>
    <p>Si necesitas ayuda, nuestro equipo está disponible en <a href="mailto:soporte@kainet.mx">soporte@kainet.mx</a>.</p>
  `

  const html = baseLayout(content, branding, {
    headerTitle: '¡Tu Organización está Lista!',
    headerEmoji: '🚀',
    headerGradientFrom: '#4F46E5',
    headerGradientTo: '#7C3AED',
    footerText: 'Plataforma de Capacitación Corporativa',
  })

  const text = `Hola ${data.adminName},

¡Tu organización ${data.tenantName} ha sido creada exitosamente en AccessLearn!

Plan: ${planLabels[data.plan] || data.plan}
Rol: Administrador

Próximos pasos recomendados:
1. 🎨 Personaliza tu marca (logo, colores)
2. 👥 Invita a tu equipo
3. 📚 Crea o importa tu primer curso
4. 📊 Configura tus métricas y reportes

Accede a tu panel: ${data.loginUrl}

¿Necesitas ayuda? Escríbenos a soporte@kainet.mx

---
© ${new Date().getFullYear()} ${data.tenantName}
Powered by Kainet`

  return { html, text }
}
