import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/network/api_client.dart';

class AuthProvider extends ChangeNotifier {
  bool isAuthenticated = false;
  Map<String, dynamic>? user;
  final _api = ApiClient();

  AuthProvider() {
    _loadSession();
  }

  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('accessToken');
    if (token != null) {
      isAuthenticated = true;
      final userJson = prefs.getString('user');
      // simple parse omitido por brevedad
      notifyListeners();
    }
  }

  Future<String?> login(String email, String password) async {
    try {
      final response = await _api.dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      final data = response.data;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('accessToken', data['accessToken']);
      await prefs.setString('user', data['user'].toString());

      isAuthenticated = true;
      user = data['user'];
      notifyListeners();
      return null;
    } catch (e) {
      return 'Credenciales inválidas o error de conexión';
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    isAuthenticated = false;
    user = null;
    notifyListeners();
  }
}
