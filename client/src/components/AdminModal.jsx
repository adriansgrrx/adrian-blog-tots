import React, { useState } from 'react';
import { Lock, Unlock, X, Key, CheckCircle } from 'lucide-react';
import { api, setAdminKey, getAdminKey } from '../api';

export function AdminModal({ isOpen, onClose, isAdmin, onStatusChange }) {
  const [keyInput, setKeyInput] = useState(getAdminKey() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setError('Please enter your secret key');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.verifyAdmin(keyInput.trim());
      setAdminKey(keyInput.trim());
      onStatusChange(true);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid admin key. Please check your ADMIN_SECRET_KEY on Render.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAdminKey('');
    setKeyInput('');
    onStatusChange(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#1e1f20] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/[0.08]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            {isAdmin ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              {isAdmin ? 'Author Mode Active' : 'Author Authentication'}
            </h3>
            <p className="text-xs text-zinc-400">
              {isAdmin
                ? 'You currently have access to create, edit drafts, and publish.'
                : 'Enter your admin secret key to unlock authoring controls.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            {error}
          </div>
        )}

        {isAdmin ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Logged in with secret key. Drafts and writing tools are visible.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-medium text-rose-400 hover:text-rose-300 px-4 py-2 rounded-full border border-rose-500/30 hover:bg-rose-500/10 transition-colors"
              >
                Lock / Sign Out
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium bg-white/[0.08] hover:bg-white/[0.14] text-white px-4 py-2 rounded-full transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Admin Secret Key
              </label>
              <div className="flex items-center rounded-xl bg-[#131314] border border-white/[0.08] px-3 py-2 text-xs">
                <Key className="w-4 h-4 text-zinc-500 mr-2" />
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="e.g. adrian-blog-secret-change-me"
                  className="bg-transparent border-none p-0 focus:outline-none text-xs w-full text-zinc-200 placeholder-zinc-600"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Default: <code className="text-zinc-400">adrian-blog-secret-change-me</code> (configured in server .env)
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-zinc-400 hover:text-white px-4 py-2 rounded-full hover:bg-white/[0.04]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="text-xs font-medium bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-full transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Unlock Author Mode'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
