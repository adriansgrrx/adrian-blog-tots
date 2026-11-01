# Adrian's Personal Blog & Essays ✦ (Tots)

> A minimalist, Google Gemini-inspired personal blog integrated with your developer portfolio. Built with a decoupled architecture (**React + Tailwind** on Vercel, **Express + Prisma** on Render, **PostgreSQL** on Neon).

### 🌐 Live Deployments
- **Frontend**: [https://adriantots.vercel.app](https://adriantots.vercel.app)
- **Backend API**: [https://adrian-blog-tots.onrender.com](https://adrian-blog-tots.onrender.com)
- **API Health Check**: [https://adrian-blog-tots.onrender.com/api/health](https://adrian-blog-tots.onrender.com/api/health)

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
   CORS_ORIGIN="http://localhost:5173,https://adriantots.vercel.app"
   ```
4. Push the schema to Neon:
   ```bash
   cd server
   npm run prisma:push
   ```

---

## 🚀 Deployment Guide (Separate Deployments)

### 1. Backend on Render (Express + Prisma)
1. Push this monorepo to GitHub.
2. In [Render Dashboard](https://dashboard.render.com):
   - Click **New +** → **Web Service** (or **Blueprint** to use `render.yaml`).
   - Connect your GitHub repository.
3. If setting up manually as a Web Service:
   - **Name**: `tots-blog-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
4. Add Environment Variables on Render:
   - `DATABASE_URL`: Your pooled Neon connection string (`-pooler`).
   - `DATABASE_URL_UNPOOLED`: Your direct Neon connection string.
   - `ADMIN_SECRET_KEY`: Your secret password to access author mode.
   - `CORS_ORIGIN`: Your Vercel frontend URL (e.g., `https://adriantots.vercel.app`).
5. Click **Create Web Service**. Render gives you a live URL (e.g. `https://tots-blog-api.onrender.com`).

### 2. Frontend on Vercel (React + Tailwind)
1. In [Vercel](https://vercel.com), click **Add New Project** → Import your GitHub repository.
2. In project configuration:
   - **Framework Preset**: Vite
   - **Root Directory**: Click edit and select `client`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://tots-blog-api.onrender.com/api` (your Render backend URL + `/api`)
4. Click **Deploy**!
