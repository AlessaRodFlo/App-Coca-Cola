import "package:flutter/material.dart";
import "../widgets/app_header.dart";

/// ✅ Formatear fecha ISO a formato legible
String formatFecha(String isoDate) {
  final date = DateTime.parse(isoDate).toLocal();
  return "${date.day.toString().padLeft(2, '0')}/"
      "${date.month.toString().padLeft(2, '0')}/"
      "${date.year} "
      "${date.hour.toString().padLeft(2, '0')}:"
      "${date.minute.toString().padLeft(2, '0')}";
}

class TicketView extends StatelessWidget {
  const TicketView({super.key});

  @override
  Widget build(BuildContext context) {
    final args = (ModalRoute.of(context)?.settings.arguments ?? {}) as Map;

    final pedido = args["pedido"] as Map<String, dynamic>;
    final items = pedido["items"] as List<dynamic>;

    return Scaffold(
      appBar: const AppHeader(title: "Ticket"),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // HEADER
            const Text(
              "Pedido generado correctamente",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),

            // ❌ ID eliminado
            Text("Estado: ${pedido["status"]}"),
            Text(
              "Fecha: ${formatFecha(pedido["createdAt"])}",
            ),

            const Divider(height: 30),

            // PRODUCTOS
            const Text(
              "Productos",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),

            Expanded(
              child: ListView.builder(
                itemCount: items.length,
                itemBuilder: (_, i) {
                  final item = items[i];
                  final subtotal = item["cantidad"] * item["precio"];

                  return ListTile(
                    title: Text(item["producto"]),
                    subtitle: Text(
                      "${item["cantidad"]} × \$${item["precio"]}",
                    ),
                    trailing: Text(
                      "\$$subtotal",
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  );
                },
              ),
            ),

            const Divider(),

            // TOTAL
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "TOTAL",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  "\$${pedido["total"]}",
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // ❌ Botón inferior SALIR eliminado
          ],
        ),
      ),
    );
  }
}
