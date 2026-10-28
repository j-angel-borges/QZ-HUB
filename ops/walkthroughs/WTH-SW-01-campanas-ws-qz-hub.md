# WALKTHROUGH TÉCNICO: MÓDULO DE CAMPAÑAS WS (TICK TOOL — BLUETICKS ALTERNATIVE) & EXTENSIÓN DESPACHADORA MV3

> **Documento ID:** `WT-01-CAMPANAS-WS-QZ-HUB`  
> **Fecha de Ejecución:** 19 de Octubre de 2026  
> **Repositorios Impactados:**  
> 
> - `D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB` (`#prospeccion` — Redisposición Dual + Consola/Preview Tick Tool + Extensión MV3)  
> - `D:\1_jose_angel\1_GitHub\Zentry\zentry-prospecc-crm` (Modal y Vista Standalone de Campañas WhatsApp + Selección de Leads en Tabla)  

---

## 1. RESUMEN EJECUTIVO DE LA SOLUCIÓN

Se diseñó e implementó de extremo a extremo el ecosistema **Tick Tool** como reemplazo propio, ilimitado y sin marcas de agua de *Blueticks* para la operación comercial de **ZentryOS / QZ-Hub**:

1. **Redisposición Visual en `QZ-Hub (#prospeccion)`:**
   
   - Siguiendo exactamente el esquema de diseño solicitado, la sección **🎯 Gestión comercial** mantiene en la parte superior centrada el encabezado descriptivo y la tarjeta de acceso rápido a **ZentryOS-Prospect (Evaluación)** (`zentry-prospecc.web.app`).
   - Debajo se despliega una **grilla dual de 2 columnas lado a lado (`prospeccion-dual-embeds-grid`)**:
     - **Columna Izquierda:** Embed en vivo de **CRM Gestión Comercial** (`https://zentry-prospecc.web.app/crm`).
     - **Columna Derecha:** Nuevo módulo **Tick Tool — Campañas WhatsApp** con **Vista Previa Interactiva en Vivo**, **Wizard de 4 pasos**, **Monitor de Cola (`whatsapp_outbox`)**, **Simulador del Popup de la Extensión Chrome** y conmutador instantáneo entre **Consola Nativa** e **Iframe Remoto** (`https://zentry-prospecc.web.app/?view=tick-tool`).

2. **Eliminación Total de Restricciones de Blueticks:**
   
   - **Cero Marcas de Agua:** Ningún mensaje incluye firmas publicitarias (`Powered by blueticks.co`).
   - **Sin Límite de 3 Mensajes:** Soporte ilimitado de campañas y secuencias encadenadas, gobernado únicamente por el **Límite de Lote Diario Seguro** configurable (por defecto `35 mensajes/día`).
   - **Sincronización Directa vía Cloud Firestore (Sin CSVs manuales):** Lectura directa de `leads_expo_maternidad` y escritura en tiempo real en `whatsapp_campaigns` y `whatsapp_outbox`.

---

## 2. ARQUITECTURA Y ARCHIVOS CREADOS / MODIFICADOS

### A. En `QZ-HUB` (`D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB`)

| Archivo                                         | Acción         | Descripción Técnica                                                                                                                                                                                                                                                                                                                                                     |
|:----------------------------------------------- |:-------------- |:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/tick-tool.js`                              | **Creado**     | Motor completo de **Tick Tool** incrustado en el panel derecho de `#prospeccion`: Wizard de 4 pasos, interpolación de variables (`{First Name}`, `{Display Name}`, `{Phone}`, `{Origin}`, `{District}`), vista previa en burbuja de WhatsApp, monitor en vivo de `whatsapp_outbox`, simulador interactivo de la extensión Chrome MV3 y puente `postMessage` con el CRM. |
| `src/main.js`                                   | **Modificado** | Actualización de `renderers.prospeccion` para implementar el layout de 2 recuadros paralelos (Izquierda: CRM Gestión Comercial, Derecha: Tick Tool & Preview) con el bloque superior centrado.                                                                                                                                                                          |
| `firestore.rules`                               | **Modificado** | Reglas de lectura/escritura habilitadas para las colecciones `whatsapp_campaigns/{campaignId}` y `whatsapp_outbox/{outboxId}`.                                                                                                                                                                                                                                          |
| `extensions/zentry-ws-dispatcher/manifest.json` | **Creado**     | Configuración Manifest V3 con permisos `storage`, `alarms`, `tabs`, `scripting` y `host_permissions` para `https://web.whatsapp.com/*`, Firestore y QZ-Hub.                                                                                                                                                                                                             |
| `extensions/zentry-ws-dispatcher/background.js` | **Creado**     | Service Worker MV3 que gestiona la cola `whatsapp_outbox`, aplica el **Jitter obligatorio (45s a 110s)**, controla el lote diario (`35/día`), sincroniza con Firestore REST/Bridge y procesa el trigger de parada cuando un prospecto responde (`replied` / `cancelled`).                                                                                               |
| `extensions/zentry-ws-dispatcher/content.js`    | **Creado**     | Script inyectado silencioso en `web.whatsapp.com` y `QZ-Hub`: ejecuta el despacho limpio en el DOM de WhatsApp Web sin marcas de agua y monitorea mensajes entrantes (Inbound) mediante `MutationObserver` para abortar follow-ups automáticamente.                                                                                                                     |
| `extensions/zentry-ws-dispatcher/popup.html`    | **Creado**     | Interfaz visual del indicador de estado de la extensión: *"WhatsApp Web Conectado"*, *"Campaña Activa"*, *"Lote en Progreso (X/35)"*, próximo Jitter y botón de **Pausa de Emergencia**.                                                                                                                                                                                |
| `extensions/zentry-ws-dispatcher/popup.js`      | **Creado**     | Controlador reactivo del popup conectado a `background.js` para pausar/reanudar lotes, simular respuestas entrantes y despachar mensajes en cola.                                                                                                                                                                                                                       |

