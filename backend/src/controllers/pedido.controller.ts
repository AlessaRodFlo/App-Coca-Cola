import { Request, Response } from "express";
import Pedido from "../models/Pedido";
import { Client } from "../models/Cliente";
import { generateTicketHTML } from "../services/ticket.service";
import { sendEmail } from "../services/email.service";

/* ===============================
   CREAR PEDIDO
================================ */
export const createPedido = async (req: Request, res: Response) => {
  try {
    const { clientNumber, items, total } = req.body;

    /* ===============================
       VALIDACIONES BÁSICAS
    ================================ */
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

    /* ===============================
       NORMALIZAR ITEMS
    ================================ */
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

    /* ===============================
       BUSCAR CLIENTE
    ================================ */
    const client = await Client.findOne({
      clientNumber: String(clientNumber),
    });

    if (!client) {
      return res.status(404).json({
        message:
          "Cliente no encontrado. Registra el cliente antes de hacer pedidos.",
      });
    }

    // ✅ Regla: si está inactivo, no puede hacer pedidos
    if (client.activo === false) {
      return res.status(403).json({
        message:
          "Cliente inactivo. No se pueden realizar pedidos hasta activarlo en Admin.",
      });
    }

    /* ===============================
       CREAR PEDIDO
    ================================ */
    const pedido = new Pedido({
      clientNumber: String(clientNumber),
      client: client ? client._id : undefined,
      items: normalizedItems,
      total: Number(total),
      status: "pendiente",
    });

    const savedPedido = await pedido.save();

    /* ===============================
       ENVÍO DE CORREO
    ================================ */
    let emailSent = false;
    let emailError: string | null = null;

    if (client?.correo) {
      try {
        const html = await generateTicketHTML(String(savedPedido._id));

        await sendEmail({
          to: client.correo,
          subject: `Ticket de tu pedido (${savedPedido._id})`,
          html,
        });

        emailSent = true;
        console.log(`Ticket enviado a: ${client.correo}`);
      } catch (err: any) {
        emailSent = false;
        emailError = err?.message || "Error desconocido enviando correo";
        console.error("Error enviando correo:", err);
      }
    } else {
      emailError = "Cliente sin correo o cliente no encontrado";
    }

    /* ===============================
       RESPUESTA FINAL
    ================================ */
    return res.status(201).json({
      ...savedPedido.toObject(),
      emailSent,
      emailError,
    });
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
      const pedidos = await Pedido.find(filter).sort({
        createdAt: -1,
      });
      return res.json(pedidos);
    }

    const pedidos = await Pedido.find({}).sort({
      createdAt: -1,
    });

    const ordenStatus: Record<string, number> = {
      pendiente: 0,
      en_ruta: 1,
      atendido: 2,
    };

    pedidos.sort((a: any, b: any) => {
      const ao = ordenStatus[a.status] ?? 99;
      const bo = ordenStatus[b.status] ?? 99;
      return ao - bo;
    });

    return res.json(pedidos);
  } catch (error) {
    console.error("ERROR GET PEDIDOS:", error);
    return res.status(500).json({
      message: "Error al obtener pedidos",
    });
  }
};

