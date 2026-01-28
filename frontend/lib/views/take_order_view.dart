import "package:flutter/material.dart";
import "../models/product.dart";
import "../services/orders_api.dart";
import "../widgets/app_header.dart";

class TakeOrderView extends StatefulWidget {
  const TakeOrderView({super.key});

  @override
  State<TakeOrderView> createState() => _TakeOrderViewState();
}

class _TakeOrderViewState extends State<TakeOrderView> {
  final Map<String, int> qty = {};
  bool loading = false;

  @override
  void initState() {
    super.initState();
    for (final p in products) {
      qty[p.id] = 0;
    }
  }

  double get total {
    double t = 0;
    for (final p in products) {
      final q = qty[p.id] ?? 0;
      t += p.price * q;
    }
    return t;
  }

  Future<void> _generateTicket(Map args) async {
    setState(() => loading = true);

    try {
      // ✅ construir items EXACTOS para el backend (Mongo)
      final items = products
          .where((p) => (qty[p.id] ?? 0) > 0)
          .map((p) => {
                "producto": p.name,
                "cantidad": qty[p.id],
                "precio": p.price,
              })
          .toList();

      if (items.isEmpty) {
        throw Exception("Sin productos");
      }

      // ✅ calcular total (CORREGIDO)
      final total = items.fold<num>(
        0,
        (sum, item) =>
            sum + (item["cantidad"] as num) * (item["precio"] as num),
      );

      // ✅ llamada correcta al API
      final resp = await OrdersApi.createOrder(
        clientNumber: args["clientNumber"],
        items: items,
        total: total,
      );

      if (!mounted) return;

      Navigator.pushNamed(
        context,
        "/ticket",
        arguments: {
          "pedido": resp,
        },
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Error al generar pedido: $e"),
        ),
      );
    } finally {
      if (mounted) {
        setState(() => loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final args = (ModalRoute.of(context)?.settings.arguments ?? {}) as Map;

    return Scaffold(
      appBar: const AppHeader(title: "Tomar pedido"),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Cliente: ${args["clientName"] ?? ""} (${args["clientNumber"]})",
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: ListView.builder(
                itemCount: products.length,
                itemBuilder: (_, i) {
                  final p = products[i];
                  return Card(
                    child: ListTile(
                      title: Text(
                        "${p.name} - \$${p.price.toStringAsFixed(2)}",
                      ),
                      trailing: SizedBox(
                        width: 120,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove),
                              onPressed: () => setState(() {
                                qty[p.id] =
                                    (qty[p.id]! > 0) ? qty[p.id]! - 1 : 0;
                              }),
                            ),
                            Text("${qty[p.id]}"),
                            IconButton(
                              icon: const Icon(Icons.add),
                              onPressed: () => setState(() {
                                qty[p.id] = qty[p.id]! + 1;
                              }),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            Text(
              "Total: \$${total.toStringAsFixed(2)}",
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: loading ? null : () => _generateTicket(args),
                child: Text(
                  loading ? "Generando..." : "Confirmar pedido",
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
