// ============================================================
//  AUTH.JS — ArcGIS Online OAuth 2.0 
// ============================================================

const Auth = (() => {

  const TOKEN_KEY  = "esri_ec_token";
  const USER_KEY   = "esri_ec_user";
  const STATE_KEY  = "esri_ec_oauth_state";

  let _token = null;
  let _user  = null;
  let _onChangeCallbacks = [];

  // ---------- PUBLIC API ----------

  function init() {
    // 1. ¿Venimos de un redirect OAuth? (hash con access_token)
    if (window.location.hash.includes("access_token")) {
      _handleRedirect();
      return;
    }
    // 2. ¿Hay sesión guardada?
    const savedToken = sessionStorage.getItem(TOKEN_KEY);
    const savedUser  = sessionStorage.getItem(USER_KEY);
    if (savedToken && savedUser) {
      _token = savedToken;
      _user  = JSON.parse(savedUser);
      _notifyChange();
      return;
    }
    // 3. No hay sesión
    _notifyChange();
  }

  function login() {
    const state = _randomState();
    sessionStorage.setItem(STATE_KEY, state);

    const params = new URLSearchParams({
      client_id:     CONFIG.CLIENT_ID,
      response_type: "token",
      redirect_uri:  CONFIG.REDIRECT_URI,
      state:         state,
      expiration:    20160,          // 2 semanas en minutos
    });

    const authURL = `${CONFIG.PORTAL_URL}/sharing/rest/oauth2/authorize?${params}`;
    window.location.href = authURL;
  }

  function logout() {
    _token = null;
    _user  = null;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    _notifyChange();
  }

  function getToken()    { return _token; }
  function getUser()     { return _user; }
  function isLoggedIn()  { return !!_token; }

  function onChange(cb)  { _onChangeCallbacks.push(cb); }

  // ---------- PRIVATE ----------

  function _handleRedirect() {
    const hash   = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token  = params.get("access_token");
    const state  = params.get("state");

    // Limpiar hash de la URL sin recargar
    history.replaceState(null, "", window.location.pathname + window.location.search);

    if (!token) { _notifyChange(); return; }

    // Validar state anti-CSRF
    const savedState = sessionStorage.getItem(STATE_KEY);
    if (state && savedState && state !== savedState) {
      console.error("OAuth state mismatch — posible CSRF");
      _notifyChange();
      return;
    }
    sessionStorage.removeItem(STATE_KEY);

    _token = token;
    sessionStorage.setItem(TOKEN_KEY, token);

    // Obtener info del usuario
    _fetchUserInfo(token);
  }

  async function _fetchUserInfo(token) {
    try {
      const res = await fetch(
        `${CONFIG.PORTAL_URL}/sharing/rest/community/self?f=json&token=${token}`
      );
      const data = await res.json();

      if (data.error) throw new Error(data.error.message);

      _user = {
        username:    data.username,
        fullName:    data.fullName || data.username,
        email:       data.email || "",
        thumbnailUrl: data.thumbnail
          ? `${CONFIG.PORTAL_URL}/sharing/rest/community/users/${data.username}/info/${data.thumbnail}?token=${token}`
          : null,
        orgId:       data.orgId || "",
      };

      sessionStorage.setItem(USER_KEY, JSON.stringify(_user));
      _notifyChange();

    } catch (err) {
      console.error("Error al obtener info de usuario:", err);
      // Guardamos token sin info de usuario
      _user = { username: "usuario", fullName: "Usuario", email: "" };
      sessionStorage.setItem(USER_KEY, JSON.stringify(_user));
      _notifyChange();
    }
  }

  function _notifyChange() {
    _onChangeCallbacks.forEach(cb => cb({ token: _token, user: _user }));
  }

  function _randomState() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  return { init, login, logout, getToken, getUser, isLoggedIn, onChange };

})();