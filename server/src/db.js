import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

let prisma = null;
let usePrisma = false;

// Initial in-memory mock posts so the app works immediately before Neon is connected
let fallbackPosts = [
  {
    id: 'post-1',
    title: 'Building Minimalist Web Applications with Google Gemini Aesthetics',
    slug: 'building-minimalist-web-apps-gemini-aesthetics',
    summary: 'A deep dive into crafting calm, dark-matte surfaces, subtle glowing gradients, and distraction-free reading experiences.',
    content: `# Building Minimalist Web Applications with Google Gemini Aesthetics

The design philosophy behind tools like **Google Gemini** centers around calm confidence: generous negative space, high legibility, and surfaces that feel light yet substantial.

---

### Key Principles

1. **Matte Surfaces Over Pure Black**  
   Instead of pure \`#000000\`, use deep slate tones like \`#131314\` and elevated card surfaces at \`#1e1f20\`. This prevents high contrast eye strain.

2. **The Signature Gemini Glow**  
   Subtle radial gradients that blend indigo, cyan, and violet provide warmth without distracting from the content.

3. **Distraction-Free Typography**  
   Clean sans-serif fonts with generous line heights (\`leading-relaxed\`) make long-form technical blogs a joy to read.

\`\`\`javascript
// Example: Smooth theme toggle
const toggleTheme = (mode) => {
  document.documentElement.classList.toggle('dark', mode === 'dark');
};
\`\`\`

> *"Design is not just what it looks like and feels like. Design is how it works."*

Stay tuned for more insights into modern full-stack workflows!
`,
    status: 'PUBLISHED',
    views: 142,
    readingTime: 3,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'post-2',
    title: 'Why I Decided to Separate My Frontend and Backend Deployments',
    slug: 'why-separate-frontend-and-backend-deployments',
    summary: 'Comparing monolithic server-rendered architectures against decoupled static frontend (Vercel) + scalable API (Railway).',
    content: `# Why I Decided to Separate My Frontend and Backend Deployments

When building personal tools and portfolio extensions, the temptation to bundle everything into one single process is strong. However, separating them provides clear superpowers.

### The Benefits
- **Zero-downtime Edge Delivery**: The React client is distributed globally on Vercel's edge network.
- **Independent Scaling**: Backend upgrades or database maintenance never take down the reading experience for users.
- **Portability**: If you ever want to build a mobile client or CLI, the Express API is ready to serve it.

---

### Our Setup
- **Frontend**: React + Vite + Tailwind CSS on **Vercel**
- **Backend**: Express on **Railway**
- **Database**: Serverless PostgreSQL on **Neon**
`,
    status: 'PUBLISHED',
    views: 89,
    readingTime: 2,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'post-3',
    title: 'Draft: Upcoming Projects & Architecture Explorations for 2026',
    slug: 'draft-upcoming-projects-architecture-explorations-2026',
    summary: 'Unpublished thoughts and roadmap ideas for upcoming portfolio case studies.',
    content: `# Draft: Upcoming Projects & Architecture Explorations for 2026

*Note: This post is currently a draft and only visible in admin mode.*

- [ ] Interactive 3D playground using Three.js
- [ ] Agentic workflow experiment with Gemini 2.5
- [ ] Micro-benchmarking serverless Postgres cold-starts

Will publish once research is wrapped up!
`,
    status: 'DRAFT',
    views: 4,
    readingTime: 1,
    publishedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  }
];

// Helper to calculate reading time
export function calculateReadingTime(text) {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Attempt to initialize Prisma if DATABASE_URL is valid
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('username:password')) {
  try {
    prisma = new PrismaClient();
    usePrisma = true;
    console.log('✅ Prisma connected to Neon PostgreSQL');
  } catch (err) {
    console.warn('⚠️ Could not connect Prisma with DATABASE_URL, using fallback store:', err.message);
    usePrisma = false;
  }
} else {
  console.log('ℹ️ No Neon DATABASE_URL provided. Running with in-memory store (instant dev mode).');
}

export const db = {
  isUsingPrisma() {
    return usePrisma;
  },

  async getPublishedPosts() {
    if (usePrisma) {
      return prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
      });
    }
    return fallbackPosts
      .filter((p) => p.status === 'PUBLISHED')
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  },

  async getAllPosts() {
    if (usePrisma) {
      return prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }
    return [...fallbackPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getPostBySlug(slug) {
    if (usePrisma) {
      return prisma.post.findUnique({
        where: { slug },
      });
    }
    return fallbackPosts.find((p) => p.slug === slug) || null;
  },

  async incrementViews(slug) {
    if (usePrisma) {
      return prisma.post.update({
        where: { slug },
        data: { views: { increment: 1 } },
      });
    }
    const post = fallbackPosts.find((p) => p.slug === slug);
    if (post) {
      post.views += 1;
      return post;
    }
    return null;
  },

  async createPost(data) {
    const readingTime = calculateReadingTime(data.content);
    const publishedAt = data.status === 'PUBLISHED' ? (data.publishedAt || new Date()) : null;

    if (usePrisma) {
      return prisma.post.create({
        data: {
          title: data.title,
          slug: data.slug,
          summary: data.summary || '',
          content: data.content,
          status: data.status || 'DRAFT',
          readingTime,
          publishedAt,
        },
      });
    }

    const newPost = {
      id: 'post-' + Date.now(),
      title: data.title,
      slug: data.slug,
      summary: data.summary || '',
      content: data.content,
      status: data.status || 'DRAFT',
      views: 0,
      readingTime,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fallbackPosts.unshift(newPost);
    return newPost;
  },

  async updatePost(id, data) {
    const readingTime = data.content ? calculateReadingTime(data.content) : undefined;
    const updateData = { ...data };
    if (readingTime) updateData.readingTime = readingTime;

    if (data.status === 'PUBLISHED' && !data.publishedAt) {
      updateData.publishedAt = new Date();
    } else if (data.status === 'DRAFT') {
      updateData.publishedAt = null;
    }

    if (usePrisma) {
      return prisma.post.update({
        where: { id },
        data: updateData,
      });
    }

    const index = fallbackPosts.findIndex((p) => p.id === id);
    if (index === -1) return null;

    fallbackPosts[index] = {
      ...fallbackPosts[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
      publishedAt: updateData.publishedAt !== undefined
        ? (updateData.publishedAt ? new Date(updateData.publishedAt).toISOString() : null)
        : fallbackPosts[index].publishedAt,
    };
    return fallbackPosts[index];
  },

  async deletePost(id) {
    if (usePrisma) {
      return prisma.post.delete({
        where: { id },
      });
    }
    const index = fallbackPosts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    fallbackPosts.splice(index, 1);
    return true;
  },
};
