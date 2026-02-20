import express, { Request, Response } from "express";
import cors from "cors";

import clientsRoutes from "./routes/cliente.routes";
import ordersRoutes from "./routes/pedido.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "API Coca-Cola funcionando" });
});

app.use("/api/clientes", clientsRoutes);
app.use("/api/pedidos", ordersRoutes);

export default app;
