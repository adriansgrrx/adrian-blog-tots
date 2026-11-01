import express from 'express';
import { db } from '../db.js';

export const publicRouter = express.Router();
export const adminRouter = express.Router();

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'adrian-blog-secret-change-me';

// Simple helper to create URL-safe slug from title
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// ----------------------------------------------------
// Public Endpoints
// ----------------------------------------------------

// GET /api/posts - Fetch all published posts
publicRouter.get('/', async (req, res) => {
  try {
    const posts = await db.getPublishedPosts();
    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (err) {
    console.error('Error fetching published posts:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve posts' });
  }
});

// GET /api/posts/:slug - Fetch a single post
publicRouter.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await db.getPostBySlug(slug);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // If it's a draft, check if admin key is passed in headers
    if (post.status !== 'PUBLISHED') {
      const clientKey = req.headers['x-admin-key'];
      if (!clientKey || clientKey !== ADMIN_SECRET_KEY) {
        return res.status(404).json({ success: false, error: 'Post not found or unpublished' });
      }
    }

    res.json({ success: true, data: post });
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve post' });
  }
});

// POST /api/posts/:slug/view - Increment views
publicRouter.post('/:slug/view', async (req, res) => {
  try {
    const { slug } = req.params;
    const updated = await db.incrementViews(slug);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, views: updated.views });
  } catch (err) {
    console.error('Error incrementing views:', err);
    res.status(500).json({ success: false, error: 'Failed to update views' });
  }
});

// ----------------------------------------------------
// Admin Middleware & Endpoints
// ----------------------------------------------------

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  const clientKey = req.headers['x-admin-key'];
  if (!clientKey || clientKey !== ADMIN_SECRET_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or missing admin key',
    });
  }
  next();
};

adminRouter.use(requireAdmin);

// POST /api/admin/verify - Validate admin password/key
adminRouter.post('/verify', (req, res) => {
  res.json({ success: true, message: 'Admin authenticated' });
});

// GET /api/admin/posts - Fetch all posts (both published and drafts)
adminRouter.get('/posts', async (req, res) => {
  try {
    const posts = await db.getAllPosts();
    res.json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    console.error('Error fetching admin posts:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
});

// POST /api/admin/posts - Create a new post or draft
adminRouter.post('/posts', async (req, res) => {
  try {
    const { title, content, summary, status, slug } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const postSlug = (slug && slug.trim()) ? generateSlug(slug) : generateSlug(title);

    // Check if slug already exists
    const existing = await db.getPostBySlug(postSlug);
    if (existing) {
      return res.status(400).json({ success: false, error: 'A post with this slug already exists' });
    }

    const newPost = await db.createPost({
      title: title.trim(),
      slug: postSlug,
      summary: summary ? summary.trim() : '',
      content: content || '',
      status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
    });

    res.status(201).json({ success: true, data: newPost });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
});

// PUT /api/admin/posts/:id - Update post or toggle publish status
adminRouter.put('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, status, slug } = req.body;

    const updatePayload = {};
    if (title !== undefined) updatePayload.title = title.trim();
    if (content !== undefined) updatePayload.content = content;
    if (summary !== undefined) updatePayload.summary = summary.trim();
    if (status !== undefined) updatePayload.status = status;
    if (slug !== undefined) updatePayload.slug = generateSlug(slug);

    const updated = await db.updatePost(id, updatePayload);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ success: false, error: 'Failed to update post' });
  }
});

// DELETE /api/admin/posts/:id - Delete post
adminRouter.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deletePost(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ success: false, error: 'Failed to delete post' });
  }
});
