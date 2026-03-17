#!/usr/bin/env node
/**
 * create-demo-db.js — Create SQLite demo database for Nash observability.
 *
 * Uses sql.js (pure JS, no native deps, no Docker).
 * Creates data/nash.db with tables matching observability/server.js queries.
 *
 * Usage: node scripts/create-demo-db.js
 */
'use strict';

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'nash.db');

async function main() {
  fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });

  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Schema
  db.run(`
    CREATE TABLE tasks (
      id TEXT PRIMARY KEY, description TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
      pipeline TEXT, current_phase TEXT, current_agent TEXT,
      started_at TEXT, updated_at TEXT, completed_at TEXT,
      tokens_used INTEGER DEFAULT 0, tokens_budget INTEGER DEFAULT 30000,
      progress_percent INTEGER DEFAULT 0, estimated_completion TEXT, error_message TEXT
    );
    CREATE TABLE agents (
      id TEXT PRIMARY KEY, type TEXT, archetype TEXT, status TEXT DEFAULT 'idle',
      current_task_id TEXT, total_tasks_completed INTEGER DEFAULT 0,
      avg_score REAL DEFAULT 0, avg_tokens_per_task REAL DEFAULT 0, last_active TEXT
    );
    CREATE TABLE agent_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT, task_id TEXT NOT NULL, agent TEXT NOT NULL,
      phase TEXT, started_at TEXT, completed_at TEXT,
      tokens_used INTEGER DEFAULT 0, score INTEGER DEFAULT 0
    );
    CREATE TABLE ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT, task_id TEXT NOT NULL, agent TEXT NOT NULL,
      event TEXT NOT NULL, severity TEXT, points INTEGER DEFAULT 0,
      evidence TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX idx_tasks_status ON tasks(status);
    CREATE INDEX idx_agents_status ON agents(status);
    CREATE INDEX idx_agent_tasks_task ON agent_tasks(task_id);
    CREATE INDEX idx_agent_tasks_agent ON agent_tasks(agent);
  `);

  const now = Date.now();
  const h = (hours) => new Date(now - hours * 3600000).toISOString();

  // Tasks
  const insertTask = db.prepare(`INSERT INTO tasks (id,description,status,pipeline,current_phase,current_agent,started_at,updated_at,completed_at,tokens_used,tokens_budget,progress_percent) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const tasks = [
    ['T1_01','Add logging to authentication module','completed','Coding','F',null,h(4),h(2),h(2),12500,30000,100],
    ['T1_02','Design user dashboard wireframes','completed','Design Flow','F',null,h(3),h(1),h(1),8300,20000,100],
    ['T1_03','Fix memory leak in event handler','in_progress','Hotfix','C','Tung Diag',h(0.5),h(0.1),null,15600,25000,65],
    ['T1_04','Write integration tests for API','in_progress','Testing','D','Son QA',h(0.25),h(0.05),null,9200,20000,40],
    ['T1_05','Security audit before deployment','pending','Security','A',null,null,null,null,0,30000,0],
    ['T1_06','Refactor database query optimization','completed','Coding','F',null,h(6),h(3),h(3),18200,30000,100],
    ['T1_07','Update API documentation','completed','Requirements','F',null,h(8),h(4),h(4),6500,15000,100],
  ];
  for (const t of tasks) { insertTask.bind(t); insertTask.step(); insertTask.reset(); }
  insertTask.free();

  // Agents
  const insertAgent = db.prepare(`INSERT INTO agents (id,type,archetype,status,current_task_id,total_tasks_completed,avg_score,avg_tokens_per_task,last_active) VALUES (?,?,?,?,?,?,?,?,?)`);
  const agents = [
    ['dung-manager','core','Strategist','active','T1_03',12,15.2,11500,h(0.1)],
    ['phuc-sa','core','Strategist','active','T1_04',8,18.5,14200,h(0.2)],
    ['moc-arch-chal','core','Critic','active',null,15,16.8,8900,h(0.5)],
    ['thuc-dev-ts','dev','Builder','idle',null,6,12.0,16500,h(2)],
    ['lan-dev-fe','dev','Builder','active','T1_03',10,14.5,12300,h(0.3)],
    ['son-qa','core','Critic','active','T1_04',9,17.0,7800,h(0.1)],
    ['tung-diag','core','Analyst','active','T1_03',11,13.5,9500,h(0.1)],
    ['conan-req-aud','core','Analyst','idle',null,7,16.0,10200,h(1)],
    ['hung-devops','dev','Operator','idle',null,5,11.5,13800,h(3)],
  ];
  for (const a of agents) { insertAgent.bind(a); insertAgent.step(); insertAgent.reset(); }
  insertAgent.free();

  // Agent Tasks history
  const insertAT = db.prepare(`INSERT INTO agent_tasks (task_id,agent,phase,started_at,completed_at,tokens_used,score) VALUES (?,?,?,?,?,?,?)`);
  const atasks = [
    ['T1_01','dung-manager','A',h(4),h(3.8),1500,10],
    ['T1_01','conan-req-aud','B',h(3.8),h(3.5),2000,15],
    ['T1_01','thuc-dev-ts','C',h(3.5),h(2.5),6000,10],
    ['T1_01','moc-arch-chal','D',h(2.5),h(2.2),2000,20],
    ['T1_01','son-qa','E',h(2.2),h(2),1000,15],
    ['T1_03','dung-manager','A',h(0.5),h(0.45),800,10],
    ['T1_03','tung-diag','B',h(0.45),h(0.35),1200,15],
    ['T1_03','lan-dev-fe','C',h(0.35),null,5000,null],
    ['T1_06','phuc-sa','A',h(6),h(5.8),2500,20],
    ['T1_06','thuc-dev-ts','C',h(5.5),h(4),12000,10],
    ['T1_06','moc-arch-chal','D',h(4),h(3.5),2500,15],
  ];
  for (const at of atasks) { insertAT.bind(at); insertAT.step(); insertAT.reset(); }
  insertAT.free();

  // Write to file
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
  db.close();

  const taskCount = tasks.length;
  const agentCount = agents.length;
  const historyCount = atasks.length;

  console.log(`✅ Demo database created: ${DB_PATH}`);
  console.log(`   📊 ${taskCount} tasks, ${agentCount} agents, ${historyCount} agent_task entries`);
  console.log(`   🗄️  Tables: tasks, agents, agent_tasks, ledger`);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
