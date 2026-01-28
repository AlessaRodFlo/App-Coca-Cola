class ApiConfig {
  // Cambia a false si quieres usar el backend local
  static const bool isProd = true;

  // Backend en Render (producción)
  static const String _prod = "https://app-coca-cola.onrender.com/api";

  // Backend local (desarrollo)
  // Si corres en Chrome (web): localhost sirve
  static const String _localWeb = "http://localhost:3000/api";

  // Si corres en Android Emulator: localhost del host = 10.0.2.2
  //static const String _localAndroid = "http://10.0.2.2:3000/api";

  // URL final
  static const String baseUrl = isProd ? _prod : _localWeb;
  // Si vas a probar en Android Emulator, cambia _localWeb por _localAndroid
}
