import "dart:convert";
import "package:http/http.dart" as http;
import "../config/api.dart";
import "package:flutter/foundation.dart";

class ClientsApi {
  /// Registrar nuevo cliente
  static Future<Map<String, dynamic>?> registerClient(
    String nombre,
    String correo,
  ) async {
    final url = Uri.parse("${ApiConfig.baseUrl}/clientes");

    final response = await http.post(
      url,
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "nombre": nombre,
        "correo": correo,
      }),
    );

    // 🔥 LOGS SOLO PARA DESARROLLO
    debugPrint("STATUS CODE: ${response.statusCode}");
    debugPrint("RESPONSE BODY: ${response.body}");

    // ✅ Si es éxito, regresamos el JSON COMPLETO
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    }

    return null;
  }

  /// Buscar cliente por número
  static Future<Map<String, dynamic>?> getClient(String clientNumber) async {
    final url = Uri.parse("${ApiConfig.baseUrl}/clientes/$clientNumber");

    final response = await http.get(url);

    debugPrint("GET STATUS: ${response.statusCode}");
    debugPrint("GET BODY: ${response.body}");

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }

    return null;
  }
}
