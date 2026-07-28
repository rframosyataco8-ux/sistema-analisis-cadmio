import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../auth/auth_provider.dart';
import '../../core/network/api_client.dart';

class SamplesPage extends StatefulWidget {
  const SamplesPage({super.key});

  @override
  State<SamplesPage> createState() => _SamplesPageState();
}

class _SamplesPageState extends State<SamplesPage> {
  final _api = ApiClient();
  List<dynamic> _samples = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadPending();
  }

  Future<void> _loadPending() async {
    setState(() => _loading = true);
    try {
      final response = await _api.dio.get('/samples/pending');
      setState(() {
        _samples = response.data;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _updateCadmium(String id, double value) async {
    try {
      await _api.dio.patch('/samples/$id/cadmium', data: {'cadmium': value});
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cadmio actualizado correctamente')),
      );
      _loadPending();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error al actualizar')),
      );
    }
  }

  void _showCadmiumDialog(Map sample) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Lote: ${sample['loteCode']}'),
        content: TextField(
          controller: controller,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: const InputDecoration(
            labelText: 'Valor de Cadmio (ppm)',
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () {
              final value = double.tryParse(controller.text);
              if (value != null) {
                Navigator.pop(ctx);
                _updateCadmium(sample['id'], value);
              }
            },
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Muestras pendientes'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthProvider>().logout(),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _samples.isEmpty
              ? const Center(child: Text('No hay muestras pendientes'))
              : RefreshIndicator(
                  onRefresh: _loadPending,
                  child: ListView.builder(
                    itemCount: _samples.length,
                    itemBuilder: (context, index) {
                      final s = _samples[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: ListTile(
                          title: Text('Lote: ${s['loteCode']}'),
                          subtitle: Text(s['productType']?['name'] ?? 'Sin producto'),
                          trailing: const Icon(Icons.edit, color: Color(0xFF16A34A)),
                          onTap: () => _showCadmiumDialog(s),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
