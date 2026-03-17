#!/usr/bin/env bun
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_DIR = path.join(process.cwd(), '.gstack');
const STATE_FILE = path.join(CONFIG_DIR, 'skill.json');

interface State {
  pid: number;
  port: number;
  token: string;
  startedAt: string;
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command) {
    console.error('Usage: skill-name <command> [args...]');
    process.exit(1);
  }

  // Pattern A: Persistent Server
  // const state = await ensureServer();
  // await sendCommand(state, command, args);

  // Pattern B: Stateless
  const result = await execute(command, args);
  console.log(result);
}

// === PATTERN A: PERSISTENT SERVER ===

async function ensureServer(): Promise<State> {
  const state = readState();

  if (state && isProcessAlive(state.pid) && await isServerHealthy(state)) {
    return state;
  }

  return await startServer();
}

function readState(): State | null {
  const lockFd = fs.openSync(STATE_FILE + '.lock', 'w');

  try {
    // @ts-ignore - Bun flock API
    fs.flockSync(lockFd, 'ex');

    if (!fs.existsSync(STATE_FILE)) return null;

    const content = fs.readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(content);
  } finally {
    // @ts-ignore
    fs.flockSync(lockFd, 'un');
    fs.closeSync(lockFd);
  }
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function isServerHealthy(state: State): Promise<boolean> {
  try {
    const resp = await fetch(`http://127.0.0.1:${state.port}/health`, {
      signal: AbortSignal.timeout(1000)
    });
    return resp.ok;
  } catch {
    return false;
  }
}

async function startServer(): Promise<State> {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });

  const proc = Bun.spawn(['bun', 'run', path.join(__dirname, 'server.ts')], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, STATE_FILE }
  });

  proc.unref();

  // Wait for server ready
  for (let i = 0; i < 40; i++) {
    await Bun.sleep(200);
    const state = readState();
    if (state && isProcessAlive(state.pid)) {
      return state;
    }
  }

  throw new Error('Server failed to start');
}

async function sendCommand(state: State, command: string, args: string[]) {
  const resp = await fetch(`http://127.0.0.1:${state.port}/command`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${state.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command, args })
  });

  if (!resp.ok) {
    throw new Error(`Command failed: ${resp.status} ${resp.statusText}`);
  }

  const result = await resp.json();
  console.log(result.output || result);
}

// === PATTERN B: STATELESS ===

async function execute(command: string, args: string[]): Promise<string> {
  // TODO: Implement business logic
  return `Executed ${command} with args: ${args.join(', ')}`;
}

// Run
main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
