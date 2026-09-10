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

function parseIdeaInput(value: unknown): { text: string; url: string | null } | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.text !== 'string' || record.text.trim() === '') return null;
  if (record.url !== undefined && record.url !== null && typeof record.url !== 'string') return null;
  const url = typeof record.url === 'string' ? record.url.trim() : null;
  return { text: record.text.trim(), url: url || null };
}

interface IdeaRow {
  id: number;
  text: string;
  url: string | null;
  photo_key: string | null;
  audio_key: string | null;
  created_at: string;
}

function toIdeaResponse(row: IdeaRow, origin: string) {
  return {
    id: row.id,
    text: row.text,
    url: row.url,
    photo_url: row.photo_key ? `${origin}/api/media/${row.photo_key}` : null,
    audio_url: row.audio_key ? `${origin}/api/media/${row.audio_key}` : null,
    created_at: row.created_at,
  };
}

function parseTaskEditInput(value: unknown): { text: string; url: string | null; due_date: string } | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.text !== 'string' || record.text.trim() === '') return null;
  if (typeof record.due_date !== 'string' || record.due_date.trim() === '') return null;
  if (record.url !== undefined && record.url !== null && typeof record.url !== 'string') return null;
  const url = typeof record.url === 'string' ? record.url.trim() : null;
  return { text: record.text.trim(), url: url || null, due_date: record.due_date.trim() };
}

interface TaskRow {
  id: number;
  text: string;
  due_date: string;
  url: string | null;
  photo_key: string | null;
  audio_key: string | null;
  completed_at: string | null;
  comment: string | null;
  created_at: string;
}

function toTaskResponse(row: TaskRow, origin: string) {
  return {
    id: row.id,
    text: row.text,
    due_date: row.due_date,
    url: row.url,
    photo_url: row.photo_key ? `${origin}/api/media/${row.photo_key}` : null,
    audio_url: row.audio_key ? `${origin}/api/media/${row.audio_key}` : null,
    completed_at: row.completed_at,
    comment: row.comment,
    created_at: row.created_at,
  };
}

async function uploadFile(env: Env, file: File, prefix: string): Promise<string> {
  const key = `${prefix}/${crypto.randomUUID()}`;
  await env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
  });
  return key;
}

