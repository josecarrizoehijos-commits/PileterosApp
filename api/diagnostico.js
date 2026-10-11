// /api/diagnostico  ·  Diagnóstico de la pileta por foto (Gemini, plan gratuito)
// Variables de entorno en Vercel:
//   GEMINI_API_KEY     (obligatoria, la misma que usa /api/jose)
//   GEMINI_MODEL       (opcional, por defecto gemini-3.1-flash-lite)
//   DIAG_GRATIS_MES    (opcional, análisis gratis por usuario por mes, por defecto 2)
//   DIAG_PRO_MES       (opcional, análisis por mes para usuarios Pro, por defecto 60)
// Requiere la tabla "diagnosticos_uso" en Supabase (ver supabase_diagnosticos.sql).

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const SB_URL = process.env.SUPABASE_URL || 'https://qwdrddaigmnacdzwlhwm.supabase.co';
const SB_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZHJkZGFpZ21uYWNkendsaHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NTgwNDAsImV4cCI6MjA5NjIzNDA0MH0.htgA0cm1Ms7rffFm3RNRty3LF-rudRURlZwTjF0CaCg';
const LIM_GRATIS = parseInt(process.env.DIAG_GRATIS_MES || '2', 10);
const LIM_PRO = parseInt(process.env.DIAG_PRO_MES || '60', 10);
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];

const PROMPT = `Sos un piletero argentino con mucha experiencia. Mirá la foto de una pileta y hacé un diagnóstico de orientación para el dueño o para otro piletero.

Respondé en español rioplatense (vos), simple y directo.
- titulo: máximo 5 palabras (ej: "Agua verde por algas").
- emoji: un solo emoji que represente el estado.
- urgencia: "baja", "media" o "alta".
- diagnostico: 2 a 4 oraciones sobre lo que se ve (color y claridad del agua, algas, hojas, estado de paredes y equipos visibles) y la causa más probable.
- acciones: 3 a 5 pasos cortos y ordenados de qué hacer.

Reglas:
- No inventes dosis ni cantidades de químicos. Recomendá medir pH y cloro con el kit y seguir la etiqueta del producto.
- Nunca recomiendes mezclar productos químicos.
- Aclaré que es una orientación hecha desde una foto, y que si hay dudas conviene que lo vea un piletero en persona.
- Si la foto no muestra una pileta, o no se ve bien, decilo en el título y pedí otra foto con buena luz.`;

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    emoji: { type: 'STRING' },
    titulo: { type: 'STRING' },
    urgencia: { type: 'STRING', enum: ['baja', 'media', 'alta'] },
    diagnostico: { type: 'STRING' },
    acciones: { type: 'ARRAY', items: { type: 'STRING' } }
  },
  required: ['emoji', 'titulo', 'urgencia', 'diagnostico', 'acciones']
};

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

async function usuarioDe(token) {
  const r = await fetch(SB_URL + '/auth/v1/user', { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + token } });
  if (!r.ok) return null;
  return r.json();
}

async function esPro(token, id) {
  const r = await fetch(SB_URL + '/rest/v1/usuarios?select=acceso_activo&id=eq.' + encodeURIComponent(id), { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + token } });
  if (!r.ok) return false;
  const d = await r.json();
  return !!(d[0] && d[0].acceso_activo);
}

// Inicio del mes en hora de Argentina (UTC-3)
function inicioDeMes() {
  const ar = new Date(Date.now() - 3 * 3600 * 1000);
  return new Date(Date.UTC(ar.getUTCFullYear(), ar.getUTCMonth(), 1, 3, 0, 0)).toISOString();
}

async function usosDelMes(token) {
  const r = await fetch(SB_URL + '/rest/v1/diagnosticos_uso?select=id&created_at=gte.' + encodeURIComponent(inicioDeMes()), {
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + token }
  });
  if (!r.ok) throw new Error('supabase usos ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const d = await r.json();
  return Array.isArray(d) ? d.length : 0;
}

async function registrarUso(token) {
  const r = await fetch(SB_URL + '/rest/v1/diagnosticos_uso', {
    method: 'POST',
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: '{}'
  });
  if (!r.ok) console.error('registrarUso', r.status, (await r.text()).slice(0, 200));
}

async function analizar(base64, mediaType) {
  const gen = { temperature: 0.4, maxOutputTokens: 1500, responseMimeType: 'application/json', responseSchema: SCHEMA };
  if (/2\.5/.test(MODEL)) gen.thinkingConfig = { thinkingBudget: 0 };
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ inline_data: { mime_type: mediaType, data: base64 } }, { text: PROMPT }] }],
      generationConfig: gen
    })
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error('gemini ' + r.status); e.status = r.status; e.detail = JSON.stringify(d).slice(0, 300); throw e; }
  const parts = d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts;
  const txt = Array.isArray(parts) ? parts.map(p => p.text || '').join('').trim() : '';
  const j = JSON.parse(txt.replace(/^```json|```$/g, '').trim());
  const urg = ['baja', 'media', 'alta'].includes(j.urgencia) ? j.urgencia : 'media';
  return {
    emoji: String(j.emoji || '🏊').slice(0, 8),
    titulo: String(j.titulo || 'Análisis completado').slice(0, 80),
    urgencia: urg,
    diagnostico: String(j.diagnostico || '').slice(0, 1200),
    acciones: (Array.isArray(j.acciones) ? j.acciones : []).slice(0, 6).map(a => String(a).slice(0, 300))
  };
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Iniciá sesión para usar el diagnóstico.' });
    const user = await usuarioDe(token);
    if (!user || !user.id) return res.status(401).json({ error: 'Tu sesión venció. Volvé a ingresar.' });

    const pro = await esPro(token, user.id);
    const limite = pro ? LIM_PRO : LIM_GRATIS;
    const usados = await usosDelMes(token);
    const restantes = Math.max(0, limite - usados);

    if (req.method === 'GET') return res.status(200).json({ pro, limite, restantes });

    if (restantes <= 0) {
      return res.status(403).json({
        error: pro ? 'Llegaste al máximo de análisis de este mes. Se renueva el mes que viene.' : 'Usaste tus ' + limite + ' análisis gratis de este mes. Con Pro tenés muchos más.',
        restantes: 0
      });
    }
    if (!GEMINI_KEY) return res.status(500).json({ error: 'El diagnóstico no está configurado.' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const img = body.imageBase64;
    const tipo = TIPOS.includes(body.mediaType) ? body.mediaType : 'image/jpeg';
    if (typeof img !== 'string' || img.length < 100) return res.status(400).json({ error: 'Falta la foto.' });
    if (img.length > 4000000) return res.status(413).json({ error: 'La foto es muy pesada. Probá con otra.' });

    let out;
    try {
      out = await analizar(img, tipo);
    } catch (e) {
      console.error('diagnostico', e.status, e.detail || e.message);
      if (e.status === 429) return res.status(429).json({ error: 'El diagnóstico llegó a su límite gratuito de hoy. Probá más tarde.' });
      return res.status(502).json({ error: 'No se pudo analizar la foto ahora. Probá de nuevo.' });
    }

    await registrarUso(token); // solo se descuenta si el análisis salió bien
    return res.status(200).json({ ...out, restantes: restantes - 1, limite });
  } catch (e) {
    console.error('diagnostico', e.message);
    return res.status(500).json({ error: 'Algo salió mal. Probá de nuevo.' });
  }
}
