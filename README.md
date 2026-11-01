# Adrian's Personal Blog & Essays ✦

> A minimalist, Google Gemini-inspired personal blog designed for seamless integration with your developer portfolio. Built with a decoupled architecture (**React + Tailwind** on the frontend, **Express + Prisma** on the backend).

---

## ⚡ Quick Start (Local Development)

Both frontend and backend run concurrently with a single command:

```bash
# In the root directory:
npm run dev
```

- **Frontend (Vite + React)**: [http://localhost:5173](http://localhost:5173)
- **Backend (Express API)**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

*(Note: If no Neon `DATABASE_URL` is set, the API runs with an in-memory/fallback store with starter articles so you can test and write immediately without configuration!)*

---

## 🎨 Features & Design

- **Google Gemini Minimalist Aesthetic**:
  - Dark slate matte surface (`#131314`) and elevated cards (`#1e1f20`).
  - Subtle iridescent gradient accents & glow.
  - Distraction-free typography with custom Markdown styling.
  - Dark / Light theme toggle.
- **Drafting & Publishing**:
  - **Save Draft**: Keep notes private without publishing to your public portfolio.
  - **Publish Now**: Makes the article instantly live in your public feed.
  - **Date tracking**: Displays original published date and last edited timestamp.
  - **Reading metrics**: Auto-calculated reading time and live view counter.
- **Markdown Support**:
  - Full GitHub-Flavored Markdown (`react-markdown` + `remark-gfm`).
  - Code blocks, blockquotes, lists, bold/italics, and custom slugs.
- **Author Authentication**:
  - Click the **Lock** icon in the navbar.
  - Enter your secret key (default: `adrian-blog-secret-change-me`).
  - Unlocks the **"Write"** button and reveals unpublished drafts in your feed.

---

## 🗄️ Connecting Neon PostgreSQL

When you are ready to persist data to Neon:

1. Create a free project on [Neon.tech](https://console.neon.tech).
2. Copy your PostgreSQL connection string.
3. In `server/`, create or edit `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
   PORT=5000
   ADMIN_SECRET_KEY="your-strong-secret-password"
   CORS_ORIGIN="http://localhost:5173,https://your-portfolio.vercel.app"
   ```
4. Push the schema to Neon:
   ```bash
   cd server
   npm run prisma:push
   ```

---

## 🚀 Deployment Guide (Separate Deployments)

### 1. Backend on Railway (Express)
1. Push this monorepo to GitHub.
2. In [Railway.app](https://railway.app), click **New Project** → **Deploy from GitHub repo**.
3. In the service **Settings**:
   - Set **Root Directory**: `server`
   - Set **Build Command**: `npm install && npx prisma generate`
   - Set **Start Command**: `npm start`
4. Add Environment Variables on Railway:
   - `DATABASE_URL`: Your Neon connection string.
   - `ADMIN_SECRET_KEY`: Your secret key.
   - `CORS_ORIGIN`: Your Vercel frontend URL.
5. Railway provides you a public URL (e.g. `https://adrian-blog-api.up.railway.app`).

### 2. Frontend on Vercel (React)
1. In [Vercel](https://vercel.com), click **Add New Project** → Import your GitHub repo.
2. In project configuration:
   - **Framework Preset**: Vite
   - **Root Directory**: Click edit and select `client`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://adrian-blog-api.up.railway.app/api`
4. Click **Deploy**!
