import Pedido from "../models/Pedido";

/* ===============================
   GENERAR TICKET EN TEXTO
================================ */
export const generateTicketText = async (pedidoId: string): Promise<string> => {
  const pedido = await Pedido.findById(pedidoId).populate("client");

  if (!pedido) throw new Error("Pedido no encontrado");

  const client = (pedido.client as any) || null;

  let ticket = "";
  ticket += "PREVENTA COCA-COLA\n";
  ticket += "========================\n";
  ticket += `Cliente: ${client?.nombre ?? "(sin registrar)"}\n`;
  ticket += `Correo: ${client?.correo ?? "(sin correo)"}\n`;
  ticket += `Pedido ID: ${pedido._id}\n`;
  ticket += `Fecha de creación: ${pedido.createdAt.toLocaleString()}\n`;
  ticket += `Última actualización: ${pedido.updatedAt.toLocaleString()}\n`;
  ticket += "------------------------\n";

  pedido.items.forEach((item: any) => {
    const subtotal = item.cantidad * item.precio;
    ticket += `${item.producto} x${item.cantidad}  $${subtotal}\n`;
  });

  ticket += "------------------------\n";
  ticket += `TOTAL: $${pedido.total}\n`;
  ticket += `ESTADO: ${pedido.status}\n`;
  ticket += "========================\n";

  return ticket;
};

/* ===============================
   GENERAR TICKET EN HTML
================================ */
export const generateTicketHTML = async (pedidoId: string): Promise<string> => {
  const pedido = await Pedido.findById(pedidoId).populate("client");

  if (!pedido) throw new Error("Pedido no encontrado");

  const client = (pedido.client as any) || null;

  const rows = pedido.items
    .map(
      (item: any) => `
      <tr>
        <td>${item.producto}</td>
        <td>${item.cantidad}</td>
        <td>$${item.precio}</td>
        <td>$${item.cantidad * item.precio}</td>
      </tr>
    `,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Ticket Coca-Cola</h2>
      <p><strong>Cliente:</strong> ${client?.nombre ?? "(sin registrar)"}</p>
      <p><strong>Correo:</strong> ${client?.correo ?? "(sin correo)"}</p>
      <p><strong>Pedido ID:</strong> ${pedido._id}</p>
      <p><strong>Fecha de creación:</strong> ${pedido.createdAt.toLocaleString()}</p>
      <p><strong>Última actualización:</strong> ${pedido.updatedAt.toLocaleString()}</p>

      <table border="1" cellpadding="8" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <h3>Total: $${pedido.total}</h3>
      <p><strong>Estado:</strong> ${pedido.status}</p>

      <hr />
      <p style="font-size: 12px; color: gray;">
        Gracias por su compra. Coca-Cola.
      </p>
    </div>
  `;
};
