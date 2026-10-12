// ==============================================================================
// QZ HUB — SPRINT DE 3 DÍAS (MICRO-BLOQUES DE CORTO PLAZO)
// ==============================================================================
// Enlace entre el Timeblocking inmediato (Presente) y la Hoja de Ruta (14 Días).
// ==============================================================================

const SPRINT_STORAGE_KEY = 'qz_sprint_3dias';

export function getDefaultSprint3DiasData() {
  return {
    sprintNumber: 1,
    title: 'Sprint 1: Aterrizaje Biológico & Orden',
    startDate: '2026-10-12',
    endDate: '2026-10-14',
    goal: 'Detox dopamina, calistenia y llamadas fuera de casa.',
    days: [
      {
        id: 'day-1',
        date: '2026-10-12',
        dayLabel: 'D1 • Lun 12 Oct',
        bio: 'Keto limpio + Sal de Maras & Limón + Cero Azúcar',
        workout: 'Front Lever & Calistenia (1.5h)',
        sales: '30m llamadas Royal + 30m prospección',
        support: 'Orden leads ExpoMaternidad & QZ-Hub',
        completed: false
      },
      {
        id: 'day-2',
        date: '2026-10-13',
        dayLabel: 'D2 • Mar 13 Oct',
        bio: 'Keto continuo + Ventana hasta 19:00',
        workout: 'Calistenia acondicionamiento (45m)',
        sales: 'Llamadas fuera de casa (08:30–10:00 AM)',
        support: 'Guion y Demo ZentryOS (Factor WOW)',
        completed: false
      },
      {
        id: 'day-3',
        date: '2026-10-14',
        dayLabel: 'D3 • Mié 14 Oct',
        bio: 'Keto estricto + Electrolitos',
        workout: 'Calistenia empuje intenso (1.5h)',
        sales: 'Llamadas Zentry + Citas fin de semana',
        support: 'Presupuesto compras Gamarra (S/ 150)',
        completed: false
      }
    ],
    rules: [
      '🚫 Cero alcohol, porros, azúcar, porno',
      '📵 Tablet fuera del cuarto',
      '📞 Llamadas fuera de casa'
    ]
  };
}

