// /api/jose  ·  Asistente virtual de José (chat dentro de la app)
// Variables de entorno en Vercel:
//   GEMINI_API_KEY      (GRATIS: clave de Google AI Studio. Si está, se usa Gemini)
//   GEMINI_MODEL        (opcional, por defecto gemini-2.5-flash)
//   JOSE_LIMITE_DIA     (opcional, consultas por usuario por día, por defecto 15)
//   ANTHROPIC_API_KEY   (opcional, de pago: solo se usa si NO hay GEMINI_API_KEY)
//   JOSE_BOT_MODEL      (opcional, modelo de Anthropic, por defecto claude-haiku-4-5-20251001)
//   SOLO_PRO            (opcional, "true" para dejarlo solo para usuarios con acceso activo)
//   SUPABASE_URL / SUPABASE_ANON_KEY (opcionales: ya vienen las de tu app)
import { CONOCIMIENTO } from './_conocimiento.js';

const MODEL = process.env.JOSE_BOT_MODEL || 'claude-haiku-4-5-20251001';
const SB_URL = process.env.SUPABASE_URL || 'https://qwdrddaigmnacdzwlhwm.supabase.co';
const SB_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZHJkZGFpZ21uYWNkendsaHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NTgwNDAsImV4cCI6MjA5NjIzNDA0MH0.htgA0cm1Ms7rffFm3RNRty3LF-rudRURlZwTjF0CaCg';
const SOLO_PRO = process.env.SOLO_PRO === 'true';
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const LIMITE = parseInt(process.env.JOSE_LIMITE_DIA || '15', 10); // consultas por usuario por día (aprox., en memoria)
const VENTANA = 24 * 3600 * 1000;
const usos = new Map();
const cache = new Map();      // preguntas repetidas: se responden gratis, sin llamar a la IA
const CACHE_MS = 12 * 3600 * 1000;
const norm = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

async function llamarGemini(system, msgs) {
  const gen = { temperature: 0.6, maxOutputTokens: 1500 };
  if (/2\.5/.test(GEMINI_MODEL)) gen.thinkingConfig = { thinkingBudget: 0 };
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: msgs.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      generationConfig: gen
    })
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error('gemini ' + r.status); e.status = r.status; e.detail = JSON.stringify(d).slice(0, 300); throw e; }
  const parts = d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts;
  return Array.isArray(parts) ? parts.map(p => p.text || '').join('').trim() : '';
}

const SYSTEM = `Sos el asistente virtual de José, un piletero de Mar del Plata. Atendés a personas que usan la app "Los 12 pasos del piletero" y les respondés dudas de mantenimiento de piscinas.

CÓMO RESPONDÉS
- Español rioplatense, trato de vos, cálido, claro y directo. Respuestas cortas (máximo unas 120 palabras), con pasos numerados cuando sirva.
- Si no te quedó claro el problema, hacé UNA pregunta concreta antes de dar una solución larga.
- Presentate como "asistente virtual de José" si te lo preguntan. No te hagas pasar por una persona.

QUÉ SABÉS
- Usá SOLO la base de conocimiento de abajo para dar los procedimientos del método de José. Si algo no está ahí, podés dar orientación general y prudente de mantenimiento de piscinas, aclarando que es general.
- Nunca inventes dosis, cantidades ni tiempos de productos químicos: para eso mandá a las tablas de la app y a la etiqueta del producto.
- Ante riesgo eléctrico, olor a quemado, chispas, pérdidas fuertes, mezcla de químicos, o cualquier cosa que no puedas resolver con seguridad, decí que no insista y que consulte a José por WhatsApp o a un técnico.
- No des consejos médicos. Si hay una intoxicación o accidente con químicos, indicá llamar a emergencias o al centro de toxicología.
- Si te preguntan algo que no tiene que ver con piscinas, decí amable que solo ayudás con el mantenimiento de la pileta.

BASE DE CONOCIMIENTO
${CONOCIMIENTO}`;

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Iniciá sesión para hablar con José.' });
    const user = await usuarioDe(token);
    if (!user || !user.id) return res.status(401).json({ error: 'Tu sesión venció. Volvé a ingresar.' });
    if (SOLO_PRO && !(await esPro(token, user.id))) return res.status(403).json({ error: 'El asistente es parte del acceso Pro.' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    let msgs = (Array.isArray(body.messages) ? body.messages : [])
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-12).map(m => ({ role: m.role, content: m.content.slice(0, 1500) }));
    while (msgs.length && msgs[0].role !== 'user') msgs.shift();
    if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return res.status(400).json({ error: 'Mensaje vacío' });

    const ctx = body.contexto && typeof body.contexto === 'object' ? ' Contexto de la app: ' + JSON.stringify(body.contexto).slice(0, 300) : '';

    // 1) Pregunta repetida (y sin contexto personal): respuesta gratis desde memoria
    const ckey = (msgs.length === 1 && !ctx) ? norm(msgs[0].content) : null;
    if (ckey) {
      const hit = cache.get(ckey);
      if (hit && Date.now() - hit.t < CACHE_MS) return res.status(200).json({ reply: hit.reply });
    }

    // 2) Límite diario por usuario
    const ahora = Date.now();
    const lista = (usos.get(user.id) || []).filter(t => ahora - t < VENTANA);
    if (lista.length >= LIMITE) return res.status(429).json({ error: 'Llegaste al límite de consultas de hoy. Volvé mañana o escribile a José por WhatsApp.' });
    lista.push(ahora); usos.set(user.id, lista);

    // 3) Llamada a la IA: Gemini (gratis) si hay clave, si no Anthropic
    let reply = '';
    if (GEMINI_KEY) {
      try {
        reply = await llamarGemini(SYSTEM + ctx, msgs);
      } catch (e) {
        console.error('gemini', e.status, e.detail || e.message);
        if (e.status === 429) return res.status(429).json({ error: 'El asistente llegó a su límite gratuito de hoy. Probá más tarde o escribile a José por WhatsApp.' });
        return res.status(502).json({ error: 'El asistente no está disponible ahora.' });
      }
    } else {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: MODEL, max_tokens: 700, system: SYSTEM + ctx, messages: msgs })
      });
      const d = await r.json();
      if (!r.ok) { console.error('anthropic', r.status, JSON.stringify(d).slice(0, 300)); return res.status(502).json({ error: 'El asistente no está disponible ahora.' }); }
      reply = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    }

    if (reply && ckey) {
      if (cache.size > 200) cache.delete(cache.keys().next().value);
      cache.set(ckey, { reply, t: Date.now() });
    }
    return res.status(200).json({ reply: reply || 'No pude armar una respuesta. ¿Me lo contás de otra forma?' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Algo salió mal. Probá de nuevo.' });
  }
}
