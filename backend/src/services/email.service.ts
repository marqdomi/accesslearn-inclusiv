import sgMail from '@sendgrid/mail'

interface EmailConfig {
  apiKey: string
  fromEmail: string
  fromName: string
  frontendUrl: string
}

interface InvitationEmailData {
  recipientEmail: string
  recipientName: string
  inviterName: string
  tenantName: string
  role: string
  invitationUrl: string
}

interface VerificationEmailData {
  recipientEmail: string
  recipientName: string
  verificationUrl: string
  tenantName: string
}

interface WelcomeEmailData {
  recipientEmail: string
  recipientName: string
  tenantName: string
  loginUrl: string
}

export class EmailService {
  private config: EmailConfig

  constructor(config?: Partial<EmailConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.SENDGRID_API_KEY || '',
      fromEmail: config?.fromEmail || process.env.FROM_EMAIL || 'noreply@kainet.mx',
      fromName: config?.fromName || process.env.FROM_NAME || 'AccessLearn Inclusiv',
      frontendUrl: config?.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173',
    }

    if (this.config.apiKey) {
      sgMail.setApiKey(this.config.apiKey)
    }
  }

  /**
   * Check if email service is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey
  }

  /**
   * Send invitation email to a new user
   */
  async sendInvitationEmail(data: InvitationEmailData): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('Email service not configured. Skipping invitation email.')
      return
    }

    const roleLabels: Record<string, string> = {
      'student': 'Estudiante',
      'instructor': 'Instructor',
      'mentor': 'Mentor',
      'content-manager': 'Gestor de Contenido',
      'tenant-admin': 'Administrador',
    }

    const roleLabel = roleLabels[data.role] || data.role

    const msg = {
      to: data.recipientEmail,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName,
      },
      subject: `Invitación a ${data.tenantName} - AccessLearn Inclusiv`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .info-box {
      background: #f3f4f6;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>¡Has sido invitado!</h1>
  </div>
  
  <div class="content">
    <p><strong>Hola ${data.recipientName},</strong></p>
    
    <p>${data.inviterName} te ha invitado a unirte a <strong>${data.tenantName}</strong> en AccessLearn Inclusiv.</p>
    
    <div class="info-box">
      <p><strong>Rol asignado:</strong> ${roleLabel}</p>
      <p><strong>Organización:</strong> ${data.tenantName}</p>
    </div>
    
    <p>Para activar tu cuenta, haz clic en el siguiente botón y configura tu contraseña:</p>
    
    <div style="text-align: center;">
      <a href="${data.invitationUrl}" class="button">Activar mi cuenta</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      O copia y pega este enlace en tu navegador:<br>
      <a href="${data.invitationUrl}">${data.invitationUrl}</a>
    </p>
    
    <p><strong>⏰ Nota importante:</strong> Esta invitación expira en 7 días.</p>
    
    <p>Si no solicitaste esta invitación, puedes ignorar este mensaje.</p>
  </div>
  
  <div class="footer">
    <p>© ${new Date().getFullYear()} AccessLearn Inclusiv - Plataforma de Capacitación Corporativa</p>
    <p>Powered by kainet.mx</p>
  </div>
</body>
</html>
      `,
      text: `
Hola ${data.recipientName},

${data.inviterName} te ha invitado a unirte a ${data.tenantName} en AccessLearn Inclusiv.

Rol asignado: ${roleLabel}
Organización: ${data.tenantName}

Para activar tu cuenta, visita el siguiente enlace y configura tu contraseña:
${data.invitationUrl}

⏰ Esta invitación expira en 7 días.

Si no solicitaste esta invitación, puedes ignorar este mensaje.

---
© ${new Date().getFullYear()} AccessLearn Inclusiv
Powered by kainet.mx
      `,
    }

    try {
      await sgMail.send(msg)
      console.log(`✅ Invitation email sent to ${data.recipientEmail}`)
    } catch (error: any) {
      console.error('❌ Error sending invitation email:', error)
      if (error.response) {
        console.error('SendGrid error response:', error.response.body)
      }
      throw new Error('Failed to send invitation email')
    }
  }

  /**
   * Send email verification link to a new registered user
   */
  async sendVerificationEmail(data: VerificationEmailData): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('Email service not configured. Skipping verification email.')
      return
    }

    const msg = {
      to: data.recipientEmail,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName,
      },
      subject: `Verifica tu email - ${data.tenantName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✉️ Verifica tu email</h1>
  </div>
  
  <div class="content">
    <p><strong>Hola ${data.recipientName},</strong></p>
    
    <p>Gracias por registrarte en <strong>${data.tenantName}</strong>.</p>
    
    <p>Para completar tu registro y activar tu cuenta, por favor verifica tu dirección de email haciendo clic en el botón:</p>
    
    <div style="text-align: center;">
      <a href="${data.verificationUrl}" class="button">Verificar mi email</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      O copia y pega este enlace en tu navegador:<br>
      <a href="${data.verificationUrl}">${data.verificationUrl}</a>
    </p>
    
    <p><strong>⏰ Nota importante:</strong> Este enlace expira en 24 horas.</p>
    
    <p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
  </div>
  
  <div class="footer">
    <p>© ${new Date().getFullYear()} AccessLearn Inclusiv</p>
    <p>Powered by kainet.mx</p>
  </div>
</body>
</html>
      `,
      text: `
Hola ${data.recipientName},

Gracias por registrarte en ${data.tenantName}.

Para completar tu registro y activar tu cuenta, por favor verifica tu dirección de email visitando:
${data.verificationUrl}

⏰ Este enlace expira en 24 horas.

Si no creaste esta cuenta, puedes ignorar este mensaje.

---
© ${new Date().getFullYear()} AccessLearn Inclusiv
Powered by kainet.mx
      `,
    }

    try {
      await sgMail.send(msg)
      console.log(`✅ Verification email sent to ${data.recipientEmail}`)
    } catch (error: any) {
      console.error('❌ Error sending verification email:', error)
      if (error.response) {
        console.error('SendGrid error response:', error.response.body)
      }
      throw new Error('Failed to send verification email')
    }
  }

  /**
   * Send welcome email after successful account activation
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('Email service not configured. Skipping welcome email.')
      return
    }

    const msg = {
      to: data.recipientEmail,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName,
      },
      subject: `¡Bienvenido a ${data.tenantName}! 🎉`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .feature-list {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .feature-list ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 ¡Bienvenido!</h1>
  </div>
  
  <div class="content">
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
    
    <div style="text-align: center;">
      <a href="${data.loginUrl}" class="button">Iniciar Sesión</a>
    </div>
    
    <p>Si necesitas ayuda o tienes alguna pregunta, no dudes en contactar al administrador de tu organización.</p>
    
    <p>¡Que disfrutes tu experiencia de aprendizaje! 🌟</p>
  </div>
  
  <div class="footer">
    <p>© ${new Date().getFullYear()} AccessLearn Inclusiv</p>
    <p>Powered by kainet.mx</p>
  </div>
</body>
</html>
      `,
      text: `
Hola ${data.recipientName},

¡Tu cuenta en ${data.tenantName} ha sido activada exitosamente!

Ya puedes acceder a la plataforma y comenzar tu experiencia de aprendizaje.

🚀 Lo que puedes hacer ahora:
- 📚 Explorar cursos disponibles
- 🎯 Completar misiones y ganar XP
- 🏆 Desbloquear logros y recompensas
- 👥 Conectar con mentores
- 📊 Seguir tu progreso en tiempo real

Inicia sesión aquí: ${data.loginUrl}

Si necesitas ayuda o tienes alguna pregunta, no dudes en contactar al administrador de tu organización.

¡Que disfrutes tu experiencia de aprendizaje! 🌟

---
© ${new Date().getFullYear()} AccessLearn Inclusiv
Powered by kainet.mx
      `,
    }

    try {
      await sgMail.send(msg)
      console.log(`✅ Welcome email sent to ${data.recipientEmail}`)
    } catch (error: any) {
      console.error('❌ Error sending welcome email:', error)
      if (error.response) {
        console.error('SendGrid error response:', error.response.body)
      }
      // Don't throw error for welcome email - it's not critical
      console.warn('Welcome email failed but continuing...')
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()
