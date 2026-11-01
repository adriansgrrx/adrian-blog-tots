// API Service for Adrian Blog

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.API_URL ||
  (import.meta.env.PROD ? 'https://adrian-blog-tots.onrender.com/api' : '/api');

export function getAdminKey() {
  return localStorage.getItem('adrian_blog_admin_key') || '';
}

export function setAdminKey(key) {
  if (key) {
    localStorage.setItem('adrian_blog_admin_key', key);
  } else {
    localStorage.removeItem('adrian_blog_admin_key');
  }
}

function getHeaders(includeAdmin = false) {
  const headers = {
    'Content-Type': 'application/json',
  };
  const key = getAdminKey();
  if (includeAdmin && key) {
    headers['x-admin-key'] = key;
  }
  return headers;
}

export const api = {
  // Public: Get published posts
  async getPosts() {
    const res = await fetch(`${BASE_URL}/posts`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch posts');
    return data.data;
  },

  // Public/Admin: Get single post
  async getPost(slug) {
    const res = await fetch(`${BASE_URL}/posts/${slug}`, {
      headers: getHeaders(true),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Post not found');
    return data.data;
  },

  // Public: Increment view count
  async incrementView(slug) {
    try {
      const res = await fetch(`${BASE_URL}/posts/${slug}/view`, {
        method: 'POST',
      });
      const data = await res.json();
      return data.views;
    } catch (err) {
      console.warn('Failed to increment view:', err);
      return null;
    }
  },

  // Admin: Verify key
  async verifyAdmin(key) {
    const res = await fetch(`${BASE_URL}/admin/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': key,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid admin key');
    return true;
  },

  // Admin: Get all posts (drafts + published)
  async getAdminPosts() {
    const res = await fetch(`${BASE_URL}/admin/posts`, {
      headers: getHeaders(true),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin posts');
    return data.data;
  },

  // Admin: Create post
  async createPost(postData) {
    const res = await fetch(`${BASE_URL}/admin/posts`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(postData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create post');
    return data.data;
  },

  // Admin: Update post
  async updatePost(id, postData) {
    const res = await fetch(`${BASE_URL}/admin/posts/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(postData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update post');
    return data.data;
  },

  // Admin: Delete post
  async deletePost(id) {
    const res = await fetch(`${BASE_URL}/admin/posts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete post');
    return true;
  },
};
