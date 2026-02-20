import { Router } from "express";
import {
  getClientByNumber,
  registerClient,
  getClientes,
  updateCliente,
  setClienteEstado,
  deleteCliente,
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

/**
 * @route   GET /api/clientes
 * @desc    Listar clientes (admin)
 */
router.get("/", getClientes);

/**
 * @route   PUT /api/clientes/:id
 * @desc    Editar nombre/correo (admin)
 * @body    { nombre?: string, correo?: string }
 */
router.put("/:id", updateCliente);

/**
 * @route   PATCH /api/clientes/:id/estado
 * @desc    Activar / desactivar cliente (admin)
 * @body    { activo: boolean }
 */
router.patch("/:id/estado", setClienteEstado);

/**
 * @route   DELETE /api/clientes/:id
 * @desc    Eliminar cliente solo si no tiene pedidos (admin)
 */
router.delete("/:id", deleteCliente);

export default router;
