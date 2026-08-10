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
    const candidateModels = [
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];

    let lastError = null;

    for (const modelName of candidateModels) {
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
          
          // Return clear API error
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
