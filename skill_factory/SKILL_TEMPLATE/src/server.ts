import * as fs from 'fs';
import * as crypto from 'crypto';

const STATE_FILE = process.env.STATE_FILE || '.gstack/skill.json';
const LOG_FILE = STATE_FILE.replace('.json', '.log');

interface State {
  pid: number;
  port: number;
  token: string;
  startedAt: string;
}

interface CommandRequest {
  command: string;
  args: string[];
}

// === SETUP ===

const TOKEN = crypto.randomUUID();
const port = await findAvailablePort();

const server = Bun.serve({
  port,
  fetch: handleRequest
});

// Write state
const state: State = {
  pid: process.pid,
  port,
  token: TOKEN,
  startedAt: new Date().toISOString()
};

writeState(state);

console.log(`Server started on port ${port} (PID ${process.pid})`);

// === REQUEST HANDLER ===

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Health check
  if (url.pathname === '/health') {
    return new Response(JSON.stringify({
      status: 'ok',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Auth check
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${TOKEN}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Command dispatch
  if (url.pathname === '/command' && req.method === 'POST') {
    try {
      const body: CommandRequest = await req.json();
      const result = await routeCommand(body.command, body.args);

      return new Response(JSON.stringify({
        status: 'ok',
        output: result
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err: any) {
      return new Response(JSON.stringify({
        status: 'error',
        message: err.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Not Found', { status: 404 });
}

// === COMMAND ROUTING ===

async function routeCommand(command: string, args: string[]): Promise<string> {
  switch (command) {
    case 'test':
      return handleTest(args);

    case 'status':
      return handleStatus();

    // TODO: Add more commands

    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

function handleTest(args: string[]): string {
  return `Test command executed with args: ${args.join(', ')}`;
}

function handleStatus(): string {
  return JSON.stringify({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: fs.existsSync('dist/.version')
      ? fs.readFileSync('dist/.version', 'utf-8').trim()
      : 'dev'
  }, null, 2);
}

// === UTILITIES ===

async function findAvailablePort(): Promise<number> {
  const MIN_PORT = 10000;
  const MAX_PORT = 60000;

  for (let attempt = 0; attempt < 5; attempt++) {
    const port = MIN_PORT + Math.floor(Math.random() * (MAX_PORT - MIN_PORT));

    try {
      const testServer = Bun.serve({ port, fetch: () => new Response('') });
      testServer.stop();
      return port;
    } catch {
      continue;
    }
  }

  throw new Error('No available port found');
}

function writeState(state: State): void {
  const tmpFile = STATE_FILE + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2));
  fs.renameSync(tmpFile, STATE_FILE);
}

// === GRACEFUL SHUTDOWN ===

let isShuttingDown = false;

async function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log('Shutting down gracefully...');

  // TODO: Cleanup resources (close browser, flush logs, etc.)

  if (fs.existsSync(STATE_FILE)) {
    fs.unlinkSync(STATE_FILE);
  }

  server.stop();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
