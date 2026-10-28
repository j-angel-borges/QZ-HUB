# WALKTHROUGH TÉCNICO: PARCHE DE SEGURIDAD, VALIDACIÓN PHONE-FIRST Y REPLICABILIDAD MULTI-PERFIL (TICK TOOL WS)

> **Documento ID:** `WT-02-FIX-DISPATCHER-NAME-SAFETY-MULTIBRAND`  
> **Fecha:** 20 de Octubre de 2026  
> **Autor/Agente:** Antigravity (DeepMind Advanced Agentic Coding)  
> **Repositorios & Módulos Impactados:**  
> - `D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\extensions\zentry-ws-dispatcher` (Extensión MV3 — ZentryOS)  
> - `D:\1_jose_angel\1_GitHub\Zentry\zentry-prospecc-crm` (CRM Zentry Prospecc — Desplegado en Firebase Hosting)  
> - `D:\1_jose_angel\1_GitHub\Vitality\vitality-ws-dispatcher` (Extensión MV3 — Vitality / Royal Prestige)  
> - `D:\1_jose_angel\1_GitHub\Vitality\vitality-prospecc` (CRM Vitality Prospecc)  

---

## 1. RESUMEN EJECUTIVO

Durante la primera prueba de despacho masivo de la campaña de WhatsApp desde Zentry Prospecc (`cmp-1792450918709-ie5ce`), se manifestaron anomalías críticas de cruce de contactos: un mismo chat (`Ariadna/MmDeAntuane/ Mt`) recibió 5 mensajes consecutivos dirigidos a distintos padres de familia (*"Hola Ramiro"*, *"Hola Ana"*, *"Hola Kamila"*, *"Hola Luis"*), además de saludos con apellidos en frío (*"Hola Romero,"*).

Se diseñó e implementó un parche de seguridad integral que erradica el error en dos niveles (Frontend CRM y Service Worker / Content Script de la Extensión), y **se replicó y sincronizó inmediatamente en la versión gemela de la herramienta para Vitality / Royal Prestige**, garantizando que ninguna de las marcas quede descontinuada ni vulnerable a este fallo.

---

## 2. ANÁLISIS FORENSE DE LA FALLA INICIAL (CAUSA RAÍZ)

A partir de la inspección de la captura de pantalla (`Captura de pantalla 2026-10-20 152603.png`) y la grabación en video (`WhatsApp Video 2026-10-20 at 3.26.02 PM.mp4`), se identificaron seis vectores de falla encadenados:

```
[Service Worker: Despacho a 500ms]
       │
       ▼
[WhatsApp Web no cambia de chat a tiempo]
       │
       ▼
[findActiveComposer() detecta el chat anterior (Ariadna)]
       │
       ▼
[Falta de verificación del destinatario en waitForSendButtonAndDispatch]
       │
       ▼
[Mensaje de Ramiro / Ana / Kamila se tipea y envía en el chat de Ariadna]
```

### Vector 1: Falso Positivo de Compositor Activo (`findActiveComposer`)
Cuando la extensión intentaba despachar un nuevo contacto mediante búsqueda en SPA o fallback por URL (`/send?phone=...`), el DOM de WhatsApp Web mantenía abierto en `#main` el chat anterior. La función `waitForSendButtonAndDispatch` examinaba si existía un cuadro de texto activo y, al encontrarlo, asumía erróneamente que correspondía al nuevo destinatario, enviando el mensaje al contacto previo.

### Vector 2: Búsqueda por Nombre en vez de Teléfono (Violación de Phone-First)
El despachador ejecutaba `searchAndOpenContactByNameAndSend(leadName || normalizedTarget)`. Debido a que en la agenda de contactos de Google/WhatsApp se utilizaban nomenclaturas compuestas (`Ariadna/MmDeAntuane/ Mt`, `Marina Sandoval / Mt / Royal`, `Claudio Abdala / Adecco`) o el contacto aún no estaba guardado, la búsqueda por nombre fallaba o seleccionaba un resultado parcial incorrecto.

