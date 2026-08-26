
function generateBackendSsotFallback(query) {
  const q = (query || '').toLowerCase();

  if (q.includes('meta') || q.includes('31 de agosto') || q.includes('caja') || q.includes('plata') || q.includes('dinero')) {
    return "Tu obligación financiera inmediata al **31 de Agosto (21 días restantes)** es de **S/ 4,000.00 PEN netos**. Partiendo de tus **S/ 770.00 PEN en caja**, necesitas generar **S/ 3,230.00 PEN netos**. Esto se logra cerrando **3 ventas de Royal Prestige** (comisión S/ 1,010.59 a S/ 1,347.46) o **2 licencias de ZentryOS ($1,000 USD / S/ 1,906.78 neto personal)**.";
  } 
  
  if (q.includes('12') || q.includes('perro') || q.includes('rutina') || q.includes('entren') || q.includes('ejercicio') || q.includes('llamada')) {
    return "En la ventana estratégica de **12:00 PM a 02:00 PM** ejecutas tres acciones en paralelo:\n1. Pasear al perro al aire libre.\n2. Entrenamiento de calistenia.\n3. **40 llamadas telefónicas breves de Royal Prestige** (usando tu Redmi Note 9 con la SIM `933709385`). Caminar mientras llamas eleva tu tono vocal y evita la fatiga del escritorio.";
  }

  if (q.includes('royal') || q.includes('olla') || q.includes('ratio') || q.includes('friccion') || q.includes('referido')) {
    return "Métricas exactas de Royal Prestige:\n• **Llamadas frías:** 20 llamadas conversadas agendan 1 demo. De cada 4 demos frías cierras 1 venta (S/ 1,010.59 neto).\n• **Referidos:** Cada demo genera 5 a 10 referidos calificados. Con referidos, el ratio de cierre mejora a 3 demos por 1 venta (S/ 1,347.46 neto).";
  }

  if (q.includes('zentry') || q.includes('quarz') || q.includes('prospecc') || q.includes('mall') || q.includes('limatambo') || q.includes('tablet')) {
    return "Métricas exactas de QUARZ / ZentryOS:\n• **Prospección presencial:** 5 personas prospectadas a pie en Limatambo/La Rambla/Jockey agendan 1 demo presencial en un ciclo de 2 semanas.\n• **Cierre de Licencias ($1k USD):** En el Mes 1 (iteración), 5 demos cierran 1 licencia ($1,000 USD -> S/ 1,906.78 neto personal + S/ 1,271.19 caja empresa). En el Mes 2 con referidos, baja a 3 demos por 1 cierre.";
  }

  if (q.includes('ayuno') || q.includes('48') || q.includes('camal') || q.includes('yerbateros') || q.includes('carne') || q.includes('comida')) {
    return "Protocolo Biológico & Abastecimiento:\n• **Ayuno Autofágico de 48h:** Jueves 13 de Agosto (08:00 PM) al Sábado 15 de Agosto (08:00 PM).\n• **Suero Táctico:** Sodio 3-5g + Potasio 1.5-2g + Magnesio 400mg.\n• **Camal de Yerbateros:** El mejor día y hora es el **Viernes por la madrugada (04:30 AM)** para obtener vísceras (hígado, corazón, panza) y chicharrón de cerdo recién faenados con cero aglomeración.";
  }

  if (q.includes('dispositivo') || q.includes('celular') || q.includes('telefono') || q.includes('sim') || q.includes('hardware')) {
    return "Infraestructura de Hardware Activa:\n• **Redmi Note 9:** Diario para llamadas (SIM `933709385` QUARZ).\n• **Motorola Edge 40 Neo:** Servidor USB 24/7 (Scrcpy/Vysor) para WhatsApp bot (número personal `942575425`).\n• **Tab A7 Samsung (10.4 in):** Demo ZentryOS Launcher Device Owner.\n• **iPad 5ª Gen:** Demo PWA Parental Dashboard.";
  }

  return "Entendido. Como Orquestador de tu plan maestro de 63 días (10 Ago - 11 Oct 2026), mantengo indexados todos tus documentos SSOT. Puedes consultarme cualquier duda sobre tus metas financieras, embudos de conversión, rutina de 12-2pm o protocolo biológico.";
}

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { message, history = [], apiKey: customApiKey } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'Message is required in request body.' });
    }

    // Resolve API Key: customApiKey in request -> header x-api-key -> process.env.GOOGLE_AI_API_KEY -> process.env.GEMINI_API_KEY -> process.env.GCP_API_KEY
    const apiKey = customApiKey || req.headers['x-api-key'] || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GCP_API_KEY || process.env.VERTEX_API_KEY;

    // Load SSOT Context (or fallback system instruction)
    let ssotContext = "";
    try {
      const dbPath = path.join(process.cwd(), 'src', 'ssot-db.json');
      if (fs.existsSync(dbPath)) {
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (dbData.pages && dbData.pages.length > 0) {
          ssotContext = dbData.pages.map(p => `### ${p.title}\n${p.body.slice(0, 1500)}`).join('\n\n').slice(0, 8000);
        }
      }
    } catch (e) {
      console.warn("Could not read ssot-db.json in backend serverless function:", e.message);
    }

    const systemInstruction = `Eres la Inteligencia Orquestadora oficial del Plan Maestro de 63 Días (10 de Agosto al 11 de Octubre de 2026) de José Ángel Borges.
Tus prioridades y reglas inflexibles:
1. META FINANCIERA INMEDIATA: S/ 4,000 PEN al 31 de Agosto (partiendo de S/ 770 en caja). Se logra con 3 ventas de Royal Prestige o 2 licencias de ZentryOS ($1,000 USD).
2. METRICAS ROYAL PRESTIGE: 20 llamadas agendan 1 demo; 4 demos frías cierran 1 venta (S/ 1,010.59 neto). Referidos (5-10 x demo) cierran 3 demos por 1 venta (S/ 1,347.46 neto).
3. METRICAS QUARZ (ZENTRYOS): 5 prospectos a pie en Limatambo/La Rambla/Jockey agendan 1 demo presencial en 2 sem. Mes 1: 5 demos cierran 1 licencia ($1,000 USD -> S/ 1,906.78 neto personal + S/ 1,271.19 caja empresa). Mes 2: 3 demos por 1 cierre.
4. RUTINA 12-2PM: Paseo del perro + calistenia + 40 llamadas breves de Royal Prestige (SIM 933709385).
5. AYUNO 48H: Jueves 13 (8pm) al Sábado 15 Ago (8pm). Camal de Yerbateros: Viernes 04:30 AM.

CONTEXTO SSOT RELEVANTE:
${ssotContext || "El SSOT contiene los manifiestos, embudos y protocolos biológicos."}

Responde siempre con tono ejecutivo, preciso, empático y estructurado en Markdown.`;

    // Construct Gemini contents array
    const contents = [
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: 'Entendido. Soy la Inteligencia Orquestadora SSOT del Plan Maestro de 63 Días. ¿En qué te ayudo hoy?' }] }
    ];

    // Append past messages history if provided
    if (Array.isArray(history) && history.length > 0) {
      history.forEach(h => {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });
    }

    // Append user's current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    if (!apiKey) {
      return res.status(200).json({
        reply: `⚠️ **Configuración de Backend Requerida:** La ruta \`/api/chat\` está activa en el servidor backend, pero no se proporcionó una Clave de API ni existe la variable de entorno \`GEMINI_API_KEY\` en el servidor.  

Por favor ingresa tu Clave de API en la configuración del chat o establece \`GEMINI_API_KEY\` en Vercel para procesar solicitudes reales con Gemini.`,
        isConfigWarning: true
      });
    }

    // Try candidate models
    const requestedModel = req.body?.model;
    const candidateModels = [
      ...(requestedModel ? [requestedModel] : []),
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];
    // Remove duplicates
    const uniqueModels = [...new Set(candidateModels)];

    let lastError = null;

    for (const modelName of uniqueModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const fetchRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });

        const data = await fetchRes.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
          const replyText = data.candidates[0].content.parts[0].text;
          return res.status(200).json({
            reply: replyText,
            model: modelName,
            status: 'success'
          });
        }

        if (data.error) {
          lastError = data.error;
          // If 404 model not found, try next candidate model
          if (data.error.code === 404) continue;

          // If 429 Prepayment credits depleted or 403 billing issue, fall back to backend SSOT engine gracefully
          if (data.error.code === 429 || data.error.code === 403 || (data.error.message && data.error.message.includes('prepayment'))) {
            console.warn("GCP Prepayment/Billing error detected (429/403). Falling back to Backend SSOT Engine.");
            const fallbackReply = generateBackendSsotFallback(message);
            return res.status(200).json({
              reply: fallbackReply,
              status: 'ssot_fallback',
              notice: 'GCP Prepayment Credits Depleted -> Handled by Backend SSOT Engine'
            });
          }
          
          // Return clear API error if unhandled
          return res.status(200).json({
            reply: `❌ **Error de la API de Gemini (${data.error.code}):** ${data.error.message}`,
            error: data.error
          });
        }
      } catch (err) {
        console.error(`Fetch error with model ${modelName}:`, err);
        lastError = err;
      }
    }

    return res.status(500).json({
      error: 'Failed to generate response from Gemini API after trying all candidate models.',
      details: lastError ? (lastError.message || JSON.stringify(lastError)) : 'Unknown error'
    });

  } catch (err) {
    console.error('Serverless function error in /api/chat:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
