# Panel_TVD_EO · v0.2.1

## Instalar

1. Sustituir `backend/tvdPanel.web.js` con `tvdPanel_web_v2.6.1_EO.txt` completo. No crear otro backend. Reemplaza la entrega v2.5.0 SYS.
2. En la página Wix `Panel_TVD_EO`, establecer slug `/panel-tvd-eo`. Usar una sección `seccPanel` y un elemento Insertar HTML con ID `htmlPanel`, según la maqueta previa.
3. Pegar `Panel_TVD_EO_HTML_v0.2.1.txt` en `htmlPanel`.
4. Pegar `Panel_TVD_EO_Velo_v0.2.1.txt` como código de esa página.
5. Publicar Wix. El acceso sin parámetro resuelve una empresa automáticamente o permite elegir si hay varias. `?codigoEO=EO015` o `?eo=EO015` solicita esa empresa; no concede permiso.

La interfaz requiere altura suficiente para monitor, tabla y editor. Conservar los elementos ya creados cuando sus IDs coincidan. No pegar el Velo EO en la página del panel general ni en el portal comercial.

## Acceso

Velo llama a `tvdEOAcceso` del backend existente. No hay sesión: Iniciar sesión. Varias empresas: selección. Con contexto: `sysResolveEOAdminContext({app:'TVD',codigoEO})` resuelve permisos. TVD vuelve a comprobar usuario activo, identidad de sesión, APP y pertenencia, y usa `sysComercial.vigenciaEO(eo)` para la suscripción. La regla comercial es la de SYS, por titular, sin reservas de órdenes ni colecciones de pagos TVD.

Sin vigencia, se muestra la empresa y la opción de contratar/renovar; no se habilitan consultas operativas ni cambios. El puente vuelve a validar todos los permisos en backend para cada operación. Si la vigencia o el permiso se revoca, los siguientes comandos se rechazan. SYS conserva su caché vigente; TVD no crea otra regla ni la elude. No hay baja automática de EO o usuarios en esta entrega.

Los métodos administrativos globales conservan su autorización anterior; no se abren a administradores EO. Esta entrega no afirma que QTD_Administradores ya sea equivalente a admSYS: el ajuste del panel global Panel_TVD_HUB es una intervención distinta.

## Operación

- Canales propios y compartidos; compartidos de solo lectura.
- VPS: consulta, alta/edición/baja de filas, activación, orden y transmitir ahora sobre canales propios.
- Virtuales: vincular una playlist propia con duración válida y editar sus videos. No se usa una parrilla que no afecte a la señal virtual.
- Playlists: crear/editar/eliminar propias, videos YouTube con duración, orden y estado. La empresa se toma del servidor, nunca de un campo enviado por el cliente.
- Catálogo: consulta de registros con enteOperador de la empresa, con proyección segura; sin mostrar rutas de Drive, archivos locales u otros campos globales. No se incorpora alta de catálogo.
- Monitor: modelo anterior, usando la fuente pública filtrada en backend para ese contexto.

No incluye creación de canales, asignación entre empresas ni RTMPS global; esas capacidades siguen en el panel HUB. No hay cambios a los procesos VPS ni a los endpoints públicos. Las funciones operativas previas se comparten internamente; sus métodos públicos globales conservan la validación administrativa original.

## Recursos heredados

El campo `enteOperador` (texto) de QTD_Playlist y QRO_Catalogo identifica su empresa con `SCaD_EO.codigoContexto`. Comprobar en CMS que el campo esté declarado; si no existe, agregarlo sin llenar registros automáticamente. Los nuevos registros de playlist del panel guardan ese contexto.

Revisión de datos del 24 de noviembre de 2026: 15 playlists sin propietario y 100 primeros registros del catálogo sin propietario (hay más páginas). No se reasignaron. Las playlists heredadas que ya alimentan un canal siguen reproduciéndose en el monitor, pero no aparecen como editables de la EO. Confirmar su pertenencia antes de asignar ese campo desde SYS/CMS; no duplicar ni adjudicar recursos por coincidencia de nombres. No vincular una playlist nueva al aire salvo que se quiera cambiar la programación del canal.

## Verificación

36 pruebas aprobadas, incluyendo sesión, usuario activo, vigencia, selección, permiso por ID, recursos ajenos, compartidos solo lectura, fuente PLAYLIST en minúsculas, propietario impuesto por servidor, conservación de secretos y distribución al vincular una playlist, y regresión de métodos globales.

La interfaz se verificó con DOM y respuestas aisladas. No se inició una suscripción ni se publicó esta página Wix automáticamente. Tras instalación, verificar sesión real, selección y renovación. Para probar edición real se requiere una suscripción vigente del titular según SYS y recursos propios. Los enlaces de portal y app se conectarán después de validar el panel; no se añadieron aquí.

## Dependencias existentes

`sys.web.js` con sysResolveEOAdminContext; sysComercial.js y sysComercialCore.js; tvdNucleo.js v2.3.0; tvdSalidas.js; colecciones actuales. Se reutilizan, no se reemplazan. `TVD_Suscripciones` y `tvdSuscripcion.web.js` de la entrega descartada no se utilizan.

Corrección v0.2.1: pantalla de acceso superior con Iniciar sesión visible desde el HTML inicial; monitor y toda la operación ocultos hasta AUTORIZADO. HTML y Velo deben usar ambos protocolo 0.2.1. Tras 10 intentos sin respuesta se muestra un diagnóstico de conexión con la página.

Corrección backend v2.6.1: ingresar y Revalidar llaman vigenciaEO(eo,{forzar:true}) de SYS; las operaciones conservan la caché común. No cambia la política de estados de pago ni modifica órdenes.
