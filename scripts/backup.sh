#!/usr/bin/env bash
# backup.sh - Automated SQLite backup script with integrity verification
# Part of Nash Agent Framework v3.0
#
# Usage: ./backup.sh {hourly|daily|weekly|monthly}
#
# Backup Strategy:
# - Hourly: Keep last 24 backups
# - Daily: Keep last 7 backups (run at 00:00)
# - Weekly: Keep last 4 backups (run on Sunday)
# - Monthly: Keep last 12 backups (run on 1st of month)
#
# Crontab Installation:
# 0 * * * * /path/to/scripts/backup.sh hourly
# 0 0 * * * /path/to/scripts/backup.sh daily
# 0 0 * * 0 /path/to/scripts/backup.sh weekly
# 0 0 1 * * /path/to/scripts/backup.sh monthly
#
# Features:
# - WAL-safe backups using sqlite3 .backup command
# - Pre/post integrity checks (PRAGMA integrity_check)
# - File size validation (backup ≥ source - 10%)
# - Disk space check (abort if <1GB free)
# - Automatic rotation with configurable retention
# - Detailed logging to data/backups/backup.log
# - Prometheus metric export (nash_backup_status)

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_PATH="${DB_PATH:-$PROJECT_ROOT/data/nash.db}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/data/backups}"
LOG_FILE="$BACKUP_DIR/backup.log"
METRICS_FILE="$BACKUP_DIR/metrics.prom"
MIN_DISK_SPACE_GB=1

# Colors for output (disabled in non-interactive mode)
if [[ -t 1 ]]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  NC='\033[0m' # No Color
else
  RED=''
  GREEN=''
  YELLOW=''
  NC=''
fi

# Logging function
log() {
  local level="$1"
  shift
  local message="$*"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

log_error() {
  echo -e "${RED}ERROR: $*${NC}" >&2
  log "ERROR" "$*"
}

log_warn() {
  echo -e "${YELLOW}WARN: $*${NC}" >&2
  log "WARN" "$*"
}

log_info() {
  echo -e "${GREEN}INFO: $*${NC}"
  log "INFO" "$*"
}

# Export Prometheus metric
export_metric() {
  local status="$1"  # 0=fail, 1=success
  local backup_type="$2"
  local timestamp=$(date +%s)

  cat > "$METRICS_FILE" << EOF
# HELP nash_backup_status Backup operation status (0=fail, 1=success)
# TYPE nash_backup_status gauge
nash_backup_status{type="$backup_type"} $status $timestamp

# HELP nash_backup_timestamp_seconds Unix timestamp of last backup
# TYPE nash_backup_timestamp_seconds gauge
nash_backup_timestamp_seconds{type="$backup_type"} $timestamp
EOF
}

# Check disk space
check_disk_space() {
  local backup_dir="$1"

  # Get available space in GB (cross-platform)
  if command -v df &> /dev/null; then
    local available_kb=$(df -k "$backup_dir" | tail -1 | awk '{print $4}')
    local available_gb=$((available_kb / 1024 / 1024))

    if [[ $available_gb -lt $MIN_DISK_SPACE_GB ]]; then
      log_error "Insufficient disk space: ${available_gb}GB available, ${MIN_DISK_SPACE_GB}GB required"
      return 1
    fi

    log_info "Disk space check passed: ${available_gb}GB available"
  else
    log_warn "df command not found, skipping disk space check"
  fi

  return 0
}

# SQLite integrity check
check_integrity() {
  local db_file="$1"
  local db_name=$(basename "$db_file")

  if [[ ! -f "$db_file" ]]; then
    log_error "Database file not found: $db_file"
    return 1
  fi

  log_info "Running integrity check on $db_name..."

  local result=$(sqlite3 "$db_file" "PRAGMA integrity_check;" 2>&1)

  if [[ "$result" != "ok" ]]; then
    log_error "Integrity check failed for $db_name: $result"
    return 1
  fi

  log_info "Integrity check passed for $db_name"
  return 0
}

# Verify backup file size
verify_backup_size() {
  local source_file="$1"
  local backup_file="$2"

  local source_size=$(stat -c%s "$source_file" 2>/dev/null || stat -f%z "$source_file" 2>/dev/null)
  local backup_size=$(stat -c%s "$backup_file" 2>/dev/null || stat -f%z "$backup_file" 2>/dev/null)

  # Backup should be at least 90% of source size
  local min_size=$((source_size * 90 / 100))

  if [[ $backup_size -lt $min_size ]]; then
    log_error "Backup file too small: $backup_size bytes (expected ≥ $min_size bytes)"
    return 1
  fi

  log_info "Backup size verified: $backup_size bytes (source: $source_size bytes)"
  return 0
}

# Perform WAL-safe backup
perform_backup() {
  local backup_type="$1"
  local timestamp
  local backup_file

  # Generate timestamp and backup filename
  case "$backup_type" in
    hourly)
      timestamp=$(date +%Y%m%d-%H%M%S)
      backup_file="$BACKUP_DIR/hourly/nash-$timestamp.db"
      ;;
    daily)
      timestamp=$(date +%Y%m%d)
      backup_file="$BACKUP_DIR/daily/nash-$timestamp.db"
      ;;
    weekly)
      timestamp=$(date +%Y%m%d)
      backup_file="$BACKUP_DIR/weekly/nash-$timestamp.db"
      ;;
    monthly)
      timestamp=$(date +%Y%m)
      backup_file="$BACKUP_DIR/monthly/nash-$timestamp.db"
      ;;
    *)
      log_error "Invalid backup type: $backup_type"
      return 1
      ;;
  esac

  log_info "Starting $backup_type backup: $(basename "$backup_file")"

  # Pre-backup integrity check
  if ! check_integrity "$DB_PATH"; then
    export_metric 0 "$backup_type"
    return 1
  fi

  # Check disk space
  if ! check_disk_space "$BACKUP_DIR"; then
    export_metric 0 "$backup_type"
    return 1
  fi

  # Perform WAL-safe backup using sqlite3 .backup command
  log_info "Executing WAL-safe backup..."
  if ! sqlite3 "$DB_PATH" ".backup '$backup_file'" 2>&1 | tee -a "$LOG_FILE"; then
    log_error "Backup command failed"
    export_metric 0 "$backup_type"
    return 1
  fi

  # Post-backup integrity check
  if ! check_integrity "$backup_file"; then
    rm -f "$backup_file"
    export_metric 0 "$backup_type"
    return 1
  fi

  # Verify backup file size
  if ! verify_backup_size "$DB_PATH" "$backup_file"; then
    rm -f "$backup_file"
    export_metric 0 "$backup_type"
    return 1
  fi

  log_info "$backup_type backup completed successfully: $backup_file"
  export_metric 1 "$backup_type"
  return 0
}

