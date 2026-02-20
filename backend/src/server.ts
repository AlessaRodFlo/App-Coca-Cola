import "dotenv/config";

import app from "./app";
import { connectDB } from "./config/database";
import { verifyEmailTransporter } from "./services/email.service";

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();

  // 👇 Esto te dice desde que inicia si SMTP va a dejar enviar o no
  await verifyEmailTransporter();

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
})();
