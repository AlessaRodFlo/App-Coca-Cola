import "package:flutter/material.dart";

class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  const AppHeader({super.key, required this.title});

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(title),
      actions: [
        TextButton(
          onPressed: () => Navigator.pushNamed(context, "/take-order"),
          child:
              const Text("Tomar pedido", style: TextStyle(color: Colors.white)),
        ),
        TextButton(
          onPressed: () => Navigator.pushNamed(context, "/status"),
          child: const Text("Status", style: TextStyle(color: Colors.white)),
        ),
        TextButton(
          onPressed: () =>
              Navigator.pushNamedAndRemoveUntil(context, "/", (_) => false),
          child: const Text("Salir", style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }
}
