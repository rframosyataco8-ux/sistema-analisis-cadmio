import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/auth_provider.dart';
import 'features/auth/login_page.dart';
import 'features/samples/samples_page.dart';

void main() {
  runApp(const CadmioApp());
}

class CadmioApp extends StatelessWidget {
  const CadmioApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: MaterialApp(
        title: 'Análisis de Cadmio',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.dark,
        home: Consumer<AuthProvider>(
          builder: (context, auth, _) {
            if (auth.isAuthenticated) {
              return const SamplesPage();
            }
            return const LoginPage();
          },
        ),
      ),
    );
  }
}
