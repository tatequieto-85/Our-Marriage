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
  origin_label: string | null;
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
    origin_label: row.origin_label,
    created_at: row.created_at,
  };
}

interface GalleryRow {
  id: number;
  photo_key: string;
  is_favorite: number;
  created_at: string;
}

function toGalleryResponse(row: GalleryRow, origin: string) {
  return {
    id: row.id,
    photo_url: `${origin}/api/media/${row.photo_key}`,
    is_favorite: Boolean(row.is_favorite),
    created_at: row.created_at,
  };
}

interface QuoteRow {
  id: number;
  text: string;
  document_key: string | null;
  document_name: string | null;
  photo_key: string | null;
  audio_key: string | null;
  status: string;
  created_at: string;
}

interface QuoteObservationRow {
  id: number;
  quote_id: number;
  text: string;
  photo_key: string | null;
  audio_key: string | null;
  document_key: string | null;
  document_name: string | null;
  created_at: string;
}

function toObservationResponse(row: QuoteObservationRow, origin: string) {
  return {
    id: row.id,
    text: row.text,
    photo_url: row.photo_key ? `${origin}/api/media/${row.photo_key}` : null,
    audio_url: row.audio_key ? `${origin}/api/media/${row.audio_key}` : null,
    document_url: row.document_key ? `${origin}/api/media/${row.document_key}` : null,
    document_name: row.document_name,
    created_at: row.created_at,
  };
}

