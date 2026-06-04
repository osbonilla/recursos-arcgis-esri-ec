# Recursos Esri EC 🗺️

Hub centralizado de recursos técnicos ArcGIS — backend 100% en ArcGIS Online.

---

## Arquitectura

```
Navegador (HTML/CSS/JS)
    │
    ├── Lee recursos  →  Feature Layer (pública o con token)
    ├── Agrega        →  Feature Layer /addFeatures  (requiere token OAuth)
    └── Login         →  ArcGIS Online OAuth 2.0 (Implicit Grant)
```

Sin backend propio. Sin Google Sheets. Todo vive en ArcGIS Online.

---

## Paso 1 — Crear la Feature Layer en ArcGIS Online

### Opción A: desde una tabla CSV (recomendado, más rápido)

1. En ArcGIS Online → **Contenido → Agregar elemento → Desde su computadora**
2. Sube un CSV con esta estructura (copia y guarda como `recursos.csv`):

```
ID,titulo,url,descripcion,tipo,etiquetas,autor,fecha_creacion
1,Demo Field Maps,https://esri.com,Demo de ejemplo,Demo,field-maps,Equipo Esri EC,2025-01-10
```

3. Activa **"Publicar esta capa como Feature Layer alojada"**
4. Finaliza la publicación

### Opción B: desde cero (sin datos iniciales)

1. **Contenido → Crear → Feature Layer → Crear una capa en blanco**
2. Nombre: `RecursosEsriEC`
3. Tipo de geometría: **Ninguna (tabla)**
4. Agrega los campos en este orden:

| Campo          | Tipo       | Alias           | Longitud |
|----------------|------------|-----------------|----------|
| titulo         | String     | Título          | 500      |
| url            | String     | URL             | 2048     |
| descripcion    | String     | Descripción     | 2000     |
| tipo           | String     | Tipo            | 100      |
| etiquetas      | String     | Etiquetas       | 500      |
| autor          | String     | Autor           | 200      |
| fecha_creacion | Date       | Fecha           | —        |

5. Guarda y publica

---

## Paso 2 — Configurar permisos de la Feature Layer

1. Abre la Feature Layer → **Compartir** → **Todos (público)** para lectura
2. Para que cualquier usuario autenticado de la org pueda escribir:
   - Abre la capa → **Configuración → Edición** → activar **"Permitir edición"**
   - Tipo de edición: **Agregar** (sin editar ni borrar ajeno)

---

## Paso 3 — Registrar la app OAuth

1. En ArcGIS Online → **Contenido → Agregar elemento → Una app**
2. Tipo: **Aplicación**
3. Nombre: `Recursos Esri EC`
4. Registrar → anota el **Client ID**
5. En la app registrada → **Configuración → URI de redireccionamiento**, agrega:
   - `http://localhost:5500/index.html` ← para desarrollo local
   - `https://TU_USUARIO.github.io/esri-recursos/index.html` ← para producción

---

## Paso 4 — Obtener la URL de la Feature Layer

1. En ArcGIS Online, abre la Feature Layer
2. Clic en **Ver elemento completo**
3. Desplaza hacia abajo → **Capas** → clic en el nombre de la capa
4. Copia la URL que termina en `.../FeatureServer/0`

Ejemplo:
```
https://services.arcgis.com/AbCdEf123456/arcgis/rest/services/RecursosEsriEC/FeatureServer/0
```

---

## Paso 5 — Configurar la app

Abre `js/config.js` y edita:

```javascript
CLIENT_ID:         "ABC123xyz",                    // Del paso 3
PORTAL_URL:        "https://esriec.maps.arcgis.com", // URL de tu org (o https://www.arcgis.com)
FEATURE_LAYER_URL: "https://services.arcgis.com/..." // Del paso 4
```

---

## Deploy en GitHub Pages

```bash
git init
git add .
git commit -m "feat: Recursos Esri EC v2 — ArcGIS Online backend"
git remote add origin https://github.com/TU_USUARIO/esri-recursos.git
git push -u origin main
```

En GitHub → **Settings → Pages → Deploy from branch → main / root**

Tu app quedará en: `https://TU_USUARIO.github.io/esri-recursos/`

Asegúrate de agregar esa URL como redirect URI en el paso 3.

---

## Estructura del proyecto

```
recursos-arcgis-esri-ec/
├── index.html        ← Entrada principal
├── css/
│   └── styles.css    ← Estilos
├── js/
│   ├── config.js     
│   ├── auth.js       ← OAuth 2.0 ArcGIS Online
│   ├── api.js        ← Feature Layer REST API
│   └── app.js        ← Lógica de la app
└── README.md
```

---

## Flujo OAuth explicado

```
Usuario → "Iniciar sesión" → Redirige a ArcGIS Online
ArcGIS Online → usuario ingresa credenciales
ArcGIS Online → redirige de vuelta con #access_token=...
App → extrae token del hash → obtiene info del usuario
App → usa token en todas las llamadas a la Feature Layer
```

El token se guarda en `sessionStorage` (se pierde al cerrar el tab, seguro).

---

## Tecnologías

- HTML5 + CSS3 + JavaScript vanilla
- ArcGIS Online Feature Layer REST API
- ArcGIS Online OAuth 2.0 Implicit Grant
- Sin frameworks, sin dependencias npm, sin backend propio