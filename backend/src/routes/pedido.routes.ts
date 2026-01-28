import { Router } from "express";
import {
  createPedido,
  getPedidos,
  updatePedidoStatus,
} from "../controllers/pedido.controller";

const router = Router();

/* ===============================
   PEDIDOS
================================ */

// Crear pedido
router.post("/", createPedido);

// Obtener pedidos (?status=pendiente)
router.get("/", getPedidos);

// Actualizar estado
router.put("/:id", updatePedidoStatus);

export default router;
