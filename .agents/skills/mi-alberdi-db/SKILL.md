---
name: mi-alberdi-db
description: >
  Arquitectura, decisiones de dominio y reglas de esquema para la base de datos PostgreSQL de Mi Alberdi.
  Trigger: Al diseñar, migrar, consultar o escribir esquemas de Prisma/SQL/Zod o lógica de negocio que interactúe con la base de datos de Mi Alberdi (`negocios`, `publicaciones`, `ubicaciones_negocio`, `planes_catalogo`, `membresias`, `eventos_analitica`, `reels_historias`, `opiniones`).
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.3"
---

## Cuándo usar esta skill

- Diseñar o modificar migraciones de PostgreSQL / Prisma / Supabase para **Mi Alberdi**.
- Escribir entidades de dominio, esquemas de Zod (`packages/shared`) o consultas en repositorios de `apps/api`.
- Implementar el flujo de alta de perfiles (`comercio`, `oficio`, `profesional`, `emprendimiento`), sucursales por plan (`max_sucursales`), cupos de destacados (`cupos_destacados`), ranking de búsqueda o analítica para comerciantes.
- Revisar límites de seguridad y aislamiento de datos personales (PII) en las tablas.

---

## 1. Por qué separamos `negocios` (Perfil Comercial / Oficio) de `publicaciones` (Servicios / Productos)

En la plataforma de referencia (GoyaNova) existía una única tabla monolítica de 42 columnas (`servicios`) donde cada publicación duplicaba la identidad del negocio, coordenadas en el mapa, número de WhatsApp, redes sociales, métodos de pago, banderas de moderación y flags de planes.

### Por qué fallaba ese modelo monolítico:
1. **Duplicación de datos y pesadilla de mantenimiento:** Una ferretería o un centro de estética con 5 servicios tenía que escribir 5 veces su WhatsApp, ubicación en el mapa, Instagram y horarios. Cambiar un número de teléfono obligaba a actualizar 5 filas.
2. **Propiedad de dominio rota:** Atributos como `badge_verificado`, `pin_destacado_mapa`, `banner_destacado`, `atencion_ia` y el QR impreso en vidriera pertenecen al **Negocio / Prestador**, no a un producto o servicio suelto.
3. **Caos comercial y de cobros:** Cobrar suscripciones por producto/servicio individual genera fricción enorme en los comerciantes de una ciudad chica y multiplica los costos de comisiones en tickets bajos (\$1.500 / \$2.500 ARS).

### Cómo lo resuelve Mi Alberdi (`perfiles_usuarios` 1 ──► N `negocios` 1 ──► N `publicaciones`):
- **`perfiles_usuarios` (Cuenta de la persona):**
  - Un vecino se registra una sola vez y desde su cuenta puede crear uno o varios perfiles comerciales (por ejemplo, tener el perfil de su **Kiosco** y además su perfil independiente como **Electricista**).
- **`negocios` (Identidad Comercial, Oficio o Profesión):**
  - Centraliza la identidad (`tipo_perfil`, `nombre_comercial`, `slug`, `logo_url`, `banner_url`, `matricula_profesional`, `qr_code_token`), verificación (`verificacion`, `badge_texto`), contacto principal (`whatsapp_principal`, redes), sucursales/ubicaciones (`ubicaciones_negocio`), horarios con corte de siesta (`horarios_negocio`), métodos de pago (`negocios_metodos_pago`) y el plan de suscripción activo (`plan_actual`, `entitlements`).
- **`publicaciones` (Ítems livianos del catálogo — Servicios o Productos):**
  - Contiene solo lo específico del ítem: `categoria_id`, `tipo` (`servicio` | `producto`), `titulo`, `descripcion`, `precio_referencia_ars`, `etiqueta_precio`, `modalidad`, `imagenes_publicacion` y la bandera `es_destacada` para saber si consume uno de los cupos de destacado del negocio.
  - Hereda automáticamente el `whatsapp_principal` del negocio a menos que se configure un `whatsapp_especifico`.

---

## 2. Distinción Nativa: Oficio / Profesional vs. Comercio / Emprendimiento (`tipo_perfil_comercial`)