### B. En `zentry-prospecc-crm` (`D:\1_jose_angel\1_GitHub\Zentry\zentry-prospecc-crm`)

| Archivo                             | Acción         | Descripción Técnica                                                                                                                                                                                                                                                                                    |
|:----------------------------------- |:-------------- |:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/services/whatsappCampaigns.ts` | **Creado**     | Servicio TypeScript para normalización de teléfonos de Perú (`+51...`), interpolación de placeholders, cálculo de Jitter (`45000ms`–`110000ms`), creación de campañas en `whatsapp_campaigns`, encolado en `whatsapp_outbox` y cancelación automática de follow-ups al detectar respuesta (`replied`). |
| `src/components/TickToolModal.tsx`  | **Creado**     | Componente React del **Wizard de 4 pasos (Tick Tool)**, monitor de cola `whatsapp_outbox` y vista previa interactiva de la extensión Chrome. Soporta modo modal dentro del CRM y modo standalone (`/?view=tick-tool`).                                                                                 |
| `src/components/OriginalAdmin.tsx`  | **Modificado** | Incorporación de columna de checkboxes en la tabla tipo Excel para selección manual de prospectos, emisión de eventos `window.parent.postMessage({ type: 'ZENTRY_CRM_SELECTION' })` hacia QZ-Hub y botón superior **"💬 Campañas WS"**.                                                                |
| `src/App.tsx`                       | **Modificado** | Soporte de enrutamiento para `/tick-tool`, `?view=tick-tool` y `#tick-tool` permitiendo incrustar o abrir Tick Tool en ventana dedicada.                                                                                                                                                               |

---

## 3. FLUJO FUNCIONAL DEL WIZARD DE 4 PASOS (PARTE A)

1. **Paso 1 — Audience (Audiencia):**
   - **Por Origen/Etiqueta:** Selección rápida por chips de eventos físicos (`Expo M`, `Rambla Z`, `Hijos F-Rp`, etc.).
   - **Selección Manual por Checkboxes:** Permite marcar/desmarcar prospectos directamente desde la tabla del CRM o dentro del Wizard.
   - **Validación Automática (+51):** Verifica y normaliza números móviles de Perú (9 dígitos que inician con `9` $\rightarrow$ `+519XXXXXXXX`).
2. **Paso 2 — Message & Follow-ups (Mensaje y Árbol de Respuestas):**
   - Editor con inserción en un clic de variables dinámicas: `{First Name}`, `{Display Name}`, `{Phone}`, `{Origin}`, `{District}`.
   - Botón **`+ Añadir Follow-up Automático`**: Permite encadenar múltiples seguimientos si el prospecto no responde tras `12 hours`, `24 hours`, `2 days` o `3 days`.
   - Switch activo por defecto: **"🛑 Detener seguimiento automáticamente si el prospecto responde"**.
   - **Vista Previa Dinámica en Tiempo Real:** Renderiza burbujas nativas de WhatsApp con los datos reales de los leads seleccionados y botón `🔄 Otro Lead` para inspeccionar cómo queda el mensaje en distintos contactos.
3. **Paso 3 — Timing & Cadencia Segura Anti-Baneo:**
   - Modo `Enviar ahora (con Jitter)` o `Programar fecha y hora de inicio`.
   - Configuración de intervalo aleatorio entre envíos (`45s` a `110s` por defecto) y límite de lote diario (`35 mensajes/día`).
4. **Paso 4 — Review & Guardar en Firestore:**
   - Resumen ejecutivo de contactos válidos, pasos de la secuencia y cadencia.
   - Al pulsar **"🚀 Guardar Campaña en Firestore & Encolar en whatsapp_outbox"**, crea el documento maestro en `whatsapp_campaigns`, genera todos los documentos individuales (mensaje inicial + follow-ups programados) en `whatsapp_outbox` y notifica a la extensión Chrome mediante `ZENTRY_WS_DISPATCHER_SYNC`.

---

## 4. ESQUEMA DE DATOS EN CLOUD FIRESTORE

### 4.1 Colección: `whatsapp_campaigns`

Almacena la configuración maestra y métricas agregadas de cada campaña:

```json
{
  "name": "Campaña VIP Expo Maternidad — ZentryOS",
  "status": "active",
  "audienceOrigins": ["Expo M"],
  "totalContacts": 18,
  "initialMessage": "¡Hola {First Name}! 👋 Qué gusto saludarte...",
  "followUps": [
    {
      "id": "fu-1",
      "stepOrder": 1,
      "delayPreset": "24 hours",
      "delayMs": 86400000,
      "messageTemplate": "Hola {First Name} ✨, paso por aquí rapidito..."
    }
  ],
  "stopOnReply": true,
  "scheduleMode": "now_jitter",
  "scheduledAt": 1760893200000,
  "jitterMinSec": 45,
  "jitterMaxSec": 110,
  "dailyBatchLimit": 35,
  "stats": {
    "pending": 36,
    "dispatched": 0,
    "replied": 0,
    "cancelled": 0
  },
  "createdAt": 1760893200000
}
```

### 4.2 Colección: `whatsapp_outbox`

Almacena cada mensaje individual encolado (tanto el paso inicial `stepOrder: 0` como los follow-ups `stepOrder: 1, 2...`):

