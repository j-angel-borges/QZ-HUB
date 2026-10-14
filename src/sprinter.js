// ==============================================================================
// QZ HUB — SPRINTER (HERRAMIENTA DE 3 DÍAS CON INTERCONEXIÓN DETERMINISTA)
// ==============================================================================
// Interconexión bidireccional entre:
// 1. SPRINTER (Tríada de Sprints 1, 2 y 3 con actividades asignadas, Isha Kriya y notas)
// 2. TIMEBLOCKING (Escribe automáticamente en cada slot de 15 min:
//    - "Llamadas Realizadas" o "Prospección realizada" + resultados (X call · Y cit)
//    - "Isha Kriya (Meditación)" en el slot de 15 min seleccionado
// 3. BIO-TRACKER (Actualiza cifras de PROD: LL, DEMOS, PCC, WIN,
//    métricas detalladas de marcación: NC, Col, Ll, cit, y contador ik.doneDays)
// ==============================================================================

const SPRINTER_STORAGE_KEY = 'qz_sprinter_data';

// Helper de fecha local
function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==============================================================================
// DEFINICIÓN CALIBRADA DE SPRINTS (SPRINT 1, SPRINT 2, SPRINT 3)
// ==============================================================================

export function getSprintPreset(sprintNumber = 1) {
  if (sprintNumber === 1) {
    return {
      sprintNumber: 1,
      title: 'Sprint 1: Aterrizaje Biológico & Foco Comercial',
      startDate: '2026-10-12',
      endDate: '2026-10-14',
      goal: 'Llamadas de 30 min sin prospección en D1, consolidación de ritmo comercial.',
      activeDayIndex: 0,
      days: [
        {
          id: 's1-d1',
          date: '2026-10-12',
          dayLabel: 'D1 • Lun 12 Oct',
          isToday: false,
          isha: { enabled: false, targetCount: 1, session1Slot: '06:30', session2Slot: '18:00', completedSessions: 0, completed: false },
          blocks: [
            {
              id: 's1-d1-b1',
              time: '08:30 - 09:00',
              startTime: '08:30',
              endTime: '09:00',
              activity: 'llamadas',
              title: 'Llamadas Fuera de Casa (Royal & Leads)',
              icon: '📞',
              desc: 'Bloque único de 30 min de llamadas (sin prospección)',
              completed: false,
              notes: '',
              syncSummary: null
            }
          ]
        },
        {
          id: 's1-d2',
          date: '2026-10-13',
          dayLabel: 'D2 • Mar 13 Oct',
          isToday: false,
          isha: { enabled: false, targetCount: 1, session1Slot: '06:30', session2Slot: '18:00', completedSessions: 0, completed: false },
          blocks: [
            {
              id: 's1-d2-b1',
              time: '08:30 - 09:00',
              startTime: '08:30',
              endTime: '09:00',
              activity: 'llamadas',
              title: 'Llamadas Mañana (Directores & Leads)',
              icon: '📞',
              desc: 'Bloque matutino de 30 minutos de marcación comercial',
              completed: false,
              notes: '',
              syncSummary: null
            },
            {
              id: 's1-d2-b2',
              time: '18:00 - 18:30',
              startTime: '18:00',
              endTime: '18:30',
              activity: 'llamadas',
              title: 'Llamadas Tarde (Seguimientos & Cierres)',
              icon: '📞',
              desc: 'Bloque vespertino de 30 minutos de marcación comercial',
              completed: false,
              notes: '',
              syncSummary: null
            }
          ]
        },
        {
          id: 's1-d3',
          date: '2026-10-14',
          dayLabel: 'D3 • Mié 14 Oct',
          isToday: true,
          isha: { enabled: false, targetCount: 1, session1Slot: '06:30', session2Slot: '18:00', completedSessions: 0, completed: false },
          blocks: [
            {
              id: 's1-d3-b1',
              time: '08:30 - 09:00',
              startTime: '08:30',
              endTime: '09:00',
              activity: 'llamadas',
              title: 'Llamadas Mañana (Confirmaciones Demos)',
              icon: '📞',
              desc: 'Primer bloque de 30 minutos de marcación activa',
              completed: false,
              notes: '',
              syncSummary: null
            },
            {
              id: 's1-d3-b2',
              time: '18:00 - 18:30',
              startTime: '18:00',
              endTime: '18:30',
              activity: 'llamadas',
              title: 'Llamadas Tarde (Cierre de Tríada)',
              icon: '📞',
              desc: 'Segundo bloque de 30 minutos de llamadas y balance',
              completed: false,
              notes: '',
              syncSummary: null
            }
          ]
        }
      ]
    };
  }

  if (sprintNumber === 2) {
    return {
      sprintNumber: 2,
      title: 'Sprint 2: Expansión de Marcación & Isha Kriya',
      startDate: '2026-10-15',
      endDate: '2026-10-17',
      goal: 'Llamadas de 45 min mañana y tarde. Isha Kriya diario (1 o 2 sesiones de 15m). Prospección únicamente el viernes.',
      activeDayIndex: 0,
      days: [
        {
          id: 's2-d1',
          date: '2026-10-15',
          dayLabel: 'D1 • Jue 15 Oct',
          isToday: false,
          isha: { enabled: true, targetCount: 1, session1Slot: '06:30', session2Slot: '17:45', completedSessions: 0, completed: false },
          blocks: [
            {
              id: 's2-d1-b1',
              time: '08:30 - 09:15',
              startTime: '08:30',
              endTime: '09:15',
              activity: 'llamadas',
              title: 'Llamadas Mañana (45 min)',
              icon: '📞',
              desc: 'Marcación matutina enfocada de 45 minutos',
              completed: false,
              notes: '',
              syncSummary: null
            },
            {
              id: 's2-d1-b2',
              time: '18:00 - 18:45',
              startTime: '18:00',
              endTime: '18:45',
              activity: 'llamadas',
              title: 'Llamadas Tarde (45 min)',
              icon: '📞',
              desc: 'Marcación vespertina enfocada de 45 minutos',
              completed: false,
              notes: '',
              syncSummary: null
            }
          ]
        },
        {
          id: 's2-d2',
          date: '2026-10-16',
          dayLabel: 'D2 • Vie 16 Oct',
          isToday: false,
          isha: { enabled: true, targetCount: 1, session1Slot: '06:30', session2Slot: '17:45', completedSessions: 0, completed: false },
          blocks: [
            {
              id: 's2-d2-b1',
              time: '08:30 - 09:15',
              startTime: '08:30',
              endTime: '09:15',
              activity: 'llamadas',
              title: 'Llamadas Mañana (45 min)',
              icon: '📞',
              desc: 'Marcación matutina enfocada de 45 minutos',
              completed: false,
              notes: '',
              syncSummary: null
            },
            {
              id: 's2-d2-b2',
              time: '12:00 - 13:00',
              startTime: '12:00',
              endTime: '13:00',
              activity: 'prospeccion',
              title: 'Prospección Viernes (Elegible Mediodía/Noche)',
              icon: '🎯',
              desc: 'Único bloque de prospección del Sprint 2 (mediodía o noche)',
              completed: false,
              notes: '',
              syncSummary: null
            },
            {
              id: 's2-d2-b3',
              time: '18:00 - 18:45',
              startTime: '18:00',
              endTime: '18:45',
              activity: 'llamadas',
              title: 'Llamadas Tarde (45 min)',
              icon: '📞',
              desc: 'Marcación de cierre semanal de 45 minutos',
              completed: false,
              notes: '',
              syncSummary: null
            }
          ]
        },
        {
          id: 's2-d3',
          date: '2026-10-17',
          dayLabel: 'D3 • Sáb 17 Oct',
          isToday: false,
          isha: { enabled: true, targetCount: 1, session1Slot: '06:30', session2Slot: '17:45', completedSessions: 0, completed: false },
          blocks: [
            {
              id: 's2-d3-b1',
              time: '08:30 - 09:15',
              startTime: '08:30',
              endTime: '09:15',
              activity: 'llamadas',
              title: 'Llamadas Mañana Sábado (45 min)',
              icon: '📞',
              desc: 'Llamadas de seguimiento y agendamiento 45 min',
              completed: false,
              notes: '',
              syncSummary: null
            },
            {
              id: 's2-d3-b2',
              time: '18:00 - 18:45',
              startTime: '18:00',
              endTime: '18:45',
              activity: 'llamadas',
              title: 'Llamadas Tarde Sábado (45 min)',
              icon: '📞',
              desc: 'Cierre del Sprint 2 y balance de conversión',
              completed: false,
              notes: '',
              syncSummary: null
            }
          ]
        }
      ]
    };
  }

  // SPRINT 3 (Arranca Lunes 19 Octubre)
  return {
    sprintNumber: 3,
    title: 'Sprint 3: Dominio de Horario Fijo & Prospección de Cierre',
    startDate: '2026-10-19',
    endDate: '2026-10-21',
    goal: 'Dos bloques de 45m exactos: 08:30 y 18:30. Isha Kriya a diario (1-2 sesiones 15m). Último día: 30 min de prospección.',
    activeDayIndex: 0,
    days: [
      {
        id: 's3-d1',
        date: '2026-10-19',
        dayLabel: 'D1 • Lun 19 Oct',
        isToday: false,
        isha: { enabled: true, targetCount: 1, session1Slot: '06:30', session2Slot: '18:00', completedSessions: 0, completed: false },
        blocks: [
          {
            id: 's3-d1-b1',
            time: '08:30 - 09:15',
            startTime: '08:30',
            endTime: '09:15',
            activity: 'llamadas',
            title: 'Llamadas Mañana (08:30 - 09:15)',
            icon: '📞',
            desc: '45 minutos exactos de marcación fija matutina',
            completed: false,
            notes: '',
            syncSummary: null
          },
          {
            id: 's3-d1-b2',
            time: '18:30 - 19:15',
            startTime: '18:30',
            endTime: '19:15',
            activity: 'llamadas',
            title: 'Llamadas Tarde (18:30 - 19:15)',
            icon: '📞',
            desc: '45 minutos exactos de marcación fija vespertina',
            completed: false,
            notes: '',
            syncSummary: null
          }
        ]
      },
      {
        id: 's3-d2',
        date: '2026-10-20',
        dayLabel: 'D2 • Mar 20 Oct',
        isToday: false,
        isha: { enabled: true, targetCount: 1, session1Slot: '06:30', session2Slot: '18:00', completedSessions: 0, completed: false },
        blocks: [
          {
            id: 's3-d2-b1',
            time: '08:30 - 09:15',
            startTime: '08:30',
            endTime: '09:15',
            activity: 'llamadas',
            title: 'Llamadas Mañana (08:30 - 09:15)',
            icon: '📞',
            desc: '45 minutos exactos de marcación fija matutina',
            completed: false,
            notes: '',
            syncSummary: null
          },
          {
            id: 's3-d2-b2',
            time: '18:30 - 19:15',
            startTime: '18:30',
            endTime: '19:15',
            activity: 'llamadas',
            title: 'Llamadas Tarde (18:30 - 19:15)',
            icon: '📞',
            desc: '45 minutos exactos de marcación fija vespertina',
            completed: false,
            notes: '',
            syncSummary: null
          }
        ]
      },
      {
        id: 's3-d3',
        date: '2026-10-21',
        dayLabel: 'D3 • Mié 21 Oct',
        isToday: false,
        isha: { enabled: true, targetCount: 1, session1Slot: '06:30', session2Slot: '18:00', completedSessions: 0, completed: false },
        blocks: [
          {
            id: 's3-d3-b1',
            time: '08:30 - 09:15',
            startTime: '08:30',
            endTime: '09:15',
            activity: 'llamadas',
            title: 'Llamadas Mañana (08:30 - 09:15)',
            icon: '📞',
            desc: '45 minutos exactos de marcación fija matutina',
            completed: false,
            notes: '',
            syncSummary: null
          },
          {
            id: 's3-d3-b2',
            time: '12:00 - 12:30',
            startTime: '12:00',
            endTime: '12:30',
            activity: 'prospeccion',
            title: 'Prospección Último Día (30 min)',
            icon: '🎯',
            desc: 'Bloque único de 30 minutos de prospección',
            completed: false,
            notes: '',
            syncSummary: null
          },
          {
            id: 's3-d3-b3',
            time: '18:30 - 19:15',
            startTime: '18:30',
            endTime: '19:15',
            activity: 'llamadas',
            title: 'Llamadas Tarde (18:30 - 19:15)',
            icon: '📞',
            desc: '45 minutos de cierre del Sprint 3',
            completed: false,
            notes: '',
            syncSummary: null
          }
        ]
      }
    ]
  };
}

