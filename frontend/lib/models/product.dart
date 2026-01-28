class Product {
  final String id;
  final String name;
  final double price;

  Product({required this.id, required this.name, required this.price});
}

final products = <Product>[
  Product(id: "p1", name: "Coca-Cola 600ml", price: 18),
  Product(id: "p2", name: "Coca-Cola 2L", price: 35),
  Product(id: "p3", name: "Fanta 600ml", price: 18),
  Product(id: "p4", name: "Sprite 600ml", price: 18),
  Product(id: "p5", name: "Del Valle 600ml", price: 20),
  Product(id: "p6", name: "Mundet 600ml", price: 18),
  Product(id: "p7", name: "Ciel 1L", price: 15),
  Product(id: "p8", name: "Powerade", price: 25),
  Product(id: "p9", name: "Coca-Cola Light 600ml", price: 18),
  Product(id: "p10", name: "Sidral 2L", price: 30),
];