/* ===============================
   MODIFICAR PEDIDO (ITEMS / TOTAL)
   PATCH /api/pedidos/:id
================================ */
export const updatePedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { items, total } = req.body;

    const pedido = await Pedido.findById(id);

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Si vienen items, normalizarlos y validarlos
    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          message: "El pedido debe tener al menos un producto",
        });
      }

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

      pedido.items = normalizedItems as any;
    }

    // Si viene total, actualizarlo
    if (total !== undefined) {
      pedido.total = Number(total);
    } else if (items !== undefined) {
      // Recalcular total si se editaron items y no se mandó total
      const t = (pedido.items as any[]).reduce(
        (acc, it) => acc + Number(it.cantidad) * Number(it.precio),
        0,
      );
      pedido.total = Number(t);
    }

    const saved = await pedido.save();

    /* ===============================
       ✅ ENVIAR TICKET ACTUALIZADO POR CORREO
       Regla: cualquier modificación del pedido (items/total) dispara un correo con el ticket actualizado
    ================================ */
    let emailSent = false;
    let emailError: string | null = null;

    try {
      // Obtener email del cliente por referencia o por clientNumber
      let clientEmail: string | null = null;

      if (saved.client) {
        const c = await Client.findById(saved.client);
        if (c?.correo) clientEmail = c.correo;
      }

      if (!clientEmail) {
        const c2 = await Client.findOne({ clientNumber: saved.clientNumber });
        if (c2?.correo) clientEmail = c2.correo;
      }

      if (clientEmail) {
        const ticketHtml = await generateTicketHTML(String(saved._id));

        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.4;">
            <h2 style="margin: 0 0 12px;">Tu pedido fue modificado</h2>
            <p style="margin: 0 0 8px;">Pedido: <b>${saved._id}</b></p>
            <p style="margin: 0 0 16px;">
              Te compartimos el ticket actualizado con los cambios realizados.
            </p>
            ${ticketHtml}
          </div>
        `;

        await sendEmail({
          to: clientEmail,
          subject: `Ticket actualizado de tu pedido (${saved._id})`,
          html,
        });

        emailSent = true;
      } else {
        emailError = "Cliente sin correo";
      }
    } catch (err: any) {
      emailSent = false;
      emailError = err?.message || "Error desconocido enviando correo";
      console.error("Error enviando ticket actualizado:", err);
    }

    return res.json({
      ...saved.toObject(),
      emailSent,
      emailError,
    });
  } catch (error: any) {
    console.error("ERROR UPDATE PEDIDO:", error);
    return res.status(500).json({
      message: "Error al modificar pedido",
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

    const allowedStatus = ["pendiente", "en_ruta", "atendido"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Estado no válido",
      });
    }

    // Buscar pedido existente
    const pedido = await Pedido.findById(id);

    if (!pedido) {
      return res.status(404).json({
        message: "Pedido no encontrado",
      });
    }

    // Actualizar status
    pedido.status = status;
    const saved = await pedido.save();

    /* ===============================
       ✅ ENVIAR TICKET ACTUALIZADO POR CORREO
       Regla: cualquier cambio de status también es una modificación del pedido
    ================================ */
    let emailSent = false;
    let emailError: string | null = null;

    try {
      // Obtener correo del cliente por referencia o por clientNumber
      let clientEmail: string | null = null;

      if (saved.client) {
        const c = await Client.findById(saved.client);
        if (c?.correo) clientEmail = c.correo;
      }

      if (!clientEmail) {
        const c2 = await Client.findOne({ clientNumber: saved.clientNumber });
        if (c2?.correo) clientEmail = c2.correo;
      }

      if (clientEmail) {
        const subject =
          status === "en_ruta"
            ? "Tu pedido está en ruta (ticket actualizado)"
            : status === "atendido"
              ? "Tu pedido ha sido atendido (ticket actualizado)"
              : "Tu pedido fue actualizado (ticket actualizado)";

        const ticketHtml = await generateTicketHTML(String(saved._id));

        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.4;">
            <h2 style="margin: 0 0 12px;">${subject}</h2>
            <p style="margin: 0 0 8px;">Pedido: <b>${saved._id}</b></p>
            <p style="margin: 0 0 16px;">
              El estado de tu pedido cambió a: <b>${status}</b>. Te compartimos el ticket actualizado.
            </p>
            ${ticketHtml}
          </div>
        `;

        await sendEmail({
          to: clientEmail,
          subject,
          html,
        });

        emailSent = true;
      } else {
        emailError = "Cliente sin correo";
      }
    } catch (err: any) {
      emailSent = false;
      emailError = err?.message || "Error desconocido enviando correo";
      console.error("Error enviando correo por cambio de status:", err);
      // No bloqueamos la respuesta por fallo de email
    }

    return res.json({
      ...saved.toObject(),
      emailSent,
      emailError,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al actualizar estado",
    });
  }
};

/* ===============================
   ELIMINAR PEDIDO
================================ */
export const deletePedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await Pedido.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Pedido no encontrado",
      });
    }

    return res.json({
      message: "Pedido eliminado",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al eliminar pedido",
    });
  }
};
