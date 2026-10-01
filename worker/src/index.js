// Contact form relay for www.polancoventures.com.
// Accepts a JSON POST from the site, validates it, and sends one email to
// MAIL_TO through the Resend API. Nothing is stored: no KV, no D1, no logs
// of message content. Secrets and settings come from the Worker environment.

const LIMITS = { name: 100, email: 200, company: 150, message: 3000 };
const AUDIENCES = { company: 'Company leader', investor: 'Investor', partner: 'Strategic partner' };
const MIN_SECONDS_ON_FORM = 3;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || 'https://www.polancoventures.com').split(',').map(s => s.trim());
    const cors = allowed.includes(origin) ? corsHeaders(origin) : {};

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405, cors);
    if (!allowed.includes(origin)) return json({ ok: false, error: 'Origin not allowed.' }, 403);

    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: 'Invalid request body.' }, 400, cors); }

    const problem = validate(body);
    if (problem) return json({ ok: false, error: problem }, 400, cors);

    // Honeypot and timing checks. Bots fill hidden fields and submit instantly.
    // Both answer "ok" so the sender learns nothing.
    const started = Number(body.t) || 0;
    if (body.website || (started && Date.now() - started < MIN_SECONDS_ON_FORM * 1000)) {
      return json({ ok: true }, 200, cors);
    }

    const f = clean(body);
    const audience = AUDIENCES[f.audience];
    const subject = `${audience} introduction | ${f.company}`;
    const text = [
      'Hello Polanco Ventures,', '', f.message, '',
      f.name, f.company, f.email, `Relationship: ${audience}`, '',
      'Sent from the contact form on www.polancoventures.com.',
    ].join('\n');

    const res = await fetch(env.MAIL_API_URL || 'https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.MAIL_FROM, to: [env.MAIL_TO], reply_to: f.email, subject, text }),
    });

    if (!res.ok) return json({ ok: false, error: 'The message could not be sent.' }, 502, cors);
    return json({ ok: true }, 200, cors);
  },
};

function validate(b) {
  if (!b || typeof b !== 'object') return 'Invalid request body.';
  for (const [k, max] of Object.entries(LIMITS)) {
    if (typeof b[k] !== 'string' || !b[k].trim()) return `Missing ${k}.`;
    if (b[k].length > max) return `${k} is too long.`;
  }
  if (b.message.trim().length < 10) return 'Message is too short.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email.trim())) return 'Invalid email address.';
  if (!AUDIENCES[b.audience]) return 'Invalid audience.';
  return null;
}

function clean(b) {
  const strip = s => s.trim().replace(/[\r\n]+/g, ' ');
  return {
    audience: b.audience,
    name: strip(b.name), email: strip(b.email), company: strip(b.company),
    message: b.message.trim(),
  };
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data, status, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });
}
