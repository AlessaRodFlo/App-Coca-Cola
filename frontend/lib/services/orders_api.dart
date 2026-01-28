import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api.dart';

class OrdersApi {
  /* ===============================
     CREAR PEDIDO
  ================================ */
  static Future<Map<String, dynamic>> createOrder({
    required String clientNumber,
    required List<Map<String, dynamic>> items,
    required num total,
  }) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/pedidos');

    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        "clientNumber": clientNumber,
        "items": items,
        "total": total,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      // 👇 AQUÍ ESTABA EL PROBLEMA: ahora verás el error real
      throw Exception(
        'Error al crear pedido (${response.statusCode}): ${response.body}',
      );
    }
  }

  static Future<List<dynamic>> getPedidos({String? status}) async {
    const base = '${ApiConfig.baseUrl}/pedidos';
    final url = Uri.parse(status == null ? base : '$base?status=$status');

    final response = await http.get(url);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception(
        'Error al obtener pedidos (${response.statusCode}): ${response.body}',
      );
    }
  }

  /* ===============================
     PEDIDOS PENDIENTES
  ================================ */
  static Future<List<dynamic>> getPedidosPendientes() async {
    final url = Uri.parse('${ApiConfig.baseUrl}/pedidos?status=pendiente');

    final response = await http.get(url);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception(
        'Error al obtener pedidos pendientes (${response.statusCode})',
      );
    }
  }

  /* ===============================
     ACTUALIZAR STATUS
  ================================ */
  static Future<void> updateStatus({
    required String pedidoId,
    required String status,
  }) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/pedidos/$pedidoId');

    final response = await http.put(
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        "status": status,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception(
        'Error al actualizar estado (${response.statusCode}): ${response.body}',
      );
    }
  }
}
