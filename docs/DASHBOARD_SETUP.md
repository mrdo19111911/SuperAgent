# Nash Framework Dashboard - Simple Setup

## ✨ Static HTML Dashboard (NO React, NO Build Step)

**File:** `observability/dashboard.html` - Single-file dashboard với vanilla JS

**Features:**
- 📊 Real-time metrics (2s polling)
- 📋 Recent tasks list
- 👥 Active agents monitor
- 🎨 Dark theme with glassmorphism
- ⚡ Zero dependencies (no npm, no webpack, no React)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Backend API

```bash
cd observability
node server.js
```

**What it does:**
- Starts REST API on `http://localhost:4000`
- Reads from SQLite database at `data/nash.db`
- Provides endpoints: `/api/tasks`, `/api/agents`, `/metrics`

**Expected output:**
```
[INFO] Connected to database: E:\SuperAgent\data\nash.db
Server listening on port 4000
```

### Step 2: Open Dashboard

**Option A - Direct file open:**
```bash
# Windows
start observability/dashboard.html

# macOS
open observability/dashboard.html

# Linux
xdg-open observability/dashboard.html
```

**Option B - Local HTTP server (if CORS issues):**
```bash
# Python 3
cd observability
python -m http.server 8080

# Node.js (if you have http-server)
npx http-server observability -p 8080
```

Then open: `http://localhost:8080/dashboard.html`

### Step 3: Dispatch Tasks

```bash
# In another terminal
claude --agent agents/core/dung-manager.md "Add logging to auth module"
```

**Dashboard will auto-update every 2 seconds** showing:
- Total tasks count
- Active running tasks
- Success rate
- Average tokens used
- Recent task list
- Active agents with scores

---

## 🔧 How It Works (Simple Polling Architecture)

```
┌─────────────────────────────────────────┐
│  Browser (dashboard.html)              │
│  - Vanilla JavaScript                   │
│  - fetch() API calls every 2s          │
│  - No frameworks, no dependencies      │
└──────────────┬──────────────────────────┘
               │
               │ HTTP GET every 2s
               │ /api/tasks
               │ /api/agents
               │
               ▼
┌─────────────────────────────────────────┐
│  Backend (server.js)                    │
│  - Express REST API                     │
│  - Port 4000                            │
│  - CORS enabled                         │
└──────────────┬──────────────────────────┘
               │
               │ Read-only queries
               │
               ▼
┌─────────────────────────────────────────┐
│  SQLite (data/nash.db)                  │
│  - tasks table                          │
│  - agents table                         │
│  - ledger table                         │
└─────────────────────────────────────────┘
```

**Why polling instead of WebSocket?**
- ✅ Simpler (no WebSocket server needed)
- ✅ Works with static HTML (no build step)
- ✅ More reliable (auto-reconnects on network issues)
- ✅ Lower resource usage (only queries when needed)
- ⚠️ Tradeoff: 2s delay (acceptable for monitoring)

**Why fetch() instead of JSONP?**
- ✅ Modern browsers all support fetch() + CORS
- ✅ Cleaner error handling
- ✅ Async/await syntax
- ✅ No global callback pollution
- ℹ️ JSONP is legacy technique (pre-CORS era)

---

## 📡 API Endpoints

Backend provides these endpoints:

### GET /api/tasks
Returns all tasks with status:
```json
[
  {
    "id": "T1_01",
    "description": "Add logging to auth",
    "status": "running",
    "pipeline": "Coding",
    "tokens_used": 12500,
    "created_at": "2026-03-17T10:30:00Z"
  }
]
```

### GET /api/agents
Returns active agents:
```json
[
  {
    "name": "Dung PM",
    "role": "Project Manager",
    "status": "active",
    "score": 150,
    "tasks_count": 5
  }
]
```

### GET /metrics
Prometheus format metrics:
```
# HELP nash_tasks_total Total tasks by status
# TYPE nash_tasks_total counter
nash_tasks_total{status="completed"} 42
nash_tasks_total{status="running"} 3
nash_tasks_total{status="failed"} 1
```

---

## 🐛 Troubleshooting

### Dashboard shows "Connection Error"

**Cause:** Backend not running or CORS blocked

**Fix:**
```bash
# 1. Check backend is running
curl http://localhost:4000/api/tasks

# 2. Check CORS headers
curl -I http://localhost:4000/api/tasks

# 3. Restart backend
cd observability
node server.js
```

### Database not found

**Error:** `Failed to connect to database: ENOENT`

**Fix:**
```bash
# Create database directory
mkdir -p data

# Initialize database (you need schema.sql)
sqlite3 data/nash.db < schema.sql
```

### Port 4000 already in use

**Fix:**
```bash
# Change port in server.js
# Line 22: const PORT = process.env.PORT || 4001;

# Or kill existing process
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:4000 | xargs kill -9
```

---

## 🎨 Customization

### Change refresh interval

Edit `dashboard.html` line 268:
```javascript
const REFRESH_INTERVAL = 2000; // Change to 5000 for 5s refresh
```

### Change theme colors

Edit CSS variables in `<style>` section:
```css
body {
  background: #0f172a; /* Dark blue background */
  color: #e2e8f0;      /* Light text */
}
```

### Add custom metrics

1. Add new metric card in HTML
2. Add data fetching in `updateMetrics()` function
3. Update display in DOM

---

## 📊 Alternative: Grafana (Advanced)

If you want more advanced visualization:

### Setup Grafana

```bash
# 1. Install Grafana (Windows - use Chocolatey)
choco install grafana

# 2. Start Grafana
grafana-server

# 3. Install Prometheus
choco install prometheus

# 4. Configure Prometheus to scrape nash API
# Edit prometheus.yml:
scrape_configs:
  - job_name: 'nash'
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: '/metrics'

# 5. Start Prometheus
prometheus --config.file=prometheus.yml

# 6. Add Prometheus data source in Grafana
# URL: http://localhost:9090

# 7. Import dashboard from grafana/dashboards/
```

**Trade-off:**
- ✅ More features (alerts, graphs, historical data)
- ❌ More complex (2 extra services: Prometheus + Grafana)
- ❌ Higher resource usage

**Recommendation:** Start with `dashboard.html`, upgrade to Grafana if needed.

---

## 🔍 Comparison: Simple vs Advanced

| Feature | Static HTML | Grafana |
|---------|-------------|---------|
| Setup time | 2 minutes | 30+ minutes |
| Dependencies | Node.js only | Node + Prometheus + Grafana |
| Memory usage | ~50MB | ~500MB |
| Real-time updates | 2s polling | 5s default |
| Historical data | Last 10 tasks | Full history |
| Alerts | No | Yes |
| Custom dashboards | Manual edit | GUI builder |
| Sharing | HTML file | URL + auth |

**Use Static HTML when:**
- 👍 Quick setup needed
- 👍 Single developer
- 👍 Low resource machine
- 👍 Simple monitoring (current state)

**Use Grafana when:**
- 👍 Team monitoring
- 👍 Historical analysis needed
- 👍 Alert notifications required
- 👍 Multiple dashboards

---

## 📝 Summary

**Nash Dashboard = 1 HTML file + 1 JS server**
- No build step
- No React/Vue/Angular
- No webpack/vite
- No package.json (for dashboard itself)
- Just open HTML, it works!

**Next steps:**
1. Run `node server.js`
2. Open `dashboard.html`
3. Dispatch tasks with Claude
4. Watch real-time updates

Simple, fast, effective! 🚀
