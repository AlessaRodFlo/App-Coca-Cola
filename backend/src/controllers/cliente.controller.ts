import { Request, Response } from "express";
import { Client } from "../models/Cliente";
import { generateClientNumber } from "../utils/clientNumber";

/**
 * GET /api/clientes/:clientNumber
 * Buscar cliente por número
 */
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

/**
 * POST /api/clientes
 * Registrar nuevo cliente
 */
export const registerClient = async (req: Request, res: Response) => {
  try {
    // 👇 LOG CLAVE PARA DEPURAR
    console.log("BODY RECIBIDO:", req.body);

    const { nombre, correo } = req.body;

    // Validación básica
    if (!nombre || !correo) {
      return res.status(400).json({
        message: "Nombre y correo son obligatorios",
      });
    }

    // Verificar si el correo ya existe
    const existingClient = await Client.findOne({ correo });
    if (existingClient) {
      return res.status(409).json({
        message: "El correo ya está registrado",
      });
    }

    // Generar número de cliente único
    const clientNumber = generateClientNumber();

    // Crear cliente
    const newClient = new Client({
      clientNumber,
      nombre,
      correo,
    });

    await newClient.save();

    return res.status(201).json({
      message: "Cliente registrado correctamente",
      client: newClient,
    });
  } catch (error) {
    console.error("Error registrando cliente:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};