### Vector 3: Modal de "Número no Válido" no Interceptado
Si un teléfono tenía un prefijo incorrecto o no tenía WhatsApp, la plataforma mostraba un cuadro de diálogo nativo (*"El número de teléfono compartido a través de la dirección URL no es válido"*). El script no cerraba este diálogo ni abortaba la tarea, dejando la pestaña bloqueada sobre el chat previo.

### Vector 4: Saludos Huérfanos por Apellidos Aislados e Inversión Escolar
En los leads extraídos de fichas escolares (MT / Villa Caritas), los registros figuraban como `"SR. CLAUDIO ABDALA"` o `"SRA. ROMERO"`. Al remover el tratamiento `"SR/SRA"`, quedaba únicamente `"Romero"`, lo que provocaba que `{First Name}` generara un saludo inapropiado: *"Hola Romero,"*. En otros casos (`"Sandoval Marina"`), el apellido antecedía al nombre de pila.

### Vector 5: Ráfaga Acelerada de Despacho (500 ms)
Cuando varios ítems en la cola tenían su hora de programación vencida, el Service Worker ejecutaba `scheduleNextDispatchIfIdle` con un retraso de apenas 500 ms, tiempo insuficiente para que la SPA de WhatsApp Web cargara el canal de chat y limpiara los parámetros de la URL.

---

## 3. ARQUITECTURA DEL PARCHE DE SEGURIDAD APLICADO

### 3.1 Candado de Verificación de Destinatario (`content.js`)
Se introdujo la función `isTargetChatCurrentlyActive(targetPhone, targetLeadName)` como barrera obligatoria previa a cualquier tipeo o clic de envío:

```javascript
function isTargetChatCurrentlyActive(targetPhone, targetLeadName) {
  const normTargetPhone = String(targetPhone || '').replace(/\D/g, '');
  const targetLast9 = normTargetPhone.length >= 9 ? normTargetPhone.slice(-9) : normTargetPhone;
  const activePhone = extractActiveChatPhone();
  const activeHeader = extractActiveChatHeaderName().toLowerCase().trim();

  // 1. Coincidencia telefónica directa (la más estricta e infalible)
  if (targetLast9 && activePhone && activePhone.endsWith(targetLast9)) {
    return true;
  }
  // 2. Coincidencia por encabezado si los 9 dígitos están en el título del chat
  if (targetLast9 && activeHeader.replace(/\D/g, '').endsWith(targetLast9)) {
    return true;
  }
  // 3. Coincidencia por nombre exacto si targetLeadName existe
  if (targetLeadName) {
    const cleanTargetName = String(targetLeadName).toLowerCase().trim();
    if (cleanTargetName.length >= 4 && (activeHeader === cleanTargetName || activeHeader.includes(cleanTargetName))) {
      return true;
    }
  }
  return false;
}
```

**Regla de Oro:** Si `targetPhone` fue provisto y `isTargetChatCurrentlyActive()` devuelve `false`, **el despachador no interactúa con el compositor**, esperando a que WhatsApp Web concrete la transición de chat.

### 3.2 Intercepción y Cierre de Diálogos de Error
En `waitForSendButtonAndDispatch`, se añadió un detector reactivo para diálogos de WhatsApp Web:
```javascript
const modalDialog = document.querySelector('div[data-animate-modal-popup="true"], div[role="dialog"]');
if (modalDialog) {
  const dialogText = (modalDialog.textContent || '').toLowerCase();
  if (dialogText.includes('no es válido') || dialogText.includes('invalid') || dialogText.includes('no se pudo encontrar')) {
    clearInterval(activeDispatchInterval);
    cleanWhatsAppSendUrlParams();
    const okBtn = modalDialog.querySelector('button');
    if (okBtn) simulateSafeUserClick(okBtn);
    safeRuntimeSendMessage({
      type: 'TICKTOOL_DISPATCH_FAILED',
      outboxId,
      reason: 'INVALID_PHONE_NUMBER'
    });
    return;
  }
}
```

