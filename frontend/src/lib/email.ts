import nodemailer from 'nodemailer'

const smtpOptions = {
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
}

export const transporter = nodemailer.createTransport(smtpOptions)

export interface EmailPayload {
  to: string
  subject: string
  html: string
}

export const sendEmail = async (data: EmailPayload) => {
  const { to, subject, html } = data

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// Verify SMTP connection
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify()
    return { success: true }
  } catch (error) {
    console.error('Error verifying email connection:', error)
    return { success: false, error: 'Failed to verify email connection' }
  }
}