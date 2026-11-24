/* Contexto público explícito. No deducir EO desde datos locales de CFCX. */
(function () {
  'use strict';
  function resolver(search, cfg) {
    var params = new URLSearchParams(search);
    var eo = (params.get('eo') || params.get('codigoEO') || cfg.codigoEOPredeterminado || '').trim();
    if (!eo) return { app: 'TVD', modo:'HUB', eo: '', clave: 'tvd.TVD.HUB.' };
    if (!/^EO\d{3,}(?:-TVD-[A-Za-z0-9_-]+)?$/.test(eo)) throw new Error('EO_INVALIDA');
    return { app: 'TVD', modo:'EO', eo: eo, clave: 'tvd.TVD.' + eo + '.' };
  }
  function coincide(contexto, eo) {
    return contexto && contexto.app === 'TVD' && typeof contexto.codigoEO === 'string' &&
      typeof contexto.codigoContexto === 'string' &&
      /^EO\d{3,}$/.test(contexto.codigoEO) &&
      contexto.codigoContexto.indexOf(contexto.codigoEO + '-TVD-') === 0 &&
      (contexto.codigoEO === eo || contexto.codigoContexto === eo);
  }
  window.TVD_CONTEXTO = { resolver: resolver, coincide: coincide };
})();
