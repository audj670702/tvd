# TV Digital · App EO

Base pública multiempresa, versión **v0.1.0**. Reutiliza el monitor HLS/YouTube y sus estilos de CFCX, sin alterar CFCX ni los VPS.

## Publicación

Sitio estático sin compilación. En GitHub Pages seleccionar **main / raíz**. El dominio personalizado queda pendiente de confirmar; este repositorio no copia el CNAME de CFCX.

- URL base: muestra un formulario para abrir una EO.
- `?eo=EO013#/inicio`: app de una EO.
- `?eo=EO013-TVD-DEMO#/inicio`: admite también el contexto completo.
- Enlaces inválidos no usan otra EO como respaldo.

**No apuntar automáticamente `tvdigital.scad.mx` a GitHub Pages:** ese host ya sirve las señales HLS actuales. Confirmar un dominio de app diferente o una configuración explícita antes de cambiar su DNS.

## Instalación de backend en Wix

Reemplazar completos, en este orden:

| Entrega | Destino en Wix |
|---|---|
| `wix/tvdNucleo_v2.2.0.txt` | `backend/tvdNucleo.js` |
| `wix/tvdPublico_v2.3.0.txt` | `backend/tvdPublico.js` |

Publicar ambos juntos. No cambiar `http-functions.js`: se conservan los nombres de los endpoints ya reexportados. No sustituir `tvdPanel.web.js` ni el Velo de la página con estos archivos.

Contrato reutilizado: `https://www.scad.mx/_functions/tvdCanales`.

- Sin parámetros: conserva la consulta general que usa CFCX.
- `?codigoEO=EO013&app=TVD`: valida EO activa y APP TVD; devuelve identidad pública y canales activos propios o compartidos.
- `?hub=1`: devuelve solamente canales activos con `publicarHub === true`. Prepara la lectura del HUB; no construye su portal.

La app comprueba la identidad devuelta por el servidor y rechaza un catálogo global o perteneciente a otra EO. Hasta instalar el backend muestra un estado pendiente real, sin usar los siete canales generales como respaldo.

## Alcance v0.1.0

- Nombre y logotipo HTTPS de la EO desde SYS; logotipos almacenados como URI `wix:image` requieren normalización posterior.
- Canales propios y compartidos; numeración independiente del tipo VPS/VIRTUAL.
- Monitor de CFCX con su lógica de reproducción conservada: HLS, playlists YouTube y programación con reloj compartido.
- Preferencias y tema separados por APP/EO.
- Instalación PWA con identidad y enlace de la EO mediante manifest dinámico; comprobar la instalación en Safari y Chrome antes de anunciarla.
- Sin registro de espectadores ni sesiones simuladas.
- No guarda catálogos o permisos para reproducir sin conexión. Si falla una consulta, retira los canales del monitor; las autorizaciones se revisan al iniciar, cada dos minutos y al volver a la pestaña.
- Una lista vacía del servidor retira los canales previos.

Pendientes: adaptar Revista, Videoteca y demás módulos de CFCX a fuentes filtradas por EO; portal HUB; pagos/suscripciones; audiencia. No se incluyen datos de ejemplo, publicaciones CFCX ni módulos sin conexión real. La administración de canales permanece en los paneles ya existentes.

La distribución es pública: seleccionar una EO no acredita identidad administrativa. No se envían tokens Wix o VPS al navegador. Los canales compartidos se reproducen desde su fuente original; no se duplican playlists ni señales.

## Comprobación

`npm test` ejecuta las pruebas de filtrado por EO/HUB, rechazo de contextos ajenos, privacidad, tipos de canal, programación y preferencias. `npm run serve` abre un servidor local en el puerto 8080. El navegador se prueba contra el backend publicado; las pruebas automáticas usan datos aislados, nunca canales de producción.

La comprobación visual local quedó pendiente: el navegador del entorno no pudo iniciar por restricciones de ejecución. Las pruebas de JavaScript y backend sí se ejecutaron.

## Procedencia

Base: `audj670702/cfcx`, commit `da339308e57bb957c5c26c224c83277b7762836f` (v0.2.13). `css/app.css` conserva los bytes originales. En `js/monitor.js` solamente se neutraliza el texto «Muy pronto en CFCX»; se conserva la lógica de reproducción. La adaptación inicial concentra el flujo público en reproducción e identidad EO; la interfaz editorial y demás módulos se adaptarán después a fuentes multiempresa.

Backend: archivos vigentes proporcionados por Jorge el 24 de noviembre de 2026. `tvdNucleo` conserva las funciones de transmisión, precarga y reporte VPS; solamente se amplía la lectura pública y la resolución de EO. No se intervienen procesos ni cuentas VPS.
