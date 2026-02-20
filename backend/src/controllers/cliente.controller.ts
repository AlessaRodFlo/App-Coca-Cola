import { Request, Response } from "express";
import { Client } from "../models/Cliente";
import Pedido from "../models/Pedido";
import { generateClientNumber } from "../utils/clientNumber";

/* ===============================
   HELPERS
================================ */
const normalizeEmail = (raw: string): string =>
  String(raw || "")
    .trim()
    .toLowerCase();

// Regex pragmático (no perfecto, pero suficiente para validación de formularios)
const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);

/* =====================================================
   GET /api/clientes/:clientNumber
   Buscar cliente por número
===================================================== */
export const getClientByNumber = async (req: Request, res: Response) => {
  try {
    const { clientNumber } = req.params;

    const client = await Client.findOne({ clientNumber });

    if (!client) {
      return res.json({
        exists: false,
        message: "Cliente no encontrado",
      });
    }

    return res.json({
      exists: true,
      client,
    });
  } catch (error) {
    console.error("Error buscando cliente:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

/* =====================================================
   POST /api/clientes
   Registrar nuevo cliente
===================================================== */
export const registerClient = async (req: Request, res: Response) => {
  try {
    const { nombre, correo } = req.body;

    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ message: "Nombre es obligatorio" });
    }

    if (!correo || !String(correo).trim()) {
      return res.status(400).json({ message: "Correo es obligatorio" });
    }

    const correoFinal = normalizeEmail(String(correo));

    // ✅ Ahora aceptamos cualquier dominio (gmail, outlook, etc.)
    if (!isValidEmail(correoFinal)) {
      return res.status(400).json({
        message: "Correo inválido. Ejemplo: usuario@dominio.com",
      });
    }

    const existingClient = await Client.findOne({ correo: correoFinal });
    if (existingClient) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    let clientNumber = generateClientNumber();
    let exists = await Client.findOne({ clientNumber });

    while (exists) {
      clientNumber = generateClientNumber();
      exists = await Client.findOne({ clientNumber });
    }

    const newClient = new Client({
      clientNumber,
      nombre: String(nombre).trim(),
      correo: correoFinal,
      activo: true,
    });

    await newClient.save();

    return res.status(201).json({
      message: "Cliente registrado correctamente",
      client: newClient,
    });
  } catch (error) {
    console.error("Error registrando cliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* =====================================================
   GET /api/clientes
   Lista de clientes
===================================================== */
export const getClientes = async (_req: Request, res: Response) => {
  try {
    const clientes = await Client.find().sort({ createdAt: -1 });
    return res.json(clientes);
  } catch (error) {
    console.error("Error obteniendo clientes:", error);
    return res.status(500).json({ message: "Error obteniendo clientes" });
  }
};

/* =====================================================
   PUT /api/clientes/:id
   Editar cliente (nombre/correo)
===================================================== */
export const updateCliente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, correo } = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    if (nombre !== undefined) {
      if (!String(nombre).trim()) {
        return res.status(400).json({ message: "Nombre no puede ir vacío" });
      }
      client.nombre = String(nombre).trim();
    }

    if (correo !== undefined) {
      const correoFinal = normalizeEmail(String(correo));
      if (!isValidEmail(correoFinal)) {
        return res.status(400).json({
          message: "Correo inválido. Ejemplo: usuario@dominio.com",
        });
      }

      // Si cambia el correo, validar duplicados
      if (correoFinal !== client.correo) {
        const exists = await Client.findOne({ correo: correoFinal });
        if (exists) {
          return res
            .status(409)
            .json({ message: "El correo ya está registrado" });
        }
        client.correo = correoFinal;
      }
    }

    await client.save();

    return res.json({
      message: "Cliente actualizado",
      client,
    });
  } catch (error) {
    console.error("Error actualizando cliente:", error);
    return res.status(500).json({ message: "Error actualizando cliente" });
  }
};

/* =====================================================
   PATCH /api/clientes/:id/estado
   Activar / desactivar cliente
===================================================== */
export const setClienteEstado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== "boolean") {
      return res
        .status(400)
        .json({ message: "Campo 'activo' debe ser boolean" });
    }

    const client = await Client.findById(id);
    if (!client)
      return res.status(404).json({ message: "Cliente no encontrado" });

    client.activo = activo;
    await client.save();

    return res.json({
      message: `Cliente ${activo ? "activado" : "desactivado"}`,
      client,
    });
  } catch (error) {
    console.error("Error cambiando estado del cliente:", error);
    return res
      .status(500)
      .json({ message: "Error cambiando estado del cliente" });
  }
};

/* =====================================================
   DELETE /api/clientes/:id
   ✅ Solo se puede eliminar si NO tiene pedidos
===================================================== */
export const deleteCliente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // 🔒 Regla: si ya tiene pedidos, NO se puede eliminar
    const pedidosCount = await Pedido.countDocuments({
      $or: [{ client: client._id }, { clientNumber: client.clientNumber }],
    });

    if (pedidosCount > 0) {
      return res.status(409).json({
        message:
          "No se puede eliminar: el cliente ya tiene pedidos registrados",
      });
    }

    await Client.findByIdAndDelete(id);

    return res.json({ message: "Cliente eliminado" });
  } catch (error) {
    console.error("Error eliminando cliente:", error);
    return res.status(500).json({ message: "Error eliminando cliente" });
  }
};
