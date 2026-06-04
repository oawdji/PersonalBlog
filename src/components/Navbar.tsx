import React, { useState } from 'react';
import { Search, Github, ShieldAlert, LogOut, Key, User, BookOpen } from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAdmin: boolean;
  onLogin: (password: string) => Promise<boolean>;
  onLogout: () => void;
  onResetView: () => void; // Reset to article list
  onGoToAdmin: () => void; // Show admin page
  githubUrl: string;
  isAboutMode: boolean;
  onToggleAbout: () => void;
}

export function Navbar({
  isDarkMode,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  isAdmin,
  onLogin,
  onLogout,
  onResetView,
  onGoToAdmin,
  githubUrl,
  isAboutMode,
  onToggleAbout,
}: NavbarProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [loginLoading, setLoginLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const success = await onLogin(password);
    setLoginLoading(false);
    if (success) {
      setShowLoginModal(false);
      setPassword('');
      setLoginError(false);
      onGoToAdmin();
    } else {
      setLoginError(true);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-950/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            onClick={onResetView}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform duration-300 shadow-sm shadow-emerald-500/10">
              <span className="text-lg font-sans">G</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-50">
                GreenGlue
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wider leading-none uppercase">
                Developer Log
              </span>
            </div>
          </div>

          {/* Search bar - header integrated */}
          <div className="hidden sm:flex flex-1 max-w-xs md:max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900/60 border-none rounded-full py-2 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/50 transition-all duration-300"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile query toggle or search button (always show tiny input if mobile) */}
            <div className="flex sm:hidden relative w-28 mr-1">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-6 pr-2 py-1 bg-slate-50 dark:bg-zinc-900 border-none rounded-full text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            </div>

            {/* Read/Blog Mode link */}
            <button
              onClick={onResetView}
              className={`p-2 rounded-full transition-all cursor-pointer ${(!isAboutMode && !isAdmin)
                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 font-bold'
                : 'text-slate-550 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-900/60'
                }`}
              title="浏览博客"
            >
              <BookOpen size={18} />
            </button>

            {/* About Me view toggle button */}
            <button
              onClick={onToggleAbout}
              className={`p-2 rounded-full transition-all cursor-pointer ${isAboutMode
                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 font-bold'
                : 'text-slate-550 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-900/60'
                }`}
              title="关于自己"
            >
              <User size={18} />
            </button>

            {/* GitHub Profile Redirect */}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-550 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-900/60 rounded-full transition-all inline-flex items-center"
              title="博主 GitHub 空间"
            >
              <Github size={18} />
            </a>

            {/* Admin status and triggers */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onGoToAdmin}
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-950 dark:text-emerald-400 text-xs font-semibold cursor-pointer transition-all"
                >
                  <ShieldAlert size={14} />
                  管理后台
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/10 rounded-full transition-all cursor-pointer"
                  title="注销登录"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setLoginError(false);
                  setShowLoginModal(true);
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 text-xs font-semibold cursor-pointer border border-slate-200 dark:border-zinc-800 transition-all duration-300"
              >
                <Key size={13} />
                博主登录
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xl relative animate-scale-up">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-400 shadow-inner">
                <ShieldAlert size={22} className="animate-pulse" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">博主身份鉴权</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                请输入管理员访问令牌（默认为 <span className="font-mono text-emerald-600 dark:text-emerald-400">admin</span>）
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                  访问密码
                </label>
                <input
                  type="password"
                  required
                  placeholder="请输入密钥..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${loginError
                    ? 'border-rose-300 dark:border-rose-900/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/10'
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                    } bg-zinc-50/50 dark:bg-zinc-900/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors duration-300`}
                />
                {loginError && (
                  <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                    ⚠ 密码错误，请重新输入（尝试使用 admin）
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-950 rounded-lg cursor-pointer transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg cursor-pointer transition-colors shadow-md shadow-emerald-500/10 disabled:opacity-60 disabled:cursor-wait"
                >
                  {loginLoading ? '验证中...' : '确认鉴权'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
