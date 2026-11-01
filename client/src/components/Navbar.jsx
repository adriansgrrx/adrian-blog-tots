import React from 'react';
import { Sun, Moon, Lock, Unlock, Plus, ArrowUpRight } from 'lucide-react';

export function Navbar({
  darkMode,
  setDarkMode,
  isAdmin,
  onOpenAdminModal,
  onNewPost,
  setCurrentView,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-white/[0.08] bg-[#fafafa]/85 dark:bg-[#131314]/85 backdrop-blur-md transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => setCurrentView({ type: 'list' })}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div>
            <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
              Tots
            </span>
            <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 font-normal -mt-0.5">
              Tech, Thoughts, and Stories
            </span>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back to Portfolio Link */}
          <a
            href="https://www.adrianesguerra.site/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-400 dark:hover:border-white/[0.2] hover:bg-zinc-100/50 dark:hover:bg-white/[0.04] transition-all"
            title="Visit Adrian's Portfolio"
          >
            <span>Portfolio</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
          </a>

          {/* New Post Button (Only when Admin is unlocked) */}
          {isAdmin && (
            <button
              onClick={onNewPost}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-sky-500 hover:bg-sky-400 text-slate-950 px-3 py-1.5 rounded-full transition-all duration-200 shadow-sm shadow-sky-500/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
          )}

          {/* Admin Lock / Unlock */}
          <button
            onClick={onOpenAdminModal}
            title={isAdmin ? 'Admin Mode Active (Click to lock)' : 'Author Login (Admin)'}
            className={`p-2 rounded-full border text-xs transition-colors ${
              isAdmin
                ? 'border-sky-500/50 bg-sky-500/10 text-sky-600 dark:text-sky-300 hover:bg-sky-500/20'
                : 'border-zinc-200 dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-400 dark:hover:border-white/[0.2] hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
            }`}
          >
            {isAdmin ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
            className="p-2 rounded-full border border-zinc-200 dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-400 dark:hover:border-white/[0.2] hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors"
          >
            {darkMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-sky-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
