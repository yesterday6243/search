# Personal Search Homepage

A self-hosted search start page for personal use.

## Features

- Clean search-home style layout
- Large centered settings modal
- Independent search-engine switch button
- Category link board (10 cards per row, expandable)
- Drag and drop to reorder links
- Hourly background rotation (Bing supported)
- Click `mx search` to switch background manually
- Last 100 search records stored in browser localStorage only
- Server-side sync for categories, links, engines, and background settings
- Account system (username + password, no SMS/email verification)
- Per-user isolated cloud data and layout after login
- Registration hard limit: 50 users

## Local Development

```bash
npm install
npm run dev
```

If PowerShell blocks `npm.ps1`, use:

```bash
cmd /c npm.cmd install
cmd /c npm.cmd run dev
```

Production run:

```bash
npm start
```

Default URL: `http://localhost:3000`

## Linux One-Click Deployment

This repo includes an interactive deployment script:

`scripts/deploy-linux.sh`

What it does:

- Deploys into an isolated directory
- Lets user choose port (with conflict check)
- Lets user choose service mode: `systemd` / `pm2` / `none`
- Lets user choose run user and service name
- Keeps existing deployed database files on update
- Does not overwrite your original source directory

### Run

```bash
chmod +x scripts/deploy-linux.sh
./scripts/deploy-linux.sh
```

The script will ask for:

- Deploy directory (default: `/opt/mx-search`)
- Service run user (default: current user)
- Listen port (default: `3000`)
- Service mode (`systemd` / `pm2` / `none`)
- Service name (default: `mx-search-<port>`)

## Service Management

### systemd mode

```bash
sudo systemctl status mx-search-3000
sudo systemctl restart mx-search-3000
sudo systemctl stop mx-search-3000
sudo journalctl -u mx-search-3000 -f
```

Replace `mx-search-3000` with your real service name.

### pm2 mode

```bash
pm2 status
pm2 logs <service-name>
pm2 restart <service-name>
pm2 delete <service-name>
```

## Upgrade Deployment

After updating source code, run the script again:

```bash
./scripts/deploy-linux.sh
```

It syncs code into deploy directory and reinstalls dependencies.

## Data and Sync

- Backend database file: `searchindex.db`
- Synced across devices (same server): categories, links, engines, background settings
- Search history is local only (browser localStorage), not uploaded to backend

## Maintenance Workflow

- Before each fix/optimization, check `OPTIMIZATION_LOG.md`.
- After each fix/optimization, append what changed, root cause, and touched files.

## Public Access Notes

If you expose this app to public network, add an access layer:

- Nginx Basic Auth
- Cloudflare Access
- Internal network only

This project is single-user by default and has no built-in authentication.
