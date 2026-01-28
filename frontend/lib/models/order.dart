class Order {
  final String id;
  final String clientId;
  final List<String> products;
  final double total;
  final DateTime date;

  Order({
    required this.id,
    required this.clientId,
    required this.products,
    required this.total,
    required this.date,
  });

  // JSON → Order
  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['_id'] ?? json['id'],
      clientId: json['clientId'],
      products: List<String>.from(json['products']),
      total: (json['total'] as num).toDouble(),
      date: DateTime.parse(json['date']),
    );
  }

  // Order → JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'clientId': clientId,
      'products': products,
      'total': total,
      'date': date.toIso8601String(),
    };
  }
}
