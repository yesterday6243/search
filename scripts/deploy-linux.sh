#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_NAME="mx-search"

DEFAULT_TARGET_DIR="/opt/$PROJECT_NAME"
DEFAULT_PORT="3000"
DEFAULT_RUN_USER="${SUDO_USER:-$(id -un)}"

log() {
  echo "[INFO] $*"
}

warn() {
  echo "[WARN] $*" >&2
}

die() {
  echo "[ERROR] $*" >&2
  exit 1
}

require_cmd() {
  local cmd="$1"
  command -v "$cmd" >/dev/null 2>&1 || die "Missing command: $cmd"
}

prompt_default() {
  local label="$1"
  local default_value="$2"
  local value=""
  read -r -p "$label [$default_value]: " value
  echo "${value:-$default_value}"
}

confirm() {
  local label="$1"
  local input=""
  read -r -p "$label [y/N]: " input
  [[ "$input" =~ ^([yY]|[yY][eE][sS])$ ]]
}

valid_port() {
  local port="$1"
  [[ "$port" =~ ^[0-9]+$ ]] || return 1
  (( port >= 1 && port <= 65535 ))
}

is_port_in_use() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn | awk 'NR>1 {print $4}' | grep -Eq "(^|:)$port$"
    return $?
  fi

  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$port" -sTCP:LISTEN -P -n >/dev/null 2>&1
    return $?
  fi

  bash -c "cat < /dev/null > /dev/tcp/127.0.0.1/$port" >/dev/null 2>&1
}

choose_service_type() {
  local value=""
  echo "Choose service mode:"
  echo "  1) systemd (recommended)"
  echo "  2) pm2"
  echo "  3) none (deploy files only, do not register service)"
  while true; do
    read -r -p "Enter [1/2/3, default 1]: " value
    value="${value:-1}"
    case "$value" in
      1) echo "systemd"; return 0 ;;
      2) echo "pm2"; return 0 ;;
      3) echo "none"; return 0 ;;
      *) warn "Invalid option, try again." ;;
    esac
  done
}

ensure_node() {
  require_cmd node
  require_cmd npm
  local major
  major="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo "0")"
  if [[ "$major" =~ ^[0-9]+$ ]] && (( major < 20 )); then
    warn "Detected Node.js $(node -v). Recommended: Node.js 20+ (22+ preferred)."
  fi
}

prepare_target_dir() {
  local dir="$1"
  mkdir -p "$dir"
  if [[ ! -w "$dir" ]]; then
    die "Target directory is not writable: $dir"
  fi
}

copy_project() {
  local src="$1"
  local dst="$2"
  local backup_dir=""

  if [[ -f "$dst/searchindex.db" ]]; then
    backup_dir="$(mktemp -d)"
    cp -f "$dst/searchindex.db" "$backup_dir/searchindex.db"
    [[ -f "$dst/searchindex.db-wal" ]] && cp -f "$dst/searchindex.db-wal" "$backup_dir/searchindex.db-wal"
    [[ -f "$dst/searchindex.db-shm" ]] && cp -f "$dst/searchindex.db-shm" "$backup_dir/searchindex.db-shm"
  fi

  if command -v rsync >/dev/null 2>&1; then
    rsync -a \
      --exclude ".git" \
      --exclude ".github" \
      --exclude ".vscode" \
      --exclude "node_modules" \
      --exclude ".codex-*.png" \
      --exclude "*.log" \
      --exclude "searchindex.db*" \
      "$src/" "$dst/"
  else
    warn "rsync not found, fallback to cp -a."
    cp -a "$src"/. "$dst"/
    rm -rf "$dst/node_modules"
    find "$dst" -maxdepth 1 -type f -name ".codex-*.png" -delete || true
    find "$dst" -maxdepth 1 -type f -name "*.log" -delete || true
    find "$dst" -maxdepth 1 -type f -name "searchindex.db*" -delete || true
  fi

  if [[ -n "$backup_dir" && -d "$backup_dir" ]]; then
    cp -f "$backup_dir/searchindex.db" "$dst/searchindex.db"
    [[ -f "$backup_dir/searchindex.db-wal" ]] && cp -f "$backup_dir/searchindex.db-wal" "$dst/searchindex.db-wal"
    [[ -f "$backup_dir/searchindex.db-shm" ]] && cp -f "$backup_dir/searchindex.db-shm" "$dst/searchindex.db-shm"
    rm -rf "$backup_dir"
  fi
}