En Juan Bautista Alberdi conviven dos realidades muy distintas que **comparten la misma tabla `negocios`** (para no duplicar llaves foráneas en reseñas, planes, reels y analítica), pero se diferencian mediante el enum `tipo_perfil_comercial`:

| Tipo de Perfil (`tipo_perfil`) | Caso real en Alberdi | Comportamiento en UI y Base de Datos |
| :--- | :--- | :--- |
| **`comercio`** | Ferretería, farmacia, pizzería, tienda de ropa | Local físico a la calle (`mostrar_direccion_exacta = true`), horario fijo/cortado, puede tener múltiples **sucursales** en planes pagos. |
| **`oficio`** | Plomero, gasista, electricista, albañil, flete, jardinero | Trabaja con su nombre o apodo, suele ir al domicilio del vecino (`atiende_a_domicilio = true`), puede ocultar la dirección exacta de su casa en el mapa (`mostrar_direccion_exacta = false` mostrando solo barrio/zona) y cargar `matricula_profesional`. |
| **`profesional`** | Abogado, contador, kinesiólogo, psicólogo, docente particular | Atención en consultorio/estudio o a domicilio, usa `modalidad_principal = 'por_turnos'` y `matricula_profesional`. |
| **`emprendimiento`** | Pastelería artesanal, viandas, diseño, venta por encargo desde casa | Funciona `por_pedido` o `solo_whatsapp`, con o sin retiro en domicilio y con envíos (`hace_envios = true`). |

> **Regla de Oro de Arquitectura:** NUNCA separar `comercios` y `oficios` en dos tablas distintas. Ambos son actores económicos que publican en el catálogo, reciben reseñas, suben reels y contratan planes. El campo `tipo_perfil` adapta el formulario de alta y las etiquetas visuales ("Ver Comercio" vs. "Contactar Especialista").

---

## 3. Estrategia de Sucursales por Plan (`ubicaciones_negocio` y `max_sucursales`)

Permitir múltiples sucursales bloqueadas en el Plan Gratis y habilitadas en los planes pagos (**Plata y Oro**) es una decisión estratégica de monetización y segmentación:

### Por qué bloquear sucursales adicionales en el Plan Gratis es una GRAN decisión:
1. **Segmentación natural por tamaño de negocio:** El trabajador de oficio, el emprendedor casero o el comercio de barrio chico tienen **1 sola ubicación** (`max_sucursales = 1`). El Plan Gratis (\$0) no los limita en su ubicación principal. En cambio, una heladería, panadería o farmacia que tiene **2 o 3 sucursales en Alberdi** tiene espalda económica de sobra para pagar \$1.500 o \$2.500 ARS al mes.
2. **Valor real en el Mapa Interactivo:** Un negocio con 3 sucursales en Plan Plata/Oro aparece con **3 pines activos en distintos barrios del mapa de Alberdi**, triplicando su presencia geográfica.
3. **Atención descentralizada por sucursal:**
   - La tabla `ubicaciones_negocio` incluye `nombre_sucursal` (ej. *"Casa Central"*, *"Sucursal Centro"*, *"Sucursal Barrio Norte"*), `whatsapp_sucursal` y `telefono_sucursal`.
   - Si el vecino toca el pin de la Sucursal Norte en el mapa, puede hablar directo al WhatsApp de esa sucursal (si `whatsapp_sucursal` es `NULL`, hereda el `whatsapp_principal` del negocio).
   - `horarios_negocio` incluye `ubicacion_id` (nullable): si todas las sucursales abren igual, se carga un solo horario general (`ubicacion_id = NULL`); si una sucursal tiene horario distinto, se vincula a esa sucursal.
   - `eventos_analitica` incluye `ubicacion_id` para decirle al dueño: *"28 personas contactaron a Casa Central y 15 a Sucursal Norte"*.
4. **Degradación limpia sin pérdida de datos (`activa_por_plan`):**
   - **Gratis (\$0):** `max_sucursales = 1` (solo la ubicación con `es_principal = true`).
   - **Plata (\$1.500):** `max_sucursales = 3` (Casa Central + hasta 2 sucursales extra).
   - **Oro (\$2.500):** `max_sucursales = 10`.
   - Si un comercio baja de Plata/Oro a Gratis, un trigger pone `activa_por_plan = false` en las sucursales secundarias (`es_principal = false`). No se borran de la base de datos; simplemente dejan de mostrarse en el mapa hasta que renueve.

