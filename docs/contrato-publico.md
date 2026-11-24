# Contrato público EO · v0.1.0

```json
{
  "ok": true,
  "ahora": "2026-11-24T15:00:00.000Z",
  "contexto": { "app": "TVD", "codigoEO": "EO013", "codigoContexto": "EO013-TVD-DEMO" },
  "eo": { "nombre": "DEMO", "logo": "" },
  "canales": []
}
```

Los canales preservan la proyección pública de `listarCanalesPublicos`: código, número, nombre, descripción, tipo, señal HLS, playlist, espacio, origen y programación. La lectura EO añade `relacion: PROPIO | COMPARTIDO`. No devuelve propietarios, listas de EO compartidas, tokens, administradores o códigos de acceso.

Se reutilizan los campos de Gestión de canales:

| Campo TVD_Canales | Uso |
|---|---|
| enteOperador | SCaD_EO.codigoContexto de la propietaria |
| eoCompartidas | Array de codigoContexto de las EO distribuidoras |
| publicarHub | Autorización de publicación HUB |
| activo | Disponibilidad general del canal |

Las EO se resuelven contra SCaD_EO con app=TVD y activo=true. La selección pública no concede permisos de edición. La vigencia comercial de una suscripción no se infiere de activo: la capa de pago se conectará posteriormente a SYS.

La consulta legado sin parámetros sigue siendo pública para conservar CFCX. Esta entrega no convierte la reproducción en un producto de acceso privado ni aplica pagos por canal compartido.
