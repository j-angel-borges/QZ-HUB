/**
 * Zentry Tick Tool — WhatsApp Web Silent Dispatcher, Agenda Contact Scraper,
 * Inbound Reply Detector & Blueticks-Style Overlay
 * Content Script (content.js v1.2.0)
 *
 * Opera en dos contextos:
 * A) En `https://web.whatsapp.com/*`:
 *    - Inyecta las herramientas superpuestas estilo Blueticks (`Captura 141430.png`):
 *      1. Barra Superior (`#zentry-wa-topbar`): Filtros rápidos (`Todos`, `Bandeja De Entrada`,
 *         `Resolver Después`, `Necesita Atención`, `No Leídos`), contador de envíos y buscador de Agenda.
 *      2. Botón Reloj/Destello en el Compositor Inferior (`#zentry-wa-schedule-btn`): Junto a la caja
 *         de texto `"Escribe un mensaje"`, abre el Modal de Envío Individual / Programación Rápida
 *         con selector de Agenda de Contactos de WhatsApp Web y CERO marcas de agua.
 *    - Captura automáticamente la Agenda de Contactos y Chats de WhatsApp Web (`#pane-side`)
 *      y la sincroniza con QZ-Hub para que el usuario pueda buscar cualquier contacto de su
 *      WhatsApp Web y mandarle un mensaje individual automático o programado.
 *    - Ejecuta el despacho automático sin marcas de agua (tanto por número `+51...` vía URL
 *      como por Nombre de Contacto buscando en la barra lateral de WhatsApp Web).
 *    - Monitorea mensajes entrantes (`message-in` / `data-id^="false_"`) mediante `MutationObserver`
 *      para disparar la parada automática de follow-ups (`replied` / `cancelled` en Firestore).
 * B) En `https://hub.quarz.online/*`, `https://qz-hub-app.web.app/*`, `https://quarz-group.web.app/*`
 *    y `https://zentry-prospecc.web.app/*`:
 *    - Actúa como puente bidireccional en tiempo real entre Tick Tool y el Service Worker
 *      local de esa sesión de Chrome.
 */

