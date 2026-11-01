import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Eye, Edit3, Trash2, Globe, FileText } from 'lucide-react';
import { api } from '../api';

export function PostEditor({ post, onSaveSuccess, onCancel }) {
  const isEditing = Boolean(post && post.id);

  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [summary, setSummary] = useState(post?.summary || '');
  const [content, setContent] = useState(post?.content || '');
  const status = post?.status || 'DRAFT'; // 'DRAFT' | 'PUBLISHED'
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-slug generator when title changes (if user hasn't manually customized slug)
  const handleTitleChange = (val) => {
    setTitle(val);
    if (!isEditing || !slug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
      setSlug(generated);
    }
  };

  const handleSubmit = async (submitStatus) => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        summary: summary.trim(),
        content,
        status: submitStatus || status,
      };

      if (isEditing) {
        await api.updatePost(post.id, payload);
      } else {
        await api.createPost(payload);
      }

      onSaveSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await api.deletePost(post.id);
      onSaveSuccess();
    } catch (err) {
      setError(err.message || 'Failed to delete post');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8">
      {/* Editor Header with Divider */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-200 dark:border-white/[0.08] gap-4">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-400 dark:hover:border-white/[0.2] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Discard</span>
        </button>

        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20 transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

          {/* Save as Draft */}
          <button
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] border border-zinc-200 dark:border-white/[0.12] px-3.5 py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Save Draft</span>
          </button>

          {/* Publish Button */}
          <button
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-1.5 rounded-full transition-all duration-200 shadow-md shadow-sky-500/20 active:scale-95 disabled:opacity-50"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isEditing && post.status === 'PUBLISHED' ? 'Update & Publish' : 'Publish Now'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Inputs */}
      <div className="space-y-4 mb-6">
        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post Title..."
            className="w-full text-2xl sm:text-3xl font-bold bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 border-none focus:outline-none focus:ring-0 px-0"
          />
        </div>

        {/* Slug & Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              URL Slug
            </label>
            <div className="flex items-center rounded-xl bg-white dark:bg-[#1e1f20] border border-zinc-200 dark:border-white/[0.08] px-3 py-2 text-xs">
              <span className="text-zinc-400 select-none mr-1">/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-post-slug"
                className="bg-transparent border-none p-0 focus:outline-none text-xs w-full text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Short Summary (1-2 sentences)
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief preview of what this post covers..."
              className="w-full rounded-xl bg-white dark:bg-[#1e1f20] border border-zinc-200 dark:border-white/[0.08] px-3 py-2 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Editor & Preview Tabs */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1e1f20]/70 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.08] px-4 py-2 bg-zinc-50 dark:bg-[#191a1b]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('write')}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'write'
                  ? 'bg-white dark:bg-white/[0.1] text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Write (Markdown)</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-white/[0.1] text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
            Markdown supported: # headers, **bold**, `code`, &gt; quotes
          </span>
        </div>

        {activeTab === 'write' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            placeholder="# Write your post here in markdown..."
            className="w-full bg-transparent p-5 text-sm text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none resize-y leading-relaxed placeholder-zinc-400 dark:placeholder-zinc-600"
          />
        ) : (
          <div className="p-6 min-h-[350px] bg-zinc-50/50 dark:bg-[#171819]">
            {content.trim() ? (
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-zinc-400 dark:text-zinc-500 text-sm italic">Nothing to preview yet. Switch back to Write to add content.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
