import "package:flutter/material.dart";
import "../services/clients_api.dart";

class RegisterView extends StatefulWidget {
  const RegisterView({super.key});

  @override
  State<RegisterView> createState() => _RegisterViewState();
}

class _RegisterViewState extends State<RegisterView> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  bool loading = false;

  Future<void> _register() async {
    setState(() => loading = true);

    try {
      final response = await ClientsApi.registerClient(
        _name.text.trim(),
        _email.text.trim(),
      );

      if (!mounted) return;

      if (response != null) {
        final client = response["client"];
        final clientNumber = client != null ? client["clientNumber"] : "N/A";

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              "Cliente registrado correctamente\n"
              "Número de cliente: $clientNumber",
            ),
            duration: const Duration(seconds: 10),
          ),
        );

        Navigator.pop(context);
      } else {
        throw Exception("Registro fallido");
      }
    } catch (_) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("El cliente ya está registrado"),
          duration: Duration(seconds: 10),
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
    return Scaffold(
      appBar: AppBar(
        title: const Text("Registro de cliente"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _name,
              decoration: const InputDecoration(labelText: "Nombre"),
            ),
            TextField(
              controller: _email,
              decoration: const InputDecoration(labelText: "Correo"),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: loading ? null : _register,
              child: Text(
                loading ? "Registrando..." : "Registrar",
              ),
            ),
          ],
        ),
      ),
    );
  }
}
