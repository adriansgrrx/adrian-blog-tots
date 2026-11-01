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
      className="group cursor-pointer py-6 sm:py-8 first:pt-2 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Draft pill badge */}
          {isDraft && (
            <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300">
              Draft
            </span>
          )}

          {/* Date published */}
          <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            {isDraft ? `Created ${formatDate(post.createdAt)}` : formatDate(post.publishedAt)}
          </span>

          {/* Last edited note */}
          {isEdited && !isDraft && (
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              (Edited {formatDate(post.updatedAt)})
            </span>
          )}
        </div>

        {/* Read time and views */}
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            {post.readingTime || 1} min read
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            {post.views || 0}
          </span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 mb-2.5">
        {post.title}
      </h2>

      {/* Summary */}
      <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
        {post.summary || (post.content ? post.content.replace(/^#+\s+/gm, '').slice(0, 150) + '...' : 'No summary provided.')}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 inline-flex items-center gap-1.5 transition-transform group-hover:translate-x-1 duration-200">
          Read essay <ArrowRight className="w-3.5 h-3.5" />
        </span>

        {/* Admin Quick Edit Button */}
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(post);
            }}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}
      </div>
    </article>
  );
}
