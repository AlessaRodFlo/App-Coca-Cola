import { Router } from "express";
import {
  getClientByNumber,
  registerClient,
} from "../controllers/cliente.controller";

const router = Router();

/**
 * @route   POST /api/clientes
 * @desc    Registrar un nuevo cliente
 * @body    { nombre: string, correo: string }
 */
router.post("/", registerClient);

/**
 * @route   GET /api/clientes/:clientNumber
 * @desc    Buscar cliente por número
 * @params  clientNumber
 */
router.get("/:clientNumber", getClientByNumber);

export default router;
