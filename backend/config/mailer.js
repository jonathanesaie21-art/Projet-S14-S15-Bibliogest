import nodemailer from "nodemailer";

const hasSmtpConfig =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export async function sendMail({ to, subject, html }) {
  if (!transporter) {
    // Pas de SMTP configuré : on affiche l'email dans la console au lieu de
    // l'envoyer, pour pouvoir tester tout le flux sans compte mail réel.
    console.log("\n📧 [mailer] SMTP non configuré — email simulé :");
    console.log(`   À : ${to}`);
    console.log(`   Sujet : ${subject}`);
    console.log(`   ${html.replace(/<[^>]+>/g, " ")}\n`);
    return;
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM || `"BiblioGest" <no-reply@bibliogest.local>`,
    to,
    subject,
    html,
  });
}

export function isMailerConfigured() {
  return !!hasSmtpConfig;
}
