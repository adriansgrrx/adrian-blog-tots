import React from 'react';
import { Calendar, Clock, Eye, Edit3, ArrowRight } from 'lucide-react';

export function PostCard({ post, onSelect, onEdit, isAdmin }) {
  const isDraft = post.status !== 'PUBLISHED';

  // Format dates
  const formatDate = (isoString) => {
    if (!isoString) return 'Unpublished';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isEdited = post.updatedAt && post.publishedAt && 
    new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 1000 * 60 * 30; // 30m diff

  return (
    <article
      onClick={() => onSelect(post.slug)}
      className="group relative cursor-pointer rounded-2xl border border-white/[0.08] bg-[#1e1f20]/60 hover:bg-[#1e1f20] hover:border-white/[0.18] p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-black/40"
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Draft pill badge */}
          {isDraft && (
            <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
              Draft
            </span>
          )}

          {/* Date published */}
          <span className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Calendar className="w-3 h-3 text-zinc-500" />
            {isDraft ? `Created ${formatDate(post.createdAt)}` : formatDate(post.publishedAt)}
          </span>

          {/* Last edited note */}
          {isEdited && !isDraft && (
            <span className="text-[11px] text-zinc-400">
              (Edited {formatDate(post.updatedAt)})
            </span>
          )}
        </div>

        {/* Read time and views badges */}
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-500" />
            {post.readingTime || 1} min read
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-zinc-500" />
            {post.views || 0}
          </span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white group-hover:text-sky-300 transition-colors line-clamp-2 mb-2">
        {post.title}
      </h2>

      {/* Summary */}
      <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed mb-4">
        {post.summary || (post.content ? post.content.replace(/^#+\s+/gm, '').slice(0, 140) + '...' : 'No summary provided.')}
      </p>

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
        <span className="text-xs font-medium text-sky-400/90 group-hover:text-sky-300 inline-flex items-center gap-1 transition-transform group-hover:translate-x-1 duration-200">
          Read essay <ArrowRight className="w-3 h-3" />
        </span>

        {/* Admin Quick Edit Button */}
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(post);
            }}
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/[0.08] transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}
      </div>
    </article>
  );
}