install_dependencies() {
  local dir="$1"
  pushd "$dir" >/dev/null
  if [[ -f package-lock.json ]]; then
    npm ci --omit=dev
  else
    npm install --omit=dev
  fi
  popd >/dev/null
}

write_env_file() {
  local dir="$1"
  local port="$2"
  cat > "$dir/.deploy.env" <<EOF
PORT=$port
NODE_ENV=production
EOF
}

setup_systemd() {
  local service_name="$1"
  local run_user="$2"
  local dir="$3"

  require_cmd systemctl
  (( EUID == 0 )) || die "systemd mode requires root. Run with sudo."
  id "$run_user" >/dev/null 2>&1 || die "User does not exist: $run_user"

  local unit_path="/etc/systemd/system/${service_name}.service"
  cat > "$unit_path" <<EOF
[Unit]
Description=mx search homepage (${service_name})
After=network.target

[Service]
Type=simple
User=$run_user
WorkingDirectory=$dir
EnvironmentFile=$dir/.deploy.env
ExecStart=/usr/bin/env node server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable --now "$service_name"
  log "systemd service started: $service_name"
  systemctl --no-pager --full status "$service_name" || true
}

setup_pm2() {
  local service_name="$1"
  local run_user="$2"
  local dir="$3"
  local port="$4"

  if ! command -v pm2 >/dev/null 2>&1; then
    if confirm "pm2 is missing. Install it now via 'npm i -g pm2'?"; then
      npm install -g pm2
    else
      die "pm2 is required for pm2 mode."
    fi
  fi

  id "$run_user" >/dev/null 2>&1 || die "User does not exist: $run_user"

  local pm2_cmd
  pm2_cmd="cd \"$dir\" && export PORT=\"$port\" NODE_ENV=production && pm2 delete \"$service_name\" >/dev/null 2>&1 || true && pm2 start server.js --name \"$service_name\" --update-env && pm2 save"

  if [[ "$(id -un)" == "$run_user" ]]; then
    bash -lc "$pm2_cmd"
  else
    require_cmd sudo
    (( EUID == 0 )) || die "Cannot switch to user '$run_user' without root."
    sudo -u "$run_user" -H bash -lc "$pm2_cmd"
  fi

  log "pm2 process started: $service_name"
  log "For auto-start on boot, run: pm2 startup"
}

main() {
  ensure_node

  local target_dir
  local port
  local service_type
  local run_user
  local service_name

  echo "==== mx search Linux one-click deploy ===="
  echo "Source directory: $SOURCE_DIR"
  echo

  target_dir="$(prompt_default "Deploy directory (isolated, will not overwrite source project)" "$DEFAULT_TARGET_DIR")"
  run_user="$(prompt_default "Service run user" "$DEFAULT_RUN_USER")"

  while true; do
    port="$(prompt_default "Listen port" "$DEFAULT_PORT")"
    if ! valid_port "$port"; then
      warn "Invalid port. Use a number between 1 and 65535."
      continue
    fi
    if is_port_in_use "$port"; then
      warn "Port $port is already in use. Pick another one."
      continue
    fi
    break
  done

  service_type="$(choose_service_type)"
  service_name="$(prompt_default "Service name" "${PROJECT_NAME}-${port}")"
  [[ "$service_name" =~ ^[a-zA-Z0-9_.@-]+$ ]] || die "Invalid service name."

  echo
  echo "Deployment summary:"
  echo "  - Deploy directory: $target_dir"
  echo "  - Service user: $run_user"
  echo "  - Listen port: $port"
  echo "  - Service mode: $service_type"
  echo "  - Service name: $service_name"
  echo
  confirm "Continue?" || die "Deployment cancelled."

  prepare_target_dir "$target_dir"
  copy_project "$SOURCE_DIR" "$target_dir"
  write_env_file "$target_dir" "$port"
  install_dependencies "$target_dir"

  case "$service_type" in
    systemd)
      setup_systemd "$service_name" "$run_user" "$target_dir"
      ;;
    pm2)
      setup_pm2 "$service_name" "$run_user" "$target_dir" "$port"
      ;;
    none)
      log "Files deployed and dependencies installed."
      log "Manual start: cd \"$target_dir\" && PORT=$port NODE_ENV=production npm start"
      ;;
    *)
      die "Unknown service mode: $service_type"
      ;;
  esac

  echo
  log "Deployment complete."
  log "Open: http://<server-ip-or-domain>:$port"
  log "Deploy directory: $target_dir"
  log "Env file: $target_dir/.deploy.env"
}

main "$@"