const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024;

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
        'SELECT id, text, url, photo_key, audio_key, created_at FROM ideas ORDER BY created_at ASC, id ASC'
      ).all<IdeaRow>();
      return json(results.map((row) => toIdeaResponse(row, url.origin)), origin);
    }

    if (url.pathname === '/api/ideas' && request.method === 'POST') {
      const formData = await request.formData().catch(() => null);
      if (!formData) return json({ error: 'Invalid form data' }, origin, 400);

      const text = formData.get('text');
      if (typeof text !== 'string' || text.trim() === '') {
        return json({ error: 'Invalid idea data' }, origin, 400);
      }
      const ideaUrl = formData.get('url');
      const trimmedUrl = typeof ideaUrl === 'string' && ideaUrl.trim() !== '' ? ideaUrl.trim() : null;

      const photoFile = formData.get('photo');
      const audioFile = formData.get('audio');
      const photoKey =
        photoFile instanceof File && photoFile.size > 0 ? await uploadFile(env, photoFile, 'ideas/photo') : null;
      const audioKey =
        audioFile instanceof File && audioFile.size > 0 ? await uploadFile(env, audioFile, 'ideas/audio') : null;

      const result = await env.DB.prepare(
        'INSERT INTO ideas (text, url, photo_key, audio_key) VALUES (?, ?, ?, ?) RETURNING id, text, url, photo_key, audio_key, created_at'
      )
        .bind(text.trim(), trimmedUrl, photoKey, audioKey)
        .first<IdeaRow>();
      return json(toIdeaResponse(result!, url.origin), origin, 201);
    }

    const ideaIdMatch = url.pathname.match(/^\/api\/ideas\/(\d+)$/);
    if (ideaIdMatch && request.method === 'PATCH') {
      const id = Number(ideaIdMatch[1]);
      const body = parseIdeaInput(await request.json().catch(() => null));
      if (!body) return json({ error: 'Invalid idea data' }, origin, 400);

      const result = await env.DB.prepare(
        'UPDATE ideas SET text = ?, url = ? WHERE id = ? RETURNING id, text, url, photo_key, audio_key, created_at'
      )
        .bind(body.text, body.url, id)
        .first<IdeaRow>();

      if (!result) return json({ error: 'Idea not found' }, origin, 404);
      return json(toIdeaResponse(result, url.origin), origin);
    }

    if (ideaIdMatch && request.method === 'DELETE') {
      const id = Number(ideaIdMatch[1]);
      const existing = await env.DB.prepare('SELECT photo_key, audio_key FROM ideas WHERE id = ?')
        .bind(id)
        .first<{ photo_key: string | null; audio_key: string | null }>();
      if (existing?.photo_key) await env.MEDIA.delete(existing.photo_key);
      if (existing?.audio_key) await env.MEDIA.delete(existing.audio_key);
      await env.DB.prepare('DELETE FROM ideas WHERE id = ?').bind(id).run();
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const ideaConvertMatch = url.pathname.match(/^\/api\/ideas\/(\d+)\/convert-to-task$/);
    if (ideaConvertMatch && request.method === 'POST') {
      const id = Number(ideaConvertMatch[1]);
      const body = await request.json().catch(() => null);
      const dueDate =
        body && typeof body === 'object' && typeof (body as Record<string, unknown>).due_date === 'string'
          ? ((body as Record<string, unknown>).due_date as string).trim()
          : '';
      if (!dueDate) return json({ error: 'Invalid due date' }, origin, 400);

      const idea = await env.DB.prepare('SELECT text, url, photo_key, audio_key FROM ideas WHERE id = ?')
        .bind(id)
        .first<{ text: string; url: string | null; photo_key: string | null; audio_key: string | null }>();
      if (!idea) return json({ error: 'Idea not found' }, origin, 404);

      const task = await env.DB.prepare(
        'INSERT INTO tasks (text, due_date, url, photo_key, audio_key) VALUES (?, ?, ?, ?, ?) RETURNING id, text, due_date, url, photo_key, audio_key, completed_at, comment, created_at'
      )
        .bind(idea.text, dueDate, idea.url, idea.photo_key, idea.audio_key)
        .first<TaskRow>();

      // La foto/audio pasan a pertenecer a la tarea, por eso no se borran de R2 aquí.
      await env.DB.prepare('DELETE FROM ideas WHERE id = ?').bind(id).run();

      return json(toTaskResponse(task!, url.origin), origin, 201);
    }

    if (url.pathname === '/api/tasks' && request.method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT id, text, due_date, url, photo_key, audio_key, completed_at, comment, created_at FROM tasks'
      ).all<TaskRow>();
      return json(results.map((row) => toTaskResponse(row, url.origin)), origin);
    }

    if (url.pathname === '/api/tasks' && request.method === 'POST') {
      const formData = await request.formData().catch(() => null);
      if (!formData) return json({ error: 'Invalid form data' }, origin, 400);

      const text = formData.get('text');
      const dueDate = formData.get('due_date');
      if (typeof text !== 'string' || text.trim() === '') {
        return json({ error: 'Invalid task data' }, origin, 400);
      }
      if (typeof dueDate !== 'string' || dueDate.trim() === '') {
        return json({ error: 'Invalid task data' }, origin, 400);
      }
      const taskUrl = formData.get('url');
      const trimmedUrl = typeof taskUrl === 'string' && taskUrl.trim() !== '' ? taskUrl.trim() : null;

      const photoFile = formData.get('photo');
      const audioFile = formData.get('audio');
      const photoKey =
        photoFile instanceof File && photoFile.size > 0 ? await uploadFile(env, photoFile, 'tasks/photo') : null;
      const audioKey =
        audioFile instanceof File && audioFile.size > 0 ? await uploadFile(env, audioFile, 'tasks/audio') : null;

      const result = await env.DB.prepare(
        'INSERT INTO tasks (text, due_date, url, photo_key, audio_key) VALUES (?, ?, ?, ?, ?) RETURNING id, text, due_date, url, photo_key, audio_key, completed_at, comment, created_at'
      )
        .bind(text.trim(), dueDate.trim(), trimmedUrl, photoKey, audioKey)
        .first<TaskRow>();
      return json(toTaskResponse(result!, url.origin), origin, 201);
    }

    const taskCompleteMatch = url.pathname.match(/^\/api\/tasks\/(\d+)\/complete$/);
    if (taskCompleteMatch && request.method === 'POST') {
      const id = Number(taskCompleteMatch[1]);
      const body = await request.json().catch(() => null);
      const comment =
        body && typeof body === 'object' && typeof (body as Record<string, unknown>).comment === 'string'
          ? ((body as Record<string, unknown>).comment as string).trim()
          : '';

      const result = await env.DB.prepare(
        "UPDATE tasks SET completed_at = datetime('now'), comment = ? WHERE id = ? RETURNING id, text, due_date, url, photo_key, audio_key, completed_at, comment, created_at"
      )
        .bind(comment || null, id)
        .first<TaskRow>();

      if (!result) return json({ error: 'Task not found' }, origin, 404);
      return json(toTaskResponse(result, url.origin), origin);
    }

    const taskIdMatch = url.pathname.match(/^\/api\/tasks\/(\d+)$/);
    if (taskIdMatch && request.method === 'PATCH') {
      const id = Number(taskIdMatch[1]);
      const body = parseTaskEditInput(await request.json().catch(() => null));
      if (!body) return json({ error: 'Invalid task data' }, origin, 400);

      const result = await env.DB.prepare(
        'UPDATE tasks SET text = ?, due_date = ?, url = ? WHERE id = ? RETURNING id, text, due_date, url, photo_key, audio_key, completed_at, comment, created_at'
      )
        .bind(body.text, body.due_date, body.url, id)
        .first<TaskRow>();

      if (!result) return json({ error: 'Task not found' }, origin, 404);
      return json(toTaskResponse(result, url.origin), origin);
    }

    if (taskIdMatch && request.method === 'DELETE') {
      const id = Number(taskIdMatch[1]);
      const existing = await env.DB.prepare('SELECT photo_key, audio_key FROM tasks WHERE id = ?')
        .bind(id)
        .first<{ photo_key: string | null; audio_key: string | null }>();
      if (existing?.photo_key) await env.MEDIA.delete(existing.photo_key);
      if (existing?.audio_key) await env.MEDIA.delete(existing.audio_key);
      await env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run();
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === '/api/gallery' && request.method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT id, photo_key, created_at FROM gallery_photos ORDER BY created_at ASC, id ASC'
      ).all<{ id: number; photo_key: string; created_at: string }>();
      return json(
        results.map((row) => ({
          id: row.id,
          photo_url: `${url.origin}/api/media/${row.photo_key}`,
          created_at: row.created_at,
        })),
        origin
      );
    }

    if (url.pathname === '/api/gallery' && request.method === 'POST') {
      const formData = await request.formData().catch(() => null);
      if (!formData) return json({ error: 'Invalid form data' }, origin, 400);

      const photoFile = formData.get('photo');
      if (!(photoFile instanceof File) || photoFile.size === 0) {
        return json({ error: 'Invalid photo' }, origin, 400);
      }
      const photoKey = await uploadFile(env, photoFile, 'gallery');

      const result = await env.DB.prepare(
        'INSERT INTO gallery_photos (photo_key) VALUES (?) RETURNING id, photo_key, created_at'
      )
        .bind(photoKey)
        .first<{ id: number; photo_key: string; created_at: string }>();
      return json(
        { id: result!.id, photo_url: `${url.origin}/api/media/${result!.photo_key}`, created_at: result!.created_at },
        origin,
        201
      );
    }

    const galleryIdMatch = url.pathname.match(/^\/api\/gallery\/(\d+)$/);
    if (galleryIdMatch && request.method === 'DELETE') {
      const id = Number(galleryIdMatch[1]);
      const existing = await env.DB.prepare('SELECT photo_key FROM gallery_photos WHERE id = ?')
        .bind(id)
        .first<{ photo_key: string }>();
      if (existing?.photo_key) await env.MEDIA.delete(existing.photo_key);
      await env.DB.prepare('DELETE FROM gallery_photos WHERE id = ?').bind(id).run();
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname.startsWith('/api/media/') && request.method === 'GET') {
      const key = url.pathname.slice('/api/media/'.length);
      const object = await env.MEDIA.get(key);
      if (!object) return json({ error: 'Not found' }, origin, 404);
      return new Response(object.body, {
        headers: {
          'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
          ...corsHeaders(origin),
        },
      });
    }

    if (url.pathname === '/api/storage-usage' && request.method === 'GET') {
      let totalBytes = 0;
      let cursor: string | undefined;
      do {
        const listing = await env.MEDIA.list({ cursor, limit: 1000 });
        for (const object of listing.objects) totalBytes += object.size;
        cursor = listing.truncated ? listing.cursor : undefined;
      } while (cursor);
      return json({ used_bytes: totalBytes, limit_bytes: STORAGE_LIMIT_BYTES }, origin);
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
