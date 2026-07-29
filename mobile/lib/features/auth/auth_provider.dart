import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/network/api_client.dart';

class AuthProvider extends ChangeNotifier {
  bool isAuthenticated = false;
  bool isLoading = true;
  Map<String, dynamic>? user;
  final _api = ApiClient();

  AuthProvider() {
    _loadSession();
  }

  Future<void> _loadSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('accessToken');
      final userJson = prefs.getString('user');
      if (token != null && userJson != null) {
        isAuthenticated = true;
        user = jsonDecode(userJson) as Map<String, dynamic>;
      }
    } catch (_) {
      isAuthenticated = false;
      user = null;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<String?> login(String email, String password) async {
    try {
      final response = await _api.dio.post('/auth/login', data: {
        'email': email.trim(),
        'password': password,
      });

      final data = response.data as Map<String, dynamic>;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('accessToken', data['accessToken'] as String);
      await prefs.setString('user', jsonEncode(data['user']));

      isAuthenticated = true;
      user = data['user'] as Map<String, dynamic>;
      notifyListeners();
      return null;
    } catch (e) {
      return 'Credenciales inválidas o sin conexión al servidor';
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
