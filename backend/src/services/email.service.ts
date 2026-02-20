import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

type MailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
};

let cachedTransporter: nodemailer.Transporter | null = null;

/* ===============================
   CARGAR CONFIG DE SMTP (desde .env)
   - Se evalúa EN TIEMPO DE EJECUCIÓN para evitar problemas de orden con dotenv
================================ */
const getMailConfig = (): MailConfig => {
  const host = process.env.MAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.MAIL_PORT || 587);
  const user = process.env.MAIL_USER || "";
  const pass = process.env.MAIL_PASS || "";

  if (!user || !pass) {
    throw new Error("Faltan variables MAIL_USER o MAIL_PASS en .env");
  }

  // Por defecto: el FROM usa el mismo correo autenticado (lo más compatible con Gmail)
  const defaultFrom = `Preventa Coca-Cola <${user}>`;

  // Si te dejaron un placeholder como 'tu_correo@gmail.com', lo ignoramos para evitar rechazos.
  const envFromRaw = (process.env.MAIL_FROM || "").trim();
  const fromLooksPlaceholder =
    envFromRaw.toLowerCase().includes("tu_correo") ||
    envFromRaw.toLowerCase().includes("example");

  const from = !envFromRaw || fromLooksPlaceholder ? defaultFrom : envFromRaw;

  // 465 = SSL/TLS directo (secure true). 587 = STARTTLS (secure false).
  const secure = port === 465;

  // Aviso útil: si MAIL_FROM trae un email distinto al autenticado, Gmail puede rechazar o reescribir.
  const fromEmailMatch = /<([^>]+)>/.exec(from)?.[1] || "";
  if (fromEmailMatch && fromEmailMatch !== user) {
    console.warn(
      `[MAIL] ⚠️ MAIL_FROM (${fromEmailMatch}) no coincide con MAIL_USER (${user}). ` +
        `Para Gmail, lo recomendado es que coincidan.`,
    );
  }

  return { host, port, user, pass, from, secure };
};

const getTransporter = (): nodemailer.Transporter => {
  if (cachedTransporter) return cachedTransporter;

  const cfg = getMailConfig();

  cachedTransporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass, // App Password (Gmail)
    },
    tls: {
      // ayuda en entornos donde TLS falla por certificados (dev)
      rejectUnauthorized: false,
    },
  });

  return cachedTransporter;
};

/* ===============================
   VERIFICAR TRANSPORTER
================================ */
export const verifyEmailTransporter = async (): Promise<void> => {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log("SMTP listo para enviar correos (verify OK)");
  } catch (error: any) {
    console.error(
      "SMTP verify falló. Revisa credenciales / App Password / bloqueo de Google:",
      error?.message || error,
    );
  }
};

/* ===============================
   ENVIAR CORREO
================================ */
export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> => {
  try {
    const transporter = getTransporter();
    const cfg = getMailConfig();

    const info = await transporter.sendMail({
      from: cfg.from,
      to,
      subject,
      html,
    });

    console.log(`Correo enviado a ${to}. messageId=${info.messageId}`);
  } catch (error: any) {
    // Log detallado cuando Nodemailer trae respuesta del servidor SMTP
    const smtpResp = error?.response || error?.responseCode || "";
    console.error("Error enviando correo:", error?.message || error, smtpResp);
    throw new Error(error?.message || "No se pudo enviar el correo");
  }
};
