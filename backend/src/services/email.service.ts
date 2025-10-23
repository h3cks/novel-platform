import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, NODE_ENV } from '../config';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

async function createTransporter(): Promise<nodemailer.Transporter> {
  if (NODE_ENV === 'production' && SMTP_HOST) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  // Dev/test: use ethereal
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
}

export async function sendMail(to: string, subject: string, html: string) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });

  // In dev, ethereal provides preview URL
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log('Preview URL: %s', preview);
  }
  console.log(`Mail sent: ${info.messageId} to ${to}`);
  return info;
}

export async function sendConfirmationEmail(to: string, token: string) {
  const confirmUrl = `${
    process.env.API_URL ?? 'http://localhost:4000'
  }/auth/confirm?token=${encodeURIComponent(token)}`;
  const html = `
    <p>Доброго дня!</p>
    <p>Натисніть посилання, щоб підтвердити ваш email:</p>
    <p><a href="${confirmUrl}">${confirmUrl}</a></p>
    <p>Якщо ви не реєструвалися — проігноруйте цей лист.</p>
  `;
  return sendMail(to, 'Підтвердження email — Novel Platform', html);
}

export async function sendPasswordResetEmail(to: string, token: string) {
  // For frontend flow, send FRONTEND_URL link with token param
  const frontend = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const resetUrl = `${frontend}/reset-password?token=${token}`;
  const html = `
    <p>Ви запросили скидання пароля.</p>
    <p>Перейдіть за посиланням, щоб задати новий пароль (лінк дійсний обмежений час):</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Якщо ви не запитували скидання — проігноруйте цей лист.</p>
  `;
  return sendMail(to, 'Скидання пароля — Novel Platform', html);
}