# Rotate backups (keep only N most recent files)
rotate_backups() {
  local backup_subdir="$1"
  local keep_count="$2"

  log_info "Rotating backups in $(basename "$backup_subdir"): keeping last $keep_count files"

  # Count existing backups
  local file_count=$(ls -1 "$backup_subdir"/nash-*.db 2>/dev/null | wc -l)

  if [[ $file_count -le $keep_count ]]; then
    log_info "No rotation needed: $file_count files (limit: $keep_count)"
    return 0
  fi

  # Delete oldest files (keep only last N)
  local delete_count=$((file_count - keep_count))
  log_info "Deleting $delete_count old backup(s)..."

  ls -1t "$backup_subdir"/nash-*.db | tail -n "$delete_count" | while read -r old_file; do
    log_info "Deleting old backup: $(basename "$old_file")"
    rm -f "$old_file"
  done

  log_info "Rotation completed"
  return 0
}

# Initialize backup directories
initialize_directories() {
  log_info "Initializing backup directories..."

  mkdir -p "$BACKUP_DIR"/{hourly,daily,weekly,monthly}

  # Create log file if it doesn't exist
  touch "$LOG_FILE"

  log_info "Directories initialized"
}

# Main execution
main() {
  local backup_type="${1:-hourly}"

  # Validate backup type
  case "$backup_type" in
    hourly|daily|weekly|monthly)
      ;;
    *)
      echo "Usage: $0 {hourly|daily|weekly|monthly}" >&2
      exit 1
      ;;
  esac

  # Initialize directories
  initialize_directories

  log_info "========== Backup Started: $backup_type =========="

  # Check if source database exists
  if [[ ! -f "$DB_PATH" ]]; then
    log_error "Source database not found: $DB_PATH"
    export_metric 0 "$backup_type"
    exit 1
  fi

  # Perform backup
  if ! perform_backup "$backup_type"; then
    log_error "Backup failed"
    exit 1
  fi

  # Rotate old backups
  case "$backup_type" in
    hourly)
      rotate_backups "$BACKUP_DIR/hourly" 24
      ;;
    daily)
      rotate_backups "$BACKUP_DIR/daily" 7
      ;;
    weekly)
      rotate_backups "$BACKUP_DIR/weekly" 4
      ;;
    monthly)
      rotate_backups "$BACKUP_DIR/monthly" 12
      ;;
  esac

  log_info "========== Backup Completed: $backup_type =========="
  exit 0
}

# Run main function
main "$@"