---

## 4. Por qué elegimos la Opción B (Modelo Híbrido + Cupos de Destacados) sobre la Opción A

Durante el diseño arquitectónico evaluamos cómo debían impactar los planes de suscripción (**Gratis \$0**, **Plata \$1.500 ARS**, **Oro \$2.500 ARS**) en el ranking y la visibilidad del catálogo.

### El problema de fondo: "La Paradoja del Destacado"
Con precios accesibles (\$1.500 y \$2.500 ARS) pensados como un "impulso/ayuda" y no como un gasto pesado:
- **¿Qué pasa si 5 plomeros de Alberdi pagan el Plan Oro?** ¿Quién sale primero?
- **¿Qué pasa si 1 tienda de ropa con Plan Oro sube 30 productos?** ¿Aparecen sus 30 productos copando la primera página y tapando a todos los demás?

### Comparativa profunda: Opción A vs. Opción B

#### Opción A: El Plan vive al 100% en el Negocio (Todas las publicaciones heredan la prioridad)
*En la Opción A pura, pagar Oro hace que CADA servicio o producto de ese negocio salga con máxima prioridad.*

- **Por qué era tentadora (Pros):**
  1. Un único cobro mensual por negocio (protege los márgenes en tickets de \$1.500 y \$2.500).
  2. Cero configuración para el comerciante ("Pago Oro y todo mi local es Oro").
  3. Coherencia visual total en mapa y perfil (Pin, Banner y Verificado pertenecen al negocio).
  4. Venta por capacidad natural (Gratis = 2 publicaciones → Plata = 10 → Oro = Ilimitadas).
  5. Triggers más simples al vencer la suscripción.
  6. Explicación comercial en 15 segundos con folleto en mano.
- **Por qué la DESCARTAMOS (Contras):**
  1. **Monopolio en el buscador (Efecto Avalancha):** Un solo comercio Oro que sube 30 prendas inunda la página 1 del buscador y borra del mapa a los demás comercios que también pagaron.
  2. **Sin destaque granular:** Una estética con 10 servicios no puede priorizar su oferta de temporada (ej. depilación) sobre los demás ítems.
  3. **Rigidez en multirrubros:** Todos los servicios pesan exactamente lo mismo.
  4. **Empate masivo:** Si 10 pizzerías pagan \$2.500, todas sus comidas empatan en `prioridad = 20`.
  5. **Bajo valor percibido para oficios de un solo servicio:** El plomero que solo publica "Plomería General" siente que pagar Oro por "publicaciones ilimitadas" es un desperdicio para él.
  6. **Caída abrupta:** Si vence el mes, todo el negocio pierde visibilidad de golpe.

#### Opción B (ELEGIDA): Modelo Híbrido — Plan en `negocios` + Cupos de Destacados (`cupos_destacados`) en `publicaciones`
*La suscripción se sigue pagando una sola vez por `negocio` (\$0 / \$1.500 / \$2.500 ARS), desbloqueando herramientas para todo el local (Sello Verificado, Pin en Mapa, Sucursales, Reels, Estadísticas, Capacidad de Catálogo). Pero para destacar en búsquedas y portada, el plan otorga un cupo limitado de **Estrellas de Vidriera (Cupos de Destacados)** que el comerciante asigna a publicaciones específicas:*
- **Plan Gratis (\$0):** hasta 2 publicaciones, 1 ubicación, **0 cupos de destacados**.
- **Plan Plata (\$1.500 ARS):** hasta 10 publicaciones, hasta 3 sucursales, **1 cupo de destacado** (`cupos_destacados = 1`).
- **Plan Oro (\$2.500 ARS):** publicaciones ilimitadas, hasta 10 sucursales, **3 cupos de destacados** (`cupos_destacados = 3`).