export function getDefaultSprinterData() {
  return getSprintPreset(1);
}

export function getSprinterData() {
  try {
    const raw = localStorage.getItem(SPRINTER_STORAGE_KEY) || localStorage.getItem('qz_sprint_3dias');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.days) && parsed.days.length === 3) {
        // Garantizar migración si faltaba isha o estructura calibrada
        let updated = false;
        parsed.days.forEach(d => {
          if (!d.isha) {
            d.isha = {
              enabled: (parsed.sprintNumber || 1) >= 2,
              targetCount: 1,
              session1Slot: '06:30',
              session2Slot: '17:45',
              completedSessions: 0,
              completed: false
            };
            updated = true;
          }
        });

        // Asegurar que Sprint 1 D1 tenga exactamente 1 bloque de 30 min (08:30-09:00)
        if (parsed.sprintNumber === 1 && parsed.days[0].blocks && parsed.days[0].blocks.length > 1) {
          parsed.days[0].blocks = [parsed.days[0].blocks[0]];
          parsed.days[0].blocks[0].time = '08:30 - 09:00';
          parsed.days[0].blocks[0].startTime = '08:30';
          parsed.days[0].blocks[0].endTime = '09:00';
          updated = true;
        }

        // Asegurar que Sprint 1 D2 y D3 tengan bloques de 30 min
        if (parsed.sprintNumber === 1) {
          [1, 2].forEach(dayIdx => {
            const d = parsed.days[dayIdx];
            if (d && d.blocks) {
              // Filtrar posibles bloques de prospeccion que se hayan colado en sprint 1
              const callBlocks = d.blocks.filter(b => b.activity === 'llamadas');
              if (callBlocks.length >= 2 && d.blocks.length !== 2) {
                d.blocks = callBlocks.slice(0, 2);
                d.blocks[0].time = '08:30 - 09:00';
                d.blocks[0].startTime = '08:30';
                d.blocks[0].endTime = '09:00';
                d.blocks[1].time = '18:00 - 18:30';
                d.blocks[1].startTime = '18:00';
                d.blocks[1].endTime = '18:30';
                updated = true;
              }
            }
          });
        }

        if (updated) saveSprinterData(parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading sprinter data:', e);
  }
  const defaultData = getDefaultSprinterData();
  saveSprinterData(defaultData);
  return defaultData;
}

