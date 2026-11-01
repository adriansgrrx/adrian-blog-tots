import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PostCard } from './components/PostCard';
import { PostDetail } from './components/PostDetail';
import { PostEditor } from './components/PostEditor';
import { AdminModal } from './components/AdminModal';
import { api, getAdminKey } from './api';
import { Sparkles, FileText, Globe, Layers, Search, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState({ type: 'list' });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'published' | 'drafts'
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
  const fetchPosts = async () => {
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
  };

  useEffect(() => {
    fetchPosts();
  }, [isAdmin]);

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
    <div className="min-h-screen flex flex-col bg-[#131314] text-[#e3e3e3] selection:bg-sky-500/25 selection:text-sky-200">
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
            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-8 pb-4 border-b border-white/[0.06]">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    filter === 'all'
                      ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  All Posts ({posts.length})
                </button>

                <button
                  onClick={() => setFilter('published')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    filter === 'published'
                      ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
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
                        : 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/10'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Drafts ({posts.filter((p) => p.status === 'DRAFT').length})</span>
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search essays..."
                  className="w-full bg-[#1e1f20] border border-white/[0.08] focus:border-sky-500/50 rounded-full pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Posts Grid / Feed */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
                <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
                <p className="text-xs">Fetching latest essays...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="py-16 text-center rounded-2xl border border-dashed border-white/[0.08] p-8">
                <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-zinc-300 mb-1">No essays found</h3>
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
              <div className="space-y-4">
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
      <footer className="border-t border-white/[0.06] mt-auto py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Adrian. Minimalist portfolio blog.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
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
