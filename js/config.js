// ============================================================
//  CONFIG — Recursos Esri EC
// ============================================================

const CONFIG = {

  // ----------------------------------------------------------
  //  ARCGIS ONLINE — OAuth
  // ----------------------------------------------------------
  CLIENT_ID: "eBKFmL0khLqcKrgA",                    

  // URL base ArcGIS Online
  PORTAL_URL: "https://www.arcgis.com",              

  // Redirect URI registrada en tu app OAuth
  REDIRECT_URI: window.location.origin + window.location.pathname, // auto-detecta

  // ----------------------------------------------------------
  //  FEATURE LAYER
  // ----------------------------------------------------------
  FEATURE_LAYER_URL: "https://services3.arcgis.com/PYyU96woLS4j2PN8/arcgis/rest/services/RecursosEsriEC/FeatureServer/0",  

  // ----------------------------------------------------------
  //  CAMPOS de la Feature Layer (deben coincidir exactamente)
  // ----------------------------------------------------------
  FIELDS: {
    TITULO:      "titulo",
    URL:         "url",
    DESCRIPCION: "descripcion",
    TIPO:        "tipo",
    ETIQUETAS:   "etiquetas",
    AUTOR:       "autor",
    FECHA:       "fecha_creacion",
  },

  // ----------------------------------------------------------
  //  ETIQUETAS / APLICACIONES ARCGIS
  // ----------------------------------------------------------
  TAGS: [
    { id: "arcgis-pro",          label: "ArcGIS Pro",          color: "blue"   },
    { id: "field-maps",          label: "Field Maps",           color: "green"  },
    { id: "arcgis-online",       label: "ArcGIS Online",        color: "teal"   },
    { id: "experience-builder",  label: "Experience Builder",   color: "purple" },
    { id: "dashboard",           label: "Dashboards",           color: "orange" },
    { id: "survey123",           label: "Survey123",            color: "red"    },
    { id: "story-maps",          label: "Story Maps",           color: "pink"   },
    { id: "enterprise",          label: "ArcGIS Enterprise",    color: "dark"   },
    { id: "instant-apps",        label: "Instant Apps",         color: "teal"   },
    { id: "notebooks",           label: "Notebooks",            color: "purple" },
    { id: "arcgis-hub",          label: "ArcGIS Hub",           color: "green"  },
    { id: "workforce",           label: "Workforce",            color: "orange" },
    { id: "velocity",            label: "Velocity",             color: "red"    },
    { id: "insights",            label: "Insights",             color: "purple" },
    { id: "arcgis-api-js",       label: "Maps SDK JS",          color: "blue"   },
    { id: "arcgis-python",       label: "API Python",           color: "green"  },
    { id: "mission",             label: "Mission",              color: "dark"   },
    { id: "indoors",             label: "ArcGIS Indoors",       color: "blue"   },
    { id: "knowledge",           label: "ArcGIS Knowledge",      color: "green"  },
    { id: "ia",                  label: "Inteligencia Artificial", color: "dark"   },
    { id: "arquitectura",        label: "Arquitectura",         color: "blue"   },
    { id: "otro",                label: "Otro",                 color: "gray"   },
  ],
};