export function getSprint3DiasData() {
  try {
    const raw = localStorage.getItem(SPRINT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.days && parsed.days.length === 3) {
        // Si tiene el texto extenso antiguo, migrar al texto conciso preservando checkboxes
        if (parsed.days[0].bio && parsed.days[0].bio.includes('5 huevos')) {
          const fresh = getDefaultSprint3DiasData();
          fresh.sprintNumber = parsed.sprintNumber || 1;
          fresh.days.forEach((d, idx) => {
            if (parsed.days[idx]) d.completed = !!parsed.days[idx].completed;
          });
          saveSprint3DiasData(fresh);
          return fresh;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading sprint 3 dias from storage, using default:', e);
  }
  const defaultData = getDefaultSprint3DiasData();
  saveSprint3DiasData(defaultData);
  return defaultData;
}

export function saveSprint3DiasData(data) {
  try {
    localStorage.setItem(SPRINT_STORAGE_KEY, JSON.stringify(data));
    if (window.pushCloudDataDebounced) {
      window.pushCloudDataDebounced();
    }
  } catch (e) {
    console.error('Error saving sprint 3 dias:', e);
  }
}

export function renderSprint3DiasHTML() {
  const sprint = getSprint3DiasData();
  const completedCount = sprint.days.filter(d => d.completed).length;
  const progressPct = Math.round((completedCount / 3) * 100);

  const daysHtml = sprint.days.map((day, idx) => {
    const isCompleted = !!day.completed;
    return `
      <div class="sprint-day-card ${isCompleted ? 'is-completed' : ''}" data-day-index="${idx}">
        <div class="sprint-day-header">
          <div class="sprint-day-title-wrap">
            <span class="sprint-day-badge">DÍA ${idx + 1}</span>
            <span class="sprint-day-label">${day.dayLabel}</span>
          </div>
          <button type="button" class="btn-toggle-sprint-day ${isCompleted ? 'active' : ''}" data-day-index="${idx}" title="${isCompleted ? 'Marcar incompleto' : 'Marcar día completado'}">
            ${isCompleted ? '✓ CUMPLIDO' : '○ PENDIENTE'}
          </button>
        </div>
        <div class="sprint-day-body">
          <div class="sprint-item">
            <span class="sprint-item-icon">🍳</span>
            <div class="sprint-item-text">
              <strong>Bio:</strong> ${day.bio}
            </div>
          </div>
          <div class="sprint-item">
            <span class="sprint-item-icon">🤸</span>
            <div class="sprint-item-text">
              <strong>Físico:</strong> ${day.workout}
            </div>
          </div>
          <div class="sprint-item">
            <span class="sprint-item-icon">📞</span>
            <div class="sprint-item-text">
              <strong>Ventas:</strong> ${day.sales}
            </div>
          </div>
          <div class="sprint-item">
            <span class="sprint-item-icon">💻</span>
            <div class="sprint-item-text">
              <strong>Dev:</strong> ${day.support}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="sprint-3dias-card" id="sprint-3dias-widget">
      <div class="sprint-card-header">
        <div class="sprint-header-left">
          <div class="sprint-icon-box">⚡</div>
          <div>
            <div class="sprint-badge-row">
              <span class="sprint-phase-tag">MICRO-SPRINT</span>
              <span class="sprint-period-pill">${sprint.startDate} ➔ ${sprint.endDate}</span>
            </div>
            <h3 class="sprint-card-title">${sprint.title}</h3>
            <p class="sprint-card-goal">🎯 <strong>Norte:</strong> ${sprint.goal}</p>
          </div>
        </div>
        <div class="sprint-header-right">
          <div class="sprint-progress-pill">
            <div class="sprint-progress-bar-wrap">
              <div class="sprint-progress-bar" style="width: ${progressPct}%;"></div>
            </div>
            <span class="sprint-progress-label">${completedCount}/3 Días (${progressPct}%)</span>
          </div>
          <button type="button" class="btn-sprint-action" id="btn-next-sprint" title="Avanzar al siguiente sprint de 3 días">
            Siguiente Sprint ➔
          </button>
        </div>
      </div>

      <!-- REGLAS DE ORO DEL SPRINT -->
      <div class="sprint-rules-strip">
        ${sprint.rules.map(r => `<span class="sprint-rule-chip">${r}</span>`).join('')}
      </div>

      <!-- TRÍADA DE DÍAS -->
      <div class="sprint-days-grid">
        ${daysHtml}
      </div>
    </div>
  `;
}

export function setupSprint3DiasEvents(container) {
  const widget = container.querySelector('#sprint-3dias-widget');
  if (!widget) return;

  // Toggle Day completion
  widget.querySelectorAll('.btn-toggle-sprint-day').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.dayIndex, 10);
      const data = getSprint3DiasData();
      if (data.days[idx]) {
        data.days[idx].completed = !data.days[idx].completed;
        saveSprint3DiasData(data);
        const parentSection = widget.closest('.backlog-extension-container');
        if (parentSection) {
          widget.outerHTML = renderSprint3DiasHTML();
          setupSprint3DiasEvents(parentSection);
        }
      }
    };
  });

  // Next Sprint advance
  const nextBtn = widget.querySelector('#btn-next-sprint');
  if (nextBtn) {
    nextBtn.onclick = () => {
      const data = getSprint3DiasData();
      if (data.sprintNumber === 1) {
        if (!confirm('¿Deseas avanzar al Sprint 2 (Jueves 15 a Sábado 17 Oct)? Esto configurará los hitos de compra en Gamarra y demos.')) return;
        data.sprintNumber = 2;
        data.title = 'Sprint 2: Logística Gamarra & Citas';
        data.startDate = '2026-10-15';
        data.endDate = '2026-10-17';
        data.goal = 'Compras Jueves (S/ 150), 20-30 llamadas/día y 2-3 demos.';
        data.days = [
          {
            id: 'day-4',
            date: '2026-10-15',
            dayLabel: 'D4 • Jue 15 Oct',
            bio: 'Compras Gamarra temprano (S/ 100 despensa, S/ 50 bio)',
            workout: 'Calistenia / Descanso activo',
            sales: '20 llamadas fuera de casa',
            support: 'Transcripción leads y agendamiento',
            completed: false
          },
          {
            id: 'day-5',
            date: '2026-10-16',
            dayLabel: 'D5 • Vie 16 Oct',
            bio: 'Keto denso + Crema de maní casera',
            workout: 'Calistenia fuerza y tracción',
            sales: 'Pico llamadas (25-30) + Citas sáb/dom',
            support: 'Material DemoBook preparado',
            completed: false
          },
          {
            id: 'day-6',
            date: '2026-10-17',
            dayLabel: 'D6 • Sáb 17 Oct',
            bio: 'Keto + Batch cooking (proteína)',
            workout: 'Calistenia o Pádel con padre',
            sales: 'Ejecución Demo 1 presencial/virtual',
            support: 'Seguimiento prospectos calientes',
            completed: false
          }
        ];
        saveSprint3DiasData(data);
        const parentSection = widget.closest('.backlog-extension-container');
        if (parentSection) {
          widget.outerHTML = renderSprint3DiasHTML();
          setupSprint3DiasEvents(parentSection);
        }
      } else {
        alert('Estás en el Sprint 2 activo. Para reiniciar o editar, utiliza la configuración.');
      }
    };
  }
}