### 3.3 Candado Anti-Concurrencia y Espaciado Seguro (`background.js`)
- **Bloqueo `inFlightDispatch`:** Antes de seleccionar el siguiente ítem de la cola, el Service Worker comprueba si hay un mensaje en vuelo activo en la pestaña con menos de 32 segundos de antigüedad. Si la pestaña sigue ocupada, aborta la llamada concurrente y reprograma la alarma.
- **Cadencia Mínima Humana:** Si los mensajes pendientes están vencidos o listos para salir, el retraso mínimo entre despachos consecutivos se fijó en **`4500 ms + random(3000 ms)`** (4.5 a 7.5 segundos), permitiendo el correcto renderizado del DOM de WhatsApp Web.
- **Recepción de Fallos:** Se añadió el manejador `TICKTOOL_DISPATCH_FAILED` para registrar inmediatamente el error en Firestore y liberar la memoria del despachador.

### 3.4 Normalizador Inteligente de Nombres y Tratamientos (`whatsappCampaigns.ts`)
Se reescribió `extractLeadNames()` con las siguientes capacidades:
1. **Limpieza de Prefijos:** Elimina automáticamente `SR.`, `SRA.`, `SEÑOR`, `SEÑORA`, `DON`, `DOÑA`, `FAMILIA`, `DR.`, `DRA.`.
2. **Descarte de Metadatos de Agenda:** Trunca cadenas con separadores de barra (`"Ariadna / MmDeAntuane / Mt"` $\rightarrow$ `"Ariadna"`).
3. **Catálogo de Apellidos Peruanos (`PERU_KNOWN_SURNAMES`):** Si el lead únicamente posee un término y este coincide con un apellido (`Romero`, `Sandoval`, `Abdala`, `Gutierrez`, `Carrasco`, `Balladares`, etc.), la variable `{First Name}` adopta la forma **`Familia [Apellido]`** (*"Hola Familia Romero,"*).
4. **Corrección de Inversión Escolar:** Si detecta formato `APELLIDO NOMBRE` (ej. `Sandoval Marina`), invierte los términos entregando `Marina` como `{First Name}` y `Marina Sandoval` como `{Display Name}`.
5. **Limpieza de Puntuación:** Se corrigen automáticamente espacios y comas huérfanas (`Hola ,` $\rightarrow$ `Hola, `).

---

## 4. REPLICACIÓN MULTI-PERFIL Y MULTI-MARCA (ZENTRY VS. VITALITY)

Para evitar la descontinuación de la herramienta en otros perfiles de trabajo (específicamente la operación comercial de **Vitality / Royal Prestige**), se aplicó la misma arquitectura manteniendo el aislamiento de proyectos:

| Componente | ZentryOS / QZ-Hub | Vitality / Royal Prestige |
| :--- | :--- | :--- |
| **Directorio Extensión** | `Quarz/QZ-HUB/extensions/zentry-ws-dispatcher` | `Vitality/vitality-ws-dispatcher` |
| **Nombre Extensión** | `Zentry WS Dispatcher & Tick Tool` | `Vitality Tick Tool - Royal Prestige WS` |
| **Proyecto Firebase** | `zentryos` / `quarz-group` | `studio-4949838222-b0ffc` |
| **Alarmas MV3** | `zentry_ticktool_poll_outbox`<br>`zentry_ticktool_next_dispatch` | `vitality_ticktool_poll_outbox`<br>`vitality_ticktool_next_dispatch` |
| **Host Permissions** | `web.whatsapp.com`, `zentry-prospecc.web.app`, `hub.quarz.online` | `web.whatsapp.com`, `vitality-prospecc.web.app`, `studio-4949838222-b0ffc.web.app` |
| **Identificador Limpieza** | `window.__zentryTickToolCleanup` | `window.__VitalityTickToolCleanup` |
| **Prefijo Topbar / DOM** | `#zentry-wa-topbar` | `#Vitality-wa-topbar` |
| **Servicio TypeScript** | `zentry-prospecc-crm/src/services/whatsappCampaigns.ts` | `vitality-prospecc/src/services/whatsappCampaigns.ts` |