- **Por qué gana la Opción B (6 Beneficios Clave):**
  1. **Evita el monopolio en las búsquedas:** Aunque una tienda Oro suba 40 productos, solo puede tener **3** con `es_destacada = true`. El buscador muestra variedad y competencia leal entre todos los que pagan.
  2. **Justo tanto para oficios como para comercios grandes:** El plomero con 1 solo servicio le pone su estrella a ese servicio; la tienda con 20 productos elige sus 3 caballitos de batalla del mes.
  3. **Fomenta el engagement y la retención:** El comerciante entra al panel los viernes para rotar qué productos deja destacados el fin de semana, manteniendo la plataforma viva.
  4. **Mantiene el cobro único y bajo:** Sigue siendo una sola suscripción mensual de \$1.500 o \$2.500 por negocio, sin micropagos engorrosos por publicación.
  5. **Reglas claras en la base de datos:** `negocios.cupos_destacados_max` define el límite y `publicaciones.es_destacada` se valida mediante trigger (`COUNT(*) WHERE es_destacada = true <= cupos_destacados_max`).
  6. **Sección "Destacados de Alberdi" curada en la Portada:** Permite armar una vidriera principal con lo mejor de cada comercio en lugar de 20 filas del mismo local.

- **Cómo mitigamos las contras de la Opción B en el esquema:**
  1. *Riesgo: El comerciante no técnico se olvida de marcar las estrellitas* → **Solución (Auto-asignación):** Al crear una publicación en Plata u Oro, si el negocio todavía tiene cupos libres, el backend marca automáticamente `es_destacada = true`.
  2. *Riesgo: ¿Quién va primero si 5 plomeros pagan Oro en el mismo rubro?* → **Solución (Algoritmo de Ranking Justo):** Dentro del mismo nivel de plan, los empates se resuelven dinámicamente mediante `configuracion_sistema.semilla_rotacion_ranking` (rotación horaria/diaria para que todos tengan las mismas impresiones arriba), ponderado por `negocios.ultima_actividad_en` (premia subir Reels o actualizar catálogo), `porcentaje_completitud` y `rating_promedio`.
  3. *Riesgo: Si baja de plan le quedan demasiadas destacadas o sucursales* → **Solución:** Un trigger al vencer la membresía desmarca el excedente de `es_destacada`, desactiva sucursales secundarias (`activa_por_plan = false`) y pasa las publicaciones que superen el límite gratuito a `estado = 'pausada_por_plan'` (sin borrar datos del comerciante).

---

## 5. Comparativa frente a la plataforma de referencia (GoyaNova → Mi Alberdi)

