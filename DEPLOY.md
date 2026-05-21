# Deploy CaliApp pe Railway

Ghid pas cu pas. Toate cele 3 servicii (Backend + Frontend + Postgres) merg pe Railway.

## Pas 1 — Push pe GitHub

Proiectul e deja initializat ca git repo. Trebuie doar push-uit pe GitHub.

```bash
# 1. Creeaza repo nou pe https://github.com/new (de ex. "caliapp", lasa-l empty, fara README)

# 2. Conecteaza repo-ul local la GitHub si push
cd d:/Worck/CaliAPP/CaliApp
git remote add origin https://github.com/<USERNAME>/caliapp.git
git push -u origin main
```

## Pas 2 — Creeaza proiect Railway + Postgres

1. Mergi la [railway.app](https://railway.app) si loghin
2. **New Project** → **Deploy from GitHub repo** → selecteaza `caliapp`
3. Railway va detecta repo-ul si va incepe sa-l proceseze. Cancel acel deploy initial — vom configura manual mai jos.
4. In proiect, click **+ New** → **Database** → **Add PostgreSQL**. Asteapta sa fie "Available" (~30s).

## Pas 3 — Backend service

1. **+ New** → **GitHub Repo** → selecteaza acelasi `caliapp` repo
2. In service-ul nou creat:
   - **Settings → Service → Root Directory** = `CaliApp_Backend`
   - **Settings → Source → Watch Paths** = `CaliApp_Backend/**` (opcional, ca sa nu redeploy la modificari frontend)
3. **Variables** tab → adauga:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   NODE_ENV=production
   JWT_ACCESS_SECRET=<genereaza cu: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
   JWT_REFRESH_SECRET=<alta valoare random ca mai sus>
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   BCRYPT_SALT_ROUNDS=12
   CLIENT_ORIGIN=https://<frontend-domain-temporar>.up.railway.app
   ```
   *(la `CLIENT_ORIGIN` pune deocamdata o valoare placeholder — o actualizam dupa ce stim domeniul frontend-ului)*
4. **Settings → Networking → Generate Domain** → vei primi un URL ca `https://caliapp-backend-production.up.railway.app`. Noteaza-l.
5. Railway va incepe build + deploy. Verifica logs (icon "..." pe service) — `prisma migrate deploy` ruleaza la start, apoi serverul porneste.

## Pas 4 — Frontend service

1. **+ New** → **GitHub Repo** → acelasi repo
2. In service-ul nou:
   - **Settings → Service → Root Directory** = `CaliApp_Client`
3. **Variables** tab → adauga:
   ```
   VITE_API_URL=https://caliapp-backend-production.up.railway.app/api
   ```
   *(URL-ul din pasul 3.4 + sufix `/api`)*
4. **Settings → Networking → Generate Domain** → noteaza URL-ul frontend-ului
5. Railway face build + deploy. La final, vizitand URL-ul, ar trebui sa vezi pagina de login.

## Pas 5 — Update CORS in backend

Acum stii URL-ul frontend-ului. Mergi inapoi in service-ul **Backend → Variables**:

```
CLIENT_ORIGIN=https://<URL-frontend-real>.up.railway.app
```

Railway va redeploy backend-ul automat. Dupa ~1 min, login-ul ar trebui sa functioneze.

## Pas 6 — Seed (optional)

Daca vrei date de test pe Railway:

```bash
# Local, cu Railway CLI
npm install -g @railway/cli
railway login
cd CaliApp_Backend
railway link  # selecteaza proiectul
railway run npx ts-node --transpile-only scripts/seedTrainingData.ts
```

Sau direct in Railway UI, creeaza un user nou via /register si seed manual.

## Diagnoza probleme

- **Backend nu porneste**: Verifica logs. Cele mai comune:
  - `Invalid environment variables` → lipseste vreun env var (JWT, DATABASE_URL)
  - `prisma migrate deploy` esueaza → verifica `DATABASE_URL` referenceaza corect serviciul Postgres
- **Frontend afiseaza ecran alb**: deschide DevTools → Console. Probabil `VITE_API_URL` gresit sau CORS blochat (verifica `CLIENT_ORIGIN`)
- **CORS blocat**: confirma ca `CLIENT_ORIGIN` din backend e exact URL-ul frontend-ului (cu `https://`, fara `/` la final)
- **Healthcheck pica**: backend-ul nu raspunde pe `/api/health`. Verifica `PORT` (Railway il seteaza automat, nu il hardcoda)

## Cost asteptat

Pe Railway free trial primesti $5/luna credit. Pentru un app cu trafic mic:
- Backend: ~$2-3/luna
- Frontend (static): ~$1/luna
- Postgres: ~$2-5/luna (functie de spatiu)

Total: ~$5-9/luna. Daca depasesti free tier, Hobby plan e $5/luna + usage.

## Re-deploy ulterior

Dupa setup, orice `git push origin main` triggereaza redeploy automat la ambele servicii.