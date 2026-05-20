# Little Paws Deployment Guide

This guide deploys Little Paws with:

- Frontend: React + Vite on Vercel
- Backend: Node.js + Express on Render
- Database: Railway MySQL for production
- Local development database: local MySQL
- Authentication: JWT cookies plus Firebase Google OAuth verification
- Image uploads: multer local `server/uploads` folder served by Express

## A. Railway MySQL Setup

1. Create a Railway project.
2. Add a MySQL database service.
3. Open the MySQL service variables/connection tab.
4. Copy the production connection values:

```env
MYSQL_HOST=
MYSQL_PORT=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=
```

5. Use Railway's public TCP host and port for the Render backend.
6. Keep `NODE_ENV=production` on Render. The backend enables MySQL SSL automatically in production:

```js
ssl: { rejectUnauthorized: false }
```

The backend creates missing tables and seed records automatically during startup.

## B. Render Backend Deployment

Create a Render Web Service from the GitHub repository.

Recommended settings:

```text
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: npm start
```

The backend uses `process.env.PORT`, so Render can inject its runtime port safely.

After the first successful deploy, copy the Render URL:

```text
https://your-render-service.onrender.com
```

Set this value as `PUBLIC_BASE_URL` so uploaded images are stored as public backend URLs:

```env
PUBLIC_BASE_URL=https://your-render-service.onrender.com
```

Important upload note: Render's normal filesystem is ephemeral. For persistent local multer uploads, attach a Render persistent disk to the backend service and mount it so the app can keep uploaded files. Without a disk, uploaded files can disappear after redeploys or restarts.

## C. Vercel Frontend Deployment

Create a Vercel project from the same GitHub repository.

Recommended settings:

```text
Framework Preset: Vite
Root Directory: client
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

The file `client/vercel.json` rewrites all routes to `index.html`, so React Router refreshes work in production.

After deployment, copy the Vercel URL:

```text
https://your-vercel-app.vercel.app
```

Then update Render:

```env
CORS_ORIGIN=https://your-vercel-app.vercel.app
CLIENT_URL=https://your-vercel-app.vercel.app
```

Redeploy the Render backend after changing these values.

## D. Environment Variables

### Local Client `.env`

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Vercel Client Variables

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Only use `VITE_` variables for browser-safe values. Do not put backend secrets in Vercel.

### Local Server `.env`

Create `server/.env`:

```env
NODE_ENV=development
PORT=5000

CORS_ORIGIN=http://localhost:5173
CLIENT_URL=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:5000

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=little_paws

CLIENT_SECRET_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_SECRET=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_SERVICE_ACCOUNT_JSON=
```

### Render Server Variables

```env
NODE_ENV=production
PORT=5000

CORS_ORIGIN=https://your-vercel-app.vercel.app
CLIENT_URL=https://your-vercel-app.vercel.app
PUBLIC_BASE_URL=https://your-render-service.onrender.com

MYSQL_HOST=
MYSQL_PORT=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=

CLIENT_SECRET_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_SECRET=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_SERVICE_ACCOUNT_JSON=
```

For Firebase Admin, prefer `FIREBASE_SERVICE_ACCOUNT_JSON` on Render because it avoids multiline private-key formatting problems.

## E. Firebase OAuth Setup

Firebase is used only for Google OAuth authentication.

1. Open Firebase Console.
2. Enable Authentication.
3. Enable Google provider.
4. Add authorized domains:

```text
localhost
your-vercel-app.vercel.app
```

5. Put Firebase web config values in Vercel and `client/.env`.
6. Put Firebase Admin service account JSON or project/client/private-key values in Render and `server/.env`.

Do not configure Firebase Storage. Little Paws uses multer local uploads served from the backend.

## F. Common Deployment Issues

- Frontend still calls localhost: set `VITE_API_BASE_URL` in Vercel and redeploy.
- Cookies not saved: confirm backend has `NODE_ENV=production`, frontend and backend are HTTPS, and `CORS_ORIGIN` exactly matches the Vercel URL.
- Google login fails: add the Vercel domain to Firebase authorized domains and configure Firebase Admin on Render.
- Images upload but do not persist: attach a Render persistent disk for `server/uploads`.
- Razorpay fails: add `RAZORPAY_KEY_ID` and `RAZORPAY_SECRET` to Render.

## G. CORS Troubleshooting

The backend accepts origins from `CORS_ORIGIN`. For multiple origins, use comma-separated values:

```env
CORS_ORIGIN=https://your-vercel-app.vercel.app,http://localhost:5173
```

Do not add a trailing slash. These are different:

```text
https://your-vercel-app.vercel.app
https://your-vercel-app.vercel.app/
```

Use the first one.

## H. Railway SSL Issues

In production, the backend enables:

```js
ssl: { rejectUnauthorized: false }
```

If Railway connection fails:

- Verify `MYSQL_HOST` is the public host, not an internal-only host.
- Verify `MYSQL_PORT` matches Railway's public TCP port.
- Confirm `NODE_ENV=production` on Render.
- Confirm the Railway database is awake and accessible.
- Check Render logs for `ER_ACCESS_DENIED_ERROR`, `ECONNREFUSED`, or SSL errors.

## I. Production Testing Checklist

After deploying:

- Open `https://your-render-service.onrender.com/api/pets`.
- Open the Vercel frontend.
- Register a normal user.
- Log in with email/password.
- Log in with Google OAuth.
- Browse pets.
- Submit an adoption application.
- Log in as shelter admin.
- Add a shelter pet with an image.
- Report a stray pet with images.
- Confirm uploaded image URLs start with the Render backend domain.
- Log in as seller admin.
- Create a product with an image.
- Add product to cart.
- Complete Razorpay order creation and verification.
- Confirm notifications appear.
- Confirm chat/socket events work.
- Refresh nested frontend routes to confirm Vercel rewrites work.

## Local Commands

Install dependencies:

```bash
npm --prefix client install
npm --prefix server install
```

Run backend:

```bash
npm --prefix server start
```

Run frontend:

```bash
npm --prefix client run dev
```

Build frontend:

```bash
npm --prefix client run build
```

Run tests:

```bash
npm test
```