| Problema en GoyaNova | Solución en Mi Alberdi ([`.doc/mi-alberdi.dbml`](file:///d:/_Gasco/programacion/mi-alberdi/.doc/mi-alberdi.dbml)) |
| :--- | :--- |
| **Tabla monolítica de 42 columnas (`servicios`)** | Separación limpia en `negocios`, `ubicaciones_negocio`, `horarios_negocio`, `negocios_metodos_pago`, `publicaciones` e `imagenes_publicacion`. |
| **Sin distinción entre local físico y trabajador a domicilio** | Campo `tipo_perfil` (`comercio`, `oficio`, `profesional`, `emprendimiento`), `atiende_a_domicilio`, `matricula_profesional` y privacidad de dirección (`mostrar_direccion_exacta`). |
| **1 sola dirección por publicación (sin soporte multi-sucursal)** | Tabla `ubicaciones_negocio` con `nombre_sucursal`, `whatsapp_sucursal` y límite gobernado por plan (`max_sucursales`: 1, 3 o 10). |
| **Catálogo descargado completo al cliente (`limit=200`)** | Búsqueda nativa Full-Text en Postgres (`search_vector tsvector` + `pg_trgm`) y paginación en servidor (`idx_negocios_ranking`, `idx_publicaciones_busqueda`). |
| **Pésimo SEO (SPA con solo 5 URLs en el sitemap)** | Columnas de `slug` únicas y obligatorias en `rubros_grupos`, `categorias`, `negocios` y `publicaciones` para renderizado indexable (SSR/SSG). |
| **Taxonomía rígida (subcategorías solo en Turismo)** | Jerarquía limpia: `rubros_grupos` (con flag `destacado_portada`) → `categorias` (con autorreferencia `parent_id` para subcategorías en cualquier rubro). |
| **Enlaces ciegos a WhatsApp (sin métricas de retorno para el cliente)** | Tabla de primera clase `eventos_analitica` para auditar `clic_whatsapp`, `escaneo_qr`, `vista_reel`, `vista_negocio`, `vista_publicacion`, `ubicacion_id` y el `origen` del tráfico. |
| **Fugas de PII en feedback y exposición de `usuario_id`** | Tablas `feedback_plataforma`, `auditoria_accesos` y `solicitudes_verificacion` aisladas solo para admin/moderador; `propietario_id` oculto de proyecciones públicas. |

---

## 6. Reglas operativas para la implementación

1. **Entitlements materializados (`negocios.entitlements`):**
   - Copiar `planes_catalogo.caracteristicas_base`, `prioridad_base`, `cupos_destacados` y `max_sucursales` en `negocios` al activarse o renovarse una membresía. Las lecturas públicas leen directo de `negocios` sin hacer joins con tablas de facturación.
2. **Flexibilidad en métodos de pago locales (`pagos_membresia`):**
   - Soportar `pasarela = 'mercadopago'`, `'transferencia_manual'` (con `comprobante_url` para transferencias directas por alias en Alberdi) y `'promo'` (`codigos_promocionales`).
3. **Horario cortado por la siesta (`horarios_negocio`):**
   - Soportar turnos de mañana (`apertura_manana`/`cierre_manana`) y tarde (`apertura_tarde`/`cierre_tarde`) respetando la costumbre comercial de Alberdi, además del flag `horario_corrido` y horario específico por sucursal (`ubicacion_id`).
4. **Cascada de resolución de WhatsApp:**
   - En una publicación: usa `publicaciones.whatsapp_especifico` → si es `NULL`, usa `negocios.whatsapp_principal`.
   - En una sucursal del mapa: usa `ubicaciones_negocio.whatsapp_sucursal` → si es `NULL`, usa `negocios.whatsapp_principal`.

---

## 7. Mapa de dominio (18 tablas en 6 contextos delimitados)

| Contexto | Tablas | Responsabilidad Principal |
| :--- | :--- | :--- |
| **1. Identidad y Seguridad** | `perfiles_usuarios`, `auditoria_accesos` | Perfil de usuario (que puede ser dueño de múltiples negocios/oficios), rol y auditoría de accesos. |
| **2. Facturación y Planes** | `planes_catalogo`, `membresias`, `pagos_membresia`, `codigos_promocionales` | Catálogo de planes (\$0 / \$1.500 / \$2.500), suscripciones activas, pagos y promociones. |
| **3. Taxonomía** | `rubros_grupos`, `categorias`, `metodos_pago_catalogo` | Árbol jerárquico limpio (`rubros_grupos` → `categorias` → `parent_id`) y catálogo de medios de pago. |
| **4. Núcleo Comercial** | `negocios`, `ubicaciones_negocio`, `horarios_negocio`, `negocios_metodos_pago`, `publicaciones`, `imagenes_publicacion` | Vidriera del comercio u oficio, sucursales y pines de mapa, horarios de siesta, catálogo y cupos de destacados. |
| **5. Retención y ROI** | `reels_historias`, `opiniones`, `eventos_analitica` | Historias de 24h, reseñas con respuesta del comerciante y telemetría de conversión (incluyendo por sucursal). |
| **6. Moderación y Sistema** | `solicitudes_verificacion`, `reportes_moderacion`, `feedback_plataforma`, `configuracion_sistema` | Verificación de comercios/matrículas, denuncias, feedback privado, semilla de rotación y mantenimiento. |

---

## Recursos asociados

- **Esquema DBML Canónico:** Ver [`.doc/mi-alberdi.dbml`](file:///d:/_Gasco/programacion/mi-alberdi/.doc/mi-alberdi.dbml)
- **Ingeniería Inversa de Producto (GoyaNova):** Ver [`.doc/goyanova/producto-goyanova.md`](file:///d:/_Gasco/programacion/mi-alberdi/.doc/goyanova/producto-goyanova.md)
- **Ingeniería Inversa de Arquitectura (GoyaNova):** Ver [`.doc/goyanova/arquitectura-goyanova.md`](file:///d:/_Gasco/programacion/mi-alberdi/.doc/goyanova/arquitectura-goyanova.md)
