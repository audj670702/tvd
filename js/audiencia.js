/* TVD · audiencia anónima de reproducción · v0.4.0 */
(function () {
  'use strict';
  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    if (!window.crypto || !window.crypto.getRandomValues) return '';
    var a = new Uint8Array(16); window.crypto.getRandomValues(a); a[6] = a[6] & 15 | 64; a[8] = a[8] & 63 | 128;
    var h = Array.from(a, function (v) { return v.toString(16).padStart(2, '0'); }).join('');
    return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
  }
  function Audiencia(opciones) {
    this.url = opciones.url; this.contexto = opciones.contexto; this.sesion = null; this.reproduciendo = false;
    this.ultimo = performance.now(); this.cola = Promise.resolve(); this.viewerId = uuid();
    // Identificador aleatorio por día y contexto; nunca usa identidad, correo, IP o perfil Wix.
    try {
      var clave = 'tvd.audiencia.' + new Date().toISOString().slice(0,10) + '.' + (this.contexto.eo || 'HUB');
      var guardado = localStorage.getItem(clave);
      if (/^[a-f0-9-]{36}$/i.test(guardado || '')) this.viewerId = guardado;
      else if (this.viewerId) localStorage.setItem(clave, this.viewerId);
    } catch (_) {}
    var self = this;
    this.intervalo = setInterval(function () { self.enviar(false); }, 30000);
    this.visibilidad = function () { self.acumular(); self.enviar(false, true); };
    this.salida = function () { self.finalizar(true); };
    document.addEventListener('visibilitychange', this.visibilidad);
    window.addEventListener('pagehide', this.salida);
  }
  Audiencia.prototype.acumular = function () {
    var ahora = performance.now();
    if (this.sesion && this.reproduciendo && !this.ocultaAnterior) this.sesion.ms += Math.max(0, ahora - this.ultimo);
    this.ultimo = ahora; this.ocultaAnterior = document.hidden;
  };
  Audiencia.prototype.actualizar = function (evento) {
    this.acumular();
    if (this.sesion && (evento.finalizar || evento.codigo !== this.sesion.canalId)) this.finalizar(false);
    this.reproduciendo = evento.reproduciendo === true;
    if (!this.sesion && this.reproduciendo && evento.codigo && this.viewerId && this.url) {
      this.sesion = { id: uuid(), canalId: evento.codigo, ms: 0, iniciada: false };
    }
    this.enviar(false, true);
  };
  Audiencia.prototype.enviar = function (finalizada, forzar, beacon) {
    this.acumular();
    var s = this.sesion; if (!s || !s.id) return;
    var activa = this.reproduciendo && !document.hidden && !finalizada;
    if (!activa && !s.iniciada) return;
    if (!activa && !forzar && !finalizada) return;
    var cuerpo = { app: 'TVD', sessionId: s.id, viewerId: this.viewerId, canalId: s.canalId,
      hub: this.contexto.modo === 'HUB', codigoEO: this.contexto.modo === 'EO' ? this.contexto.eo : '',
      segundos: Math.floor(s.ms / 1000), activa: activa, finalizada: !!finalizada };
    s.iniciada = true;
    var texto = JSON.stringify(cuerpo), url = this.url;
    if (beacon && navigator.sendBeacon) { navigator.sendBeacon(url, new Blob([texto], { type: 'text/plain;charset=UTF-8' })); return; }
    // Orden por sesión: una respuesta de pausa no puede pisar una reanudación posterior.
    this.cola = this.cola.catch(function () {}).then(function () {
      return fetch(url, { method: 'POST', mode: 'cors', credentials: 'omit', keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: texto }).then(function (r) { if (!r.ok) throw Error('AUDIENCIA_NO_DISPONIBLE'); });
    }).catch(function () {});
  };
  Audiencia.prototype.finalizar = function (beacon) {
    this.enviar(true, true, beacon); this.sesion = null; this.reproduciendo = false;
  };
  Audiencia.prototype.destroy = function () {
    this.finalizar(false); clearInterval(this.intervalo);
    document.removeEventListener('visibilitychange', this.visibilidad); window.removeEventListener('pagehide', this.salida);
  };
  window.TVD_AUDIENCIA = Audiencia;
})();
