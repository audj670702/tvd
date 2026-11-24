# TV Digital · App HUB / EO · v0.3.4

La app usa el modelo visual y las pantallas de CFCX: cabecera, tipografías, monitor, revista de Inicio, portadas/hemeroteca, Videoteca, Arcade, Mi app, temas y navegación inferior. `css/app.css` es una copia exacta del original. Las adaptaciones se concentran en identidad, fuentes públicas por contexto y el componente de dirección HUB/EO.

## Entradas públicas

| Entrada | Modo y comportamiento |
|---|---|
| https://tvd.scad.mx/ | HUB: canales autorizados para el HUB; acceso «Canales de las EO» con búsqueda y selección. |
| https://tvd.scad.mx/?eo=EO013 | EO: identidad de la empresa, canales propios/compartidos y acceso «TVD HUB». |

Los dos accesos de dirección usan el mismo lugar y diseño. «Canales insignia» despliega una lista con búsqueda, sin modal; cada entrada muestra código y nombre del canal. Elegir una EO en el directorio del HUB abre su app y su canal insignia. El selector integrado en el monitor cambia canales dentro del contexto actual. El enlace difundido por una EO abre directamente su app, sin formularios de empresa, login ni validación del viewer.

El portal comercial está separado en https://www.scad.mx/tvdigital y tiene su propio diseño y propósito. Los paneles administrativos mantienen su validación; no forman parte del acceso público de esta app.

## Datos y límites reales

- No se cargan catálogos ni datos de ejemplo de CFCX. REVISTA comparte expresamente su fuente editorial pública y su respaldo aprobado.
- El servidor debe confirmar el contexto HUB o la EO solicitada. Un catálogo general sin contexto se rechaza.
- REVISTA está conectada al flujo público actual de CFCX, común a HUB y EO. Las pantallas de Videoteca, Espacios, Arcade y Cupones se conservan. Las que aún no tienen una fuente pública por contexto muestran estados vacíos reales. Los RIAs siguen pendientes, como en CFCX; no se simulan partidas, puntos o canjes.
- Mi app conserva el diseño de tarjeta y las opciones de apariencia, con identidad pública del contexto. Se elimina el ingreso simulado de CFCX; no hay registros de espectadores.
- El monitor conserva su lógica HLS/YouTube y de programación sincronizada. Solo se neutraliza un texto que mencionaba CFCX.
- Preferencias y tema separados por APP/EO o HUB. No se almacenan catálogos/permisos para reproducción sin conexión.
- Cada dos minutos y al reactivar la pestaña se consulta el catálogo. Ante un error o revocación se retiran los canales previos del monitor.
- La PWA conserva el enlace del modo y la identidad al instalarse. Validar la instalación en Safari/Chrome antes de anunciarla.

## Conexión Wix existente

Estas entregas ya están incluidas y no se sustituyen por archivos de frontend:

| Archivo | Destino |
|---|---|
| `wix/tvdNucleo_v2.3.0.txt` | `backend/tvdNucleo.js` |
| `wix/tvdPublico_v2.4.0.txt` | `backend/tvdPublico.js` |

Instalar también, en este orden, `wix/gestion/tvdPanel_web_v2.4.0.txt` en `backend/tvdPanel.web.js`, `wix/gestion/TV_Digital_Velo_v2.3.0.txt` como código de página TV_Digital y `wix/gestion/TVD_GestionCanales_HTML_v0.4.0.txt` en `htmlGestionCanales`. Publicar Wix al terminar.

En Gestión de canales, seleccionar la EO propietaria, marcar «Canal insignia» y «Publicar en HUB». Solo se admite una insignia activa por propietaria; para cambiarla, desmarcar y guardar la anterior antes de marcar la nueva. Compartir un canal no crea otra entrada en el directorio. Solo aparecen EOs activas de TVD con una insignia activa y autorizada para HUB. Si el backend aún no devuelve `directorioEO`, la app muestra que el directorio no está disponible.

**Puente HTTP necesario:** la función existente en `backend/http-functions.js` debe reenviar `request`:

```js
export function get_tvdCanales(request) {
  return tvdPublico.get_tvdCanales(request);
}
```

El fragmento completo está en `wix/http-functions_TVD_ajuste.txt`. Sustituir únicamente esa función, no todo el archivo compartido con otras apps.

El endpoint existente acepta `?hub=1` o `?codigoEO=EO013&app=TVD`. La consulta sin parámetros conserva CFCX. No se crean servicios paralelos ni se intervienen los VPS.

La respuesta pública puede aportar `contenido:{articulos:[],programas:[],espacios:[],cupones:[]}` dentro del mismo contexto confirmado; la conexión editorial de estas fuentes sigue pendiente. Compartir un canal no implica compartir el resto del contenido de su propietaria.

## Publicación y pruebas

GitHub Pages: main / raíz, dominio `tvd.scad.mx`, HTTPS. El archivo CNAME ya pertenece al repositorio. No modificar `tvdigital.scad.mx`, usado por las señales HLS.

Desarrollo: `npm ci`, `npm test`, `npm run serve`. No se requiere compilación para publicar.

Pruebas incluidas: filtrado EO/HUB, exclusión de canales ajenos/inactivos y datos privados, rechazo de contexto incorrecto, programación, preferencias separadas y DOM de los dos modos. Las pruebas DOM verifican cinco pestañas, cabecera, revista, monitor, selector/filtro, navegación del directorio HUB→EO por insignia, acceso EO→HUB, rutas, tema y estados de error. Datos aislados, sin escribir en CMS.

## Procedencia

Referencia visual: audj670702/cfcx, commit da339308e57bb957c5c26c224c83277b7762836f, versión v0.2.13. CFCX permanece intacta. Los backends de referencia fueron entregados por Jorge el 24 de noviembre de 2026. Sus funciones de transmisión/precarga/reporte VPS se conservaron.

Versión 0.3.4: selector compacto alineado a la derecha, logotipo de la identidad pública en listado y tarjeta Mi app; código y nombre con estilos separados. Se reutiliza logoEO/logoEo de la cuenta para representar su canal insignia. Sin imagen se muestra un icono; no se inventan logotipos.

## REVISTA compartida · v0.3.4

Usa `https://www.scad.mx/_functions/cfcxRevista` sin parámetros de empresa. Conserva Inicio, carruseles, portadas, hemeroteca con búsqueda, audio y lectura completa en el blog. El respaldo `data/revista-inicial.json` es la misma instantánea aprobada de CFCX y solo se usa si falla el servicio; una lista oficial vacía se respeta. Se actualiza cada dos minutos y al volver a la app. La consulta editorial es independiente del catálogo de canales y no se borra si este falla. No modifica el proceso de creación, aprobación o publicación ni añade modo multiempresa. Requiere permitir TVD en la cabecera CORS del servicio editorial existente; ver `wix/REVISTA_ajuste_CORS.txt`. El respaldo se actualizó con las tres fichas públicas aprobadas consultadas el 24 de noviembre de 2026.
