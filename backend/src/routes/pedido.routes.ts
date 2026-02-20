import { Router } from "express";
import {
  createPedido,
  getPedidos,
  updatePedido,
  updatePedidoStatus,
  deletePedido,
} from "../controllers/pedido.controller";

const router = Router();

/* ===============================
   PEDIDOS
================================ */

// Crear pedido
router.post("/", createPedido);

// Obtener pedidos (?status=pendiente)
router.get("/", getPedidos);

// Modificar pedido (items/total)
router.patch("/:id", updatePedido);

// Actualizar estado
router.put("/:id", updatePedidoStatus);

// Eliminar pedido
router.delete("/:id", deletePedido);

export default router;