- **Estados soportados (`status`):**
  - `pending`: En cola esperando su turno de despacho con Jitter.
  - `dispatched`: Enviado limpiamente por la extensión en WhatsApp Web.
  - `replied`: El prospecto respondió un mensaje entrante (Inbound).
  - `cancelled`: Follow-up abortado automáticamente porque el prospecto ya respondió o por pausa manual.

```json
{
  "campaignId": "camp_abc123",
  "campaignName": "Campaña VIP Expo Maternidad — ZentryOS",
  "leadId": "seed-01",
  "leadName": "Estefani",
  "phone": "+51989079092",
  "origin": "Expo M",
  "district": "San Miguel",
  "stepOrder": 0,
  "renderedMessage": "¡Hola Estefani! 👋 Qué gusto saludarte, soy Jose Angel del equipo de ZentryOS...",
  "status": "pending",
  "stopOnReply": true,
  "jitterDelayMs": 74210,
  "scheduledFor": 1760893274210,
  "dispatchedAt": null,
  "repliedAt": null,
  "cancelledAt": null,
  "createdAt": 1760893200000
}
```

---

## 5. INSTRUCCIONES PARA INSTALAR LA EXTENSIÓN EN CHROME (`chrome://extensions`)

1. Abre Google Chrome o Brave y navega a:
   
   ```text
   chrome://extensions/
   ```
2. En la esquina superior derecha, activa el interruptor **"Modo de desarrollador"** (*Developer mode*).
3. Haz clic en el botón **"Cargar descomprimida"** (*Load unpacked*) que aparece arriba a la izquierda.
4. Selecciona la carpeta del paquete construido en este repositorio:
   
   ```text
   ZFija el ícono de **Zentry WS Dispatcher — Tick Tool** en la barra de herramientas de Chrome (ícono de pieza de rompecabezas 📌).
   ```
