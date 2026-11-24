/* Interfaz compatible con el monitor original; preferencias separadas por APP/EO. */
(function () {
  'use strict';
  var cfg = window.TVD_CONFIG, contexto;
  try { contexto = window.TVD_CONTEXTO.resolver(location.search, cfg); } catch (_) { contexto = { clave: 'tvd.invalida.' }; }
  function leer(k) { try { return localStorage.getItem(contexto.clave + k); } catch (_) { return null; } }
  function guardar(k,v) { try { localStorage.setItem(contexto.clave + k,v); } catch (_) {} }
  window.CFCX_STORE = {
    getCanalPredeterminado: function () { var c=leer('canal');return /^CH\d{2,}$/.test(c || '') ? c : null; },
    setCanalPredeterminado: function (c) { if (/^CH\d{2,}$/.test(c)) guardar('canal',c); },
    quitarCanalPredeterminado: function () { try { localStorage.removeItem(contexto.clave+'canal'); } catch (_) {} },
    getTheme: function () { var t=leer('tema');return t==='dark'||t==='light'?t:'auto'; },
    setTheme: function (t) { guardar('tema',['light','dark'].includes(t)?t:'auto'); }
  };
})();
