// ==============================================================================
// QZ HUB — WORKFLOW AGÉNTICO MATUTINO (MARKDOWN-DRIVEN)
// ==============================================================================
// Formalización del ritual diario de alineación estratégica con el agente.
// ==============================================================================

export const MORNING_PROMPT_TEMPLATE = `Iniciando sesión matutina. He completado mis deberes domésticos y desayuno. Lee D:\\1_jose_angel\\HOJA_DE_RUTA_REINICIO_OPTIMIZACION.md donde he colocado mis nuevas reflexiones bajo el emoji 🪢. Audita mi avance del sprint de 3 días, actualiza mis timeblocks y calibra mis prioridades de hoy.`;

export function renderAgentWorkflowHTML() {
  return `
    <div class="agent-workflow-card" id="agent-workflow-widget">
      <div class="workflow-card-header">
        <div class="workflow-title-box">
          <span class="workflow-icon">🤖</span>
          <div>
            <h4 class="workflow-title">WORKFLOW MATUTINO AGÉNTICO</h4>
            <span class="workflow-subtitle">Ritual diario de alineación Jose Ángel & Antigravity</span>
          </div>
        </div>
        <div class="workflow-actions-top">
          <button type="button" class="btn-copy-morning-prompt" id="btn-copy-morning-prompt" title="Copiar prompt al portapapeles">
            📋 Copiar Prompt Matutino
          </button>
        </div>
      </div>

      <div class="workflow-steps-grid">
        <div class="workflow-step-item">
          <span class="step-num">1</span>
          <div class="step-content">
            <strong>🧹 Orden & Bio:</strong>
            <p>Casa limpia, desayuno keto y electrolitos.</p>
          </div>
        </div>

        <div class="workflow-step-item">
          <span class="step-num">2</span>
          <div class="step-content">
            <strong>💻 Terminal:</strong>
            <p>Antigravity CLI con contexto QZ-Hub.</p>
          </div>
        </div>

        <div class="workflow-step-item">
          <span class="step-num">3</span>
          <div class="step-content">
            <strong>📝 Hoja Viva (🪢):</strong>
            <p>Nuevas reflexiones con 🪢 en el markdown.</p>
          </div>
        </div>

        <div class="workflow-step-item">
          <span class="step-num">4</span>
          <div class="step-content">
            <strong>🎯 Calibración:</strong>
            <p>Auditoría de sprint y ejecución de bloques.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupAgentWorkflowEvents(container) {
  const btn = container.querySelector('#btn-copy-morning-prompt');
  if (!btn) return;

  btn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(MORNING_PROMPT_TEMPLATE);
      const originalText = btn.innerHTML;
      btn.innerHTML = '✓ ¡Copiado al Portapapeles!';
      btn.style.background = '#059669';
      btn.style.color = '#ffffff';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.color = '';
      }, 2500);
    } catch (e) {
      alert('Prompt:\n\n' + MORNING_PROMPT_TEMPLATE);
    }
  };
}
