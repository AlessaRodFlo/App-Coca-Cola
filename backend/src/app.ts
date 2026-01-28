import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";

// Rutas
import clientsRoutes from "./routes/cliente.routes";
import ordersRoutes from "./routes/pedido.routes";

const app = express();

/* ===============================
   MIDDLEWARES
================================ */
app.use(cors());
app.use(express.json());

/* ===============================
   RUTA DE SALUD (TEST)
================================ */
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "API Coca-Cola funcionando" });
});

/* ===============================
   RUTAS PRINCIPALES
================================ */
app.use("/api/clientes", clientsRoutes);
app.use("/api/pedidos", ordersRoutes);

export default app;
