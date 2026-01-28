import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
} from "../controllers/order.controller";

const router = Router();

// Crear un pedido
router.post("/", createOrder);

// 👉 Listar pedidos (opcionalmente filtrados por status)
// Ejemplo: /api/pedidos?status=pendiente
router.get("/", getOrders);

// Obtener un pedido por ID
router.get("/:id", getOrderById);

export default router;
