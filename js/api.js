// ============================================================
//  API.JS — ArcGIS Feature Layer REST API
// ============================================================

const FeatureAPI = (() => {

  const BASE = () => CONFIG.FEATURE_LAYER_URL;
  const F    = CONFIG.FIELDS;

  // ---------- QUERY (leer todos los features) ----------
  async function query({ where = "1=1", orderByFields = "fecha_creacion DESC", outFields = "*" } = {}) {
    const token = Auth.getToken();

    const params = new URLSearchParams({
      where,
      outFields,
      orderByFields,
      returnGeometry: "false",
      f:              "json",
      ...(token ? { token } : {}),
    });

    const res  = await fetch(`${BASE()}/query?${params}`);
    const data = await res.json();

    if (data.error) throw new Error(`Feature Layer error: ${data.error.message}`);

    return (data.features || []).map(f => ({
      OBJECTID:        f.attributes.OBJECTID,
      [F.TITULO]:      f.attributes[F.TITULO]      || "",
      [F.URL]:         f.attributes[F.URL]          || "",
      [F.DESCRIPCION]: f.attributes[F.DESCRIPCION]  || "",
      [F.TIPO]:        f.attributes[F.TIPO]          || "",
      [F.ETIQUETAS]:   f.attributes[F.ETIQUETAS]     || "",
      [F.AUTOR]:       f.attributes[F.AUTOR]          || "",
      [F.FECHA]:       f.attributes[F.FECHA]          || "",
    }));
  }

  // ---------- ADD FEATURE (crear nuevo recurso) ----------
  async function addFeature(attrs) {
    const token = Auth.getToken();
    if (!token) throw new Error("Se requiere iniciar sesión.");

    const feature = {
      attributes: {
        [F.TITULO]:      attrs[F.TITULO]      || "",
        [F.URL]:         attrs[F.URL]          || "",
        [F.DESCRIPCION]: attrs[F.DESCRIPCION]  || "",
        [F.TIPO]:        attrs[F.TIPO]          || "Otro",
        [F.ETIQUETAS]:   attrs[F.ETIQUETAS]     || "",
        [F.AUTOR]:       Auth.getUser()?.fullName || Auth.getUser()?.username || "Anónimo",
        [F.FECHA]:       new Date().toISOString().split("T")[0],
      },
    };

    const body = new URLSearchParams({
      features: JSON.stringify([feature]),
      rollbackOnFailure: "true",
      f:     "json",
      token: token,
    });

    const res  = await fetch(`${BASE()}/addFeatures`, { method: "POST", body });
    const data = await res.json();

    if (data.error)                        throw new Error(data.error.message);
    if (data.addResults?.[0]?.error)       throw new Error(data.addResults[0].error.description);
    if (!data.addResults?.[0]?.success)    throw new Error("No se pudo guardar el recurso.");

    return data.addResults[0];
  }

  // ---------- DELETE FEATURE ----------
  async function deleteFeature(objectId) {
    const token = Auth.getToken();
    if (!token) throw new Error("Se requiere iniciar sesión.");

    const body = new URLSearchParams({
      objectIds: String(objectId),
      f:         "json",
      token:     token,
    });

    const res  = await fetch(`${BASE()}/deleteFeatures`, { method: "POST", body });
    const data = await res.json();

    if (data.error) throw new Error(data.error.message);
    return data.deleteResults?.[0];
  }

  return { query, addFeature, deleteFeature };

})();