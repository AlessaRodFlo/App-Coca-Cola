import "package:flutter/material.dart";
import "../services/orders_api.dart";
import "../widgets/app_header.dart";

class StatusView extends StatefulWidget {
  const StatusView({super.key});

  @override
  State<StatusView> createState() => _StatusViewState();
}

class _StatusViewState extends State<StatusView> {
  bool loading = true;
  List<dynamic> orders = [];

  Future<void> load() async {
    if (!mounted) return;

    // 🔥 LIMPIAR SIEMPRE ANTES DE CARGAR
    setState(() {
      loading = true;
      orders = [];
    });

    try {
      final data = await OrdersApi.getPedidos();

      if (!mounted) return;

      setState(() {
        orders = data; // puede ser [] y está perfecto
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error cargando pedidos: $e")),
      );
    } finally {
      if (mounted) {
        setState(() => loading = false);
      }
    }
  }

  Future<void> toggleStatus(dynamic order) async {
    final current = order["status"];
    final next = current == "pendiente" ? "atendido" : "pendiente";

    try {
      await OrdersApi.updateStatus(
        pedidoId: order["_id"].toString(),
        status: next,
      );
      await load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error actualizando status: $e")),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    load();
  }

  /// FUNCIÓN SEGURA PARA OBTENER EL NÚMERO DE CLIENTE
  String getClientNumber(dynamic order) {
    final direct = order["clientNumber"];
    if (direct != null && direct.toString().trim().isNotEmpty) {
      return direct.toString();
    }

    final client = order["client"];
    if (client is Map && client["clientNumber"] != null) {
      return client["clientNumber"].toString();
    }

    return "";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppHeader(title: "Status del pedido"),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : orders.isEmpty
              ? const Center(child: Text("No hay pedidos"))
              : RefreshIndicator(
                  onRefresh: load,
                  child: ListView.builder(
                    itemCount: orders.length,
                    itemBuilder: (_, i) {
                      final o = orders[i];
                      final status = o["status"]?.toString() ?? "pendiente";
                      final total = (o["total"] is num) ? o["total"] as num : 0;
                      final clientNumber = getClientNumber(o);

                      return ListTile(
                        title: Text(
                          clientNumber.isEmpty
                              ? "Cliente"
                              : "Cliente $clientNumber",
                        ),
                        subtitle: Text(
                          "Total: \$${total.toStringAsFixed(2)}",
                        ),
                        trailing: TextButton(
                          onPressed: () => toggleStatus(o),
                          child: Text(
                            status,
                            style: TextStyle(
                              color: status == "pendiente"
                                  ? Colors.orange
                                  : Colors.green,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
