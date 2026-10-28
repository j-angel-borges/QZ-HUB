/**
 * Zentry Tick Tool — Extension Popup Controller (popup.js)
 * Muestra en tiempo real:
 * - "WhatsApp Web Conectado" / "WhatsApp Web Desconectado"
 * - "Campaña Activa"
 * - "Lote en Progreso (X/35)"
 * - Botón de Pausa de Emergencia y acciones de sincronización con Firestore
 */

document.addEventListener('DOMContentLoaded', () => {
  const waConnectionBadge = document.getElementById('waConnectionBadge');
  const waConnectionText = document.getElementById('waConnectionText');
  const activeCampaignLabel = document.getElementById('activeCampaignLabel');
  const batchProgressTitle = document.getElementById('batchProgressTitle');
  const batchPercentLabel = document.getElementById('batchPercentLabel');
  const batchProgressBar = document.getElementById('batchProgressBar');
  const lastJitterLabel = document.getElementById('lastJitterLabel');

  const countPending = document.getElementById('countPending');
  const countDispatched = document.getElementById('countDispatched');
  const countReplied = document.getElementById('countReplied');
  const countCancelled = document.getElementById('countCancelled');

  const emergencyPauseBtn = document.getElementById('emergencyPauseBtn');
  const emergencyPauseText = document.getElementById('emergencyPauseText');
  const syncFirestoreBtn = document.getElementById('syncFirestoreBtn');
  const dispatchNextBtn = document.getElementById('dispatchNextBtn');
  const openHubBtn = document.getElementById('openHubBtn');
  const footerStatusText = document.getElementById('footerStatusText');

  function renderState(state) {
    if (!state) return;

    // 1. Estado de conexión con WhatsApp Web
    if (state.waConnected) {
      waConnectionBadge.className = 'status-pill connected';
      waConnectionText.textContent = 'WhatsApp Web Conectado';
    } else {
      waConnectionBadge.className = 'status-pill disconnected';
      waConnectionText.textContent = 'WhatsApp Web No Abierto';
    }

    // 2. Campaña Activa
    activeCampaignLabel.textContent = state.activeCampaignName || 'Campaña Activa QZ-Hub';

    // 3. Lote en Progreso (X/35)
    const sentToday = Number(state.dailyDispatchedCount) || 0;
    const dailyLimit = Number(state.dailyLimit) || 35;
    const pct = Math.min(100, Math.round((sentToday / dailyLimit) * 100));

    batchProgressTitle.textContent = `Lote en Progreso (${sentToday}/${dailyLimit})`;
    batchPercentLabel.textContent = `${pct}%`;
    batchProgressBar.style.width = `${pct}%`;

    if (state.lastJitterMs) {
      lastJitterLabel.textContent = `Jitter: ${Math.round(state.lastJitterMs / 1000)}s`;
    } else {
      lastJitterLabel.textContent = 'Jitter: 45s-110s';
    }

    // 4. Conteo de estados en `whatsapp_outbox`
    const queue = Array.isArray(state.outboxQueue) ? state.outboxQueue : [];
    countPending.textContent = queue.filter(i => i.status === 'pending').length;
    countDispatched.textContent = queue.filter(i => i.status === 'dispatched').length;
    countReplied.textContent = queue.filter(i => i.status === 'replied').length;
    countCancelled.textContent = queue.filter(i => i.status === 'cancelled').length;

    // 5. Botón de Pausa de Emergencia
    if (state.isPaused) {
      emergencyPauseBtn.className = 'btn-emergency resume';
      emergencyPauseText.textContent = 'REANUDAR DESPACHO (PAUSADO)';
      footerStatusText.textContent = '⏸ Cola en pausa de emergencia. Ningún mensaje saldrá.';
    } else {
      emergencyPauseBtn.className = 'btn-emergency pause';
      emergencyPauseText.textContent = 'PAUSA DE EMERGENCIA';
      if (state.nextDispatchAt) {
        const nextTime = new Date(state.nextDispatchAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        footerStatusText.textContent = `⏱ Próximo envío programado con jitter a las ${nextTime}`;
      } else {
        footerStatusText.textContent = 'Detector Inbound Activo: detiene follow-ups si el lead responde.';
      }
    }
  }

  function refreshStatus() {
    chrome.runtime.sendMessage({ type: 'TICKTOOL_GET_STATUS' }, response => {
      if (response && response.state) {
        renderState(response.state);
      }
    });
  }

  emergencyPauseBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'TICKTOOL_TOGGLE_PAUSE' }, response => {
      if (response && response.state) {
        renderState(response.state);
      }
    });
  });

  syncFirestoreBtn.addEventListener('click', () => {
    footerStatusText.textContent = 'Sincronizando whatsapp_outbox desde Firestore...';
    chrome.runtime.sendMessage({ type: 'TICKTOOL_SYNC_NOW' }, response => {
      if (response && response.state) {
        renderState(response.state);
        footerStatusText.textContent = `✅ Sincronizados ${response.count || 0} registros desde Firestore.`;
      }
    });
  });

  dispatchNextBtn.addEventListener('click', () => {
    footerStatusText.textContent = 'Despachando siguiente mensaje limpio en WhatsApp Web...';
    chrome.runtime.sendMessage({ type: 'TICKTOOL_DISPATCH_NEXT_NOW' }, response => {
      if (response && response.state) {
        renderState(response.state);
      }
    });
  });

  openHubBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://hub.quarz.online/#prospeccion' });
  });

  refreshStatus();
});
