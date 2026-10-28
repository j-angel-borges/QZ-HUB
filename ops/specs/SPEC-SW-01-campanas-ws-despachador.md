 Comenzaremos a realizar, algunas mejoras en la seccion de: "C:\Users\jange\Pictures\Screenshots\Captura de pantalla 2026-10-19 112936.png"



Para ello desarrollaremos una redisposicion de la pagina de la siguiente manera:  "C:\Users\jange\Pictures\Screenshots\Captura de pantalla 2026-10-19 113033.png" los dos
  recuadros rojos representan los dos embeded que estaran en esa seccion uno ya funciona
  perfectamente y el otro será el nuevo que crearemos (a la izquierda el CRM y a la derecha el
  Tick Tool)

  Entonces a constinuacion redactaré a detalle la herrmaienta despachadora que se llama Tick Tool
  y como deberás construirla y considerando los detalles mencionados crea tambien una preview
  para esta herramienta.



# PROMPT EJECUTOR: MÓDULO DE CAMPAÑAS WS (PIPELINE BLUETICKS ALTERNATIVE) & EXTENSIÓN DESPACHADORA

> **Rol del Agente:** Ingeniero Fullstack Frontend & Chrome Extensions (Manifest V3).  
> **Objetivo:** Desarrollar el sistema completo de programación de campañas de mensajería para WhatsApp Web sin las restricciones de Blueticks (sin límite de 3 mensajes, sin marca de agua, con árboles de follow-up y placeholders dinámicos).  
> **Destino obligatorio de tu Walkthrough Técnico:** Al finalizar tu sesión, debes registrar todo lo construido, archivos modificados y pruebas en:  
> `D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\wkths-exce\WT-01-CAMPANAS-WS-QZ-HUB.md`

---

## 1. CONTEXTO OPERATIVO Y ARQUITECTURA

El usuario (Jose Angel) maneja su embudo de prospección comercial en **QZ-Hub** (`https://hub.quarz.online/#prospeccion`), donde incrusta y sincroniza la base de datos de leads de **Zentry Prospecc CRM** (`D:\1_jose_angel\1_GitHub\Zentry\zentry-prospecc-crm`, React + TypeScript + Firebase Firestore).

Actualmente los leads provienen de eventos físicos con fuentes identificadas (`Expo M`, `Rambla Z`, `Hijos F-Rp`, etc.) y cuentan con atributos como:

- Nombre de la madre / contacto
- Teléfono móvil (formato Perú `+51...` o 9 dígitos)
- Origen de prospección
- Distrito y notas de interés

### Problema con Blueticks:

1. La capa gratuita impone una marca de agua obligatoria (`Powered by blueticks.co`) que daña la percepción de exclusividad de Zentry.
2. Limita la programación concurrente a 3 mensajes.
3. Desconecta los datos: obliga a exportar e importar CSVs manualmente entre QZ-Hub y la extensión externa.

---

## 2. ESPECIFICACIÓN DEL DESARROLLO (QUÉ CONSTRUIR)

Debes construir la solución en **dos partes sincronizadas**:

### PARTE A: MÓDULO VISUAL DE CAMPAÑAS EN QZ-HUB / ZENTRY CRM

Ubicación principal de la interfaz:

- Integrar la vista/modal de **"Campañas WhatsApp"** en el CRM de Zentry (`D:\1_jose_angel\1_GitHub\Zentry\zentry-prospecc-crm`) y reflejarla en la vista de `#prospeccion` de QZ-Hub.

**Wizard de 4 Pasos (Idéntico al flujo validado de Blueticks):**

1. **Paso 1: Audience (Audiencia)**
   - Selector por origen/etiqueta (ej. `Expo M`, `La Rambla`, etc.) o selección manual por checkboxes desde la tabla de leads.
   - Conteo de contactos seleccionados y validación de números de WhatsApp válidos.
2. **Paso 2: Message & Follow-ups (Mensaje y Árbol de Respuestas)**
   - Editor de mensaje inicial con soporte de variables dinámicas: `{First Name}`, `{Display Name}`, `{Phone}`.
   - Botón `+ Añadir Follow-up`: Permite encadenar un segundo mensaje si el prospecto no responde tras un retardo configurable (ej. `12 hours`, `24 hours`, `2 days`).
   - Switch de control: *"Detener seguimiento automáticamente si el prospecto responde"*.
   - Vista previa dinámica en tiempo real (formato burbuja de WhatsApp).
3. **Paso 3: Timing (Programación)**
   - Opciones: `Enviar ahora (con jitter)` o `Programar fecha y hora de inicio`.
   - Selector de cadencia segura: Intervalo aleatorio (Jitter) entre envíos (recomendado: 45s a 110s por mensaje).
   - Límite de lote diario (ej. 35 mensajes/día según documento técnico).
4. **Paso 4: Review & Guardar en Firestore**
   - Resumen de la campaña: Total de contactos, textos de la secuencia y horario de ejecución.
   - Colección destino en Firestore: `whatsapp_campaigns` y `whatsapp_outbox` con los estados: `pending`, `dispatched`, `replied`, `cancelled`.

---

### PARTE B: EXTENSIÓN ULTRA-LIVIANA DE CHROME (`zentry-ws-dispatcher`)

Crear el paquete de la extensión en:
`D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\extensions\zentry-ws-dispatcher`

**Estructura requerida (Manifest V3):**

- `manifest.json`: Permisos para `https://web.whatsapp.com/*`, `storage` y `alarms`.
- `content.js`: Script inyectado silencioso en WhatsApp Web.
- `background.js`: Service worker que consulta los mensajes en cola (`whatsapp_outbox`) o recibe la orden de despacho desde QZ-Hub.
- `popup.html` / `popup.js`: Indicador de estado: "WhatsApp Web Conectado", "Campaña Activa", "Lote en Progreso (X/35)", con botón de pausa de emergencia.

**Reglas Críticas de Anti-Baneo y Despacho:**

1. **Cero marcas de agua:** El texto debe enviarse limpio.

2. **Jitter Obligatorio:** Ningún mensaje se enviará con un delay fijo; debe existir una función con variación aleatoria:
   
   ```javascript
   const jitterDelay = Math.floor(Math.random() * (110000 - 45000 + 1)) + 45000; // Entre 45s y 110s
   ```

3. **Mecanismo de Despacho Invisible:**
   
   - Aprovechar la navegación nativa por URL de WhatsApp Web (`https://web.whatsapp.com/send?phone=...&text=...`) o el Store interno de la sesión abierta.
   - Esperar a que el botón de envío esté listo en el DOM y disparar el evento de envío con simulación de evento de usuario seguro.

4. **Detector de Interrupción (Trigger de Parada):**
   
   - Cuando se detecte un mensaje entrante (Inbound) del prospecto, marcar el lead como `replied` en Firestore y abortar cualquier follow-up programado para ese número.

---

## 3. ENTREGABLES Y WALKTHROUGH OBLIGATORIO

Al terminar el desarrollo:

1. Comprueba que el proyecto compile sin errores (`npm run build`).
2. Documenta cada componente creado, instrucciones para cargar la extensión en `chrome://extensions` (Modo Desarrollador), y el esquema de datos de Firebase.
3. Escribe el reporte completo en:
   `D:\1_jose_angel\1_GitHub\Quarz\QZ-HUB\wkths-exce\WT-01-CAMPANAS-WS-QZ-HUB.md`
