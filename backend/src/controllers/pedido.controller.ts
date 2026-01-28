import { Request, Response } from "express";
import Pedido from "../models/Pedido";

/* ===============================
   CREAR PEDIDO
================================ */
export const createPedido = async (req: Request, res: Response) => {
  try {
    const { clientNumber, items, total } = req.body;

    // 🔎 Validaciones básicas
    if (!clientNumber) {
      return res.status(400).json({
        message: "clientNumber es obligatorio",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "El pedido debe tener al menos un producto",
      });
    }

    // ✅ Normalizar items (CLAVE)
    const normalizedItems = items.map((item: any) => {
      if (
        !item.producto ||
        item.cantidad === undefined ||
        item.precio === undefined
      ) {
        throw new Error("Item inválido");
      }

      return {
        producto: String(item.producto),
        cantidad: Number(item.cantidad),
        precio: Number(item.precio),
      };
    });

    const pedido = new Pedido({
      clientNumber: String(clientNumber),
      items: normalizedItems,
      total: Number(total),
      status: "pendiente",
    });

    const savedPedido = await pedido.save();
    return res.status(201).json(savedPedido);
  } catch (error) {
    console.error("ERROR CREATE PEDIDO:", error);
    return res.status(500).json({
      message: "Error al crear pedido",
    });
  }
};

/* ===============================
   OBTENER PEDIDOS
   (?status=pendiente)
================================ */
export const getPedidos = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const filter: any = {};
    if (status) {
      filter.status = status;
      // Si filtras por status, basta con orden por fecha
      const pedidos = await Pedido.find(filter).sort({ createdAt: -1 });
      return res.json(pedidos);
    }

    // Si NO filtras, regresamos TODOS y ordenamos:
    // 1) pendientes primero
    // 2) atendidos al final
    // 3) dentro de cada grupo, más recientes primero
    const pedidos = await Pedido.find({}).sort({ createdAt: -1 });

    const ordenStatus: Record<string, number> = {
      pendiente: 0,
      atendido: 1,
    };

    pedidos.sort((a: any, b: any) => {
      const ao = ordenStatus[a.status] ?? 99;
      const bo = ordenStatus[b.status] ?? 99;
      if (ao !== bo) return ao - bo;

      const ad = new Date(a.createdAt).getTime();
      const bd = new Date(b.createdAt).getTime();
      return bd - ad;
    });

    return res.json(pedidos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al obtener pedidos",
    });
  }
};

/* ===============================
   ACTUALIZAR STATUS
================================ */
export const updatePedidoStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pedido = await Pedido.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!pedido) {
      return res.status(404).json({
        message: "Pedido no encontrado",
      });
    }

    return res.json(pedido);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al actualizar estado",
    });
  }
};