(function initZentryTickToolContentScript() {
  // Si había una instancia previa de content.js corriendo en esta pestaña (antes de recargar la extensión),
  // limpiar todos sus timers y observadores inmediatamente para evitar 'Extension context invalidated'.
  if (typeof window.__zentryTickToolCleanup === 'function') {
    try {
      window.__zentryTickToolCleanup();
    } catch (_) {}
  }

  function isExtensionContextValid() {
    try {
      return Boolean(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
    } catch (_) {
      return false;
    }
  }

  function safeRuntimeSendMessage(payload, callback) {
    if (!isExtensionContextValid()) {
      if (typeof window.__zentryTickToolCleanup === 'function') {
        try {
          window.__zentryTickToolCleanup();
        } catch (_) {}
      }
      return;
    }
    try {
      chrome.runtime.sendMessage(payload, response => {
        // Consumir chrome.runtime.lastError silenciosamente si existe
        const _err = chrome.runtime?.lastError;
        if (typeof callback === 'function' && !_err) {
          callback(response);
        }
      });
    } catch (_) {
      if (typeof window.__zentryTickToolCleanup === 'function') {
        try {
          window.__zentryTickToolCleanup();
        } catch (_) {}
      }
    }
  }

  const isWhatsAppWeb = window.location.hostname.includes('web.whatsapp.com');

  // ── CONTEXTO B: PUENTE CON QZ-HUB Y ZENTRY CRM ──────────────────────────────
  if (!isWhatsAppWeb) {
    window.document.documentElement.setAttribute('data-zentry-ticktool-ext', 'active');

    const hubMessageListener = event => {
      if (!isExtensionContextValid()) {
        window.removeEventListener('message', hubMessageListener);
        return;
      }
      if (event.source !== window || !event.data || typeof event.data !== 'object') return;
      const { type, payload } = event.data;

      if (type === 'ZENTRY_TICKTOOL_PING') {
        safeRuntimeSendMessage({ type: 'TICKTOOL_GET_STATUS' }, response => {
          window.postMessage(
            {
              type: 'ZENTRY_TICKTOOL_PONG',
              extensionInstalled: true,
              state: response?.state || null
            },
            '*'
          );
        });
      } else if (type === 'ZENTRY_TICKTOOL_SCRAPE_CONTACTS') {
        safeRuntimeSendMessage({ type: 'TICKTOOL_SCRAPE_CONTACTS_NOW' }, response => {
          window.postMessage(
            {
              type: 'ZENTRY_TICKTOOL_CONTACTS_SYNC',
              ok: response?.ok || false,
              contacts: response?.contacts || [],
              state: response?.state || null
            },
            '*'
          );
        });
      } else if (type === 'ZENTRY_TICKTOOL_PUSH_QUEUE') {
        const queueItems = payload?.items || event.data.items || [];
        const cName = payload?.campaignName || event.data.campaignName || '';
        const cId = payload?.campaignId || event.data.campaignId || '';
        const opId = payload?.operatorId || event.data.operatorId || '';
        safeRuntimeSendMessage(
          {
            type: 'TICKTOOL_PUSH_CAMPAIGN_QUEUE',
            items: queueItems,
            campaignName: cName,
            campaignId: cId,
            operatorId: opId
          },
          response => {
            window.postMessage(
              {
                type: 'ZENTRY_TICKTOOL_QUEUE_SYNCED',
                ok: response?.ok || false,
                state: response?.state || null
              },
              '*'
            );
          }
        );
      } else if (type === 'ZENTRY_TICKTOOL_TOGGLE_PAUSE') {
        safeRuntimeSendMessage(
          {
            type: 'TICKTOOL_TOGGLE_PAUSE',
            isPaused: typeof payload?.isPaused === 'boolean' ? payload.isPaused : event.data.isPaused
          },
          response => {
            window.postMessage(
              {
                type: 'ZENTRY_TICKTOOL_STATUS_UPDATED',
                state: response?.state || null
              },
              '*'
            );
          }
        );
      } else if (type === 'ZENTRY_TICKTOOL_RESET_DAILY_COUNT') {
        safeRuntimeSendMessage({ type: 'TICKTOOL_RESET_DAILY_COUNT' }, response => {
          window.postMessage(
            {
              type: 'ZENTRY_TICKTOOL_STATUS_UPDATED',
              state: response?.state || null
            },
            '*'
          );
        });
      } else if (type === 'ZENTRY_TICKTOOL_SET_DAILY_LIMIT') {
        safeRuntimeSendMessage(
          {
            type: 'TICKTOOL_SET_DAILY_LIMIT',
            limit: payload?.limit || event.data.limit || 100
          },
          response => {
            window.postMessage(
              {
                type: 'ZENTRY_TICKTOOL_STATUS_UPDATED',
                state: response?.state || null
              },
              '*'
            );
          }
        );
      } else if (type === 'ZENTRY_TICKTOOL_DISPATCH_NOW') {
        safeRuntimeSendMessage({ type: 'TICKTOOL_DISPATCH_NEXT_NOW' }, response => {
          window.postMessage(
            {
              type: 'ZENTRY_TICKTOOL_STATUS_UPDATED',
              state: response?.state || null
            },
            '*'
          );
        });
      } else if (type === 'ZENTRY_TICKTOOL_TEST_SEND') {
        safeRuntimeSendMessage(
          {
            type: 'TICKTOOL_TEST_SEND_NOW',
            id: payload?.id || '',
            campaignId: payload?.campaignId || '',
            campaignName: payload?.campaignName || '',
            phone: payload?.phone || '',
            leadName: payload?.leadName || 'Envío Individual',
            message: payload?.message || '',
            attachments: Array.isArray(payload?.attachments) ? payload.attachments : [],
            operatorId: payload?.operatorId || '',
            scheduledFor: payload?.scheduledFor || Date.now()
          },
          response => {
            window.postMessage(
              {
                type: 'ZENTRY_TICKTOOL_STATUS_UPDATED',
                state: response?.state || null
              },
              '*'
            );
          }
        );
      }
    };

    window.addEventListener('message', hubMessageListener);
    window.__zentryTickToolCleanup = () => {
      window.removeEventListener('message', hubMessageListener);
    };

    // Emitir un PONG automático apenas carga el content script para que QZ-Hub detecte la extensión al instante
    setTimeout(() => {
      safeRuntimeSendMessage({ type: 'TICKTOOL_GET_STATUS' }, response => {
        window.postMessage(
          {
            type: 'ZENTRY_TICKTOOL_PONG',
            extensionInstalled: true,
            state: response?.state || null
          },
          '*'
        );
      });
    }, 300);

    return;
  }

  // ── CONTEXTO A: WHATSAPP WEB (`https://web.whatsapp.com/*`) ─────────────────
  console.log('[Zentry Tick Tool v1.3.1] Content script + Agenda Scraper + Video/Media Auto-Send activo en WhatsApp Web.');

  const SEND_BUTTON_SELECTORS = [
    '#main footer button[data-testid="compose-btn-send"]',
    '#main footer [data-testid="compose-btn-send"]',
    '#main footer [data-testid="send"]',
    '#main footer button[aria-label="Enviar"]',
    '#main footer button[aria-label="Send"]',
    '#main footer button[aria-label*="Enviar"]',
    '#main footer button[aria-label*="Send"]',
    '#main footer button:has(span[data-icon*="send"])',
    '#main footer button:has(svg[data-icon*="send"])',
    '#main footer div[role="button"][aria-label="Enviar"]',
    '#main footer div[role="button"][aria-label="Send"]',
    '#main footer span[data-icon="wds-ic-send-filled"]',
    '#main footer span[data-icon="send"]',
    '#main footer span[data-icon="send-filled"]',
    '#main footer span[data-icon*="send"]',
    '#main footer button[data-tab="11"]',
    'button[data-testid="compose-btn-send"]',
    'button[aria-label="Enviar"]',
    'button[aria-label="Send"]',
    'button[aria-label*="Enviar"]',
    'button[aria-label*="Send"]',
    'div[role="button"][aria-label="Enviar"]',
    'div[role="button"][aria-label="Send"]',
    'span[data-icon="wds-ic-send-filled"]',
    'span[data-icon="send"]',
    'span[data-icon="send-filled"]'
  ];

  function findSendButton() {
    for (const selector of SEND_BUTTON_SELECTORS) {
      try {
        const el = document.querySelector(selector);
        if (el) {
          const btn = (
            el.tagName === 'BUTTON'
              ? el
              : el.closest('button') || el.closest('div[role="button"]') || el
          );
          if (btn && btn.getAttribute('aria-disabled') !== 'true' && !btn.disabled) {
            const rect = btn.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) return btn;
          }
        }
      } catch (_) {}
    }

    // Búsqueda posicional: el botón a la derecha del composer en footer
    const footer = document.querySelector('#main footer');
    if (footer) {
      const composer = findActiveComposer();
      if (composer) {
        const compRect = composer.getBoundingClientRect();
        const allButtons = Array.from(footer.querySelectorAll('button, div[role="button"]'));
        const rightButtons = allButtons.filter(b => {
          if (b.getAttribute('aria-disabled') === 'true' || b.disabled) return false;
          const r = b.getBoundingClientRect();
          return r.left >= compRect.right - 15 && r.width > 0 && r.height > 0;
        });
        if (rightButtons.length > 0) {
          return rightButtons[rightButtons.length - 1];
        }
      }
    }

    return null;
  }

  // Busca EXCLUSIVAMENTE el botón Enviar del Modal de Vista Previa de Archivos/Imágenes/Videos
  // (Ignora por completo #main footer y #side para no confundirse nunca con el botón del chat normal)
  function findMediaModalSendButton() {
    const selectors = [
      'div[role="button"][aria-label="Enviar"]',
      'div[role="button"][aria-label="Send"]',
      'button[aria-label="Enviar"]',
      'button[aria-label="Send"]',
      'div[role="button"][aria-label*="Enviar"]',
      'div[role="button"][aria-label*="Send"]',
      'button[aria-label*="Enviar"]',
      'button[aria-label*="Send"]',
      'span[data-icon="wds-ic-send-filled"]',
      'span[data-icon="send"]',
      'span[data-icon="send-filled"]',
      'span[data-icon*="send"]'
    ];
    for (const sel of selectors) {
      const nodes = Array.from(document.querySelectorAll(sel));
      for (const n of nodes) {
        // CRÍTICO: Si está dentro de #main footer o #side, es el botón del chat de fondo, NO el del modal de adjuntos
        if (n.closest('#main footer') || n.closest('#side') || n.closest('#zentry-wa-modal-backdrop')) continue;
        const clickable = n.closest('button') || n.closest('div[role="button"]') || n;
        if (clickable.getAttribute('aria-disabled') === 'true' || clickable.disabled) continue;
        const rect = clickable.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return clickable;
        }
      }
    }
    return null;
  }

  // Busca la caja de texto de comentario ("Añade un comentario" / caption) dentro del modal de vista previa de archivos/videos
  function findMediaModalCaptionBox() {
    const editables = Array.from(document.querySelectorAll('div[contenteditable="true"]'));
    for (const el of editables) {
      if (el.closest('#main footer') || el.closest('#side') || el.closest('#zentry-wa-modal-backdrop')) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return el;
      }
    }
    return null;
  }

  function findActiveComposer() {
    return (
      document.querySelector('#main footer div[contenteditable="true"][role="textbox"]') ||
      document.querySelector('#main footer div[contenteditable="true"][data-tab="10"]') ||
      document.querySelector('#main footer div[contenteditable="true"]')
    );
  }

  function findSearchInputBox() {
    return (
      document.querySelector('#side div[contenteditable="true"][role="textbox"]') ||
      document.querySelector('#side div[contenteditable="true"][data-tab="3"]') ||
      document.querySelector('#side div[contenteditable="true"]') ||
      document.querySelector('#side [role="textbox"]')
    );
  }

  // Abre una fila de chat en #pane-side disparando eventos reales en toda la jerarquía de la celda de React
  function clickChatRowReliably(rowEl) {
    if (!rowEl) return false;
    const rowRoot = rowEl.closest('[role="listitem"], [role="row"]') || rowEl;
    const targets = [
      rowRoot.querySelector('div[role="gridcell"]'),
      rowRoot.querySelector('div[tabindex="-1"]'),
      rowRoot.querySelector('div._ak8l, div._ak8o, div._ak72'),
      rowRoot.querySelector('span[dir="auto"][title], [title]'),
      rowRoot
    ].filter(Boolean);

    const uniqueTargets = Array.from(new Set(targets));
    uniqueTargets.forEach(t => {
      try {
        t.scrollIntoView?.({ block: 'nearest' });
      } catch (_) {}
      simulateSafeUserClick(t);
    });
    return true;
  }

  function extractActiveChatHeaderName() {
    const headerSpan =
      document.querySelector('#main header span[dir="auto"]') ||
      document.querySelector('#main header [title]');
    return headerSpan ? (headerSpan.textContent || headerSpan.getAttribute('title') || '').trim() : '';
  }

  function isTargetChatCurrentlyActive(targetPhone, targetLeadName, expectedText = '') {
    const normTargetPhone = String(targetPhone || '').replace(/\D/g, '');
    const targetLast9 = normTargetPhone.length >= 9 ? normTargetPhone.slice(-9) : normTargetPhone;
    const activePhone = extractActiveChatPhone();
    const activeHeader = extractActiveChatHeaderName().toLowerCase().trim();

    // 0. CANDADO 100% INDISCUTIBLE: Si el texto esperado ya está presente en el compositor del chat activo
    // (o el compositor contiene los primeros 25 caracteres del texto a enviar)
    if (expectedText) {
      const composer = findActiveComposer();
      const composerText = (composer?.innerText || '').trim().toLowerCase();
      const normExpected = String(expectedText).trim().toLowerCase();
      if (composerText.length >= 8 && normExpected.length >= 8) {
        const prefixExp = normExpected.slice(0, 25);
        const prefixComp = composerText.slice(0, 25);
        if (
          composerText.includes(prefixExp) ||
          normExpected.includes(prefixComp) ||
          composerText === normExpected
        ) {
          return true;
        }
      }
    }

    // 1. Memoria de navegación reciente por URL (si navegamos a este número hace menos de 45 segundos)
    if (window.__zentryLastNavigated && targetLast9) {
      const recentNav = window.__zentryLastNavigated;
      const isRecent = Date.now() - (recentNav.timestamp || 0) < 45000;
      if (isRecent && recentNav.phone && recentNav.phone.endsWith(targetLast9)) {
        if (findActiveComposer()) {
          return true;
        }
      }
    }

    // 2. Si la URL actual contiene el teléfono objetivo (/send?phone=... o ?phone=...)
    let urlPhone = '';
    try {
      urlPhone = (new URLSearchParams(window.location.search).get('phone') || '').replace(/\D/g, '');
    } catch (_) {}
    if (targetLast9 && urlPhone && urlPhone.endsWith(targetLast9)) {
      return true;
    }

    // 3. Coincidencia telefónica directa (la más segura e infalible)
    if (targetLast9 && activePhone && activePhone.endsWith(targetLast9)) {
      return true;
    }

    // 4. Coincidencia por encabezado si los 9 dígitos están en el encabezado
    if (targetLast9 && activeHeader.replace(/\D/g, '').endsWith(targetLast9)) {
      return true;
    }

    // 5. Detección de chat con uno mismo ("(Tú)" / "(You)") para pruebas directas
    if (activeHeader.includes('(tú)') || activeHeader.includes('(you)') || activeHeader === 'tú' || activeHeader === 'you') {
      if (findActiveComposer()) {
        return true;
      }
    }

    // 6. Coincidencia con contactos de WhatsApp cacheados
    if (typeof cachedWaContacts !== 'undefined' && cachedWaContacts instanceof Map) {
      for (const c of cachedWaContacts.values()) {
        const cNorm = String(c.phone || '').replace(/\D/g, '');
        if (targetLast9 && cNorm && cNorm.endsWith(targetLast9)) {
          if (c.name && activeHeader && (activeHeader === c.name.toLowerCase() || activeHeader.includes(c.name.toLowerCase()))) {
            return true;
          }
        }
      }
    }

    // 7. Coincidencia por nombre si targetLeadName existe y el encabezado lo contiene
    if (targetLeadName) {
      const cleanTargetName = String(targetLeadName).toLowerCase().trim();
      if (cleanTargetName.length >= 3 && (activeHeader === cleanTargetName || activeHeader.includes(cleanTargetName))) {
        return true;
      }
      const words = cleanTargetName.split(/\s+/).filter(w => w.length >= 3);
      if (words.some(w => activeHeader.includes(w))) {
        return true;
      }
    }

    // 8. Si el texto de #main contiene los 9 dígitos del teléfono buscado
    if (targetLast9) {
      const mainText = document.querySelector('#main')?.innerText || '';
      if (mainText.replace(/\D/g, '').includes(targetLast9)) {
        return true;
      }
    }

    return false;
  }

  function extractActiveChatPhone() {
    const headerTitle = extractActiveChatHeaderName();
    const digits = headerTitle.replace(/\D/g, '');
    if (digits.length >= 9) return digits;

    try {
      const urlDigits = (new URLSearchParams(window.location.search).get('phone') || '').replace(/\D/g, '');
      if (urlDigits.length >= 9) return urlDigits;
    } catch (_) {}

    const msgNodes = document.querySelectorAll('#main [data-id*="@c.us"], #main [data-id*="@lid"]');
    for (const msgNode of msgNodes) {
      const dataId = msgNode.getAttribute('data-id') || '';
      const match = dataId.match(/(?:true|false)_(\d{8,15})@/);
      if (match) return match[1];
    }
    return '';
  }

  // ── CAPTURADOR DE AGENDA DE CONTACTOS DE WHATSAPP WEB (`#pane-side`) ────────
  let cachedWaContacts = new Map();

  function scrapeWhatsAppAgendaContacts() {
    const rows = document.querySelectorAll('#pane-side [role="listitem"], #pane-side [role="row"]');
    rows.forEach(row => {
      try {
        // Extraer el título del contacto o chat
        const titleEl =
          row.querySelector('span[dir="auto"][title]') ||
          row.querySelector('[title]') ||
          row.querySelector('span[dir="auto"]');
        const rawName = titleEl
          ? (titleEl.getAttribute('title') || titleEl.textContent || '').trim()
          : '';
        if (!rawName || rawName.length < 2) return;

        // Intentar extraer número si el nombre contiene dígitos o si algún nodo interno tiene @c.us
        let phone = '';
        const dataIdEl = row.querySelector('[data-id*="@c.us"]');
        if (dataIdEl) {
          const did = dataIdEl.getAttribute('data-id') || '';
          const m = did.match(/(\d{8,15})@c\.us/);
          if (m) phone = m[1];
        }
        if (!phone) {
          const digitsInName = rawName.replace(/\D/g, '');
          if (digitsInName.length >= 9 && digitsInName.length <= 15) {
            phone = digitsInName;
          }
        }

        // Extraer subtítulo / último mensaje o etiqueta si existe
        const spans = Array.from(row.querySelectorAll('span[dir="ltr"], span[dir="auto"]'));
        let lastPreview = '';
        if (spans.length > 1) {
          lastPreview = (spans[spans.length - 1].textContent || '').trim().slice(0, 60);
        }

        const key = (phone || rawName).toLowerCase();
        cachedWaContacts.set(key, {
          id: `wa-${key.replace(/[^a-z0-9]/g, '')}`,
          name: rawName,
          phone: phone || '',
          source: 'WhatsApp Web',
          preview: lastPreview
        });
      } catch (_) {}
    });

    // También incluir el chat activo si está abierto
    const activeName = extractActiveChatHeaderName();
    const activePhone = extractActiveChatPhone();
    if (activeName) {
      const key = (activePhone || activeName).toLowerCase();
      cachedWaContacts.set(key, {
        id: `wa-${key.replace(/[^a-z0-9]/g, '')}`,
        name: activeName,
        phone: activePhone || '',
        source: 'Chat Activo WS',
        preview: 'Abierto actualmente'
      });
    }

    return Array.from(cachedWaContacts.values());
  }

  function simulateSafeUserClick(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const clientX = rect.left + rect.width / 2;
    const clientY = rect.top + rect.height / 2;

    const eventInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      clientX,
      clientY,
      button: 0,
      buttons: 1
    };

    element.dispatchEvent(new PointerEvent('pointerdown', eventInit));
    element.dispatchEvent(new MouseEvent('mousedown', eventInit));
    element.dispatchEvent(new PointerEvent('pointerup', eventInit));
    element.dispatchEvent(new MouseEvent('mouseup', eventInit));
    if (typeof element.click === 'function') {
      element.click();
    } else {
      element.dispatchEvent(new MouseEvent('click', eventInit));
    }
    return true;
  }

  function triggerEnterOnComposer(composer) {
    if (!composer) return false;
    composer.focus();
    const enterEventInit = {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
      composed: true
    };
    composer.dispatchEvent(new KeyboardEvent('keydown', enterEventInit));
    composer.dispatchEvent(new KeyboardEvent('keypress', enterEventInit));
    composer.dispatchEvent(new KeyboardEvent('keyup', enterEventInit));
    return true;
  }

  function sanitizeWatermarkText(rawText) {
    if (!rawText) return '';
    return String(rawText)
      .replace(/Powered by blueticks\.co/gi, '')
      .replace(/Sent via Blueticks/gi, '')
      .trim();
  }

  function sanitizeComposerIfNeeded() {
    const composer = findActiveComposer();
    if (!composer) return;
    const rawText = composer.innerText || '';
    if (/blueticks\.co/i.test(rawText)) {
      const cleaned = sanitizeWatermarkText(rawText);
      composer.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, cleaned);
    }
  }

  // ── PUENTE INVISIBLE EN MAIN WORLD (Evita ventanas de explorador de archivos y usa setters nativos de React) ──
  function ensureMainWorldBridgeInjected() {
    if (document.getElementById('zentry-ticktool-mainworld-bridge')) return;
    try {
      const script = document.createElement('script');
      script.id = 'zentry-ticktool-mainworld-bridge';
      script.textContent = `
        (function() {
          if (window.__zentryMainWorldBridgeReady) return;
          window.__zentryMainWorldBridgeReady = true;

          // Interceptar HTMLInputElement.prototype.click cuando Tick Tool está inyectando un archivo en segundo plano
          // para que NUNCA se abra la ventana del explorador de archivos de Windows y podamos capturar el input exacto creado por WhatsApp
          const origInputClick = HTMLInputElement.prototype.click;
          window.__zentryCapturedFileInput = null;
          window.__zentrySuppressNativeFilePicker = false;

          HTMLInputElement.prototype.click = function() {
            if (window.__zentrySuppressNativeFilePicker && this.type === 'file' && this.id !== 'ztt-modal-files') {
              window.__zentryCapturedFileInput = this;
              return;
            }
            return origInputClick.apply(this, arguments);
          };

          // Escuchar comandos desde el Content Script para asignar FileList usando el descriptor nativo y disparar React onChange
          window.addEventListener('zentry-ticktool-assign-input-files', function() {
            try {
              const inp = window.__zentryCapturedFileInput;
              if (inp) {
                inp.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                inp.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
              }
            } catch (e) {}
          });
        })();
      `;
      (document.head || document.documentElement).appendChild(script);
    } catch (_) {}
  }

  ensureMainWorldBridgeInjected();

  // Normaliza el MIME type de un archivo según su extensión para que WhatsApp Web lo reconozca como Video/Imagen de galería y NUNCA como Documento genérico
  function inferMediaMimeType(fileName, currentType) {
    const cleanType = String(currentType || '').trim().toLowerCase();
    const ext = String(fileName || '').split('.').pop().toLowerCase();
    if (ext === 'mp4' || ext === 'm4v') return 'video/mp4';
    if (ext === 'mov') return 'video/quicktime';
    if (ext === 'webm') return 'video/webm';
    if (ext === '3gp') return 'video/3gpp';
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'png') return 'image/png';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'pdf') return 'application/pdf';
    if (cleanType && cleanType !== 'application/octet-stream') return cleanType;
    return 'application/octet-stream';
  }

  // Asegura que un objeto File nativo tenga su MIME type explícito (ej. video/mp4) para que el reproductor multimedia de WhatsApp Web lo procese como video y no como documento
  function ensureNormalizedFileMime(fileObj) {
    if (!(fileObj instanceof File)) return null;
    const expectedMime = inferMediaMimeType(fileObj.name, fileObj.type);
    if (fileObj.type === expectedMime) return fileObj;
    try {
      return new File([fileObj], fileObj.name || `media-${Date.now()}.mp4`, {
        type: expectedMime,
        lastModified: fileObj.lastModified || Date.now()
      });
    } catch (_) {
      return fileObj;
    }
  }

  // Convierte un dataUrl base64 a un objeto File nativo del navegador
  function dataUrlToFile(dataUrl, fileName, mimeType) {
    try {
      const arr = String(dataUrl || '').split(',');
      if (arr.length < 2) return null;
      const mimeMatch = arr[0].match(/:(.*?);/);
      const rawMime = mimeType || (mimeMatch ? mimeMatch[1] : '');
      const mime = inferMediaMimeType(fileName, rawMime);
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], fileName || `adjunto-${Date.now()}`, { type: mime });
    } catch (err) {
      console.warn('[TickTool] Error convirtiendo adjunto base64 a File:', err);
      return null;
    }
  }

  // Asigna un DataTransfer.files a un <input type="file"> invocando el setter nativo del prototipo HTMLInputElement
  // para que el tracker interno de React 18 en WhatsApp Web detecte el cambio al 100%
  function assignFilesToInputWithReactSetter(targetInput, dt) {
    if (!targetInput || !dt) return false;
    try {
      const nativeFilesSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'files')?.set;
      if (nativeFilesSetter) {
        nativeFilesSetter.call(targetInput, dt.files);
      } else {
        targetInput.files = dt.files;
      }
      targetInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      targetInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      return true;
    } catch (err) {
      console.warn('[TickTool] Error en assignFilesToInputWithReactSetter:', err);
      return false;
    }
  }

  // Inyecta archivos en el <input type="file"> nativo de WhatsApp Web en segundo plano:
  // - Para videos/imágenes selecciona "Fotos y videos" (accept="image/*,video/mp4,video/3gpp,video/quicktime")
  // - Para documentos selecciona "Documento" (accept="*")
  // - NUNCA abre el diálogo de archivos del sistema operativo ni deja el menú '+' colgado
  let isOpeningAttachMenu = false;
  function injectFilesViaNativeFileInput(validFiles) {
    try {
      ensureMainWorldBridgeInjected();
      const dt = new DataTransfer();
      validFiles.forEach(f => dt.items.add(f));

      const hasVideoOrImage = validFiles.some(f => {
        const mime = inferMediaMimeType(f.name, f.type);
        return mime.startsWith('video/') || mime.startsWith('image/');
      });

      const findWaFileInputs = () =>
        Array.from(document.querySelectorAll('input[type="file"]')).filter(
          inp => inp.id !== 'ztt-modal-files' && !inp.closest('#zentry-wa-modal-backdrop')
        );

      const findMediaGalleryInput = inputs =>
        inputs.find(inp => {
          const acc = (inp.getAttribute('accept') || '').toLowerCase();
          return acc.includes('video/mp4') || acc.includes('video/*') || (acc.includes('video') && acc.includes('image'));
        });

      const findDocumentInput = inputs =>
        inputs.find(inp => {
          const acc = (inp.getAttribute('accept') || '').toLowerCase();
          return acc === '*' || (!acc.includes('video') && !acc.includes('image'));
        }) || inputs[0];

      // 1. Revisar si los <input type="file"> ya están en el DOM
      const existingInputs = findWaFileInputs();
      if (hasVideoOrImage) {
        const mediaInput = findMediaGalleryInput(existingInputs);
        if (mediaInput) {
          return assignFilesToInputWithReactSetter(mediaInput, dt);
        }
      } else if (existingInputs.length > 0) {
        return assignFilesToInputWithReactSetter(findDocumentInput(existingInputs), dt);
      }

      // 2. Si el menú aún no está abierto, evitar darle clic una segunda vez si ya lo estamos abriendo (evita que un 2do clic lo cierre)
      if (isOpeningAttachMenu) return false;

      const attachBtn =
        document.querySelector('#main footer button[aria-label*="Adjuntar"]') ||
        document.querySelector('#main footer button[aria-label*="Attach"]') ||
        document.querySelector('#main footer div[role="button"][aria-label*="Adjuntar"]') ||
        document.querySelector('#main footer div[role="button"][aria-label*="Attach"]') ||
        document.querySelector('#main footer span[data-icon="plus"]')?.closest('button, div[role="button"]') ||
        document.querySelector('#main footer span[data-icon="plus-rounded"]')?.closest('button, div[role="button"]') ||
        document.querySelector('#main footer span[data-icon="clip"]')?.closest('button, div[role="button"]');

      if (attachBtn) {
        isOpeningAttachMenu = true;
        // Solo abrir el botón '+' si el menú no está ya desplegado en pantalla
        const menuAlreadyVisible = Boolean(
          document.querySelector('[role="application"] li, [data-animate-dropdown-item="true"]') &&
            Array.from(document.querySelectorAll('li, [role="button"], [role="listitem"]')).some(el => {
              const t = (el.innerText || '').toLowerCase();
              return t.includes('fotos y videos') || t.includes('photos & videos') || t.includes('documento');
            })
        );
        if (!menuAlreadyVisible) {
          simulateSafeUserClick(attachBtn);
        }

        let menuPolls = 0;
        const pollMenuTimer = setInterval(() => {
          menuPolls++;
          const menuInputs = findWaFileInputs();
          if (hasVideoOrImage) {
            const mediaInp = findMediaGalleryInput(menuInputs);
            if (mediaInp) {
              clearInterval(pollMenuTimer);
              isOpeningAttachMenu = false;
              assignFilesToInputWithReactSetter(mediaInp, dt);
              return;
            }
          } else if (menuInputs.length > 0) {
            clearInterval(pollMenuTimer);
            isOpeningAttachMenu = false;
            assignFilesToInputWithReactSetter(findDocumentInput(menuInputs), dt);
            return;
          }

          // Si en esta versión de WhatsApp Web el <input type="file"> se crea al pulsar la opción "Fotos y videos" / "Documento":
          if (menuPolls >= 2) {
            const candidates = Array.from(
              document.querySelectorAll('li, [role="listitem"], [role="menuitem"], [data-animate-dropdown-item="true"], div[role="button"]')
            );
            const targetMenuItem = candidates.find(el => {
              if (el.closest('#main footer') || el.closest('#side') || el.closest('#zentry-wa-modal-backdrop')) return false;
              const txt = (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
              if (hasVideoOrImage) {
                return (
                  txt === 'fotos y videos' ||
                  txt === 'fotos y vídeos' ||
                  txt === 'photos & videos' ||
                  txt === 'photos and videos' ||
                  txt.includes('fotos y video') ||
                  txt.includes('photos & video') ||
                  Boolean(el.querySelector('span[data-icon*="media"], span[data-icon*="image"], span[data-icon*="photo"], svg path[d*="M19 3H5"]'))
                );
              }
              return txt === 'documento' || txt === 'document' || txt.includes('documento');
            });

            if (targetMenuItem) {
              const nestedInp = targetMenuItem.querySelector('input[type="file"]');
              if (nestedInp) {
                clearInterval(pollMenuTimer);
                isOpeningAttachMenu = false;
                assignFilesToInputWithReactSetter(nestedInp, dt);
                return;
              }
            }
          }

          if (menuPolls >= 8) {
            clearInterval(pollMenuTimer);
            isOpeningAttachMenu = false;
          }
        }, 120);

        return true;
      }
    } catch (err) {
      isOpeningAttachMenu = false;
      console.warn('[TickTool] Fallback input[type=file] warning:', err);
    }
    return false;
  }

  // Inyecta archivos adjuntos (Imágenes, PDF, Video, Documentos) y texto en el chat activo de WhatsApp Web SIN abrir menús si Paste funciona, y los envía automáticamente
  function dispatchAttachmentsAndTextInActiveChat(attachments, text, onComplete) {
    const cleanText = sanitizeWatermarkText(text);
    const validFiles = (Array.isArray(attachments) ? attachments : [])
      .map(att => {
        if (!att) return null;
        if (att instanceof File) return ensureNormalizedFileMime(att);
        if (att.file instanceof File) return ensureNormalizedFileMime(att.file);
        return dataUrlToFile(att.dataUrl, att.name, att.type || att.mimeType);
      })
      .filter(Boolean);

    if (validFiles.length === 0) {
      return typeAndSendInActiveChat(cleanText, [], onComplete);
    }

    const hasVideoFile = validFiles.some(
      f => inferMediaMimeType(f.name, f.type).startsWith('video/') || /\.(mp4|mov|webm|m4v|3gp)$/i.test(f.name || '')
    );
    const composer = findActiveComposer();
    const mainChatPane = document.querySelector('#main') || document.body;

    // 1. Escribir el texto en el compositor antes de adjuntar (WhatsApp Web lo mueve al caption del modal automáticamente)
    if (composer && cleanText) {
      composer.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, cleanText);
      composer.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
    }

    setTimeout(() => {
      try {
        const dt = new DataTransfer();
        validFiles.forEach(file => dt.items.add(file));

        const targetEl = findActiveComposer() || mainChatPane;
        targetEl.focus?.();

        // PASO 1 SILENCIOSO ("Behind the Scenes"):
        // Disparar ClipboardEvent('paste') directamente sobre la caja de texto con MIME normalizado (video/mp4, image/png, application/pdf).
        // En WhatsApp Web, pegar un File con type="video/mp4" abre directamente el visor de VIDEO sin tocar el botón '+' ni abrir menús.
        const pasteEvt = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          composed: true,
          clipboardData: dt
        });
        targetEl.dispatchEvent(pasteEvt);
        if (composer && targetEl !== composer) {
          composer.dispatchEvent(pasteEvt);
        }

        // PASO 2 (Respaldo a los 550ms SOLO si Paste no abrió el modal de vista previa):
        // Usar el <input type="file" accept="image/*,video/mp4,..."> una sola vez (sin doble clic que cierre el menú)
        setTimeout(() => {
          if (!findMediaModalSendButton() && !findMediaModalCaptionBox()) {
            injectFilesViaNativeFileInput(validFiles);
          }
        }, 550);

        showOverlayToast(
          hasVideoFile
            ? `🎬 Procesando video adjunto (${validFiles.length}) y enviando automáticamente...`
            : `📎 Adjuntando ${validFiles.length} archivo(s) y enviando automáticamente...`
        );

        // 2. Esperar a que aparezca el Modal de Vista Previa Multimedia (fuera de #main footer)
        let attempts = 0;
        let modalWasOpened = false;
        let clickAttemptsOnModal = 0;
        const maxAttempts = hasVideoFile ? 65 : 35;

        const waitMediaModal = setInterval(() => {
          if (!isExtensionContextValid()) {
            clearInterval(waitMediaModal);
            return;
          }
          attempts++;
          const modalSendBtn = findMediaModalSendButton();
          const modalCaption = findMediaModalCaptionBox();

          if (modalSendBtn) {
            modalWasOpened = true;
            clickAttemptsOnModal++;

            // Asegurarnos de que el texto/comentario esté puesto en el caption del modal de archivo/video
            if (cleanText && modalCaption && !(modalCaption.innerText || '').trim()) {
              modalCaption.focus();
              document.execCommand('selectAll', false, null);
              document.execCommand('insertText', false, cleanText);
              modalCaption.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
            }

            const warmupTicks = hasVideoFile ? 2 : 1;
            if (clickAttemptsOnModal <= warmupTicks) {
              return;
            }

            // Pulsar el botón verde de Enviar del modal de archivos/video + fallback Enter en el caption del modal
            simulateSafeUserClick(modalSendBtn);
            if (clickAttemptsOnModal >= warmupTicks + 1 && modalCaption) {
              triggerEnterOnComposer(modalCaption);
            } else if (clickAttemptsOnModal >= warmupTicks + 2) {
              triggerEnterOnComposer(document.activeElement || modalSendBtn);
            }
          } else if (modalWasOpened && !modalSendBtn) {
            // ¡El modal de vista previa ya se cerró! Eso confirma que el video/archivo + mensaje fueron enviados.
            clearInterval(waitMediaModal);
            showOverlayToast(`✅ Mensaje + ${validFiles.length} adjunto(s) enviados automáticamente`);
            if (onComplete) onComplete(true);
          } else if (attempts >= maxAttempts) {
            clearInterval(waitMediaModal);
            const fallbackBtn = findMediaModalSendButton() || findSendButton();
            if (fallbackBtn) simulateSafeUserClick(fallbackBtn);
            if (onComplete) onComplete(true);
          }
        }, 400);
      } catch (err) {
        console.warn('[TickTool] Error despachando adjuntos:', err);
        typeAndSendInActiveChat(cleanText, [], onComplete);
      }
    }, 320);

    return true;
  }

  // Escribe directamente en la caja de mensaje del chat abierto y presiona Enviar automáticamente (con soporte de adjuntos)
  function typeAndSendInActiveChat(text, attachments = [], onComplete) {
    if ( typeof attachments === 'function' ) {
      onComplete = attachments;
      attachments = [];
    }
    if (Array.isArray(attachments) && attachments.length > 0) {
      return dispatchAttachmentsAndTextInActiveChat(attachments, text, onComplete);
    }

    const cleanText = sanitizeWatermarkText(text);
    const composer = findActiveComposer();
    if (!composer || !cleanText) {
      if (onComplete) onComplete(false);
      return false;
    }

    composer.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, cleanText);
    composer.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));

    setTimeout(() => {
      const sendBtn = findSendButton();
      if (sendBtn) {
        simulateSafeUserClick(sendBtn);
      } else {
        triggerEnterOnComposer(composer);
      }

      // Verificación de respaldo a los 400ms para asegurar que el mensaje nunca quede en borrador
      setTimeout(() => {
        const remainingText = (composer.innerText || '').trim();
        if (remainingText.length > 0) {
          const retryBtn = findSendButton();
          if (retryBtn) {
            simulateSafeUserClick(retryBtn);
          } else {
            triggerEnterOnComposer(composer);
          }
        }
        showOverlayToast('✅ Mensaje enviado automáticamente por Zentry Tick Tool');
        if (onComplete) onComplete(true);
      }, 400);
    }, 320);

    return true;
  }

  // Busca un contacto por su Nombre o Teléfono en la lista o buscador de WhatsApp Web SIN recargar la página, abre su chat y le envía el mensaje + adjuntos
  function searchAndOpenContactByNameAndSend(contactQuery, messageText, outboxId, attachments = [], onComplete) {
    if (typeof attachments === 'function') {
      onComplete = attachments;
      attachments = [];
    }
    const cleanName = String(contactQuery || '').trim();
    const cleanText = sanitizeWatermarkText(messageText);
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    if (!cleanName || (!cleanText && !hasAttachments)) {
      if (onComplete) onComplete(false);
      return;
    }

    showOverlayToast(`🔍 Abriendo chat de "${cleanName}" al instante...`);

    const digitsOnly = cleanName.replace(/\D/g, '');
    const last9Digits = digitsOnly.length >= 9 ? digitsOnly.slice(-9) : '';

    const finishOnceChatIsOpen = () => {
      typeAndSendInActiveChat(cleanText, attachments, ok => {
        if (outboxId) {
          safeRuntimeSendMessage({ type: 'TICKTOOL_INFLIGHT_COMPLETED', outboxId });
        }
        if (onComplete) onComplete(ok);
      });
    };

    // 1. Revisar si está visible en #pane-side
    const findVisibleRowByQuery = () => {
      const rows = document.querySelectorAll('#pane-side [role="listitem"], #pane-side [role="row"]');
      const needle = cleanName.toLowerCase();
      for (const row of rows) {
        const titleEl = row.querySelector('span[dir="auto"][title]') || row.querySelector('[title]');
        const title = titleEl ? (titleEl.getAttribute('title') || titleEl.textContent || '').trim() : '';
        const rowDigits = title.replace(/\D/g, '');
        const dataIdEl = row.querySelector('[data-id*="@c.us"]');
        const dataId = dataIdEl ? dataIdEl.getAttribute('data-id') || '' : '';

        if (
          (title && (title.toLowerCase() === needle || title.toLowerCase().includes(needle))) ||
          (last9Digits && (rowDigits.endsWith(last9Digits) || dataId.includes(last9Digits)))
        ) {
          return row;
        }
      }
      return null;
    };

    // Función auxiliar que usa la barra de búsqueda superior de WhatsApp Web (#side) y presiona Enter / clic en resultado
    const openViaSearchBoxFallback = () => {
      let searchInput = findSearchInputBox();
      if (!searchInput) {
        const searchBtn =
          document.querySelector('#side button[aria-label*="Buscar"]') ||
          document.querySelector('#side button[aria-label*="Search"]') ||
          document.querySelector('#side span[data-icon="search"]')?.closest('button, div[role="button"]');
        if (searchBtn) simulateSafeUserClick(searchBtn);
      }

      setTimeout(() => {
        searchInput = findSearchInputBox();
        if (!searchInput) {
          if (onComplete) onComplete(false);
          return;
        }

        simulateSafeUserClick(searchInput);
        searchInput.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, last9Digits || cleanName);
        searchInput.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));

        setTimeout(() => {
          const foundRow = findVisibleRowByQuery();
          if (foundRow) {
            clickChatRowReliably(foundRow);
          }
          // También enviar Enter en el buscador por si el clic virtual en la lista virtualizada requiere Enter
          triggerEnterOnComposer(searchInput);

          let attempts = 0;
          const waitComp = setInterval(() => {
            attempts++;
            const comp = findActiveComposer();
            // CRÍTICO: Verificar que el chat activo sea realmente el del contacto buscado y no el chat residual anterior
            const isCorrectChat = isTargetChatCurrentlyActive(last9Digits, cleanName, cleanText);
            if (comp && isCorrectChat) {
              clearInterval(waitComp);
              finishOnceChatIsOpen();
            } else if (attempts === 4) {
              const retryRow = findVisibleRowByQuery();
              if (retryRow) clickChatRowReliably(retryRow);
              triggerEnterOnComposer(searchInput);
            } else if (attempts > 16) {
              clearInterval(waitComp);
              console.warn('[Zentry TickTool] Timeout o destinatario incorrecto en búsqueda:', cleanName);
              if (onComplete) onComplete(false);
            }
          }, 250);
        }, 650);
      }, 120);
    };

    const directRow = findVisibleRowByQuery();
    if (directRow) {
      clickChatRowReliably(directRow);
      let attempts = 0;
      const waitComp = setInterval(() => {
        attempts++;
        const comp = findActiveComposer();
        const isCorrectChat = isTargetChatCurrentlyActive(last9Digits, cleanName, cleanText);
        if (comp && isCorrectChat) {
          clearInterval(waitComp);
          finishOnceChatIsOpen();
        } else if (attempts === 3) {
          // Re-intentar clic en la fila
          clickChatRowReliably(directRow);
        } else if (attempts >= 6) {
          // Si tras ~1.5s el clic directo en #pane-side no montó el chat, usar el buscador (#side) + Enter automáticamente
          clearInterval(waitComp);
          openViaSearchBoxFallback();
        }
      }, 250);
      return;
    }

    openViaSearchBoxFallback();
  }

  // Espera a que el botón de envío o el compositor pre-llenado esté disponible en el DOM y dispara el envío automático
  let activeDispatchInterval = null;
  let isDispatchingInTab = false;
  const completedOutboxIds = new Set();

  function cleanWhatsAppSendUrlParams() {
    try {
      if (window.location.pathname.includes('/send') || window.location.search.includes('phone=')) {
        window.history.replaceState({}, document.title, 'https://web.whatsapp.com/');
      }
    } catch (_) {}
  }

  function markOutboxCompletedInTab(outboxId) {
    if (outboxId) completedOutboxIds.add(outboxId);
    isDispatchingInTab = false;
    cleanWhatsAppSendUrlParams();
    safeRuntimeSendMessage({
      type: 'TICKTOOL_INFLIGHT_COMPLETED',
      outboxId
    });
  }

  function waitForSendButtonAndDispatch(outboxId, expectedText = '', attachments = [], targetPhone = '', targetLeadName = '', maxWaitMs = 28000) {
    if (outboxId && completedOutboxIds.has(outboxId)) return;
    if (isDispatchingInTab) return;

    if (activeDispatchInterval) clearInterval(activeDispatchInterval);
    isDispatchingInTab = true;
    const startTime = Date.now();
    let dispatched = false;
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

    activeDispatchInterval = setInterval(() => {
      if (dispatched || Date.now() - startTime > maxWaitMs || !isExtensionContextValid()) {
        clearInterval(activeDispatchInterval);
        activeDispatchInterval = null;
        if (!dispatched) {
          const comp = findActiveComposer();
          const btn = findSendButton();
          if (comp && (comp.innerText || '').trim().length > 0) {
            if (btn) simulateSafeUserClick(btn);
            else triggerEnterOnComposer(comp);
            markOutboxCompletedInTab(outboxId);
          } else {
            isDispatchingInTab = false;
          }
        }
        return;
      }

      // 1. Detección y descarte si WhatsApp Web muestra diálogo de número no válido
      const modalDialog = document.querySelector('div[data-animate-modal-popup="true"], div[role="dialog"]');
      if (modalDialog) {
        const dialogText = (modalDialog.textContent || '').toLowerCase();
        if (
          dialogText.includes('no es válido') ||
          dialogText.includes('no es valido') ||
          dialogText.includes('invalid') ||
          dialogText.includes('no se pudo encontrar')
        ) {
          clearInterval(activeDispatchInterval);
          activeDispatchInterval = null;
          isDispatchingInTab = false;
          cleanWhatsAppSendUrlParams();
          const okBtn = modalDialog.querySelector('button');
          if (okBtn) simulateSafeUserClick(okBtn);
          safeRuntimeSendMessage({
            type: 'TICKTOOL_DISPATCH_FAILED',
            outboxId,
            reason: 'INVALID_PHONE_NUMBER'
          });
          showOverlayToast('⚠️ Número de teléfono no válido en WhatsApp Web.');
          return;
        }
      }

      // 2. CANDADO ANTI-DESVÍO: Verificar que el chat activo coincida estrictamente con el destinatario
      // Si el chat anterior aún sigue en pantalla mientras carga la URL, NUNCA enviar al chat residual
      if (targetPhone || targetLeadName) {
        if (!isTargetChatCurrentlyActive(targetPhone, targetLeadName, expectedText)) {
          return;
        }
      }

      const sendBtn = findSendButton();
      const composer = findActiveComposer();
      const composerText = composer ? (composer.innerText || '').trim() : '';

      // Si hay archivos adjuntos y el compositor del chat ya está listo, despachar adjuntos + texto
      if (hasAttachments && composer) {
        dispatched = true;
        clearInterval(activeDispatchInterval);
        activeDispatchInterval = null;
        dispatchAttachmentsAndTextInActiveChat(attachments, expectedText || composerText, () => {
          markOutboxCompletedInTab(outboxId);
        });
        return;
      }

      if (sendBtn) {
        dispatched = true;
        clearInterval(activeDispatchInterval);
        activeDispatchInterval = null;
        sanitizeComposerIfNeeded();

        setTimeout(() => {
          const btnNow = findSendButton();
          if (btnNow) {
            simulateSafeUserClick(btnNow);
          } else if (composer) {
            triggerEnterOnComposer(composer);
          }

          // Verificación de respaldo a los 400ms para asegurar que el mensaje nunca quede en borrador
          setTimeout(() => {
            const compAfter = findActiveComposer();
            const textRemaining = (compAfter?.innerText || '').trim();
            if (textRemaining.length > 0) {
              const retryBtn = findSendButton();
              if (retryBtn) {
                simulateSafeUserClick(retryBtn);
              } else if (compAfter) {
                triggerEnterOnComposer(compAfter);
              }
            }
            showOverlayToast('🚀 Mensaje enviado automáticamente por Zentry Tick Tool (0 marcas de agua)');
            markOutboxCompletedInTab(outboxId);
          }, 400);
        }, 320);
      } else if (composer && (composerText.length > 0 || expectedText)) {
        if (!composerText && expectedText) {
          dispatched = true;
          clearInterval(activeDispatchInterval);
          activeDispatchInterval = null;
          typeAndSendInActiveChat(expectedText, attachments, () => {
            markOutboxCompletedInTab(outboxId);
          });
        } else if (composerText.length > 0) {
          dispatched = true;
          clearInterval(activeDispatchInterval);
          activeDispatchInterval = null;
          sanitizeComposerIfNeeded();
          const btnRetry = findSendButton();
          if (btnRetry) {
            simulateSafeUserClick(btnRetry);
          } else {
            triggerEnterOnComposer(composer);
          }
          setTimeout(() => {
            const compAfter = findActiveComposer();
            if ((compAfter?.innerText || '').trim().length > 0) {
              const retryBtn2 = findSendButton();
              if (retryBtn2) simulateSafeUserClick(retryBtn2);
              else if (compAfter) triggerEnterOnComposer(compAfter);
            }
            showOverlayToast('🚀 Mensaje enviado automáticamente (Enter)');
            markOutboxCompletedInTab(outboxId);
          }, 400);
        }
      }
    }, 300);
  }

  function sendHeartbeatWithContacts() {
    if (!isExtensionContextValid()) {
      if (typeof window.__zentryTickToolCleanup === 'function') {
        window.__zentryTickToolCleanup();
      }
      return;
    }
    const contacts = scrapeWhatsAppAgendaContacts();
    safeRuntimeSendMessage(
      {
        type: 'TICKTOOL_WA_HEARTBEAT',
        contacts
      },
      response => {
        // Si ya hay un despacho activo en esta pestaña, NO volver a disparar desde el heartbeat
        if (isDispatchingInTab) return;

        const inFlight = response?.inFlightDispatch;
        const hasUrlSendParams =
          window.location.pathname.includes('/send') || window.location.search.includes('phone=');

        if (inFlight && inFlight.outboxId && completedOutboxIds.has(inFlight.outboxId)) {
          cleanWhatsAppSendUrlParams();
          return;
        }

        // Solo actuar en el heartbeat si realmente venimos de una recarga por URL (`/send?phone=...`)
        if (hasUrlSendParams && inFlight) {
          const normPhone = String(inFlight?.phone || '').replace(/\D/g, '');
          if (normPhone) {
            window.__zentryLastNavigated = {
              phone: normPhone,
              timestamp: Date.now()
            };
          }
          let urlText = inFlight?.message || '';
          const inFlightAttachments = Array.isArray(inFlight?.attachments) ? inFlight.attachments : [];
          try {
            const params = new URLSearchParams(window.location.search);
            if (params.get('text')) urlText = params.get('text');
          } catch (_) {}

          waitForSendButtonAndDispatch(
            inFlight.outboxId || 'url-dispatch',
            urlText,
            inFlightAttachments,
            inFlight?.phone || '',
            inFlight?.leadName || ''
          );
        }
      }
    );
  }

  sendHeartbeatWithContacts();
  const heartbeatIntervalId = setInterval(sendHeartbeatWithContacts, 12000);

  // Escuchar órdenes desde background.js
  if (isExtensionContextValid()) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!isExtensionContextValid()) return false;
      if (
        message?.type === 'TICKTOOL_COLLECT_WA_CONTACTS' ||
        message?.type === 'TICKTOOL_SCRAPE_CONTACTS_NOW'
      ) {
        const contacts = scrapeWhatsAppAgendaContacts();
        sendResponse({ contacts });
        return true;
      }

      if (message?.type === 'TICKTOOL_DISPATCH_MESSAGE') {
        const {
          outboxId,
          phone,
          leadName,
          message: rawText,
          attachments = [],
          mode
        } = message.payload || {};

        // Candado anti-duplicado: si este outboxId ya fue enviado o ya estamos despachando en la pestaña, ignorar
        if ((outboxId && completedOutboxIds.has(outboxId)) || isDispatchingInTab) {
          sendResponse({ accepted: true, deduplicated: true });
          return true;
        }

        const cleanText = sanitizeWatermarkText(rawText);
        const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
        if (!cleanText && !hasAttachments) {
          sendResponse({ accepted: false });
          return false;
        }

        isDispatchingInTab = true;
        const activePhone = extractActiveChatPhone();
        const activeHeader = extractActiveChatHeaderName();
        const normalizedTarget = String(phone || '').replace(/\D/g, '');

        const isSameActiveChat =
          mode === 'ACTIVE_CHAT' ||
          (activePhone && normalizedTarget && activePhone.endsWith(normalizedTarget.slice(-9))) ||
          (leadName && activeHeader && activeHeader.toLowerCase() === String(leadName).toLowerCase());

        // Caso 1: Ya estamos en el chat de ese contacto -> escribir/adjuntar y enviar directo en ~1 seg
        if (isSameActiveChat && findActiveComposer()) {
          typeAndSendInActiveChat(cleanText, attachments, () => {
            markOutboxCompletedInTab(outboxId);
          });
          sendResponse({ accepted: true, directComposer: true });
          return true;
        }

        // Caso 2: El contacto proviene de la Agenda de WhatsApp Web por nombre (sin número visible)
        if (!normalizedTarget && leadName) {
          searchAndOpenContactByNameAndSend(leadName, cleanText, outboxId, attachments, () => {
            markOutboxCompletedInTab(outboxId);
          });
          sendResponse({ accepted: true, byContactName: true });
          return true;
        }

        if (!normalizedTarget) {
          isDispatchingInTab = false;
          sendResponse({ accepted: false });
          return false;
        }

        // Caso 3: Tenemos el teléfono (+51...) -> PRIORIDAD ABSOLUTA AL NÚMERO TELEFÓNICO (Phone-First)
        // JAMÁS buscar por nombre de lead si tenemos el teléfono, ya que la agenda de WhatsApp puede tener otro nombre
        // o no estar guardado aún, lo que provocaría abrir y enviar al chat incorrecto.
        searchAndOpenContactByNameAndSend(
          normalizedTarget,
          cleanText,
          outboxId,
          attachments,
          foundAndSent => {
            if (foundAndSent) {
              markOutboxCompletedInTab(outboxId);
            } else {
              isDispatchingInTab = false;
              window.__zentryLastNavigated = {
                phone: normalizedTarget,
                timestamp: Date.now()
              };
              const tempLink = document.createElement('a');
              tempLink.href = `https://web.whatsapp.com/send?phone=${encodeURIComponent(normalizedTarget)}&text=${encodeURIComponent(cleanText)}`;
              tempLink.style.display = 'none';
              document.body.appendChild(tempLink);
              tempLink.click();
              document.body.removeChild(tempLink);
              waitForSendButtonAndDispatch(outboxId, cleanText, attachments, normalizedTarget, leadName);
            }
          }
        );

        sendResponse({ accepted: true, fastSpaOrUrlFallback: true });
        return true;
      }
      return false;
    });
  }

  // ── DETECTOR DE INTERRUPCIÓN POR RESPUESTA ENTRANTE (INBOUND TRIGGER) ───────
  const processedInboundIds = new Set();

  function extractPhoneFromDataId(dataId) {
    if (!dataId || !dataId.startsWith('false_')) return null;
    const match = dataId.match(/^false_(\d{8,15})@/);
    return match ? match[1] : null;
  }

  function inspectInboundMessages() {
    if (!isExtensionContextValid()) return;
    const inboundNodes = document.querySelectorAll('div.message-in, div[data-id^="false_"]');
    inboundNodes.forEach(node => {
      const dataId =
        node.getAttribute('data-id') ||
        node.closest('[data-id]')?.getAttribute('data-id') ||
        '';

      if (!dataId || processedInboundIds.has(dataId)) return;
      processedInboundIds.add(dataId);

      const senderPhone = extractPhoneFromDataId(dataId);
      const chatTitle = extractActiveChatHeaderName();

      if (senderPhone || chatTitle) {
        safeRuntimeSendMessage({
          type: 'TICKTOOL_INBOUND_REPLY',
          phone: senderPhone || chatTitle,
          leadName: chatTitle
        });
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // HERRAMIENTAS SUPERPUESTAS EN WHATSAPP WEB (ESTILO BLUETICKS — CAPTURA 141430)
  // 1. Barra Superior (`#zentry-wa-topbar`) con pestañas de filtro y botón Agenda/Programar
  // 2. Botón Reloj/Destello (`#zentry-wa-schedule-btn`) junto al cuadro de mensaje
  // 3. Modal de Envío Individual & Programación con Buscador de Agenda de WhatsApp Web
  // ══════════════════════════════════════════════════════════════════════════════

  let activeTopFilter = 'todos';
  let localScheduledTimers = [];

  function injectOverlayStyles() {
    if (document.getElementById('zentry-ticktool-wa-styles')) return;
    const style = document.createElement('style');
    style.id = 'zentry-ticktool-wa-styles';
    style.textContent = `
      #zentry-wa-topbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 40px;
        background: linear-gradient(90deg, #0b141a 0%, #111b21 55%, #0f172a 100%);
        border-bottom: 1px solid rgba(16, 185, 129, 0.32);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 14px;
        z-index: 99990;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #e9edef;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
      }
      body.zentry-wa-has-topbar #app > div {
        padding-top: 40px !important;
        box-sizing: border-box !important;
      }
      .ztt-wa-tabs {
        display: flex;
        align-items: center;
        gap: 6px;
        overflow-x: auto;
      }
      .ztt-wa-brand {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.4);
        color: #34d399;
        font-size: 11.5px;
        font-weight: 700;
        margin-right: 6px;
        white-space: nowrap;
      }
      .ztt-wa-tab {
        background: transparent;
        border: 1px solid transparent;
        color: #aebac1;
        font-size: 12px;
        font-weight: 600;
        padding: 5px 11px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;
      }
      .ztt-wa-tab:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.06);
      }
      .ztt-wa-tab.active {
        color: #00a884;
        background: rgba(0, 168, 132, 0.12);
        border-bottom: 2px solid #00a884;
        border-radius: 6px 6px 0 0;
      }
      .ztt-wa-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ztt-wa-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 7px;
        border: 1px solid rgba(148, 163, 184, 0.25);
        background: rgba(30, 41, 59, 0.75);
        color: #e2e8f0;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .ztt-wa-action-btn:hover {
        border-color: #10b981;
        color: #6ee7b7;
      }
      .ztt-wa-action-btn.primary {
        background: linear-gradient(135deg, #00a884, #059669);
        border-color: rgba(16, 185, 129, 0.5);
        color: #ffffff;
      }
      #zentry-wa-schedule-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        height: 36px;
        padding: 0 11px;
        margin: 0 6px;
        border-radius: 999px;
        border: 1.5px solid rgba(0, 168, 132, 0.65);
        background: linear-gradient(135deg, rgba(0, 168, 132, 0.22), rgba(16, 185, 129, 0.12));
        color: #00a884;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.18s ease;
        box-shadow: 0 0 12px rgba(0, 168, 132, 0.25);
        flex-shrink: 0;
        z-index: 50;
      }
      #zentry-wa-schedule-btn:hover {
        background: linear-gradient(135deg, #00a884, #059669);
        color: #ffffff;
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(0, 168, 132, 0.45);
      }
      #zentry-wa-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(6, 11, 19, 0.68);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99998;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .ztt-wa-modal {
        width: 480px;
        max-width: 94vw;
        background: #111b21;
        border: 1px solid rgba(0, 168, 132, 0.45);
        border-radius: 16px;
        padding: 20px;
        color: #e9edef;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
      }
      .ztt-wa-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(134, 150, 160, 0.18);
        margin-bottom: 14px;
      }
      .ztt-wa-modal-title {
        font-size: 15px;
        font-weight: 800;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ztt-wa-modal-close {
        background: transparent;
        border: none;
        color: #8696a0;
        font-size: 18px;
        cursor: pointer;
      }
      .ztt-wa-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin: 8px 0 12px;
      }
      .ztt-wa-delay-chip {
        padding: 6px 11px;
        border-radius: 8px;
        border: 1px solid rgba(134, 150, 160, 0.3);
        background: #202c33;
        color: #d1d7db;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .ztt-wa-delay-chip.active {
        border-color: #00a884;
        background: rgba(0, 168, 132, 0.22);
        color: #34d399;
      }
      .ztt-wa-textarea {
        width: 100%;
        min-height: 88px;
        border-radius: 10px;
        border: 1px solid rgba(134, 150, 160, 0.3);
        background: #202c33;
        color: #e9edef;
        padding: 10px 12px;
        font-size: 13px;
        resize: vertical;
        box-sizing: border-box;
      }
      .ztt-wa-textarea:focus {
        outline: none;
        border-color: #00a884;
      }
      .ztt-wa-input {
        width: 100%;
        border-radius: 8px;
        border: 1px solid rgba(134, 150, 160, 0.3);
        background: #202c33;
        color: #e9edef;
        padding: 8px 10px;
        font-size: 12.5px;
        box-sizing: border-box;
      }
      #zentry-wa-toast {
        position: fixed;
        bottom: 78px;
        right: 24px;
        background: linear-gradient(135deg, #064e3b, #0f172a);
        border: 1px solid #10b981;
        color: #ecfdf5;
        padding: 10px 16px;
        border-radius: 12px;
        font-size: 12.5px;
        font-weight: 600;
        z-index: 99999;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
        transition: opacity 0.25s ease;
      }
    `;
    document.head.appendChild(style);
  }

  function showOverlayToast(text, durationMs = 4200) {
    let toast = document.getElementById('zentry-wa-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'zentry-wa-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.style.opacity = '1';
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
      if (toast) toast.style.opacity = '0';
    }, durationMs);
  }

  function applyChatListFilter(filterId) {
    activeTopFilter = filterId;
    const topbar = document.getElementById('zentry-wa-topbar');
    if (topbar) {
      topbar.querySelectorAll('.ztt-wa-tab').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === filterId);
      });
    }

    const rows = document.querySelectorAll('#pane-side [role="listitem"], #pane-side [role="row"]');
    rows.forEach(row => {
      const text = (row.innerText || '').toLowerCase();
      const hasUnreadBadge = Boolean(
        row.querySelector('[aria-label*="no leído"], [aria-label*="unread"], span[data-icon="unread-count"]')
      );

      let visible = true;
      if (filterId === 'no-leidos') {
        visible = hasUnreadBadge;
      } else if (filterId === 'necesita-atencion') {
        visible = hasUnreadBadge || text.includes('?') || text.includes('precio') || text.includes('info');
      } else if (filterId === 'resolver-despues') {
        visible = !hasUnreadBadge;
      }
      row.style.display = visible ? '' : 'none';
    });
  }

  function injectTopFilterBar() {
    if (document.getElementById('zentry-wa-topbar')) return;
    injectOverlayStyles();

    const bar = document.createElement('div');
    bar.id = 'zentry-wa-topbar';
    bar.innerHTML = `
      <div class="ztt-wa-tabs">
        <span class="ztt-wa-brand" title="Conectado a QZ-Hub & Zentry CRM sin marcas de agua">
          🟢 Tick Tool WS v1.3
        </span>
        <button type="button" class="ztt-wa-tab active" data-filter="todos">Todos</button>
        <button type="button" class="ztt-wa-tab" data-filter="bandeja">Bandeja De Entrada</button>
        <button type="button" class="ztt-wa-tab" data-filter="resolver-despues">Resolver Después</button>
        <button type="button" class="ztt-wa-tab" data-filter="necesita-atencion">Necesita Atención</button>
        <button type="button" class="ztt-wa-tab" data-filter="no-leidos">No Leídos</button>
      </div>
      <div class="ztt-wa-actions">
        <span id="ztt-wa-countdown-pill" style="display:none;font-size:11.5px;font-weight:700;color:#fde68a;background:rgba(245,158,11,0.16);border:1px solid rgba(245,158,11,0.4);padding:3px 9px;border-radius:999px;"></span>
        <button type="button" class="ztt-wa-action-btn primary" id="ztt-wa-open-scheduler-top">
          👤 Envío Individual / Programar
        </button>
        <button type="button" class="ztt-wa-action-btn" id="ztt-wa-open-qzhub" title="Abrir panel de campañas en QZ-Hub">
          🚀 QZ-Hub
        </button>
      </div>
    `;

    document.body.appendChild(bar);
    document.body.classList.add('zentry-wa-has-topbar');

    bar.querySelectorAll('.ztt-wa-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.getAttribute('data-filter') || 'todos';
        applyChatListFilter(f);
      });
    });

    const topSchedBtn = bar.querySelector('#ztt-wa-open-scheduler-top');
    if (topSchedBtn) {
      topSchedBtn.addEventListener('click', () => openInChatSchedulerModal());
    }

    const openHubBtn = bar.querySelector('#ztt-wa-open-qzhub');
    if (openHubBtn) {
      openHubBtn.addEventListener('click', () => {
        window.open('https://qz-hub-app.web.app/#prospeccion', '_blank');
      });
    }
  }

  function injectComposerScheduleButton() {
    const footer = document.querySelector('#main footer');
    if (!footer) return;
    if (document.getElementById('zentry-wa-schedule-btn')) return;

    const composer = findActiveComposer();
    if (!composer) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'zentry-wa-schedule-btn';
    btn.title = 'Enviar o programar mensaje individual con Agenda de WhatsApp y Adjuntos (Zentry Tick Tool · Sin marca de agua)';
    btn.innerHTML = `<span>⏰✨</span><span style="font-size:11px;">Programar</span>`;

    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      openInChatSchedulerModal();
    });

    const targetRow = composer.closest('div._ak1r') || composer.parentElement?.parentElement || footer;
    if (targetRow && targetRow.parentElement) {
      targetRow.parentElement.insertBefore(btn, targetRow.nextSibling);
    } else {
      footer.appendChild(btn);
    }
  }

  // Modal superpuesto en WhatsApp Web con Selector de Agenda de Contactos + Adjuntos + Envío Inmediato o Programado
  function openInChatSchedulerModal() {
    injectOverlayStyles();
    const existing = document.getElementById('zentry-wa-modal-backdrop');
    if (existing) existing.remove();

    const contacts = scrapeWhatsAppAgendaContacts();
    const activeChatName = extractActiveChatHeaderName() || '';
    const activePhone = extractActiveChatPhone();
    const composer = findActiveComposer();
    const currentDraft = composer ? (composer.innerText || '').trim() : '';

    const defaultTargetName = activeChatName || (contacts[0] ? contacts[0].name : 'Contacto');
    const defaultMsg =
      currentDraft ||
      `Hola ${defaultTargetName.split(' ')[0] || ''} 👋, te escribo desde Zentry para confirmar tu información. ¿Cómo estás?`;

    let modalAttachments = [];

    const backdrop = document.createElement('div');
    backdrop.id = 'zentry-wa-modal-backdrop';
    backdrop.innerHTML = `
      <div class="ztt-wa-modal">
        <div class="ztt-wa-modal-header">
          <div class="ztt-wa-modal-title">
            <span>👤 Envío Individual & Agenda WhatsApp</span>
            <span style="font-size:10.5px;padding:2px 7px;border-radius:999px;background:rgba(16,185,129,0.2);color:#34d399;">Auto-Send + Adjuntos</span>
          </div>
          <button type="button" class="ztt-wa-modal-close" id="ztt-modal-close">✕</button>
        </div>

        <label style="display:block;font-size:11.5px;font-weight:700;color:#cbd5e1;margin-bottom:5px;">
          1. Selecciona un contacto de tu Agenda de WhatsApp Web o escribe su nombre/número:
        </label>
        <div style="display:flex;gap:6px;margin-bottom:10px;">
          <input
            type="text"
            id="ztt-contact-search-input"
            class="ztt-wa-input"
            list="ztt-wa-contacts-datalist"
            value="${activeChatName || activePhone || ''}"
            placeholder="🔍 Buscar contacto en tu agenda (ej. Yixy Linares, Karen, +51989...)"
          />
          <datalist id="ztt-wa-contacts-datalist">
            ${contacts
              .map(
                c =>
                  `<option value="${c.name.replace(/"/g, '&quot;')}">${
                    c.phone ? `+${c.phone}` : 'Agenda WhatsApp'
                  }</option>`
              )
              .join('')}
          </datalist>
        </div>

        <label style="display:block;font-size:11.5px;font-weight:700;color:#cbd5e1;margin-bottom:5px;">
          2. ¿Cuándo deseas que se envíe automáticamente?
        </label>
        <div class="ztt-wa-chip-row" id="ztt-delay-chips">
          <button type="button" class="ztt-wa-delay-chip active" data-delay-sec="0">⚡ Enviar Ahora Mismo (0s)</button>
          <button type="button" class="ztt-wa-delay-chip" data-delay-sec="10">⏱️ Prueba en 10 seg</button>
          <button type="button" class="ztt-wa-delay-chip" data-delay-sec="60">⏱️ En 1 min</button>
          <button type="button" class="ztt-wa-delay-chip" data-delay-sec="300">⏱️ En 5 min</button>
          <button type="button" class="ztt-wa-delay-chip" data-delay-sec="custom">📅 Fecha/Hora exacta</button>
        </div>

        <div id="ztt-custom-datetime-wrap" style="display:none;margin-bottom:12px;">
          <input type="datetime-local" class="ztt-wa-input" id="ztt-custom-datetime" />
        </div>

        <label style="display:block;font-size:11.5px;font-weight:700;color:#cbd5e1;margin-bottom:6px;">
          3. Mensaje a enviar (Limpio · Sin marca de agua):
        </label>
        <textarea class="ztt-wa-textarea" id="ztt-modal-message">${defaultMsg}</textarea>

        <div style="margin-top:10px;padding:9px 11px;border-radius:10px;border:1px dashed rgba(56,189,248,0.45);background:rgba(15,23,42,0.65);">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span style="font-size:11.5px;font-weight:700;color:#7dd3fc;">📎 Adjuntar Archivos (Imágenes, PDF, Brochure, Video)</span>
            <label style="cursor:pointer;padding:4px 10px;border-radius:7px;background:rgba(14,165,233,0.2);border:1px solid rgba(56,189,248,0.45);color:#bae6fd;font-size:11px;font-weight:700;">
              + Seleccionar Archivo
              <input type="file" id="ztt-modal-files" multiple accept="image/*,application/pdf,video/*,.doc,.docx,.xls,.xlsx" style="display:none;" />
            </label>
          </div>
          <div id="ztt-modal-attachments-list" style="margin-top:6px;font-size:11px;color:#94a3b8;">
            Sin archivos adjuntos.
          </div>
        </div>

        <div style="margin-top:8px;padding:8px 10px;border-radius:8px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);font-size:11.5px;color:#a7f3d0;">
          💡 <strong>Agenda conectada (${contacts.length} chats detectados):</strong> Puedes elegir cualquier contacto de tu WhatsApp Web. La extensión buscará su chat, adjuntará los archivos y presionará Enviar automáticamente.
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
          <button type="button" class="ztt-wa-action-btn" id="ztt-modal-cancel">Cancelar</button>
          <button type="button" class="ztt-wa-action-btn primary" id="ztt-modal-confirm" style="padding:7px 14px;font-size:12.5px;">
            🚀 Ejecutar Envío Automático
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const fileInput = backdrop.querySelector('#ztt-modal-files');
    const attListEl = backdrop.querySelector('#ztt-modal-attachments-list');
    const renderAttList = () => {
      if (!attListEl) return;
      if (modalAttachments.length === 0) {
        attListEl.innerHTML = 'Sin archivos adjuntos.';
        return;
      }
      attListEl.innerHTML = modalAttachments
        .map(
          (a, idx) =>
            `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 8px;margin:2px 4px 2px 0;border-radius:6px;background:rgba(30,41,59,0.9);border:1px solid rgba(56,189,248,0.35);color:#e2e8f0;">
              📎 ${a.name} <button type="button" data-rm-att="${idx}" style="background:none;border:none;color:#fca5a5;cursor:pointer;font-weight:700;">✕</button>
            </span>`
        )
        .join('');
      attListEl.querySelectorAll('[data-rm-att]').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = Number(btn.getAttribute('data-rm-att'));
          modalAttachments.splice(i, 1);
          renderAttList();
        });
      });
    };

    if (fileInput) {
      fileInput.addEventListener('change', e => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
          const item = {
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            file, // Objeto File nativo disponible al instante sin esperar FileReader
            dataUrl: ''
          };
          modalAttachments.push(item);
          renderAttList();

          // Para archivos <= 12MB generamos también dataUrl por si el envío ocurre desde otra pestaña
          if (file.size <= 12 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = () => {
              item.dataUrl = String(reader.result || '');
            };
            reader.readAsDataURL(file);
          }
        });
        e.target.value = '';
      });
    }

    let selectedDelaySec = 0;
    const chips = backdrop.querySelectorAll('.ztt-wa-delay-chip');
    const customWrap = backdrop.querySelector('#ztt-custom-datetime-wrap');
    const customInput = backdrop.querySelector('#ztt-custom-datetime');

    if (customInput) {
      const in15m = new Date(Date.now() + 15 * 60000);
      customInput.value = new Date(in15m.getTime() - in15m.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const val = chip.getAttribute('data-delay-sec');
        if (val === 'custom') {
          selectedDelaySec = 'custom';
          if (customWrap) customWrap.style.display = 'block';
        } else {
          selectedDelaySec = Number(val) || 0;
          if (customWrap) customWrap.style.display = 'none';
        }
      });
    });

    const closeModal = () => backdrop.remove();
    backdrop.querySelector('#ztt-modal-close')?.addEventListener('click', closeModal);
    backdrop.querySelector('#ztt-modal-cancel')?.addEventListener('click', closeModal);

    backdrop.querySelector('#ztt-modal-confirm')?.addEventListener('click', () => {
      const targetQuery = (backdrop.querySelector('#ztt-contact-search-input')?.value || '').trim();
      const rawText = backdrop.querySelector('#ztt-modal-message')?.value || '';
      const cleanText = sanitizeWatermarkText(rawText);
      if (!cleanText && modalAttachments.length === 0) {
        showOverlayToast('⚠️ Escribe un mensaje o adjunta un archivo antes de enviar.');
        return;
      }

      let delayMs = 0;
      if (selectedDelaySec === 'custom') {
        const dtVal = customInput?.value;
        const targetMs = dtVal ? new Date(dtVal).getTime() : Date.now() + 60000;
        delayMs = Math.max(0, targetMs - Date.now());
      } else {
        delayMs = Number(selectedDelaySec) * 1000;
      }

      const matchedContact = contacts.find(
        c => c.name.toLowerCase() === targetQuery.toLowerCase() || (c.phone && c.phone === targetQuery.replace(/\D/g, ''))
      );
      const targetName = matchedContact ? matchedContact.name : targetQuery || activeChatName || 'Chat Activo';
      const targetPhone = matchedContact?.phone || (targetQuery.replace(/\D/g, '').length >= 9 ? targetQuery.replace(/\D/g, '') : activePhone);

      closeModal();
      scheduleInChatCountdownAndSend(cleanText, delayMs, targetName, targetPhone, modalAttachments);
    });
  }

  function scheduleInChatCountdownAndSend(cleanText, delayMs, chatName, phone, attachments = []) {
    const outboxId = `inchat_${Date.now()}`;
    const targetTime = Date.now() + Math.max(0, delayMs);
    const isImmediate = delayMs <= 500;

    // Registrar SIEMPRE en la cola de la extensión y en Firestore (incluso si es envío inmediato 0s)
    // Enviar metadatos ligeros por IPC para que videos grandes de >15MB nunca bloqueen chrome.runtime.sendMessage
    const ipcAttachments = (Array.isArray(attachments) ? attachments : []).map(a => ({
      name: a.name || 'adjunto',
      type: a.type || 'application/octet-stream',
      size: a.size || 0,
      dataUrl: !isImmediate && a.dataUrl && a.dataUrl.length < 4 * 1024 * 1024 ? a.dataUrl : ''
    }));

    safeRuntimeSendMessage({
      type: 'TICKTOOL_SCHEDULE_INCHAT_MESSAGE',
      id: outboxId,
      phone: phone || '',
      leadName: chatName || 'Chat Activo',
      message: cleanText,
      attachments: ipcAttachments,
      scheduledFor: targetTime,
      dispatchedDirectly: isImmediate
    });

    const executeNow = () => {
      completedOutboxIds.add(outboxId);
      const notifyDone = () => {
        safeRuntimeSendMessage({ type: 'TICKTOOL_INFLIGHT_COMPLETED', outboxId });
      };

      const currentActiveHeader = extractActiveChatHeaderName();
      if (
        findActiveComposer() &&
        (!chatName || currentActiveHeader.toLowerCase() === chatName.toLowerCase())
      ) {
        typeAndSendInActiveChat(cleanText, attachments, () => notifyDone());
      } else if (chatName && !phone) {
        searchAndOpenContactByNameAndSend(chatName, cleanText, outboxId, attachments, () => notifyDone());
      } else if (phone) {
        searchAndOpenContactByNameAndSend(chatName || phone, cleanText, outboxId, attachments, ok => {
          if (!ok) {
            const tempLink = document.createElement('a');
            tempLink.href = `https://web.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(cleanText)}`;
            tempLink.style.display = 'none';
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            waitForSendButtonAndDispatch(outboxId, cleanText, attachments);
          } else {
            notifyDone();
          }
        });
      } else if (findActiveComposer()) {
        typeAndSendInActiveChat(cleanText, attachments, () => notifyDone());
      }
    };

    if (isImmediate) {
      executeNow();
      return;
    }

    const pill = document.getElementById('ztt-wa-countdown-pill');

    showOverlayToast(
      `⏰ Mensaje programado para "${chatName}" en ${Math.round(delayMs / 1000)} seg.`
    );

    const timerId = setInterval(() => {
      if (!isExtensionContextValid()) {
        clearInterval(timerId);
        return;
      }
      const remainingSec = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
      if (pill) {
        pill.style.display = 'inline-flex';
        pill.textContent = `⏳ Enviando a ${chatName.slice(0, 16)} en ${remainingSec}s...`;
      }

      if (remainingSec <= 0) {
        clearInterval(timerId);
        if (pill) {
          pill.textContent = '🚀 ¡Enviando ahora!';
          setTimeout(() => {
            pill.style.display = 'none';
          }, 3000);
        }
        executeNow();
      }
    }, 500);

    localScheduledTimers.push(timerId);
  }

  function ensureWhatsAppOverlayMounted() {
    if (!isExtensionContextValid()) {
      if (typeof window.__zentryTickToolCleanup === 'function') {
        window.__zentryTickToolCleanup();
      }
      return;
    }
    injectTopFilterBar();
    injectComposerScheduleButton();
  }

  ensureWhatsAppOverlayMounted();
  const overlayIntervalId = setInterval(ensureWhatsAppOverlayMounted, 1800);

  const observer = new MutationObserver(mutations => {
    if (!isExtensionContextValid()) {
      observer.disconnect();
      return;
    }
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length > 0) {
        inspectInboundMessages();
        injectComposerScheduleButton();
        break;
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Registrar limpiador global de esta instancia para que si la extensión se recarga en caliente,
  // se detengan todos los timers/observers antiguos sin lanzar 'Extension context invalidated'.
  window.__zentryTickToolCleanup = () => {
    try {
      clearInterval(heartbeatIntervalId);
      clearInterval(overlayIntervalId);
      if (activeDispatchInterval) clearInterval(activeDispatchInterval);
      localScheduledTimers.forEach(t => clearInterval(t));
      localScheduledTimers = [];
      observer.disconnect();
    } catch (_) {}
  };
})();

