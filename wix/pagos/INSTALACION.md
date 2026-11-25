# TVD · integración comercial normalizada SYS

Esta entrega sustituye y descarta la implementación independiente anterior.

## Instalar en Wix

1. Sustituir `backend/tvdPanel.web.js` con `tvdPanel_web_v2.5.0_SYS.txt` completo.
2. Sustituir código de página TV_Digital con `TV_Digital_Velo_v2.4.1_SYS.txt` completo.
3. Sustituir HTML de `htmlGestionCanales` con `TVD_GestionCanales_HTML_v0.5.1_SYS.txt` completo.
4. Publicar y actualizar `/panel-tvdigital`.

No crear backends. Se consumen los existentes `backend/sysComercial.js` y `backend/sysComercialCore.js`; no se reemplazan ni modifican. Referencia revisada: scad-sys, sysComercial v1.0 y sysComercialCore v1.5.

Si instalaste la entrega descartada, el nuevo Velo elimina su importación: `tvdSuscripcion.web.js` deja de utilizarse y puede retirarse tras publicar. La colección TVD_Suscripciones, creada anteriormente, no participa en el modelo normalizado. No se borra ni se migra automáticamente.

## Configuración

En el backend existente TVD se instancia `comercial({APP:'TVD',PLANES:[{id:'983d6ede-7678-4ac7-a367-1046de1308a6',nivel:'BASICO'}],NIVELES:['BASICO']})`.

No se inventan límites: no se declara LIMITES_NIVEL ni se llama al registro automático de EO. Los límites actuales de las EO permanecen bajo SYS. BASICO identifica el único nivel del plan actual, sin añadir cuotas o prestaciones.

## Fuente única

La sección Suscripción · TV Digital presenta el resultado de `COMERCIAL_TVD.vigenciaEO(eo)`. SYS resuelve admPrincipal → SCaD_USR → memberId y consulta el plan de la APP, sincronizando activoPricing y ultimaVerificacionAcceso con su caché existente. No se asigna una orden manualmente ni se utiliza una colección TVD de pagos. No se usan accesoPricing/pricingPlanIds de EO: son política de acceso de usuarios, no contratación comercial de la empresa.

No hay checkout, cobros ni cambios de órdenes desde esta entrega. No se adopta la regla anterior de una compra reservada a una sola empresa: se respeta exactamente la política comercial del titular vigente en SYS. Cualquier cambio a esa política debe hacerse en el núcleo común.

El catálogo de canales sigue cargando si la consulta comercial falla; no se expone información de suscripciones a visitantes. La consulta usa la autorización administrativa existente QTD_Administradores. Los datos de canal, secretos, playlists y salidas conservan los métodos existentes.

## Alcance y comprobación

La integración muestra vigencia comercial en el panel; no añade suspensión automática ni convierte la autorización global actual del panel en autorización por EO. Esas decisiones requieren vincular cada operación con su contexto y aplicar las políticas de SYS. No altera acceso de viewers, señales VPS ni REVISTA.

No se modificó el núcleo común. Se conserva su comportamiento actual: planesActivos toma órdenes ACTIVE, y en v1.5 convierte un error de Pricing en lista vacía. La integración no introduce otra regla financiera para sustituirlo; por eso no se activa suspensión automática en esta entrega. Ese manejo de error, si se ajusta, debe corregirse en SYS para todas las apps.

Pruebas: 27 controles de regresión e integración TVD, más ejecución con el núcleo SYS real para plan, titular, sincronización de SCaD_USR y caché. La comprobación con suscripción real queda pendiente de instalación y de que exista una compra vigente del titular.
