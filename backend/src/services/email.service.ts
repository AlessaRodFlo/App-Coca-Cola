import * as nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/* ===============================
   TRANSPORTER DE CORREO (GMAIL)
================================ */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // contraseña de aplicación
  },
});

/* ===============================
   ENVIAR CORREO
================================ */
export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"Preventa Coca-Cola" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Correo enviado a ${to}`);
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    throw new Error("No se pudo enviar el correo");
  }
};
