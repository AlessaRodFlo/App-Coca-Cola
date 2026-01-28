import "package:flutter/material.dart";
import "../services/clients_api.dart";

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _clientNumber = TextEditingController();
  bool loading = false;

  Future<void> _goTakeOrder() async {
    setState(() => loading = true);

    try {
      final response = await ClientsApi.getClient(_clientNumber.text.trim());

      if (!mounted) return;

      // ❌ Cliente no encontrado
      if (response == null || response["exists"] != true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Cliente no encontrado. Regístralo."),
          ),
        );
        return;
      }

      // ✅ Cliente encontrado
      final client = response["client"];

      Navigator.pushNamed(
        context,
        "/take-order",
        arguments: {
          "clientNumber": client["clientNumber"],
          "clientName": client["nombre"],
          "clientEmail": client["correo"],
        },
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Error al buscar cliente")),
      );
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  void _goRegister() {
    Navigator.pushNamed(context, "/register");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Login cliente")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _clientNumber,
              decoration: const InputDecoration(labelText: "Número de cliente"),
            ),
            const SizedBox(height: 16),

            /// BOTÓN ENTRAR
            ElevatedButton(
              onPressed: loading ? null : _goTakeOrder,
              child: Text(loading ? "Buscando..." : "Entrar"),
            ),

            const SizedBox(height: 12),

            /// BOTÓN REGISTRAR CLIENTE 👇
            OutlinedButton(
              onPressed: _goRegister,
              child: const Text("Registrar nuevo cliente"),
            ),
          ],
        ),
      ),
    );
  }
}
