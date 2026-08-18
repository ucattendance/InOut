# Git Deploy Setup — INOUT

`main` branch-ku **git push** panna automatic deploy aagum (GitHub Actions).

> **Last runs failed** because GitHub Secrets add pannala. Below secrets setup pannunga, apram push or **Run workflow**.

---

## Step 0 — One-time secrets (required)

### Frontend (`InOut` repo)

Open: **https://github.com/ucattendance/InOut/settings/secrets/actions**

| Secret name | Value (from hPanel → FTP Access for inout.urbancode.tech) |
|-------------|--------|
| `FTP_SERVER` | `93.127.208.197` (no `ftp://` prefix) |
| `FTP_USERNAME` | `u736600761.inout.urbancode.tech` |
| `FTP_PASSWORD` | FTP password (Change FTP password in hPanel) |
| `FTP_SERVER_DIR` | **Delete / leave empty** (FTP root = `public_html`) |

### Backend (`InOut-backend` repo) — Linode VPS

Backend runs on **Linode** (`172.105.61.231`, port `5010`, PM2 `inout-backend`).

Public API URL (HTTPS): **https://api.inout.urbancode.tech**

One-time server setup: see `InOut-backend/deploy/LINODE_API_SETUP.md`

| Check | URL |
|-------|-----|
| Backend ping | https://api.inout.urbancode.tech/ping |
| Backend Swagger | https://api.inout.urbancode.tech/api-docs |

---

## Step 1 — Deploy via git push

```powershell
# Frontend → Hostinger
cd c:\Users\nagus\OneDrive\Desktop\InOut
git add .
git commit -m "your message"
git push origin main

# Backend → Linode (git pull on server)
cd ~/Inout-backend
git pull origin main
pm2 restart inout-backend
```

---

## Step 2 — Manual run (without new commit)

- Frontend: https://github.com/ucattendance/InOut/actions/workflows/deploy-hostinger.yml → **Run workflow**
- Backend: https://github.com/ucattendance/InOut-backend/actions/workflows/deploy-render.yml → **Run workflow**

---

## Step 3 — Verify live

| Check | URL |
|-------|-----|
| Frontend deploy | https://inout.urbancode.tech/deploy-check.html |
| Build version | Sidebar **v2026.06.09** |
| API docs | https://inout.urbancode.tech/api-docs |
| Backend ping | https://api.inout.urbancode.tech/ping |
| Backend Swagger | https://api.inout.urbancode.tech/api-docs |

Dashboard-la **Refresh Data** click pannunga (cache clear).

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Missing secret FTP_SERVER` | Add Hostinger FTP secrets (Step 0) |
| `RENDER_DEPLOY_HOOK secret is not set` | Add hook URL or use Render GitHub connect |
| Live site still old | Check Actions run is green; hard refresh Ctrl+Shift+R |
| FTP deploy fails | Try `FTP_SERVER_DIR` = `/domains/inout.urbancode.tech/public_html/` |

---

## Backup — manual zip

```powershell
cd InOut
npm run deploy:pack
```

Upload `Desktop\InOut-deploy.zip` to Hostinger `public_html`.
