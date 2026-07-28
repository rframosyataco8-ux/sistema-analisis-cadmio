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
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPending();
  }

  Future<void> _loadPending() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response = await _api.dio.get('/samples/pending');
      setState(() {
        _samples = response.data is List ? response.data : [];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _loading = false;
        _error = 'Error al cargar muestras. Verifica tu conexión.';
      });
    }
  }

  Future<void> _updateCadmium(String id, double value, String? notes) async {
    try {
      await _api.dio.patch('/samples/$id/cadmium', data: {
        'cadmium': value,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Cadmio guardado correctamente'),
            backgroundColor: Color(0xFF16A34A),
          ),
        );
        _loadPending();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error al guardar. Intenta de nuevo.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  void _showCadmiumDialog(Map sample) {
    final cadmiumController = TextEditingController();
    final notesController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 24,
            right: 24,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[600],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Lote: ${sample['loteCode']}',
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                sample['productType']?['name'] ?? 'Sin producto',
                style: TextStyle(color: Colors.grey[400]),
              ),
              if (sample['origins'] != null && (sample['origins'] as List).isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  'Orígenes: ${(sample['origins'] as List).map((o) => o['zone']?['name'] ?? '').join(', ')}',
                  style: TextStyle(color: Colors.grey[500], fontSize: 13),
                ),
              ],
              const SizedBox(height: 24),
              TextField(
                controller: cadmiumController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                autofocus: true,
                decoration: const InputDecoration(
                  labelText: 'Valor de Cadmio (ppm) *',
                  hintText: 'Ej: 0.85',
                  prefixIcon: Icon(Icons.science),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: notesController,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'Observaciones (opcional)',
                  prefixIcon: Icon(Icons.notes),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 48),
                        side: const BorderSide(color: Colors.grey),
                      ),
                      child: const Text('Cancelar'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        final value = double.tryParse(cadmiumController.text.replaceAll(',', '.'));
                        if (value == null || value < 0) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Ingresa un valor válido de Cadmio')),
                          );
                          return;
                        }
                        Navigator.pop(ctx);
                        _updateCadmium(sample['id'], value, notesController.text);
                      },
                      child: const Text('Guardar'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Muestras pendientes'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadPending,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthProvider>().logout(),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF16A34A)))
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!, style: const TextStyle(color: Colors.redAccent)),
                      const SizedBox(height: 16),
                      ElevatedButton(onPressed: _loadPending, child: const Text('Reintentar')),
                    ],
                  ),
                )
              : _samples.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.check_circle_outline, size: 64, color: Colors.green[400]),
                          const SizedBox(height: 16),
                          const Text('No hay muestras pendientes', style: TextStyle(fontSize: 16)),
                          const SizedBox(height: 8),
                          Text('Todas las muestras están analizadas', style: TextStyle(color: Colors.grey[500])),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      color: const Color(0xFF16A34A),
                      onRefresh: _loadPending,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: _samples.length,
                        itemBuilder: (context, index) {
                          final s = _samples[index];
                          return Card(
                            color: const Color(0xFF1F2937),
                            margin: const EdgeInsets.only(bottom: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              title: Text(
                                'Lote: ${s['loteCode']}',
                                style: const TextStyle(fontWeight: FontWeight.w600),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 4),
                                  Text(s['productType']?['name'] ?? 'Sin producto'),
                                  if (s['weight'] != null)
                                    Text('Peso: ${s['weight']} gr', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                                ],
                              ),
                              trailing: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF16A34A).withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: const Text(
                                  'Ingresar',
                                  style: TextStyle(color: Color(0xFF16A34A), fontWeight: FontWeight.w600, fontSize: 13),
                                ),
                              ),
                              onTap: () => _showCadmiumDialog(s),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
