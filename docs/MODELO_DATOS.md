# Modelo de Datos (Fase 1)

## Tablas principales

### users
- id (uuid)
- email (unique)
- password_hash
- full_name
- role (ADMIN | ANALISTA)
- is_active
- created_at / updated_at

### product_types
- id
- name (Torta de cacao, Grano de cacao, Cacao en polvo, etc.)
- description

### zones
- id
- name (Ayacucho, Jaén, Tarapoto, Neshuya, etc.)
- region

### samples
- id (uuid)
- lote_code (Cuartel/Lote)
- product_type_id
- weight
- producer_code
- producer_name
- cadmium (decimal, nullable)
- status (CREATED | SENT_TO_LIMA | PENDING_ANALYSIS | ANALYZED | VALIDATED)
- sent_date
- analyzed_at
- analyzed_by (user_id)
- created_by (user_id)
- notes
- created_at / updated_at

### sample_origins (many-to-many)
- sample_id
- zone_id

### pesticides
- id
- sample_id
- name
- value
- unit

### audit_logs
- id
- user_id
- action
- entity
- entity_id
- old_values (jsonb)
- new_values (jsonb)
- created_at
