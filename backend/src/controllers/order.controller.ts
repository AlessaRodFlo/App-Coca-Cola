import { Request, Response } from "express";
import Order from "../models/order.model";

/**
 * POST /api/pedidos
 * Crear un nuevo pedido
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, total, client } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "El pedido debe tener al menos un producto",
      });
    }

    if (!client) {
      return res.status(400).json({
        message: "El pedido debe tener un cliente",
      });
    }

    const order = new Order({
      items,
      total,
      client, // 🔑 SE GUARDA EL CLIENTE
      status: "pendiente", // 🔑 estado inicial
    });

    const savedOrder = await order.save();

    // 🔥 devolvemos el pedido ya poblado
    const populatedOrder = await Order.findById(savedOrder._id).populate(
      "client",
    );

    return res.status(201).json(populatedOrder);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al crear el pedido",
    });
  }
};

/**
 * GET /api/pedidos
 * Listar pedidos (opcionalmente filtrados por status)
 * Ejemplo: /api/pedidos?status=pendiente
 */
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("client") // 🔥 CLAVE
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al obtener pedidos",
    });
  }
};

/**
 * GET /api/pedidos/:id
 * Obtener pedido por ID
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate("client"); // 🔥 CLAVE

    if (!order) {
      return res.status(404).json({
        message: "Pedido no encontrado",
      });
    }

    return res.json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al obtener el pedido",
    });
  }
};
