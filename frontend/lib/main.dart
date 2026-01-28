import "package:flutter/material.dart";
import "views/login_view.dart";
import "views/register_view.dart";
import "views/take_order_view.dart";
import "views/ticket_view.dart";
import "views/status_view.dart";

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Preventas",
      debugShowCheckedModeBanner: false,
      initialRoute: "/",
      routes: {
        "/": (_) => const LoginView(),
        "/register": (_) => const RegisterView(),
        "/take-order": (_) => const TakeOrderView(),
        "/ticket": (_) => const TicketView(),
        "/status": (_) => const StatusView(),
      },
    );
  }
}
