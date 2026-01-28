import 'package:flutter/material.dart';
import '../models/client.dart';
import '../models/order.dart';

class AppController extends ChangeNotifier {
  Client? currentClient;
  Order? currentOrder;

  // =========================
  // CLIENTES
  // =========================

  void setClient(Client client) {
    currentClient = client;
    notifyListeners();
  }

  void clearClient() {
    currentClient = null;
    notifyListeners();
  }

  // =========================
  // PEDIDOS
  // =========================

  void createOrder({
    required List<String> products,
    required double total,
  }) {
    if (currentClient == null) return;

    currentOrder = Order(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      clientId: currentClient!.id,
      products: products,
      total: total,
      date: DateTime.now(),
    );

    notifyListeners();
  }

  void clearOrder() {
    currentOrder = null;
    notifyListeners();
  }
}
