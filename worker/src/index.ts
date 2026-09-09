const ALLOWED_ORIGINS = new Set([
  'https://tatequieto-85.github.io',
  'http://localhost:5173',
]);

function corsHeaders(origin: string | null): HeadersInit {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(data: unknown, origin: string | null, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

interface GuestInput {
  name: string;
  rsvp?: 'pending' | 'yes' | 'no';
  guests_count?: number;
  notes?: string;
}

function parseGuestInput(value: unknown): GuestInput | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.name !== 'string' || record.name.trim() === '') return null;
  const rsvp = record.rsvp;
  if (rsvp !== undefined && rsvp !== 'pending' && rsvp !== 'yes' && rsvp !== 'no') return null;
  const guestsCount = record.guests_count;
  if (guestsCount !== undefined && (typeof guestsCount !== 'number' || guestsCount < 1)) return null;
  if (record.notes !== undefined && record.notes !== null && typeof record.notes !== 'string') return null;
  return {
    name: record.name.trim(),
    rsvp: rsvp as GuestInput['rsvp'],
    guests_count: guestsCount as number | undefined,
    notes: record.notes as string | undefined,
  };
}

function parseIdeaInput(value: unknown): { text: string } | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.text !== 'string' || record.text.trim() === '') return null;
  return { text: record.text.trim() };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (url.pathname === '/api/guests' && request.method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT id, name, rsvp, guests_count, notes, created_at FROM guests ORDER BY created_at ASC, id ASC'
      ).all();
      return json(results, origin);
    }

    if (url.pathname === '/api/guests' && request.method === 'POST') {
      const body = parseGuestInput(await request.json().catch(() => null));
      if (!body) return json({ error: 'Invalid guest data' }, origin, 400);

      const result = await env.DB.prepare(
        'INSERT INTO guests (name, rsvp, guests_count, notes) VALUES (?, ?, ?, ?) RETURNING id, name, rsvp, guests_count, notes, created_at'
      )
        .bind(body.name, body.rsvp ?? 'pending', body.guests_count ?? 1, body.notes ?? null)
        .first();
      return json(result, origin, 201);
    }

    const guestIdMatch = url.pathname.match(/^\/api\/guests\/(\d+)$/);
    if (guestIdMatch && request.method === 'PATCH') {
      const id = Number(guestIdMatch[1]);
      const body = parseGuestInput(await request.json().catch(() => null));
      if (!body) return json({ error: 'Invalid guest data' }, origin, 400);

      const result = await env.DB.prepare(
        'UPDATE guests SET name = ?, rsvp = ?, guests_count = ?, notes = ? WHERE id = ? RETURNING id, name, rsvp, guests_count, notes, created_at'
      )
        .bind(body.name, body.rsvp ?? 'pending', body.guests_count ?? 1, body.notes ?? null, id)
        .first();

      if (!result) return json({ error: 'Guest not found' }, origin, 404);
      return json(result, origin);
    }

    if (guestIdMatch && request.method === 'DELETE') {
      const id = Number(guestIdMatch[1]);
      await env.DB.prepare('DELETE FROM guests WHERE id = ?').bind(id).run();
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === '/api/ideas' && request.method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT id, text, photo_key, audio_key, created_at FROM ideas ORDER BY created_at ASC, id ASC'
      ).all();
      return json(results, origin);
    }

    if (url.pathname === '/api/ideas' && request.method === 'POST') {
      const body = parseIdeaInput(await request.json().catch(() => null));
      if (!body) return json({ error: 'Invalid idea data' }, origin, 400);

      const result = await env.DB.prepare(
        'INSERT INTO ideas (text) VALUES (?) RETURNING id, text, photo_key, audio_key, created_at'
      )
        .bind(body.text)
        .first();
      return json(result, origin, 201);
    }

    const ideaIdMatch = url.pathname.match(/^\/api\/ideas\/(\d+)$/);
    if (ideaIdMatch && request.method === 'PATCH') {
      const id = Number(ideaIdMatch[1]);
      const body = parseIdeaInput(await request.json().catch(() => null));
      if (!body) return json({ error: 'Invalid idea data' }, origin, 400);

      const result = await env.DB.prepare(
        'UPDATE ideas SET text = ? WHERE id = ? RETURNING id, text, photo_key, audio_key, created_at'
      )
        .bind(body.text, id)
        .first();

      if (!result) return json({ error: 'Idea not found' }, origin, 404);
      return json(result, origin);
    }

    if (ideaIdMatch && request.method === 'DELETE') {
      const id = Number(ideaIdMatch[1]);
      await env.DB.prepare('DELETE FROM ideas WHERE id = ?').bind(id).run();
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const settingsMatch = url.pathname.match(/^\/api\/settings\/([a-z0-9_-]+)$/i);
    if (settingsMatch && request.method === 'GET') {
      const key = settingsMatch[1];
      const result = await env.DB.prepare('SELECT key, value FROM app_settings WHERE key = ?')
        .bind(key)
        .first();
      if (!result) return json({ error: 'Not found' }, origin, 404);
      return json(result, origin);
    }

    if (settingsMatch && request.method === 'PUT') {
      const key = settingsMatch[1];
      const body = await request.json().catch(() => null);
      const value = body && typeof body === 'object' ? (body as Record<string, unknown>).value : undefined;
      if (typeof value !== 'string' || value.trim() === '') {
        return json({ error: 'Invalid value' }, origin, 400);
      }

      const result = await env.DB.prepare(
        'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value RETURNING key, value'
      )
        .bind(key, value)
        .first();
      return json(result, origin);
    }

    return json({ error: 'Not found' }, origin, 404);
  },
} satisfies ExportedHandler<Env>;