function toQuoteResponse(row: QuoteRow, origin: string, observations: QuoteObservationRow[]) {
  return {
    id: row.id,
    text: row.text,
    document_url: row.document_key ? `${origin}/api/media/${row.document_key}` : null,
    document_name: row.document_name,
    photo_url: row.photo_key ? `${origin}/api/media/${row.photo_key}` : null,
    audio_url: row.audio_key ? `${origin}/api/media/${row.audio_key}` : null,
    status: row.status,
    observations: observations.map((o) => toObservationResponse(o, origin)),
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

    const TASK_COLUMNS = 'id, text, due_date, url, photo_key, audio_key, completed_at, comment, origin_label, created_at';

    const ideaConvertMatch = url.pathname.match(/^\/api\/ideas\/(\d+)\/convert-to-task$/);
    if (ideaConvertMatch && request.method === 'POST') {
      const id = Number(ideaConvertMatch[1]);
      const body = await request.json().catch(() => null);
      const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
      const dueDate = typeof record.due_date === 'string' ? record.due_date.trim() : '';
      const overrideText = typeof record.text === 'string' ? record.text.trim() : '';
      if (!dueDate) return json({ error: 'Invalid due date' }, origin, 400);

      const idea = await env.DB.prepare('SELECT text, url, photo_key, audio_key FROM ideas WHERE id = ?')
        .bind(id)
        .first<{ text: string; url: string | null; photo_key: string | null; audio_key: string | null }>();
      if (!idea) return json({ error: 'Idea not found' }, origin, 404);

      const finalText = overrideText || idea.text;
      const originLabel = `Idea: ${idea.text}`;

      const task = await env.DB.prepare(
        `INSERT INTO tasks (text, due_date, url, photo_key, audio_key, origin_label) VALUES (?, ?, ?, ?, ?, ?) RETURNING ${TASK_COLUMNS}`
      )
        .bind(finalText, dueDate, idea.url, idea.photo_key, idea.audio_key, originLabel)
        .first<TaskRow>();

      // La foto/audio pasan a pertenecer a la tarea, por eso no se borran de R2 aquí.
      await env.DB.prepare('DELETE FROM ideas WHERE id = ?').bind(id).run();

      return json(toTaskResponse(task!, url.origin), origin, 201);
    }

    if (url.pathname === '/api/tasks' && request.method === 'GET') {
      const { results } = await env.DB.prepare(`SELECT ${TASK_COLUMNS} FROM tasks`).all<TaskRow>();
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
        `INSERT INTO tasks (text, due_date, url, photo_key, audio_key) VALUES (?, ?, ?, ?, ?) RETURNING ${TASK_COLUMNS}`
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
        `UPDATE tasks SET completed_at = datetime('now'), comment = ? WHERE id = ? RETURNING ${TASK_COLUMNS}`
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
        `UPDATE tasks SET text = ?, due_date = ?, url = ? WHERE id = ? RETURNING ${TASK_COLUMNS}`
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

    const OBS_COLUMNS = 'id, quote_id, text, photo_key, audio_key, document_key, document_name, created_at';
    const QUOTE_COLUMNS = 'id, text, document_key, document_name, photo_key, audio_key, status, created_at';

    if (url.pathname === '/api/quotes' && request.method === 'GET') {
      const [{ results: quoteRows }, { results: obsRows }] = await Promise.all([
        env.DB.prepare(`SELECT ${QUOTE_COLUMNS} FROM quotes ORDER BY created_at ASC, id ASC`).all<QuoteRow>(),
        env.DB.prepare(`SELECT ${OBS_COLUMNS} FROM quote_observations ORDER BY created_at ASC, id ASC`).all<QuoteObservationRow>(),
      ]);
      const obsByQuote = new Map<number, QuoteObservationRow[]>();
      for (const obs of obsRows) {
        const list = obsByQuote.get(obs.quote_id) ?? [];
        list.push(obs);
        obsByQuote.set(obs.quote_id, list);
      }
      return json(
        quoteRows.map((row) => toQuoteResponse(row, url.origin, obsByQuote.get(row.id) ?? [])),
        origin
      );
    }

    if (url.pathname === '/api/quotes' && request.method === 'POST') {
      const formData = await request.formData().catch(() => null);
      if (!formData) return json({ error: 'Invalid form data' }, origin, 400);

      const text = formData.get('text');
      if (typeof text !== 'string' || text.trim() === '') {
        return json({ error: 'Invalid quote data' }, origin, 400);
      }

      const documentFile = formData.get('document');
      const photoFile = formData.get('photo');
      const audioFile = formData.get('audio');
      const documentKey =
        documentFile instanceof File && documentFile.size > 0 ? await uploadFile(env, documentFile, 'quotes') : null;
      const documentName = documentFile instanceof File && documentFile.size > 0 ? documentFile.name : null;
      const photoKey =
        photoFile instanceof File && photoFile.size > 0 ? await uploadFile(env, photoFile, 'quotes/photo') : null;
      const audioKey =
        audioFile instanceof File && audioFile.size > 0 ? await uploadFile(env, audioFile, 'quotes/audio') : null;

      const result = await env.DB.prepare(
        `INSERT INTO quotes (text, document_key, document_name, photo_key, audio_key) VALUES (?, ?, ?, ?, ?) RETURNING ${QUOTE_COLUMNS}`
      )
        .bind(text.trim(), documentKey, documentName, photoKey, audioKey)
        .first<QuoteRow>();
      return json(toQuoteResponse(result!, url.origin, []), origin, 201);
    }

    const quoteStatusMatch = url.pathname.match(/^\/api\/quotes\/(\d+)\/status$/);
    if (quoteStatusMatch && request.method === 'PUT') {
      const id = Number(quoteStatusMatch[1]);
      const body = await request.json().catch(() => null);
      const status =
        body && typeof body === 'object' && typeof (body as Record<string, unknown>).status === 'string'
          ? ((body as Record<string, unknown>).status as string)
          : '';
      if (status !== 'pending' && status !== 'desestimada') {
        return json({ error: 'Invalid status' }, origin, 400);
      }

      const result = await env.DB.prepare(`UPDATE quotes SET status = ? WHERE id = ? RETURNING ${QUOTE_COLUMNS}`)
        .bind(status, id)
        .first<QuoteRow>();
      if (!result) return json({ error: 'Quote not found' }, origin, 404);

      const { results: obsRows } = await env.DB.prepare(
        `SELECT ${OBS_COLUMNS} FROM quote_observations WHERE quote_id = ? ORDER BY created_at ASC, id ASC`
      )
        .bind(id)
        .all<QuoteObservationRow>();
      return json(toQuoteResponse(result, url.origin, obsRows), origin);
    }

    const quoteObservationsMatch = url.pathname.match(/^\/api\/quotes\/(\d+)\/observations$/);
    if (quoteObservationsMatch && request.method === 'POST') {
      const id = Number(quoteObservationsMatch[1]);
      const formData = await request.formData().catch(() => null);
      if (!formData) return json({ error: 'Invalid form data' }, origin, 400);

      const text = formData.get('text');
      if (typeof text !== 'string' || text.trim() === '') {
        return json({ error: 'Invalid observation' }, origin, 400);
      }

      const quote = await env.DB.prepare(`SELECT ${QUOTE_COLUMNS} FROM quotes WHERE id = ?`)
        .bind(id)
        .first<QuoteRow>();
      if (!quote) return json({ error: 'Quote not found' }, origin, 404);

      const photoFile = formData.get('photo');
      const audioFile = formData.get('audio');
      const documentFile = formData.get('document');
      const photoKey =
        photoFile instanceof File && photoFile.size > 0 ? await uploadFile(env, photoFile, 'quotes/obs-photo') : null;
      const audioKey =
        audioFile instanceof File && audioFile.size > 0 ? await uploadFile(env, audioFile, 'quotes/obs-audio') : null;
      const documentKey =
        documentFile instanceof File && documentFile.size > 0
          ? await uploadFile(env, documentFile, 'quotes/obs-document')
          : null;
      const documentName = documentFile instanceof File && documentFile.size > 0 ? documentFile.name : null;

      await env.DB.prepare(
        'INSERT INTO quote_observations (quote_id, text, photo_key, audio_key, document_key, document_name) VALUES (?, ?, ?, ?, ?, ?)'
      )
        .bind(id, text.trim(), photoKey, audioKey, documentKey, documentName)
        .run();

      const { results: obsRows } = await env.DB.prepare(
        `SELECT ${OBS_COLUMNS} FROM quote_observations WHERE quote_id = ? ORDER BY created_at ASC, id ASC`
      )
        .bind(id)
        .all<QuoteObservationRow>();
      return json(toQuoteResponse(quote, url.origin, obsRows), origin, 201);
    }

    const quoteScheduleMatch = url.pathname.match(/^\/api\/quotes\/(\d+)\/schedule-task$/);
    if (quoteScheduleMatch && request.method === 'POST') {
      const id = Number(quoteScheduleMatch[1]);
      const body = await request.json().catch(() => null);
      const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
      const dueDate = typeof record.due_date === 'string' ? record.due_date.trim() : '';
      const overrideText = typeof record.text === 'string' ? record.text.trim() : '';
      if (!dueDate) return json({ error: 'Invalid due date' }, origin, 400);

      const quote = await env.DB.prepare(`SELECT ${QUOTE_COLUMNS} FROM quotes WHERE id = ?`)
        .bind(id)
        .first<QuoteRow>();
      if (!quote) return json({ error: 'Quote not found' }, origin, 404);

      const lastObservation = await env.DB.prepare(
        'SELECT text FROM quote_observations WHERE quote_id = ? ORDER BY created_at DESC, id DESC LIMIT 1'
      )
        .bind(id)
        .first<{ text: string }>();

      const finalText = overrideText || lastObservation?.text || quote.text;
      const taskUrl = quote.document_key ? `${url.origin}/api/media/${quote.document_key}` : null;
      const originLabel = `Cotización: ${quote.text}`;

      const task = await env.DB.prepare(
        `INSERT INTO tasks (text, due_date, url, origin_label) VALUES (?, ?, ?, ?) RETURNING ${TASK_COLUMNS}`
      )
        .bind(finalText, dueDate, taskUrl, originLabel)
        .first<TaskRow>();

      return json(toTaskResponse(task!, url.origin), origin, 201);
    }

    const quoteIdMatch = url.pathname.match(/^\/api\/quotes\/(\d+)$/);
    if (quoteIdMatch && request.method === 'PATCH') {
      const id = Number(quoteIdMatch[1]);
      const body = await request.json().catch(() => null);
      const text =
        body && typeof body === 'object' && typeof (body as Record<string, unknown>).text === 'string'
          ? ((body as Record<string, unknown>).text as string).trim()
          : '';
      if (!text) return json({ error: 'Invalid quote data' }, origin, 400);

      const result = await env.DB.prepare(`UPDATE quotes SET text = ? WHERE id = ? RETURNING ${QUOTE_COLUMNS}`)
        .bind(text, id)
        .first<QuoteRow>();
      if (!result) return json({ error: 'Quote not found' }, origin, 404);

      const { results: obsRows } = await env.DB.prepare(
        `SELECT ${OBS_COLUMNS} FROM quote_observations WHERE quote_id = ? ORDER BY created_at ASC, id ASC`
      )
        .bind(id)
        .all<QuoteObservationRow>();
      return json(toQuoteResponse(result, url.origin, obsRows), origin);
    }

    if (quoteIdMatch && request.method === 'DELETE') {
      const id = Number(quoteIdMatch[1]);
      const existing = await env.DB.prepare('SELECT document_key, photo_key, audio_key FROM quotes WHERE id = ?')
        .bind(id)
        .first<{ document_key: string | null; photo_key: string | null; audio_key: string | null }>();
      if (existing?.document_key) await env.MEDIA.delete(existing.document_key);
      if (existing?.photo_key) await env.MEDIA.delete(existing.photo_key);
      if (existing?.audio_key) await env.MEDIA.delete(existing.audio_key);

      const { results: obsToDelete } = await env.DB.prepare(
        'SELECT photo_key, audio_key, document_key FROM quote_observations WHERE quote_id = ?'
      )
        .bind(id)
        .all<{ photo_key: string | null; audio_key: string | null; document_key: string | null }>();
      for (const obs of obsToDelete) {
        if (obs.photo_key) await env.MEDIA.delete(obs.photo_key);
        if (obs.audio_key) await env.MEDIA.delete(obs.audio_key);
        if (obs.document_key) await env.MEDIA.delete(obs.document_key);
      }

      await env.DB.prepare('DELETE FROM quote_observations WHERE quote_id = ?').bind(id).run();
      await env.DB.prepare('DELETE FROM quotes WHERE id = ?').bind(id).run();
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === '/api/gallery' && request.method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT id, photo_key, is_favorite, created_at FROM gallery_photos ORDER BY created_at ASC, id ASC'
      ).all<GalleryRow>();
      return json(results.map((row) => toGalleryResponse(row, url.origin)), origin);
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
        'INSERT INTO gallery_photos (photo_key) VALUES (?) RETURNING id, photo_key, is_favorite, created_at'
      )
        .bind(photoKey)
        .first<GalleryRow>();
      return json(toGalleryResponse(result!, url.origin), origin, 201);
    }

    const galleryFavoriteMatch = url.pathname.match(/^\/api\/gallery\/(\d+)\/favorite$/);
    if (galleryFavoriteMatch && request.method === 'PUT') {
      const id = Number(galleryFavoriteMatch[1]);
      const body = await request.json().catch(() => null);
      const isFavorite =
        body && typeof body === 'object' && typeof (body as Record<string, unknown>).is_favorite === 'boolean'
          ? ((body as Record<string, unknown>).is_favorite as boolean)
          : null;
      if (isFavorite === null) return json({ error: 'Invalid value' }, origin, 400);

      const result = await env.DB.prepare(
        'UPDATE gallery_photos SET is_favorite = ? WHERE id = ? RETURNING id, photo_key, is_favorite, created_at'
      )
        .bind(isFavorite ? 1 : 0, id)
        .first<GalleryRow>();

      if (!result) return json({ error: 'Photo not found' }, origin, 404);
      return json(toGalleryResponse(result, url.origin), origin);
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
