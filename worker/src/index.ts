const ALLOWED_ORIGINS = new Set([
  'https://tatequieto-85.github.io',
  'http://localhost:5173',
]);

function corsHeaders(origin: string | null): HeadersInit {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (url.pathname === '/api/guests' && request.method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT id, name, rsvp, guests_count, notes, created_at FROM guests ORDER BY created_at DESC'
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

    return json({ error: 'Not found' }, origin, 404);
  },
} satisfies ExportedHandler<Env>;
