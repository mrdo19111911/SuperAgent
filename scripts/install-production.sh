#!/bin/bash

# Nash Framework - Production Setup (NO DOCKER)
# For: Single server with 28 cores, 64-128GB RAM
# OS: Windows (WSL2) or Linux

set -e

echo "🚀 Nash Framework Production Setup"
echo "=================================="

# 1. Install PostgreSQL
echo "📦 Installing PostgreSQL..."
if command -v apt-get &> /dev/null; then
  # Ubuntu/Debian
  sudo apt-get update
  sudo apt-get install -y postgresql postgresql-contrib
elif command -v yum &> /dev/null; then
  # CentOS/RHEL
  sudo yum install -y postgresql postgresql-server
fi

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create nash database
sudo -u postgres psql -c "CREATE DATABASE nash_framework;"
sudo -u postgres psql -c "CREATE USER nash WITH PASSWORD 'nash_local_dev';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nash_framework TO nash;"

echo "✅ PostgreSQL installed"

# 2. Install Redis
echo "📦 Installing Redis..."
if command -v apt-get &> /dev/null; then
  sudo apt-get install -y redis-server
elif command -v yum &> /dev/null; then
  sudo yum install -y redis
fi

sudo systemctl start redis
sudo systemctl enable redis

echo "✅ Redis installed"

# 3. Install Qdrant (standalone binary, NO Docker)
echo "📦 Installing Qdrant..."
QDRANT_VERSION="v1.7.4"
wget https://github.com/qdrant/qdrant/releases/download/${QDRANT_VERSION}/qdrant-x86_64-unknown-linux-gnu.tar.gz
tar -xzf qdrant-x86_64-unknown-linux-gnu.tar.gz
sudo mv qdrant /usr/local/bin/
rm qdrant-x86_64-unknown-linux-gnu.tar.gz

# Create Qdrant data directory
mkdir -p data/qdrant

# Create systemd service for Qdrant
sudo tee /etc/systemd/system/qdrant.service > /dev/null <<EOF
[Unit]
Description=Qdrant Vector Database
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PWD
ExecStart=/usr/local/bin/qdrant --storage-path $PWD/data/qdrant
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start qdrant
sudo systemctl enable qdrant

echo "✅ Qdrant installed (http://localhost:6333)"

# 4. Install Prometheus
echo "📦 Installing Prometheus..."
PROM_VERSION="2.48.0"
wget https://github.com/prometheus/prometheus/releases/download/v${PROM_VERSION}/prometheus-${PROM_VERSION}.linux-amd64.tar.gz
tar -xzf prometheus-${PROM_VERSION}.linux-amd64.tar.gz
sudo mv prometheus-${PROM_VERSION}.linux-amd64/prometheus /usr/local/bin/
sudo mv prometheus-${PROM_VERSION}.linux-amd64/promtool /usr/local/bin/
rm -rf prometheus-${PROM_VERSION}.linux-amd64*

# Create Prometheus config
mkdir -p data/prometheus
cat > prometheus.yml <<EOF
global:
  scrape_interval: 10s

scrape_configs:
  - job_name: 'nash-agents'
    static_configs:
      - targets: ['localhost:9091']
EOF

# Create systemd service
sudo tee /etc/systemd/system/prometheus.service > /dev/null <<EOF
[Unit]
Description=Prometheus Monitoring
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PWD
ExecStart=/usr/local/bin/prometheus --config.file=$PWD/prometheus.yml --storage.tsdb.path=$PWD/data/prometheus
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start prometheus
sudo systemctl enable prometheus

echo "✅ Prometheus installed (http://localhost:9090)"

# 5. Install Grafana
echo "📦 Installing Grafana..."
if command -v apt-get &> /dev/null; then
  sudo apt-get install -y software-properties-common
  sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
  wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
  sudo apt-get update
  sudo apt-get install -y grafana
elif command -v yum &> /dev/null; then
  sudo tee /etc/yum.repos.d/grafana.repo > /dev/null <<EOF
[grafana]
name=grafana
baseurl=https://packages.grafana.com/oss/rpm
repo_gpgcheck=1
enabled=1
gpgcheck=1
gpgkey=https://packages.grafana.com/gpg.key
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
EOF
  sudo yum install -y grafana
fi

sudo systemctl start grafana-server
sudo systemctl enable grafana-server

echo "✅ Grafana installed (http://localhost:3001)"
echo "   Default login: admin / admin"

# 6. Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# 7. Build embedding model (local, no API)
echo "📦 Downloading local embedding model..."
npm install @xenova/transformers

# Download snowflake-arctic-embed-xs model (22M params)
node -e "
const { pipeline } = require('@xenova/transformers');
(async () => {
  const embedder = await pipeline('feature-extraction', 'Snowflake/snowflake-arctic-embed-xs');
  console.log('✅ Embedding model downloaded');
})();
"

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Run baseline metrics:"
echo "   bash scripts/measure-baseline.sh"
echo ""
echo "2. Start Nash API server:"
echo "   npm run start:api"
echo ""
echo "3. Start React Dashboard:"
echo "   cd observability && npm start"
echo ""
echo "Services running:"
echo "  - PostgreSQL:  localhost:5432"
echo "  - Redis:       localhost:6379"
echo "  - Qdrant:      http://localhost:6333"
echo "  - Prometheus:  http://localhost:9090"
echo "  - Grafana:     http://localhost:3001 (admin/admin)"
echo ""
echo "Total cost: \$0/month (all native, no Docker, no cloud)"
