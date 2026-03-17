const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3737;
const TASKS_FILE = path.join(__dirname, '..', 'Tasks.json');
const LOG_FILE = path.join(__dirname, '..', 'Tasks.log');

function log(message) {
  const ts = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${ts}] ${message}\n`);
}

function readTasks() {
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  } catch {
    return { tasks: [], completed: [] };
  }
}

function writeTasks(data) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2) + '\n');
}

function serveStatic(res, filePath, contentType) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Static files
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    return serveStatic(res, path.join(__dirname, 'index.html'), 'text/html');
  }

  // API: GET tasks
  if (req.method === 'GET' && url.pathname === '/api/tasks') {
    return json(res, readTasks());
  }

  // API: POST task (add)
  if (req.method === 'POST' && url.pathname === '/api/tasks') {
    const body = await parseBody(req);
    if (!body.title) return json(res, { error: 'title required' }, 400);

    const data = readTasks();
    const task = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: body.title,
      description: body.description || '',
      priority: ['critical', 'high', 'medium', 'low'].includes(body.priority) ? body.priority : 'medium',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.tasks.push(task);
    writeTasks(data);
    log(`ADDED: [${task.priority}] "${task.title}"`);
    return json(res, task, 201);
  }

  // API: PUT task (update)
  if (req.method === 'PUT' && url.pathname.startsWith('/api/tasks/')) {
    const id = url.pathname.split('/').pop();
    const body = await parseBody(req);
    const data = readTasks();
    const idx = data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return json(res, { error: 'not found' }, 404);

    if (body.title) data.tasks[idx].title = body.title;
    if (body.description !== undefined) data.tasks[idx].description = body.description;
    if (body.priority) data.tasks[idx].priority = body.priority;
    if (body.status) data.tasks[idx].status = body.status;
    data.tasks[idx].updatedAt = new Date().toISOString();

    writeTasks(data);
    log(`UPDATED: [${data.tasks[idx].priority}] "${data.tasks[idx].title}"`);
    return json(res, data.tasks[idx]);
  }

  // API: DELETE task
  if (req.method === 'DELETE' && url.pathname.startsWith('/api/tasks/')) {
    const id = url.pathname.split('/').pop();
    const data = readTasks();
    const idx = data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return json(res, { error: 'not found' }, 404);

    const removed = data.tasks.splice(idx, 1)[0];
    writeTasks(data);
    log(`DELETED: [${removed.priority}] "${removed.title}"`);
    return json(res, { ok: true });
  }

  // API: POST complete task
  if (req.method === 'POST' && url.pathname.startsWith('/api/tasks/') && url.pathname.endsWith('/complete')) {
    const id = url.pathname.split('/')[3];
    const data = readTasks();
    const idx = data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return json(res, { error: 'not found' }, 404);

    const task = data.tasks.splice(idx, 1)[0];
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    data.completed.push(task);
    writeTasks(data);
    log(`COMPLETED: [${task.priority}] "${task.title}"`);
    return json(res, task);
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Dashboard: http://localhost:${PORT}`);
  log('SERVER STARTED');
});
