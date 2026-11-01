import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const starterPosts = [
  {
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
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
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
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
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
  }
];

async function main() {
  console.log('🌱 Seeding initial posts to Neon PostgreSQL...');
  for (const post of starterPosts) {
    const existing = await prisma.post.findUnique({ where: { slug: post.slug } });
    if (!existing) {
      await prisma.post.create({ data: post });
      console.log(` Created post: ${post.title}`);
    } else {
      console.log(` Post already exists: ${post.title}`);
    }
  }
  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
