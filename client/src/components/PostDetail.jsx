import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock, Eye, Edit3, Share2, Check, Sparkles } from 'lucide-react';
import { api } from '../api';

export function PostDetail({ slug, onBack, onEdit, isAdmin }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadPost() {
      try {
        setLoading(true);
        const data = await api.getPost(slug);
        if (isMounted) {
          setPost(data);
          // Increment view count in background
          api.incrementView(slug).then((newViews) => {
            if (newViews && isMounted) {
              setPost((prev) => (prev ? { ...prev, views: newViews } : prev));
            }
          });
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load post');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPost();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const formatDate = (isoString) => {
    if (!isoString) return 'Unpublished';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
        <Sparkles className="w-6 h-6 text-sky-400 animate-spin" />
        <p className="text-sm">Loading essay...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-semibold text-white mb-2">Post Not Found</h2>
        <p className="text-sm text-zinc-400 mb-6">{error || 'This post may be an unpublished draft.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium bg-white/[0.08] hover:bg-white/[0.14] text-white px-4 py-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Essays</span>
        </button>
      </div>
    );
  }

  const isDraft = post.status !== 'PUBLISHED';
  const isEdited = post.updatedAt && post.publishedAt && 
    new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 1000 * 60 * 30;

  return (
    <article className="max-w-3xl mx-auto py-8">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-full border border-white/[0.08] hover:border-white/[0.2] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All posts</span>
        </button>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => onEdit(post)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-3 py-1.5 rounded-full transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-full border border-white/[0.08] hover:border-white/[0.2] transition-colors"
            title="Copy URL"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Header Info */}
      <header className="mb-10">
        <div className="flex items-center gap-2.5 flex-wrap mb-4">
          {isDraft && (
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
              Unpublished Draft
            </span>
          )}

          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            {isDraft ? `Draft created ${formatDate(post.createdAt)}` : `Published ${formatDate(post.publishedAt)}`}
          </span>

          {isEdited && !isDraft && (
            <span className="text-xs text-zinc-400">
              • Last edited {formatDate(post.updatedAt)}
            </span>
          )}

          <span className="text-zinc-600">•</span>

          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            {post.readingTime || 1} min read
          </span>

          <span className="text-zinc-600">•</span>

          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <Eye className="w-3.5 h-3.5 text-zinc-500" />
            {post.views || 0} views
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight mb-4">
          {post.title}
        </h1>

        {post.summary && (
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            {post.summary}
          </p>
        )}
      </header>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.1] to-transparent mb-10" />

      {/* Article Content */}
      <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Footer Info */}
      <footer className="mt-16 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <p>Written by Adrian • Published on personal portfolio</p>
        <button
          onClick={onBack}
          className="text-sky-400 hover:text-sky-300 transition-colors"
        >
          ← Back to all essays
        </button>
      </footer>
    </article>
  );
}
