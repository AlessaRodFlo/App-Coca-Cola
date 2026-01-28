class Client {
  final String id;
  final String name;
  final String email;

  Client({
    required this.id,
    required this.name,
    required this.email,
  });

  // Convertir JSON → Client
  factory Client.fromJson(Map<String, dynamic> json) {
    return Client(
      id: json['_id'] ?? json['id'],
      name: json['name'],
      email: json['email'],
    );
  }

  // Convertir Client → JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
    };
  }
}
