# App Móvil - Sistema Inteligente de Análisis de Cadmio

## Tecnologías
- Flutter 3.22+
- Dart
- Provider / Riverpod (estado)
- Dio (HTTP)
- Socket.io-client (tiempo real)

## Estructura (se completará en Fase 3 y 4)

```
mobile/
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   ├── network/
│   │   ├── theme/
│   │   └── utils/
│   ├── features/
│   │   ├── auth/
│   │   ├── samples/
│   │   └── home/
│   ├── shared/
│   └── main.dart
├── android/
├── ios/
└── pubspec.yaml
```

## Objetivo de la app
Solo permite a los analistas de Lima:
- Ver muestras pendientes de análisis
- Ingresar el valor de Cadmio
- Marcar la muestra como "Analizado"
