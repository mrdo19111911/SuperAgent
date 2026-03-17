// Create demo database for Nash Framework
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'data', 'nash.db');

console.log('Creating demo database at:', DB_PATH);

// Create data directory
try {
  mkdirSync(join(__dirname, '..', 'data'), { recursive: true });
} catch (e) {
  // Directory already exists
}

// Create database
const db = new Database(DB_PATH);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    description TEXT,
    status TEXT,
    pipeline TEXT,
    tokens_used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS agents (
    name TEXT PRIMARY KEY,
    role TEXT,
    status TEXT,
    score INTEGER DEFAULT 0,
    tasks_count INTEGER DEFAULT 0
  );
`);

// Insert demo data
const insertTask = db.prepare(`
  INSERT OR REPLACE INTO tasks (id, description, status, pipeline, tokens_used, created_at)
  VALUES (?, ?, ?, ?, ?, datetime('now', ?))
`);

const insertAgent = db.prepare(`
  INSERT OR REPLACE INTO agents (name, role, status, score, tasks_count)
  VALUES (?, ?, ?, ?, ?)
`);

// Demo tasks
insertTask.run('T1_01', 'Add logging to authentication module', 'completed', 'Coding', 12500, '-2 hours');
insertTask.run('T1_02', 'Design user dashboard wireframes', 'completed', 'Design Flow', 8300, '-1 hour');
insertTask.run('T1_03', 'Fix memory leak in event handler', 'running', 'Hotfix', 15600, '-30 minutes');
insertTask.run('T1_04', 'Write integration tests for API', 'running', 'Testing', 9200, '-15 minutes');
insertTask.run('T1_05', 'Security audit before deployment', 'pending', 'Security', 0, '-5 minutes');
insertTask.run('T1_06', 'Refactor database query optimization', 'completed', 'Coding', 18200, '-3 hours');
insertTask.run('T1_07', 'Update API documentation', 'completed', 'Requirements', 6500, '-4 hours');

// Demo agents
insertAgent.run('Dung PM', 'Project Manager', 'active', 150, 12);
insertAgent.run('Phuc SA', 'Software Architect', 'active', 180, 8);
insertAgent.run('Moc', 'Code Reviewer', 'active', 165, 15);
insertAgent.run('Thuc', 'Backend Developer', 'idle', 120, 6);
insertAgent.run('Lan', 'Quality Assurance', 'active', 140, 10);

db.close();

console.log('✅ Demo database created successfully!');
console.log(`📊 Inserted ${db.prepare('SELECT COUNT(*) FROM tasks').pluck().get() || 7} tasks`);
console.log(`👥 Inserted ${db.prepare('SELECT COUNT(*) FROM agents').pluck().get() || 5} agents`);
