import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { PostCard } from './components/PostCard';
import { PostDetail } from './components/PostDetail';
import { PostEditor } from './components/PostEditor';
import { AdminModal } from './components/AdminModal';
import { api, getAdminKey } from './api';
import { FileText, Globe, Layers, Search, Loader2, ArrowUpRight } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export default function App() {
  const [currentView, setCurrentView] = useState({ type: 'list' });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'published' | 'drafts'
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Initialize theme from localStorage or system preference
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true; // Default dark
  });

  // Sync theme to <html> tag and persist
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Check admin key on load
  useEffect(() => {
    const key = getAdminKey();
    if (key) {
      api.verifyAdmin(key)
        .then(() => setIsAdmin(true))
        .catch(() => setIsAdmin(false));
    }
  }, []);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const adminData = await api.getAdminPosts();
        setPosts(adminData);
      } else {
        const publicData = await api.getPosts();
        setPosts(publicData);
      }
    } catch (err) {
      console.warn('API error, using cached/fallback posts if available:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Navigation helpers
  const handleSelectPost = (slug) => {
    setCurrentView({ type: 'post', slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditPost = (post) => {
    setCurrentView({ type: 'editor', post });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewPost = () => {
    setCurrentView({ type: 'editor', post: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditorSuccess = () => {
    fetchPosts();
    setCurrentView({ type: 'list' });
  };

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.summary && p.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === 'published') return p.status === 'PUBLISHED';
    if (filter === 'drafts') return p.status === 'DRAFT';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#131314] text-zinc-900 dark:text-[#e3e3e3] selection:bg-sky-500/25 selection:text-sky-900 dark:selection:text-sky-200 transition-colors duration-150">
      {/* Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setAdminModalOpen(true)}
        onNewPost={handleNewPost}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {currentView.type === 'editor' ? (
          <PostEditor
            post={currentView.post}
            onSaveSuccess={handleEditorSuccess}
            onCancel={() => setCurrentView({ type: 'list' })}
          />
        ) : currentView.type === 'post' ? (
          <PostDetail
            slug={currentView.slug}
            onBack={() => setCurrentView({ type: 'list' })}
            onEdit={handleEditPost}
            isAdmin={isAdmin}
          />
        ) : (
          <div>
            {/* Filter Tabs & Search Header separated by clean divider */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-zinc-200 dark:border-white/[0.08]">
              {/* Category Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    filter === 'all'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  All Posts ({posts.length})
                </button>

                <button
                  onClick={() => setFilter('published')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    filter === 'published'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>Published</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setFilter('drafts')}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      filter === 'drafts'
                        ? 'bg-amber-400 text-zinc-950 font-semibold shadow-sm'
                        : 'text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 hover:bg-amber-500/10'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Drafts ({posts.filter((p) => p.status === 'DRAFT').length})</span>
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search essays..."
                  className="w-full bg-zinc-100 dark:bg-[#1e1f20] border border-zinc-200 dark:border-white/[0.08] focus:border-sky-500 dark:focus:border-sky-500/50 rounded-full pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Posts Feed: No container boxes, divided by clean dividers */}
            {loading ? (
              <div className="py-24 flex items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="py-20 text-center">
                <Layers className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">No essays found</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
                  {searchQuery
                    ? `No posts matching "${searchQuery}". Try a different keyword.`
                    : filter === 'drafts'
                    ? 'No drafts currently saved. Click "Write" to start drafting a new post.'
                    : 'No published articles yet.'}
                </p>
                {isAdmin && (
                  <button
                    onClick={handleNewPost}
                    className="text-xs font-medium bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-full transition-colors"
                  >
                    Create your first post
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-white/[0.08]">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id || post.slug}
                    post={post}
                    onSelect={handleSelectPost}
                    onEdit={handleEditPost}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-200 dark:border-white/[0.08] mt-auto py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <p>
            © {CURRENT_YEAR}{' '}
            <a
              href="https://www.adrianesguerra.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-800 dark:text-zinc-200 hover:underline inline-flex items-center gap-0.5"
            >
              Adrian Esguerra <ArrowUpRight className="w-3 h-3" />
            </a>
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              API: {isAdmin ? 'Admin Mode' : 'Online'}
            </span>
          </div>
        </div>
      </footer>

      {/* Admin Authentication Modal */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        isAdmin={isAdmin}
        onStatusChange={(status) => {
          setIsAdmin(status);
        }}
      />
    </div>
  );
}