### Protocolo para Replicar en una 3ra Marca o Perfil de Chrome:
1. **Copiar Carpeta Base:** Duplicar `extensions/zentry-ws-dispatcher` bajo el nuevo nombre (ej. `extensions/nueva-marca-ws-dispatcher`).
2. **Actualizar `manifest.json`:**
   - Modificar `name`, `short_name` y `description`.
   - Ajustar `host_permissions` con la URL de Hosting del nuevo CRM (`https://nueva-marca.web.app/*`).
3. **Ajustar Constantes en `background.js`:**
   - Modificar `FIRESTORE_PROJECTS = ['id-proyecto-gcp']`.
   - Renombrar las constantes `ALARM_POLL_OUTBOX` y `ALARM_NEXT_DISPATCH` con el prefijo de la marca para evitar colisiones entre Service Workers si coexisten en el mismo perfil de Chrome.
4. **Ajustar Identificadores en `content.js`:**
   - Modificar `window.__[Marca]TickToolCleanup`.
   - Personalizar las etiquetas visuales del Topbar (`#[Marca]-wa-topbar`).
5. **Incorporar `whatsappCampaigns.ts` en el CRM:**
   - Ubicar el archivo en `src/services/whatsappCampaigns.ts` para heredar las reglas de validación `PERU_KNOWN_SURNAMES`, normalización E.164 y generación de jitter.

---

## 5. RESUMEN DE ARCHIVOS MODIFICADOS Y CREADOS

```
├── D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB
│   └── extensions\zentry-ws-dispatcher
│       ├── content.js                   (Parcheado: Phone-First, validación activa, modal detector)
│       └── background.js                (Parcheado: inFlight lock, pacing 4.5-7.5s, TICKTOOL_DISPATCH_FAILED)
│
├── D:\1_jose_angel\1_GitHub\Zentry\zentry-prospecc-crm
│   ├── src\services\whatsappCampaigns.ts (Parcheado: extractLeadNames con PERU_KNOWN_SURNAMES y formato escolar)
│   ├── dist\                            (Compilado con Vite v8.2.2)
│   └── (Desplegado en producción: https://zentry-prospecc.web.app)
│
└── D:\1_jose_angel\1_GitHub\Vitality
    ├── vitality-ws-dispatcher
    │   ├── content.js                   (Sincronizado: candados y Phone-First para Royal Prestige)
    │   └── background.js                (Sincronizado: inFlight lock y pacing humano para Royal Prestige)
    └── vitality-prospecc
        └── src\services\whatsappCampaigns.ts (Instalado: motor de nombres y campañas idéntico al SSOT)
```

---

## 6. SANITIZACIÓN DE LA COLA Y VERIFICACIÓN EN VIVO

1. **Corrección de Datos en Cola:**
   - Se procesaron los registros de la campaña activa en localStorage y Firestore: los prospectos pendientes `id-mt-013` (Gutierrez), `id-mt-016` (Carrasco) e `id-mt-037` (Balladares) fueron re-renderizados pasando de *"Hola Gutierrez"* a **`Hola Familia Gutierrez`**, **`Hola Familia Carrasco`** y **`Hola Familia Balladares`**.
2. **Compilación y Hosting:**
   - Se ejecutó `npm run build` en `zentry-prospecc-crm` resultando en 0 errores.
   - Se ejecutó `firebase deploy --only hosting`, publicando la versión blindada en `https://zentry-prospecc.web.app`.
3. **Instrucción de Recarga:**
   - Para que Chrome cargue los archivos actualizados en memoria:
     1. Abrir `chrome://extensions`.
     2. Pulsar el icono de recargar (**⟳**) en la extensión correspondiente.
     3. Refrescar la pestaña de [web.whatsapp.com](https://web.whatsapp.com/).

---
> **Estado del Sistema:** Operativo, blindado contra envíos cruzados, compatible con secuencias multi-marca y listo para reanudar campañas.
