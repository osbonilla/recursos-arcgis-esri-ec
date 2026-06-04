# 🗺️ Recursos Esri EC

Recursos técnicos ArcGIS para el equipo de Esri Ecuador.

Nació de la necesidad de organizar los cientos de links, demos y documentación que el equipo comparte en chats grupales — y convertirlos en algo útil, buscable y accesible para todos.

---

## ¿Qué es?

Una aplicación web estática que permite al equipo técnico de Esri EC **descubrir, compartir y organizar recursos de la plataforma ArcGIS** en un solo lugar.

Cualquier persona del equipo puede:
- 🔍 Buscar recursos por título, tipo o aplicación
- 🏷️ Filtrar por producto ArcGIS (Pro, Field Maps, Survey123, etc.)
- ➕ Agregar nuevos recursos con su cuenta de ArcGIS Online
- 🔗 Acceder directamente a demos, tutoriales, apps y documentación

---

## Stack

- HTML5 + CSS3 + JavaScript vanilla — sin frameworks
- ArcGIS Online como backend (Feature Layer + OAuth 2.0)
- Desplegado en GitHub Pages

---

## Estructura

```
recursos-arcgis-esri-ec/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── config.js
│   ├── auth.js
│   ├── api.js
│   └── app.js
└── README.md
```

---

Desarrollado por [@osbonilla](https://github.com/osbonilla) para el equipo técnico de Esri Ecuador.