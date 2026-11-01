import React from 'react';
import { Sparkles, Sun, Moon, Lock, Unlock, Plus, ArrowUpRight } from 'lucide-react';

export function Navbar({
  darkMode,
  setDarkMode,
  isAdmin,
  onOpenAdminModal,
  onNewPost,
  currentView,
  setCurrentView,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] dark:border-white/[0.08] bg-[#131314]/85 dark:bg-[#131314]/85 backdrop-blur-md transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => setCurrentView({ type: 'list' })}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div>
            <span className="text-base font-semibold tracking-tight text-white flex items-center gap-1.5">
              Tots
            </span>
            <span className="block text-[11px] text-zinc-400 font-normal -mt-0.5">
              Tech, Thoughts, and Stories
            </span>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back to Portfolio Link */}
          <a
            href="/"
            onClick={(e) => {
              // Can link to your main portfolio url
              console.log('Navigating to portfolio...');
            }}
            className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-full border border-white/[0.08] hover:border-white/[0.2] transition-colors"
          >
            <span>Portfolio</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-400" />
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
                ? 'border-sky-500/50 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'
                : 'border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.2] hover:bg-white/[0.04]'
            }`}
          >
            {isAdmin ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle color theme"
            className="p-2 rounded-full border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.2] hover:bg-white/[0.04] transition-colors"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-sky-300" />}
          </button>
        </div>
      </div>
    </header>
  );
}
