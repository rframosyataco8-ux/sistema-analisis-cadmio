# Modelo de Datos (Actualizado)

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
- code (corto, único: TORTA, TROZADA, GRANO, POLVO, etc.)
- name (Torta de cacao, Grano de cacao, Cacao en polvo, etc.)
- description
- has_pesticides (boolean) — indica si el producto maneja plaguicidas
- created_at

### zones
- id
- name (Ayacucho, Jaén, Tarapoto, Neshuya, etc.)
- region

### samples
- id (uuid)
- lote_code
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
- observation_cadmium
- created_at / updated_at

### sample_origins (many-to-many)
- sample_id
- zone_id

### pesticides
- id
- sample_id
- name (Chlorpyrifos, 2,4-D, Cypermethrin, Fipronil, DEET, Azoxystrobin…)
- value (Decimal)
- unit (default: mg/kg)

### audit_logs
- id
- user_id
- action
- entity
- entity_id
- old_values (jsonb)
- new_values (jsonb)
- created_at

## Productos del Excel (cada hoja)

| Producto | Código | Plaguicidas |
|----------|--------|-------------|
| Torta de cacao | TORTA | Sí |
| Torta trozada estándar | TROZADA | Sí |
| Torta de cacao alcalino | TORTA_ALC | No |
| Grano de cacao | GRANO | No |
| Grano de cacao orgánico | GRANO_ORG | No |
| Cacao alcalino | ALC | No |
| Cacao en polvo | POLVO | No |
