import dotenv from 'dotenv'
import { EmailService } from '../services/email.service'

// Load environment variables FIRST
dotenv.config()

async function testEmail() {
  console.log('🧪 Testing Resend Email Service...\n')
  console.log('🔧 Configuration:')
  console.log('   - RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set')
  console.log('   - EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set')
  console.log('   - FROM_NAME:', process.env.FROM_NAME || 'AccessLearn Inclusiv')
  console.log()

  // Create new instance after env vars are loaded
  const emailService = new EmailService()

  try {
    // Test invitation email
    console.log('📧 Sending invitation email to marcdomibe@gmail.com...')
    
    await emailService.sendInvitationEmail({
      recipientEmail: 'marcdomibe@gmail.com',
      recipientName: 'Marco Domínguez',
      inviterName: 'Dra. Amayrani Gómez',
      tenantName: 'Hospital de Ejemplo',
      role: 'student',
      invitationUrl: 'http://localhost:5000/accept-invitation?token=test-token-123',
      expiresInDays: 7,
    })

    console.log('✅ Invitation email sent successfully!')
    console.log('\n📬 Check your inbox at marcdomibe@gmail.com')
    console.log('📁 Also check spam folder if not in inbox')
    console.log('\n🔗 Invitation details:')
    console.log('   - From: AccessLearn Inclusiv <newsletter@kainet.mx>')
    console.log('   - To: marcdomibe@gmail.com')
    console.log('   - Subject: Invitación a Hospital de Ejemplo - AccessLearn Inclusiv')
    console.log('   - Role: Student')
    console.log('   - Expires: 7 days')

  } catch (error: any) {
    console.error('\n❌ Error sending email:', error.message)
    if (error.response) {
      console.error('Response:', error.response)
    }
    process.exit(1)
  }
}

// Run test
testEmail()
