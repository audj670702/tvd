# TVD · conexión Pricing v1.0.0

Plan TV Digital: `983d6ede-7678-4ac7-a367-1046de1308a6`.

## Instalación

1. Crear `backend/tvdSuscripcion.web.js` con el archivo `tvdSuscripcion_web_v1.0.0.txt` completo.
2. Sustituir el código de página TV_Digital con `TV_Digital_Velo_v2.4.0.txt` completo.
3. Sustituir el HTML de `htmlGestionCanales` con `TVD_GestionCanales_HTML_v0.5.0.txt` completo.
4. Publicar Wix y actualizar `/panel-tvdigital`.

Dependencias ya utilizadas por GYM: `@wix/pricing-plans`, `@wix/essentials`; confirmar su disponibilidad en el editor si marca un import faltante.

La colección `TVD_Suscripciones` ya se creó en el sitio SCaD con permisos ADMIN para lectura, inserción, edición y eliminación. No contiene compras de prueba. Los campos son app, enteOperador, codigoEO, planId, buyerMemberId, vinculadoPor (texto), fechaVinculo (fecha/hora). Su `_id` es el ID de la orden, para impedir reutilizar una compra en distintas EO incluso con solicitudes simultáneas.

## Comportamiento

La sección Suscripción · TV Digital aparece sobre Gestión de canales y muestra cada empresa activa. Obtiene al pagador desde `SCaD_EO.admPrincipal` → `SCaD_USR.memberId`, cotejando APP, pertenencia y actividad. No acepta un comprador libre enviado por el navegador.

Consulta Wix en backend como GYM, con elevación, por ID de plan y comprador, recorriendo todas las páginas. Vuelve a cotejar comprador y plan en la respuesta. Una compra pagada y activa aparece disponible para vincular a una EO. El administrador selecciona explícitamente la empresa mediante su botón Vincular compra; no se asigna a todas las empresas del comprador. Solo pueden hacerlo los administradores ya autorizados del Panel TVD (`QTD_Administradores`).

Vigente significa ACTIVE + PAID y fechas válidas dentro del periodo. Pausa, fin, cancelación efectiva, pagos pendientes/fallidos/reembolsados y fechas inválidas no se presentan como vigentes. Cancelar renovación mantiene el periodo válido; no se crea ningún cobro. NOT_APPLICABLE no activa este plan de pago en esta versión: los planes gratuitos/pruebas requieren política explícita posterior.

La consulta se repite al actualizar el catálogo; no guarda estados financieros que se vuelvan obsoletos. Un fallo del proveedor muestra No se pudo verificar; no se transforma en Sin suscripción. Los enlaces históricos se conservan.

## Alcance de esta entrega

Conecta consulta y vínculo verificable, sin checkout nuevo ni modificación de cargos, órdenes, estados de EO, usuarios o canales. El plan no tenía compras al revisar esta entrega; la comprobación real de vinculación requiere una compra genuina del responsable principal.

El panel actual opera mediante autorización global; esta entrega no convierte esa autorización en permisos por canal ni activa bloqueos automáticos por impago. Esa aplicación de vigencia requiere conectar la autorización de cada operación con su empresa, y decidir la política de suspensión. SYS y los administradores globales conservan el acceso de gestión. El viewer, HUB, REVISTA y las señales públicas mantienen su acceso actual. No se intervienen VPS.

No requiere modificar tvdPanel.web.js, tvdNucleo.js ni http-functions.js.