5. Abre una pestaña con [https://web.whatsapp.com](https://web.whatsapp.com) con tu sesión vinculada y abre **QZ-Hub** en `#prospeccion`.
6. Al hacer clic sobre el ícono de la extensión verás:
   - **Estado:** `WhatsApp Web Conectado`
   - **Campaña Activa** y **Barra de Progreso del Lote (`X/35`)**
   - **Contador de Jitter aleatorio (`45s - 110s`)**
   - **Botón rojo de Pausa de Emergencia**

---

## 6. VERIFICACIÓN DE COMPILACIÓN (`npm run build`)

Ambos proyectos fueron compilados y validados sin errores:

1. **`zentry-prospecc-crm` (`vite build`):**
   - `✓ 39 modules transformed.`
   - `dist/index.html` y bundles generados con **0 errores**.
2. **`QZ-HUB` (`vite build`):**
   - Compilación de producción completada con `src/tick-tool.js` y `src/main.js` integrados con **0 errores**.

---

## 7. ACTUALIZACIÓN V2: CORRECCIÓN DE SINCRONIZACIÓN CRM, AISLAMIENTO MULTI-SESIÓN Y OVERLAY SUPERPUESTO EN WHATSAPP WEB

### 7.1 Corrección del Bug `"Mamá / 0 de 329 / ⚠️"` en la Preview de Tick Tool
- **Causa raíz identificada:** En Firestore (`leads_expo_maternidad`), muchos de los 329 documentos almacenaban únicamente deltas de edición (`status`, `notes` o `updatedAt`) referenciados por su ID numérico (`"1"`, `"2"`, etc.), mientras que los nombres reales (`nombreMadre`: *Kumar Barrueta*, *Susan Espinoza*, *Andrés Mur*...), celulares (`celular`: *987806711*, *987333219*...) y pestañas (`sheetTab`: `Expo M (JA)`, `Expo M (R)`, `Villa Caritas`, `La Rambla`, `Hijos F-Rp`, `MT`) residían en la base semilla combinada del CRM (`REAL_LEADS_EXPO_MATERNIDAD`). Además, `tick-tool.js` buscaba originalmente `momName`/`phone` en vez de `nombreMadre`/`celular`/`sheetTab`.
- **Solución implementada:**
  1. En `zentry-prospecc-crm/src/services/cloudCrm.ts`: `subscribeToCloudLeads` ahora fusiona cada documento parcial de Firestore con su registro base en `REAL_LEADS_EXPO_MATERNIDAD`.
  2. En `zentry-prospecc-crm/src/components/OriginalAdmin.tsx`: El CRM emite automáticamente `ZENTRY_CRM_LEADS_SYNC` y `ZENTRY_CRM_SELECTION` vía `window.parent.postMessage` hacia `QZ-Hub`.
  3. En `QZ-HUB/src/tick-tool.js`: Se actualizó el mapeador de campos (`nombreMadre`, `celular`, `sheetTab`, `distrito`), se filtraron documentos vacíos sin teléfono válido y se sincronizaron las mismas pestañas exactas del CRM (`Expo M (JA)`, `Expo M (R)`, `Villa Caritas`, `La Rambla`, `Hijos F-Rp`, `MT`).

### 7.2 Validación de Conexión en Vivo y Aislamiento Multi-Sesión (`operatorId`)
- **Barra de Estado en Vivo en Tick Tool:** Muestra en tiempo real uno de 3 estados claros:
  - `🟢 WhatsApp Web Conectado (Sesión Lista)`
  - `🟡 Extensión Detectada · Abre web.whatsapp.com`
  - `🔴 Extensión No Cargada en este Chrome`
- **Aislamiento entre Usuarios / Perfiles de Chrome:**
  - La extensión (`zentry-ws-dispatcher`) vive **localmente dentro del perfil de Chrome** de cada usuario y solo se comunica con la pestaña `https://web.whatsapp.com` abierta en **esa misma computadora y perfil de Chrome**.
  - Adicionalmente, cada sesión genera un `operatorId` único (`OP-XXXX`) en `localStorage` para etiquetar sus campañas y mensajes en `whatsapp_outbox`, evitando que los envíos de otro operador se mezclen con tu WhatsApp Web.
- **Botones de Diagnóstico Inmediato:**
  - `🔌 Validar Conexión Ahora`: Hace ping instantáneo al Service Worker y verifica si `web.whatsapp.com` está abierto.
  - `⚡ Probar Envío Real`: Permite enviar un mensaje de prueba inmediato (sin marca de agua) para comprobar visualmente el despacho automático.

### 7.3 Herramientas Superpuestas dentro de WhatsApp Web (Estilo Blueticks)
En `extensions/zentry-ws-dispatcher/content.js` se inyectan dos componentes superpuestos directamente sobre `https://web.whatsapp.com`:
1. **Barra Superior Superpuesta (`#zentry-wa-topbar`):**
   - Pestañas de filtrado rápido de chats: `Todos`, `Bandeja De Entrada`, `Resolver Después`, `Necesita Atención`, `No Leídos`.
   - Indicador `🟢 Tick Tool WS` + píldora de cuenta regresiva en vivo (`⏳ Enviando a ... en Xs`) + botón `⏰ Programar Mensaje / Prueba` y acceso rápido a `🚀 QZ-Hub`.
2. **Botón Reloj/Destello en el Compositor Inferior (`#zentry-wa-schedule-btn`):**
   - Ubicado justo al lado del cuadro `"Escribe un mensaje"` del chat activo.
   - Al pulsarlo, abre el **Modal de Programación Rápida en el Chat** con opciones de:
     - `⚡ Prueba en 10 seg` (ideal para ver en vivo cómo la extensión escribe y presiona Enviar sola en el chat abierto).
     - `⏱️ En 1 min`, `⏱️ En 5 min`, `⏱️ En 1 hora` o `📅 Fecha/Hora exacta`.

---

## 8. ACTUALIZACIÓN V3 (v1.2.0): ENVÍO AUTOMÁTICO INMEDIATO (0s EN 1ER CONTACTO), EXPLICACIÓN CLARA DE JITTER Y PESTAÑA DE ENVÍO INDIVIDUAL CON CAPTURA DE AGENDA WHATSAPP WEB

### 8.1 Clarificación Visual de Jitter y Límite Diario en Paso 3
- Se reemplazó el bloque técnico de código JavaScript (`const jitterDelay = ...`) por una explicación en español claro e intuitivo dentro del **Paso 3 (Timing)**:
  - **1er Contacto (`0 seg` de espera):** Sale **inmediatamente** apenas lanzas la campaña o haces una prueba de 1 contacto.
  - **2do Contacto en adelante (`Jitter 45s - 110s`):** Pausa humana aleatoria entre un contacto y el siguiente cuando envías campañas masivas, imitando a una persona real escribiendo para evitar bloqueos de WhatsApp.
  - **Límite Lote Diario (`35/día`):** Tope seguro de conversaciones nuevas iniciadas por día.

### 8.2 Corrección Definitiva del Despacho Automático Sin Clics Manuales (`manifest.json`, `background.js`, `content.js`)
- **Dominios autorizados en `manifest.json`:** Se agregaron explícitamente `https://qz-hub-app.web.app/*` y `https://quarz-group.web.app/*` en `host_permissions` y `content_scripts.matches` para que el puente entre `QZ-Hub` y `zentry-ws-dispatcher` funcione en todas las URLs de producción.
- **Despacho en `0 seg` para el primer contacto:** En `handleSaveCampaignToFirestore` (`src/tick-tool.js`), el primer contacto de cualquier campaña (`idx === 0`) ahora se programa con `0ms` de retardo (`scheduledFor = baseStartTime`) y dispara automáticamente `ZENTRY_TICKTOOL_DISPATCH_NOW` hacia la extensión.
- **Auto-Clic en Botón Enviar + Fallback `Enter` en `content.js`:** Cuando la extensión abre o navega a un chat (`https://web.whatsapp.com/send?phone=...&text=...`), `waitForSendButtonAndDispatch()` espera a que cargue el cuadro de texto, hace clic automático en el botón `Enviar` (`span[data-icon="wds-ic-send-filled"]` / `button[aria-label="Enviar"]`) y además incluye un fallback automático que dispara el evento de teclado `Enter` sobre el compositor `#main footer div[contenteditable="true"]`.

### 8.3 Nueva Pestaña `"👤 Envío Individual & Agenda WS"` y Captura de Contactos de WhatsApp Web
- **En `QZ-Hub` (`src/tick-tool.js`):**
  - Se añadió la pestaña dedicada **`👤 Envío Individual & Agenda WS`** junto al Wizard de Campaña.
  - Incluye el botón **`🔄 Capturar Agenda de mi WhatsApp Web`** que lee los contactos y chats visibles de tu sesión abierta de WhatsApp Web y los unifica con los prospectos del CRM en un buscador instantáneo.
  - Permite seleccionar cualquier contacto con un clic, redactar el mensaje personalizado y elegir entre **`⚡ Enviar Ahora Mismo (0 seg)`** o **`📅 Programar Fecha y Hora`** de forma 100% automática.
- **Dentro de WhatsApp Web (`content.js`):**
  - El modal superpuesto (`⏰ Programar Mensaje / Prueba`) ahora también incluye un **Buscador de Agenda de Contactos de WhatsApp Web** (`scrapeWhatsAppAgendaContacts()`), permitiendo buscar cualquier chat/contacto de tu agenda o escribir un número `+51...` y despachar/programar sin salir de WhatsApp Web.

---

## 9. ACTUALIZACIÓN V4 (v1.3.0): ADJUNTAR ARCHIVOS (IMÁGENES, PDF, BROCHURES, VIDEOS) EN CAMPAÑAS / FOLLOW-UPS / ENVÍO INDIVIDUAL + DESPACHO ULTRA-RÁPIDO SPA (~2-4 SEGUNDOS)

### 9.1 Soporte Completo de Archivos Adjuntos (`📎 Adjuntar Archivos`)
Se habilitó la carga y envío automático de archivos adjuntos (`image/*`, `video/*`, `.pdf`, `.doc/.docx`, `.xls/.xlsx`, `.ppt/.pptx`) en todos los puntos del ecosistema **Tick Tool**:
1. **Campañas Masivas (Paso 2 — Mensaje Inicial):**
   - Nuevo bloque **`📎 Adjuntar Archivos a la Campaña (Imágenes, PDF, Brochure, Video)`** con botón `+ Seleccionar Archivo(s)` tanto en `QZ-HUB/src/tick-tool.js` como en `zentry-prospecc-crm/src/components/TickToolModal.tsx`.
   - Muestra miniaturas de imágenes, nombre/peso del archivo, botón `✕` para quitar y **vista previa en tiempo real dentro de la Burbuja de WhatsApp** (Paso 2 y Resumen Paso 4).
2. **Árbol de Follow-ups (Paso 2):**
   - Cada paso de seguimiento (`Follow-up #1`, `#2`, etc.) cuenta con su propio botón **`📎 + Adjuntar archivo al Follow-up`** para enviar brochures o recordatorios visuales si el prospecto no responde.
3. **Pestaña `👤 Envío Individual & Agenda WS` y Modal Superpuesto en WhatsApp Web:**
   - Selector **`📎 Adjuntar Archivo / Imagen / PDF a este mensaje`** (`#tick-indiv-files-input` y `#ztt-modal-files`) para acompañar cualquier mensaje directo o programado con archivos multimedia.

### 9.2 Inyección Automática de Archivos en WhatsApp Web (`content.js` + `background.js`)
- En `background.js` y `manifest.json` (`v1.3.0`, permiso `unlimitedStorage`), los archivos codificados en Base64 (`dataUrl`) viajan junto al ítem de `whatsapp_outbox` hacia el Content Script.
- En `content.js`, la función `dispatchAttachmentsAndTextInActiveChat()` convierte cada `dataUrl` en un objeto nativo `File` mediante `dataUrlToFile()`, construye un `DataTransfer` y dispara un `ClipboardEvent('paste')` (con fallback a `DragEvent('drop')`) directamente sobre el compositor del chat activo.
- Inmediatamente detecta el modal de vista previa multimedia de WhatsApp Web (`findMediaModalSendButton()`) y pulsa el botón verde de envío automáticamente.

### 9.3 Aceleración del Envío en `0s` (De 1-2 minutos a ~2-4 segundos)
- **Causa de la demora previa (1-2 min):** Navegar mediante `window.location.href = https://web.whatsapp.com/send?phone=...` forzaba una recarga completa de toda la aplicación web de WhatsApp en cada mensaje.
- **Solución SPA Instantánea (`searchAndOpenContactByNameAndSend`):** Ahora, incluso cuando el destino tiene número telefónico, `content.js` primero busca el teléfono o nombre en el buscador lateral nativo de WhatsApp Web (`#side div[contenteditable="true"]`) y abre el chat con un clic sin recargar la página (~1.5 segundos). Solo si el número es nuevo y no aparece en la búsqueda, recurre a la navegación por URL como respaldo.
- Además, el retardo de disparo inicial en `background.js` se redujo de `1500ms-2000ms` a `400ms`.

### 9.4 Corrección Definitiva del Doble Envío / Reenvío Automático (`tick-tool.js`, `background.js`, `content.js`)
Al analizar por qué un mensaje se enviaba dos veces seguidas, se identificaron y corrigieron **3 causas de condición de carrera en el código** (no fue un error de configuración tuyo):
1. **Doble señal desde `tick-tool.js` al lanzar campaña (`ZENTRY_TICKTOOL_PUSH_QUEUE` + `ZENTRY_TICKTOOL_DISPATCH_NOW`):**
   - `TICKTOOL_PUSH_CAMPAIGN_QUEUE` en `background.js` ya ejecutaba automáticamente `processNextOutboxItem(true)` cuando detectaba un mensaje inmediato (`0s`), y `250ms` después `tick-tool.js` volvía a emitir `ZENTRY_TICKTOOL_DISPATCH_NOW`, disparando un segundo `processNextOutboxItem(true)` concurrente antes de que el primero terminara de marcarse en Firestore.
   - **Corrección:** Se eliminó el segundo disparo redundante en `tick-tool.js` y se añadió un candado mutex (`isProcessingDispatchLock`) + un `Set` en memoria (`dispatchedOutboxIdsMemory`) en `background.js`, marcando el mensaje como `dispatched` **antes** de enviarlo a la pestaña.
2. **Desfase de ID en Envío Individual (`handleIndividualSend` vs `fetchPendingOutboxFromFirestore`):**
   - En `tick-tool.js`, `handleIndividualSend()` guardaba el mensaje en Firestore con su ID real (`docRef.id`), pero al notificar a la extensión (`ZENTRY_TICKTOOL_TEST_SEND`) no le pasaba ese `id`, por lo que `background.js` creaba un ID temporal `direct_...`. Cuando la alarma de 30s (`fetchPendingOutboxFromFirestore`) leía Firestore, veía el documento `docRef.id` todavía en `pending` y lo volvía a despachar por segunda vez.
   - **Corrección:** Ahora `handleIndividualSend` envía el `id: outboxItem.id` exacto de Firestore, y `fetchPendingOutboxFromFirestore()` fusiona el estado local (`dispatched`) para que ningún poll de Firestore pueda revertir un mensaje ya enviado a `pending`.
3. **Heartbeat de 12s en `content.js` con parámetros URL `/send?phone=...`:**
   - Si la URL de WhatsApp Web conservaba `?phone=...&text=...` o `inFlightDispatch` seguía activo mientras el heartbeat de 12 segundos corría, `waitForSendButtonAndDispatch()` podía volver a invocarse.
   - **Corrección:** Se agregaron `completedOutboxIds` e `isDispatchingInTab` en `content.js`, además de `cleanWhatsAppSendUrlParams()` (`history.replaceState`) inmediatamente después de cada envío.

### 9.5 Corrección del Auto-Envío en el Modal de Vista Previa de Archivos Adjuntos (`content.js`)
- **Causa por la que los archivos se quedaban esperando clic manual en la vista previa:**
  - En `dispatchAttachmentsAndTextInActiveChat()`, primero se escribía el texto en el compositor inferior (`#main footer`), lo que hacía aparecer de inmediato el botón verde `Enviar` del pie de página.
  - Al pegar el archivo (`ClipboardEvent('paste')`), WhatsApp Web tarda ~600ms en montar el modal de vista previa de archivos a pantalla completa. Sin embargo, en el primer ciclo de búsqueda (`350ms`), `findMediaModalSendButton()` tenía un fallback (`if (nodes.length > 0) return nodes[nodes.length - 1]`) que devolvía por error el botón `Enviar` del `#main footer` en lugar de esperar al botón `Enviar` del modal de archivos, deteniendo el `setInterval` antes de que el modal terminara de abrirse.
- **Solución implementada en `extensions/zentry-ws-dispatcher/content.js`:**
  1. **`findMediaModalSendButton()` estricto:** Se eliminó el fallback que capturaba botones dentro de `#main footer` (`if (n.closest('#main footer')) continue;`), exigiendo además que el botón tenga dimensiones visibles (`rect.width > 0 && rect.height > 0`) dentro del overlay de vista previa multimedia.
  2. **Detección del Caption del Modal (`findMediaModalCaptionBox()`):** Localiza el `div[contenteditable="true"]` exclusivo del modal de vista previa de archivos para asegurar que el texto/caption quede escrito en el archivo.
  3. **Ciclo persistente de confirmación de cierre (`modalWasOpened && !modalSendBtn`):** Una vez que aparece el modal de vista previa (`modalWasOpened = true`), espera `400ms` para que WhatsApp Web termine de renderizar la miniatura/PDF y luego pulsa el botón verde del modal (`simulateSafeUserClick(modalSendBtn)` + fallback `Enter` en el caption) hasta confirmar que el modal de vista previa se cerró por completo.

### 9.6 Erradicación de `Extension context invalidated` y Soporte Nativo de Videos Adjuntos (`<input type="file">`)
1. **Por qué salía `Uncaught Error: Extension context invalidated` y `Cannot read properties of undefined (reading 'sendMessage')` (`Captura 163415.png`):**
   - Cuando recargas la extensión en `chrome://extensions/`, Chrome destruye el contexto de la versión anterior, pero el `content.js` antiguo que seguía corriendo en la pestaña abierta de WhatsApp Web mantenía activos sus `setInterval` y `MutationObserver` intentando llamar a `chrome.runtime.sendMessage`.
   - **Solución definitiva:**
     - Se implementaron `isExtensionContextValid()`, `safeRuntimeSendMessage()` y `window.__zentryTickToolCleanup()` en `content.js` para detener automáticamente cualquier timer/observer antiguo en cuanto el contexto cambia.
     - En `background.js` se añadió `reinjectContentScriptIntoOpenTabs()` en `chrome.runtime.onInstalled`, que reinyecta automáticamente el nuevo `content.js` en las pestañas abiertas de WhatsApp Web y QZ-Hub apenas recargas la extensión.
2. **Por qué el Video Adjunto demoraba o no abría con `paste`:**
   - A diferencia de las imágenes PNG/JPG, WhatsApp Web muchas veces ignora el evento `ClipboardEvent('paste')` cuando el archivo es un **video (`.mp4`, `.mov`, `.webm`)** y además tarda entre **1.5s y 4s** en decodificar los fotogramas del video antes de habilitar el botón verde de enviar (`aria-disabled="false"`).
   - **Solución de 3 canales en `dispatchAttachmentsAndTextInActiveChat()` (`content.js`):**
     - **Canal 1 (`t=0ms`):** `ClipboardEvent('paste')`.
     - **Canal 2 (`t=550ms`):** Secuencia completa `dragenter` $\rightarrow$ `dragover` $\rightarrow$ `drop`.
     - **Canal 3 (`t=1200ms`, `injectFilesViaNativeFileInput`):** Inyección directa de los archivos en el `<input type="file">` nativo de WhatsApp Web (abriendo automáticamente el menú `+` / Adjuntar si aún no estaba montado en el DOM).
     - **Espera inteligente de decodificación de video:** Extiende el tiempo máximo de espera a `~26s` para videos, verifica que el botón no esté `aria-disabled="true"` y espera `800ms` tras montarse el reproductor del modal antes de disparar el clic automático y cerrar el modal.


### 9.7 Corrección v1.4.0: Apertura de Chat sin Conversación Previa, Videos Pesados Nativo (`File`) y Registro Inmediato en Cola Outbox (`Grabación 165128.mp4`)
Al analizar el video `Grabación de pantalla 2026-10-19 165128.mp4`, se identificaron y corrigieron **4 puntos críticos**:
1. **Apertura garantizada del chat cuando no hay ninguna conversación abierta en `#main` (`clickChatRowReliably` + `openViaSearchBoxFallback`):**
   - En el video, WhatsApp Web estaba en la pantalla de bienvenida (ningún chat abierto en `#main`) y el usuario seleccionó `"Angel Borges / Archiv"` desde la agenda. Hacer un único clic simple sobre la fila de `#pane-side` en ciertas versiones de WhatsApp Web no abría el panel `#main`.
   - **Solución:** Se creó `clickChatRowReliably(rowEl)` que dispara la secuencia completa de puntero y ratón sobre el contenedor `[role="listitem"]`, `[role="row"]`, celda y título. Además, `searchAndOpenContactByNameAndSend()` ahora verifica si `#main footer` (`findActiveComposer()`) se abrió en `1.5s`; si sigue cerrado, ejecuta automáticamente `openViaSearchBoxFallback()` (escribe el nombre en el buscador `#side`, hace clic en el resultado y pulsa `Enter`).
2. **Inyección instantánea de Videos Pesados (`.mp4`) mediante referencia nativa `File` sin bloqueo de `FileReader` ni IPC:**
   - Cuando se adjuntaba un video pesado (`VID_20230910_040540_whatsapp.mp4`), el navegador tardaba en convertirlo a Base64 (`dataUrl`) o saturaba el mensaje IPC de Chrome (`chrome.runtime.sendMessage` / `chrome.storage.local`).
   - **Solución:** En `#ztt-modal-files` (`content.js`), cada archivo seleccionado guarda de inmediato su instancia nativa `item.file = file` en memoria sin esperar a `FileReader`, y `dispatchAttachmentsAndTextInActiveChat()` usa directamente `att.file` e invoca de forma inmediata `injectFilesViaNativeFileInput(validFiles)` cuando detecta un archivo de video (`hasVideoFile`). En `background.js`, se añadió `stripHeavyAttachmentsForQueue()` y `attachmentVaultMemory` para que la cola guarde metadatos ligeros sin truncar ni bloquear `chrome.storage.local`.
3. **Registro inmediato en `Cola Outbox` (Extensión + QZ-Hub + Zentry CRM + Firestore) incluso en envíos de `0s`:**
   - Anteriormente, cuando se enviaba desde el modal de WhatsApp Web con `0s (Inmediato)`, `scheduleInChatCountdownAndSend()` ejecutaba el envío en la pestaña y hacía `return` antes de llamar a `TICKTOOL_SCHEDULE_INCHAT_MESSAGE`, por lo que el envío no quedaba registrado en la pestaña `📬 Cola Outbox`.
   - **Solución:** Ahora `scheduleInChatCountdownAndSend()` registra siempre el ítem en `background.js` (`TICKTOOL_SCHEDULE_INCHAT_MESSAGE` con `dispatchedDirectly: true`), y `background.js` invoca `createFirestoreOutboxDoc(newItem)` para escribirlo simultáneamente en `outboxQueue` local y en Cloud Firestore (`whatsapp_outbox` de `zentryos` y `quarz-group`). Asimismo, `src/tick-tool.js` fusiona en tiempo real `state.outboxQueue` de la extensión dentro de la tabla `📬 Cola Outbox`.
4. **Soporte de dominio `https://zentry-prospect.web.app/*` en `manifest.json` (`v1.4.0`):**
   - Se agregaron `https://zentry-prospect.web.app/*` y `https://zentry-prospect.firebaseapp.com/*` a `host_permissions` y `content_scripts` para que el CRM embebido reconozca siempre la extensión al pulsar **`🔄 Validar Conexión Ahora`**.

### 9.8 Corrección v1.5.0: Envío de Videos como Video Reproducible (No Documento) y Captura Behind-the-Scenes Sin Abrir el Explorador Nativo (`Grabación 172752.mp4` y `173148.mp4`)
1. **Por qué se enviaba como Documento en lugar de Video (`Grabación 172752.mp4`):**
   - WhatsApp Web monta en el menú `+` múltiples `<input type="file">`: el primero en el DOM tiene `accept="*"` (correspondiente a **Documento**), mientras que el de **Fotos y videos** tiene `accept="image/*,video/mp4,video/3gpp,video/quicktime"`. Al seleccionar `inputs[0]`, el video caía en el input de Documentos.
   - Además, los archivos `.mp4` con tipos MIME variantes (`video/x-matroska`, vacíos o sin normalizar) hacían que WhatsApp Web los degradara a documento.
2. **Por qué pedía clic o abría la ventana del explorador de archivos (`Grabación 173148.mp4`):**
   - Al hacer clic programático en el ítem `"Fotos y videos"` del menú `+`, el navegador disparaba `HTMLInputElement.prototype.click()` sobre el `<input type="file">`, abriendo el diálogo nativo de Windows o fallando si el clic sintético no era reconocido por React Fiber.
3. **Solución Behind-the-Scenes (`page-bridge.js` en `MAIN` world + `content.js`):**
   - Se creó [`extensions/zentry-ws-dispatcher/page-bridge.js`](file:///mnt/d/1_jose_angel/1_GitHub/Quarz/QZ-HUB/extensions/zentry-ws-dispatcher/page-bridge.js) registrado en `manifest.json` con `"world": "MAIN"` y `"run_at": "document_start"`.
   - Cuando `window.__zentryInterceptFilePicker = true`, el puente intercepta `HTMLInputElement.prototype.click` y `window.showOpenFilePicker`: **bloquea la apertura de la ventana de archivos del sistema operativo**, captura la referencia exacta al `<input type="file" accept="image/*,video/mp4...">` creado por WhatsApp Web e inyecta ahí mismo el `DataTransfer.files` invocando directamente el handler interno `__reactProps$.onChange` de React Fiber.
   - Normalización automática de MIME (`normalizeMediaFileForWhatsApp`) forzando `type: 'video/mp4'` y extensión `.mp4` para cualquier video.

### 9.9 Programación Precisa de Follow-ups (Minutos Exactos, Tiempo Personalizado y Selector de Fecha/Hora Exacta `datetime-local`)
En respuesta al requerimiento de configurar con precisión cuándo debe dispararse cada **Follow-up** (por ejemplo, **`+5 min después`** o en una **Fecha y Hora exacta con calendario** igual que el programador del modal):
1. **Nuevas Opciones de Tiempo en Cada Tarjeta de Follow-up (`QZ-HUB/src/tick-tool.js` y `zentry-prospecc-crm/src/components/TickToolModal.tsx`):**
   - **Presets rápidos en minutos, horas y días:** `+1 min después`, `+5 min después`, `+10 min después`, `+15 min después`, `+30 min después`, `+1 hora`, `+6 horas`, `+12 horas`, `+24 horas (1 día)`, `+48 horas (2 días)`, `+72 horas (3 días)`.
   - **Modo `⏱️ Tiempo exacto (Min/Horas/Días)` (`custom_rel`):** Campo numérico libre (`1` a `999`) + selector de unidad (`minutos después` / `horas después` / `días después`).
   - **Modo `📅 Fecha y Hora exacta (Calendario)` (`custom_datetime`):** Selector `<input type="datetime-local">` idéntico al de la captura de referencia (`dd/mm/aaaa --:--`), para elegir el día, hora y minuto exacto del seguimiento.
   - **Píldoras de acceso rápido en 1 clic:** Botones `+1 min`, `+5 min`, `+15 min`, `+1h`, `+24h` y `📅 Fecha/Hora` directamente en cada tarjeta de Follow-up.
2. **Precisión Exacta sin Jitter Artificial en Follow-ups Cortos (`<= 30 min` o `custom_datetime`):**
   - Tanto en `handleSaveCampaignToFirestore` (`QZ-HUB/src/tick-tool.js`) como en `createCampaignAndOutbox` (`zentry-prospecc-crm/src/services/whatsappCampaigns.ts`), cuando un Follow-up es de corta duración (`<= 30 min`, como `1 min` o `5 min`) o tiene una `Fecha y Hora exacta`, se programa con **`fuJitterMs = 0`** para que salga exactamente en el minuto configurado.
   - En `extensions/zentry-ws-dispatcher/background.js`, `scheduleNextDispatchIfIdle()` ahora reprograma siempre la alarma al `scheduledFor` más próximo y añade un `setTimeout` de alta precisión (`preciseFollowUpTimerId`) para esperas menores a 6 minutos.

### 9.10 Mejoras de UX en Paso 1 (Audiencia) y en `📬 Cola Outbox` (Filtro por Campaña y Archivado por Lotes)
En respuesta a los requerimientos de las capturas `175256.png` y `180241.png`, se implementaron en ambos entornos (`QZ-HUB/src/tick-tool.js` y `zentry-prospecc-crm/src/components/TickToolModal.tsx`) las siguientes mejoras:
1. **Paso 1 — Audiencia (`Audience`):**
   - **Ordenamiento automático de seleccionados primero (`sortedLeads` / `visibleAudienceLeads`):** Al hacer clic en cualquier grupo de origen (`Expo M`, `Rambla Z`, `Hijos F-Rp`, etc.) o marcar leads manualmente, todos los contactos seleccionados suben automáticamente a las **primeras filas** de la tabla con insignia `Seleccionado`.
   - **Buscador instantáneo (`🔍 Buscar contacto por nombre, WhatsApp (+51), grupo o distrito...`):** Filtra en tiempo real con botón `✕` para limpiar búsqueda.
   - **Deslizador de Control (`🎚️ Deslizador de Lista`):** Barra `<input type="range" min="0" max="100">` sincronizada bidireccionalmente con el scroll de la tabla + botones `⬆️ Subir` y `⬇️ Bajar` para desplazarse de forma controlada.
   - **Botón `⤢ Expandir / Ver Más Grande` (`🗕 Contraer Vista`):** Duplica la altura visible de la tabla de leads (`240px–280px` $\leftrightarrow$ `560px`) para inspeccionar listas grandes cómodamente.
2. **Sección `📬 Cola Outbox` (`whatsapp_outbox`):**
   - **Filtro por Campaña (`🎯 Campaña`):** Selector desplegable con todas las campañas registradas + buscador de texto en la cola + clic directo sobre cualquier tarjeta de campaña para aislar únicamente sus mensajes.
   - **Selección Múltiple y Archivado de Mensajes (`📦 Archivar seleccionados`):**
     - Checkboxes individuales por fila y checkbox maestro en el encabezado (`Seleccionar visibles`).
     - Botón **`📦 Archivar seleccionados (N)`** en la barra superior y botón rápido **`📦`** por fila para limpiar mensajes de la vista principal sin perder historial.
     - Nueva tarjeta/pestaña de estado **`📦 Archivados`** con botón **`♻️ Restaurar seleccionados`** para devolver cualquier mensaje archivado a la cola activa (sincronizado en `localStorage` `zentry_archived_outbox_v1` y Firestore `archived: true`).