export function saveSprinterData(data) {
  try {
    localStorage.setItem(SPRINTER_STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem('qz_sprint_3dias', JSON.stringify(data));
    if (window.pushCloudDataDebounced) {
      window.pushCloudDataDebounced();
    }
  } catch (e) {
    console.error('Error saving sprinter data:', e);
  }
}

export function switchSprinterSprint(sprintNumber) {
  const newPreset = getSprintPreset(sprintNumber);
  saveSprinterData(newPreset);
  return newPreset;
}

// ==============================================================================
// PARSER DETERMINISTA DE ANOTACIONES
// ==============================================================================
export function parseSprinterNotes(notes) {
  if (!notes || typeof notes !== 'string') {
    return { calls: 0, cits: 0, pcc: 0, nc: 0, col: 0, ll: 0, win: 0, raw: '' };
  }
  const s = notes.trim();

  function extractMetric(keywords) {
    const kwPattern = keywords.join('|');
    // Patrón 1: número seguido de palabra (ej: 15 call, 15 calls, 2 cit, 5 nc)
    const p1 = new RegExp('(?:^|[^\\w])(\\d+)\\s*(?:' + kwPattern + ')(?:[^\\w]|$)', 'i');
    const m1 = s.match(p1);
    if (m1) return parseInt(m1[1], 10);

    // Patrón 2: palabra seguida de : o espacio y número (ej: call: 15, calls 15, cit: 2)
    const p2 = new RegExp('(?:^|[^\\w])(?:' + kwPattern + ')\\s*[:=]?\\s*(\\d+)(?:[^\\w]|$)', 'i');
    const m2 = s.match(p2);
    if (m2) return parseInt(m2[1], 10);

    return 0;
  }

  return {
    calls: extractMetric(['calls?', 'llamadas?']),
    cits: extractMetric(['cits?', 'citas?', 'demos?']),
    pcc: extractMetric(['pcc', 'prospecs?', 'prospecci[oó]n(?:es)?']),
    nc: extractMetric(['nc', 'no\\s*contest[oó]']),
    col: extractMetric(['col', 'colg[oó]']),
    ll: extractMetric(['ll', 'rellamar', 'volver\\s*a\\s*llamar']),
    win: extractMetric(['win', 'vtas?', 'ventas?', 'cierres?']),
    raw: s
  };
}

// Generador de slots de 15 minutos en un rango dado (ej: "08:30" a "09:00" -> ["08:30", "08:45"])
export function get15MinSlotsInRange(startTime, endTime) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;

  const slots = [];
  for (let m = startMins; m < endMins; m += 15) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

// ==============================================================================
// EJECUCIÓN DEL PUENTE DETERMINISTA: SPRINTER ➔ TIMEBLOCKING & BIOTRACKER
// ==============================================================================
export function executeSprinterBlockSync(dayIdx, blockId, userNotes) {
  const data = getSprinterData();
  const day = data.days[dayIdx];
  if (!day) return null;
  const block = day.blocks.find(b => b.id === blockId);
  if (!block) return null;

  block.notes = userNotes;
  const parsed = parseSprinterNotes(userNotes);

  // 1. GENERAR NOMENCLATURA EXACTA PARA TIMEBLOCKING
  // "Llamadas Realizadas" o "Prospección realizada" + (X call · Y cit)
  let metricsSummary = [];
  if (parsed.calls > 0) metricsSummary.push(`${parsed.calls} call`);
  if (parsed.cits > 0) metricsSummary.push(`${parsed.cits} cit`);
  const metricsStr = metricsSummary.length > 0 ? ` (${metricsSummary.join(' · ')})` : '';

  let timeblockTitle = '';
  if (block.activity === 'prospeccion' || block.title.toLowerCase().includes('prospec')) {
    timeblockTitle = `Prospección realizada${metricsStr}`;
  } else {
    timeblockTitle = `Llamadas Realizadas${metricsStr}`;
  }

  // 2. ESCRIBIR EN CADA BLOQUE DE 15 MIN DE TIMEBLOCKING
  const slots = get15MinSlotsInRange(block.startTime, block.endTime);
  const targetDate = day.date || getTodayDateStr();

  try {
    const tbKey = `zentry_timeblock_${targetDate}`;
    let tbData = {};
    const rawTb = localStorage.getItem(tbKey);
    if (rawTb) {
      try { tbData = JSON.parse(rawTb); } catch(e) {}
    }

    slots.forEach(slotTime => {
      tbData[slotTime] = {
        text: timeblockTitle,
        details: parsed.raw || '',
        type: 'productivo',
        source: 'sprinter',
        completed: true,
        isBrick: true
      };
    });

    localStorage.setItem(tbKey, JSON.stringify(tbData));
    if (window.syncTimeblock) {
      window.syncTimeblock(targetDate, tbData);
    }
  } catch (err) {
    console.error('Error writing to Timeblocking:', err);
  }

  // 3. JALAR MÉTRICAS DETALLADAS AL BIO-TRACKER
  // NC (no contestó), Col (colgó), Ll (volver a llamar), cit (cita agendada) y PROD Comercial
  try {
    const rawTracker = localStorage.getItem('qz_bio_tracker');
    let trackerData = null;
    if (rawTracker) {
      try { trackerData = JSON.parse(rawTracker); } catch(e) {}
    }
    if (!trackerData) trackerData = {};

    const todayStr = getTodayDateStr();
    if (!trackerData.prod) {
      trackerData.prod = {
        todayDate: todayStr,
        today: { pcc: 0, ll: 0, demos: 0, win: 0, callDetails: { nc: 0, col: 0, ll: 0, cit: 0 } },
        history: {},
        totals: { pcc: 0, ll: 0, demos: 0, win: 0 }
      };
    }

    const prod = trackerData.prod;
    if (!prod.today) prod.today = { pcc: 0, ll: 0, demos: 0, win: 0 };
    if (!prod.today.callDetails) prod.today.callDetails = { nc: 0, col: 0, ll: 0, cit: 0 };
    if (!prod.totals) prod.totals = { pcc: 0, ll: 0, demos: 0, win: 0 };

    if (parsed.calls > 0) {
      prod.today.ll = (prod.today.ll || 0) + parsed.calls;
      prod.totals.ll = (prod.totals.ll || 0) + parsed.calls;
    }

    if (parsed.cits > 0) {
      prod.today.demos = (prod.today.demos || 0) + parsed.cits;
      prod.totals.demos = (prod.totals.demos || 0) + parsed.cits;
      prod.today.callDetails.cit = (prod.today.callDetails.cit || 0) + parsed.cits;
    }

    if (parsed.pcc > 0) {
      prod.today.pcc = (prod.today.pcc || 0) + parsed.pcc;
      prod.totals.pcc = (prod.totals.pcc || 0) + parsed.pcc;
    }

    if (parsed.win > 0) {
      prod.today.win = (prod.today.win || 0) + parsed.win;
      prod.totals.win = (prod.totals.win || 0) + parsed.win;
    }

    if (parsed.nc > 0) prod.today.callDetails.nc = (prod.today.callDetails.nc || 0) + parsed.nc;
    if (parsed.col > 0) prod.today.callDetails.col = (prod.today.callDetails.col || 0) + parsed.col;
    if (parsed.ll > 0) prod.today.callDetails.ll = (prod.today.callDetails.ll || 0) + parsed.ll;

    localStorage.setItem('qz_bio_tracker', JSON.stringify(trackerData));
    if (window.syncHabitTracker) {
      window.syncHabitTracker(trackerData);
    }
    if (window.refreshHabitTrackerUI) {
      window.refreshHabitTrackerUI();
    }
  } catch (err) {
    console.error('Error updating Bio-Tracker:', err);
  }

  // 4. ACTUALIZAR ESTADO DEL BLOQUE EN SPRINTER
  block.completed = true;
  block.syncSummary = {
    timeblockText: timeblockTitle,
    slotsCount: slots.length,
    parsed: parsed,
    syncedAt: new Date().toLocaleTimeString()
  };

  saveSprinterData(data);
  return block.syncSummary;
}

// ==============================================================================
// PUENTE DETERMINISTA PARA ISHA KRIYA (1 O 2 MEDITACIONES • 15 MIN C/U)
// ==============================================================================
export function executeSprinterIshaSync(dayIdx, sessionNum = 1) {
  const data = getSprinterData();
  const day = data.days[dayIdx];
  if (!day) return null;

  if (!day.isha) {
    day.isha = { enabled: true, targetCount: 1, session1Slot: '06:30', session2Slot: '17:45', completedSessions: 0, completed: false };
  }

  const slotTime = sessionNum === 2 ? (day.isha.session2Slot || '17:45') : (day.isha.session1Slot || '06:30');
  const targetDate = day.date || getTodayDateStr();

  // 1. ESCRIBIR EN EXACTAMENTE 1 SLOT DE 15 MIN DE TIMEBLOCKING
  try {
    const tbKey = `zentry_timeblock_${targetDate}`;
    let tbData = {};
    const rawTb = localStorage.getItem(tbKey);
    if (rawTb) {
      try { tbData = JSON.parse(rawTb); } catch(e) {}
    }

    tbData[slotTime] = {
      text: `Isha Kriya (Meditación ${sessionNum}/${day.isha.targetCount || 1})`,
      details: 'Sesión de 15 min sincronizada desde Sprinter',
      type: 'importante',
      source: 'sprinter',
      completed: true,
      isBrick: true
    };

    localStorage.setItem(tbKey, JSON.stringify(tbData));
    if (window.syncTimeblock) {
      window.syncTimeblock(targetDate, tbData);
    }
  } catch (err) {
    console.error('Error writing Isha Kriya to Timeblocking:', err);
  }

  // 2. INCREMENTAR IK.DONEDAYS EN BIO-TRACKER
  try {
    const rawTracker = localStorage.getItem('qz_bio_tracker');
    let trackerData = null;
    if (rawTracker) {
      try { trackerData = JSON.parse(rawTracker); } catch(e) {}
    }
    if (trackerData && trackerData.ik) {
      trackerData.ik.doneDays = (trackerData.ik.doneDays || 0) + 1;
      localStorage.setItem('qz_bio_tracker', JSON.stringify(trackerData));
      if (window.syncHabitTracker) {
        window.syncHabitTracker(trackerData);
      }
      if (window.refreshHabitTrackerUI) {
        window.refreshHabitTrackerUI();
      }
    }
  } catch (err) {
    console.error('Error updating IK in Bio-Tracker:', err);
  }

  // 3. ACTUALIZAR ESTADO DE ISHA EN SPRINTER
  day.isha.completedSessions = Math.min((day.isha.targetCount || 1), (day.isha.completedSessions || 0) + 1);
  if (day.isha.completedSessions >= (day.isha.targetCount || 1)) {
    day.isha.completed = true;
  }
  day.isha.lastSyncedAt = new Date().toLocaleTimeString();

  saveSprinterData(data);
  return day.isha;
}

// ==============================================================================
// RENDERIZADO VISUAL COMPACTO DE LA TARJETA SPRINTER (EN COLUMNA DERECHA)
// ==============================================================================
export function renderSprinterCardHTML() {
  const data = getSprinterData();
  const currentDayIdx = data.activeDayIndex || 0;
  const currentDay = data.days[currentDayIdx] || data.days[0];

  const totalBlocks = data.days.reduce((acc, d) => acc + d.blocks.length, 0);
  const completedBlocks = data.days.reduce((acc, d) => acc + d.blocks.filter(b => b.completed).length, 0);
  const progressPct = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  // Selector de Sprints (Sprint 1, Sprint 2, Sprint 3)
  const sprintSelectorHtml = `
    <div class="sprinter-sprint-nav">
      <button type="button" class="btn-sprinter-sprint-chip ${data.sprintNumber === 1 ? 'active' : ''}" data-sprint-target="1">Sprint 1</button>
      <button type="button" class="btn-sprinter-sprint-chip ${data.sprintNumber === 2 ? 'active' : ''}" data-sprint-target="2">Sprint 2</button>
      <button type="button" class="btn-sprinter-sprint-chip ${data.sprintNumber === 3 ? 'active' : ''}" data-sprint-target="3">Sprint 3</button>
    </div>
  `;

  const dayTabsHtml = data.days.map((d, idx) => {
    const dayDone = d.blocks.filter(b => b.completed).length;
    const isSelected = idx === currentDayIdx;
    return `
      <button type="button" class="btn-sprinter-day-tab ${isSelected ? 'active' : ''}" data-day-idx="${idx}">
        <span>${d.dayLabel}</span>
        <span class="day-tab-count">${dayDone}/${d.blocks.length}</span>
      </button>
    `;
  }).join('');

  // Render Isha Kriya si está habilitado o si estamos en Sprint 2/3 (o configurable)
  const isha = currentDay.isha || { enabled: data.sprintNumber >= 2, targetCount: 1, session1Slot: '06:30', session2Slot: '17:45', completedSessions: 0, completed: false };
  const showIsha = isha.enabled || data.sprintNumber >= 2;

  const ishaHtml = showIsha ? `
    <div class="sprinter-isha-card ${isha.completed ? 'is-completed' : ''}">
      <div class="sprinter-isha-header">
        <div class="sprinter-isha-title-box">
          <span class="sprinter-isha-icon">🧘</span>
          <div>
            <div class="sprinter-isha-title">Isha Kriya (15 min)</div>
            <div class="sprinter-isha-sub">Sincroniza 1 bloque de 15m al Timeblocking y suma al Bio-Tracker</div>
          </div>
        </div>
        <div class="sprinter-isha-count-toggle">
          <button type="button" class="btn-isha-count ${isha.targetCount === 1 ? 'active' : ''}" data-count="1" data-day-idx="${currentDayIdx}">1 ses</button>
          <button type="button" class="btn-isha-count ${isha.targetCount === 2 ? 'active' : ''}" data-count="2" data-day-idx="${currentDayIdx}">2 ses</button>
        </div>
      </div>

      <div class="sprinter-isha-sessions-row">
        <!-- Sesión 1 -->
        <div class="sprinter-isha-slot-pill">
          <span class="isha-slot-label">Sesión 1:</span>
          <select class="sprinter-isha-select" data-session="1" data-day-idx="${currentDayIdx}">
            ${['05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '12:30', '17:45', '18:00', '18:30', '21:00', '21:30'].map(t => 
              `<option value="${t}" ${isha.session1Slot === t ? 'selected' : ''}>${t}</option>`
            ).join('')}
          </select>
          <button type="button" class="btn-isha-done ${(isha.completedSessions >= 1) ? 'done' : ''}" data-session="1" data-day-idx="${currentDayIdx}">
            ${(isha.completedSessions >= 1) ? '✓ Lista' : '○ Hecho'}
          </button>
        </div>

        <!-- Sesión 2 (si targetCount == 2) -->
        ${isha.targetCount === 2 ? `
          <div class="sprinter-isha-slot-pill">
            <span class="isha-slot-label">Sesión 2:</span>
            <select class="sprinter-isha-select" data-session="2" data-day-idx="${currentDayIdx}">
              ${['17:00', '17:30', '17:45', '18:00', '18:30', '19:00', '20:00', '21:00', '21:30'].map(t => 
                `<option value="${t}" ${isha.session2Slot === t ? 'selected' : ''}>${t}</option>`
              ).join('')}
            </select>
            <button type="button" class="btn-isha-done ${(isha.completedSessions >= 2) ? 'done' : ''}" data-session="2" data-day-idx="${currentDayIdx}">
              ${(isha.completedSessions >= 2) ? '✓ Lista' : '○ Hecho'}
            </button>
          </div>
        ` : ''}
      </div>
      ${isha.lastSyncedAt ? `<div class="sprinter-isha-synced-note">⚡ Sincronizado ${isha.completedSessions}/${isha.targetCount} en Timeblocking & Bio-Tracker a las ${isha.lastSyncedAt}</div>` : ''}
    </div>
  ` : '';

  const blocksHtml = currentDay.blocks.map(b => {
    const isDone = !!b.completed;
    return `
      <div class="sprinter-block-item ${isDone ? 'is-completed' : ''}" data-block-id="${b.id}">
        <div class="sprinter-block-header">
          <div class="sprinter-block-title-box">
            <span class="sprinter-block-time">⏱️ ${b.time}</span>
            <span class="sprinter-block-act-badge ${b.activity}">${b.activity === 'prospeccion' ? '🎯 Prospección' : '📞 Llamadas'}</span>
          </div>
          <button type="button" class="btn-sprinter-done ${isDone ? 'done-active' : ''}" data-block-id="${b.id}" data-day-idx="${currentDayIdx}">
            ${isDone ? '✓ Hecho' : '○ Marcar Hecho'}
          </button>
        </div>
        <div class="sprinter-block-desc">${b.title}</div>
        
        <div class="sprinter-block-notes-wrap">
          <input type="text" class="sprinter-block-input" 
                 placeholder="Anotación (ej: 15 call, 2 cit, 5 nc, 3 col, 2 ll)" 
                 value="${b.notes || ''}" 
                 data-block-id="${b.id}" 
                 data-day-idx="${currentDayIdx}" />
        </div>

        ${isDone && b.syncSummary ? `
          <div class="sprinter-sync-pill">
            <span class="sync-pill-tag">⚡ Timeblocking:</span>
            <span class="sync-pill-val">${b.syncSummary.timeblockText} (${b.syncSummary.slotsCount} bloques 15m)</span>
            <span class="sync-pill-tag" style="margin-left: 6px;">📊 Bio:</span>
            <span class="sync-pill-val">+${b.syncSummary.parsed.calls} LL, +${b.syncSummary.parsed.cits} CIT</span>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="sprinter-card" id="sprinter-widget">
      <!-- HEADER COMPACTO CON SELECTOR DE SPRINTS -->
      <div class="sprinter-card-top">
        <div class="sprinter-brand-wrap">
          <div class="sprinter-icon-glow">⚡</div>
          <div>
            <div class="sprinter-title-row">
              <h3 class="sprinter-card-title">SPRINTER (3 DÍAS)</h3>
              <span class="sprinter-phase-badge">Sprint ${data.sprintNumber}</span>
            </div>
            <p class="sprinter-card-subtitle">${data.goal}</p>
          </div>
        </div>
        <div class="sprinter-progress-box">
          <div class="sprinter-progress-bar-bg">
            <div class="sprinter-progress-bar-fill" style="width: ${progressPct}%;"></div>
          </div>
          <span class="sprinter-progress-num">${completedBlocks}/${totalBlocks} Bloques (${progressPct}%)</span>
        </div>
      </div>

      <!-- SELECTOR DE SPRINTS (1, 2, 3) -->
      ${sprintSelectorHtml}

      <!-- SELECTOR DE DÍAS -->
      <div class="sprinter-day-tabs">
        ${dayTabsHtml}
      </div>

      <!-- MEDITACIÓN ISHA KRIYA (SI ESTÁ ACTIVA) -->
      ${ishaHtml}

      <!-- LISTA DE BLOQUES DEL DÍA ACTIVO -->
      <div class="sprinter-blocks-list">
        ${blocksHtml}
      </div>

      <!-- FOOTER CON INSTRUCCIÓN RÁPIDA -->
      <div class="sprinter-card-footer">
        <span class="sprinter-hint-text">💡 <strong>Nomenclatura:</strong> Escribe <code>15 call</code>, <code>2 cit</code>, <code>5 nc</code>, <code>3 col</code>, <code>2 ll</code> y presiona Enter o <em>"Hecho"</em>.</span>
      </div>
    </div>
  `;
}

// ==============================================================================
// GESTOR DE EVENTOS INTERACTIVOS DE SPRINTER
// ==============================================================================
export function setupSprinterEvents(container) {
  const widget = container.querySelector('#sprinter-widget');
  if (!widget) return;

  // 1. Selector de Sprints (Sprint 1, Sprint 2, Sprint 3)
  widget.querySelectorAll('.btn-sprinter-sprint-chip').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const targetSprint = parseInt(btn.dataset.sprintTarget, 10);
      switchSprinterSprint(targetSprint);
      widget.outerHTML = renderSprinterCardHTML();
      setupSprinterEvents(container);
    };
  });

  // 2. Cambio de pestaña de día
  widget.querySelectorAll('.btn-sprinter-day-tab').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const dayIdx = parseInt(btn.dataset.dayIdx, 10);
      const data = getSprinterData();
      data.activeDayIndex = dayIdx;
      saveSprinterData(data);
      widget.outerHTML = renderSprinterCardHTML();
      setupSprinterEvents(container);
    };
  });

  // 3. Control de Isha Kriya (1 o 2 sesiones)
  widget.querySelectorAll('.btn-isha-count').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const count = parseInt(btn.dataset.count, 10);
      const dayIdx = parseInt(btn.dataset.dayIdx, 10);
      const data = getSprinterData();
      if (data.days[dayIdx]) {
        if (!data.days[dayIdx].isha) {
          data.days[dayIdx].isha = { enabled: true, targetCount: 1, session1Slot: '06:30', session2Slot: '17:45', completedSessions: 0, completed: false };
        }
        data.days[dayIdx].isha.targetCount = count;
        saveSprinterData(data);
        widget.outerHTML = renderSprinterCardHTML();
        setupSprinterEvents(container);
      }
    };
  });

  // 4. Selección de slots de Isha Kriya (horas de 15m)
  widget.querySelectorAll('.sprinter-isha-select').forEach(sel => {
    sel.onchange = (e) => {
      const session = parseInt(sel.dataset.session, 10);
      const dayIdx = parseInt(sel.dataset.dayIdx, 10);
      const data = getSprinterData();
      if (data.days[dayIdx] && data.days[dayIdx].isha) {
        if (session === 1) data.days[dayIdx].isha.session1Slot = sel.value;
        if (session === 2) data.days[dayIdx].isha.session2Slot = sel.value;
        saveSprinterData(data);
      }
    };
  });

  // 5. Botón marcar Isha Kriya Hecho
  widget.querySelectorAll('.btn-isha-done').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const session = parseInt(btn.dataset.session, 10);
      const dayIdx = parseInt(btn.dataset.dayIdx, 10);
      executeSprinterIshaSync(dayIdx, session);
      widget.outerHTML = renderSprinterCardHTML();
      setupSprinterEvents(container);
    };
  });

  // 6. Guardar notas mientras escribe
  widget.querySelectorAll('.sprinter-block-input').forEach(input => {
    input.oninput = (e) => {
      const dayIdx = parseInt(input.dataset.dayIdx, 10);
      const blockId = input.dataset.blockId;
      const data = getSprinterData();
      if (data.days[dayIdx]) {
        const blk = data.days[dayIdx].blocks.find(b => b.id === blockId);
        if (blk) {
          blk.notes = input.value;
          saveSprinterData(data);
        }
      }
    };

    // Al presionar Enter, marcar como hecho
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const blockId = input.dataset.blockId;
        const dayIdx = parseInt(input.dataset.dayIdx, 10);
        executeSprinterBlockSync(dayIdx, blockId, input.value);
        widget.outerHTML = renderSprinterCardHTML();
        setupSprinterEvents(container);
      }
    };
  });

  // 7. Botón "✓ Hecho" de Bloque de llamadas / prospección
  widget.querySelectorAll('.btn-sprinter-done').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const blockId = btn.dataset.blockId;
      const dayIdx = parseInt(btn.dataset.dayIdx, 10);
      const row = btn.closest('.sprinter-block-item');
      const input = row?.querySelector('.sprinter-block-input');
      const userNotes = input?.value || '';

      executeSprinterBlockSync(dayIdx, blockId, userNotes);
      widget.outerHTML = renderSprinterCardHTML();
      setupSprinterEvents(container);
    };
  });
}
