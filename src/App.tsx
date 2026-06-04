import { useState, useEffect } from 'react';
import {
  Article, BloggerProfile, VisitorStats,
  fetchArticles, fetchProfile, fetchStats,
  saveArticle, deleteArticle, incrementArticleView,
  saveProfile, recordPV,
  login, logout, hasToken,
} from './api/client';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetail } from './components/ArticleDetail';
import { AdminDashboard } from './components/AdminDashboard';
import { GithubCalendar } from './components/GithubCalendar';
import { TechStackWall } from './components/TechStackWall';
import { AboutView } from './components/AboutView';
import { ChevronLeft, ChevronRight, ArrowUpCircle, Sparkles } from 'lucide-react';

/** 加载前的默认资料占位 */
const EMPTY_PROFILE: BloggerProfile = {
  name: 'Loading...',
  avatar: '/images/avatar.jpg',
  title: '',
  bio: '',
  githubUrl: '#',
  techStack: [],
};

export default function App() {
  // --- 1. CORE DATA STATES (now from API) ---
  const [articles, setArticles] = useState<Article[]>([]);
  const [profile, setProfile] = useState<BloggerProfile>(EMPTY_PROFILE);
  const [visitorStats, setVisitorStats] = useState<VisitorStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Dark mode has been deleted and disabled as requested
  const isDarkMode = false;

  const [isAdmin, setIsAdmin] = useState<boolean>(() => hasToken());

  // --- 2. INITIAL DATA LOAD + PV RECORD ---
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        const [arts, prof, stats] = await Promise.all([
          fetchArticles(),
          fetchProfile(),
          fetchStats(),
        ]);

        if (cancelled) return;

        setArticles(arts);
        if (prof) setProfile(prof);
        setVisitorStats(stats);

        // 记录一次 PV
        try {
          await recordPV();
          // 记录后刷新统计
          const updatedStats = await fetchStats();
          if (!cancelled) setVisitorStats(updatedStats);
        } catch { /* PV 记录失败不影响主流程 */ }
      } catch (err: any) {
        if (!cancelled) setDataError(err.message || '数据加载失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => { cancelled = true; };
  }, []);

  // --- 3. FILTER & NAVIGATION STATES ---
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedArchive, setSelectedArchive] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'views'>('date');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isAboutMode, setIsAboutMode] = useState<boolean>(false);

  const postsPerPage = 3;

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSelectedArchive(null);
    setSearchQuery('');
    setCurrentPage(1);
    setSelectedArticleId(null);
    setIsAdminMode(false);
    setIsAboutMode(false);
  };

  const handleToggleAbout = () => {
    setIsAboutMode((prev) => !prev);
    setSelectedArticleId(null);
    setIsAdminMode(false);
  };

  // Nav to detail page
  const handleSelectArticle = (id: string) => {
    setSelectedArticleId(id);
    setIsAdminMode(false);
    setIsAboutMode(false);
  };

  // Tag filter trigger
  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setSelectedCategory(null);
    setSelectedArchive(null);
    setSelectedArticleId(null);
    setIsAdminMode(false);
    setIsAboutMode(false);
    setCurrentPage(1);
  };

  // Category filter trigger
  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
    setSelectedTag(null);
    setSelectedArchive(null);
    setSelectedArticleId(null);
    setIsAdminMode(false);
    setIsAboutMode(false);
    setCurrentPage(1);
  };

  // Archive filter trigger
  const handleArchiveClick = (archive: string | null) => {
    setSelectedArchive(archive);
    setSelectedCategory(null);
    setSelectedTag(null);
    setSelectedArticleId(null);
    setIsAdminMode(false);
    setIsAboutMode(false);
    setCurrentPage(1);
  };

  // View state switchers
  const handleGoToAdmin = () => {
    if (isAdmin) {
      setIsAdminMode(true);
      setSelectedArticleId(null);
      setIsAboutMode(false);
    }
  };

  // --- 4. AUTH HANDLERS (async API) ---
  const handleAdminLogin = async (password: string): Promise<boolean> => {
    try {
      await login(password);
      setIsAdmin(true);
      return true;
    } catch {
      return false;
    }
  };

  const handleAdminLogout = () => {
    logout();
    setIsAdmin(false);
    setIsAdminMode(false);
    setIsAboutMode(false);
  };

  // --- 5. MUTATORS (calling API, then refreshing state) ---
  const handleIncrementViews = async (id: string) => {
    try {
      const result = await incrementArticleView(id);
      setArticles((prev) =>
        prev.map((art) =>
          art.id === id ? { ...art, views: result.views } : art
        )
      );
    } catch (err) {
      console.error('Failed to increment views', err);
    }
  };

  const handleSaveArticle = async (savedArticle: Article) => {
    try {
      await saveArticle(savedArticle);
      // Refetch all articles to get the latest state
      const updated = await fetchArticles(true);
      setArticles(updated);

      // Increment stats bump for posting
      setVisitorStats((prevStats) => {
        const statsCopy = [...prevStats];
        if (statsCopy.length > 0) {
          const lastIdx = statsCopy.length - 1;
          statsCopy[lastIdx] = {
            ...statsCopy[lastIdx],
            pv: (statsCopy[lastIdx].pv || 0) + 15,
          };
        }
        return statsCopy;
      });
    } catch (err) {
      console.error('Failed to save article', err);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteArticleApi(id);
      setArticles((prev) => prev.filter((art) => art.id !== id));
      if (selectedArticleId === id) {
        setSelectedArticleId(null);
      }
    } catch (err) {
      console.error('Failed to delete article', err);
    }
  };

  // Need a wrapper since the import name conflicts
  async function deleteArticleApi(id: string) {
    return deleteArticle(id);
  }

  const handleUpdateProfile = async (updatedProfile: BloggerProfile) => {
    try {
      await saveProfile(updatedProfile);
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  // --- 6. DATA FILTERING & PAGINATION ---
  const filteredArticles = articles
    .filter((art) => {
      if (art.status !== 'published') return false;
      if (selectedCategory && art.category !== selectedCategory) return false;
      if (selectedTag && !art.tags.includes(selectedTag)) return false;
      if (selectedArchive) {
        const dateParts = art.createTime.split(' ')[0].split('-');
        if (dateParts.length >= 2) {
          const key = `${dateParts[0]}-${dateParts[1]}`;
          if (key !== selectedArchive) return false;
        } else {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const keyword = searchQuery.toLowerCase();
        return (
          art.title.toLowerCase().includes(keyword) ||
          art.summary.toLowerCase().includes(keyword) ||
          art.content.toLowerCase().includes(keyword)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      return b.createTime.localeCompare(a.createTime);
    });

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPagedArticles = filteredArticles.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredArticles.length / postsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeArticle = articles.find((art) => art.id === selectedArticleId);

  const getFilterHelperTitle = () => {
    if (selectedCategory) return `分类：${selectedCategory}`;
    if (selectedTag) return `标签：#${selectedTag}`;
    if (selectedArchive) {
      const parts = selectedArchive.split('-');
      return `归档时间：${parts[0]}年${parts[1]}月`;
    }
    if (searchQuery) return `关键词搜索："${searchQuery}"`;
    return null;
  };

  // Scroll to Top
  const [showScrollTopBtn, setShowScrollTopBtn] = useState(false);
  useEffect(() => {
    const handleScrollHide = () => {
      setShowScrollTopBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScrollHide);
    return () => window.removeEventListener('scroll', handleScrollHide);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-zinc-500 font-mono">正在加载 GreenTech Blog...</p>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (dataError && articles.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcfdfc] flex items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md">
          <div className="text-3xl">⚠️</div>
          <h2 className="text-lg font-bold text-zinc-800">数据加载失败</h2>
          <p className="text-xs text-zinc-500 font-mono">{dataError}</p>
          <p className="text-xs text-zinc-400">
            请确保后端服务已启动：<code className="bg-zinc-100 px-2 py-0.5 rounded">npm run dev:api</code>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg cursor-pointer hover:bg-emerald-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfc] dark:bg-[#090d09] text-zinc-800 dark:text-zinc-200 transition-colors duration-300 font-sans flex flex-col justify-between antialiased">

      <Navbar
        isDarkMode={isDarkMode}
        onToggleTheme={() => {}}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
          setSelectedArticleId(null);
          setIsAdminMode(false);
          setIsAboutMode(false);
        }}
        isAdmin={isAdmin}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        onResetView={handleResetFilters}
        onGoToAdmin={handleGoToAdmin}
        githubUrl={profile.githubUrl}
        isAboutMode={isAboutMode}
        onToggleAbout={handleToggleAbout}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {isAdminMode ? (
          <AdminDashboard
            articles={articles}
            profile={profile}
            visitorStats={visitorStats}
            onSaveArticle={handleSaveArticle}
            onDeleteArticle={handleDeleteArticle}
            onUpdateProfile={handleUpdateProfile}
            onBackToBlog={handleResetFilters}
            isDarkMode={isDarkMode}
          />
        ) : isAboutMode ? (
          <AboutView
            profile={profile}
            onBack={handleResetFilters}
          />
        ) : selectedArticleId && activeArticle ? (
          <ArticleDetail
            article={activeArticle}
            onBack={() => setSelectedArticleId(null)}
            onTagClick={handleTagClick}
            onIncrementViews={handleIncrementViews}
          />
        ) : (
          <div className="space-y-8">

            {getFilterHelperTitle() && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between select-none animate-scale-up">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>当前筛选条件：</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{getFilterHelperTitle()}</span>
                  <span className="text-zinc-400">({filteredArticles.length} 篇结果)</span>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded border border-emerald-500/20 cursor-pointer"
                >
                  清除重选
                </button>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 items-start">

              <div className="flex-1 space-y-6 w-full">

                <div className="border-b border-zinc-100 pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                      <span className="w-1.5 h-3.5 rounded bg-emerald-500"></span>
                      文章精选 Feed
                    </h2>
                    <p className="text-[11px] text-zinc-500 mt-0.5">记录程序开发实践、深度洞察以及心智模型</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 select-none text-[11px]">
                      <button
                        onClick={() => { setSortBy('date'); setCurrentPage(1); }}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          sortBy === 'date' ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                      >
                        按发布时间
                      </button>
                      <button
                        onClick={() => { setSortBy('views'); setCurrentPage(1); }}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          sortBy === 'views' ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                      >
                        按点击量
                      </button>
                    </div>
                    <div className="text-zinc-400 font-mono text-[11px]">
                      第 {indexOfFirstPost + 1}-{Math.min(indexOfLastPost, filteredArticles.length)} 篇 / 共 {filteredArticles.length} 篇
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {currentPagedArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onSelect={handleSelectArticle}
                      onTagClick={handleTagClick}
                    />
                  ))}
                  {filteredArticles.length === 0 && (
                    <div className="py-20 text-center text-zinc-400 flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-900 rounded-3xl bg-white dark:bg-zinc-950/20">
                      <span className="text-xl mb-2 font-mono">🔍</span>
                      <p className="text-xs sm:text-sm">没有匹配到符合条件的技术档案成果。</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 rounded-lg cursor-pointer transition-colors"
                      >
                        重置检索过滤器
                      </button>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-6 select-none font-mono text-xs">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3.5 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 text-zinc-500 hover:text-emerald-500 disabled:opacity-40 disabled:hover:text-zinc-400 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft size={14} />
                      上一页
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        const isCurrent = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg font-bold transition-colors cursor-pointer ${
                              isCurrent ? 'bg-emerald-600 text-white' : 'text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3.5 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 text-zinc-500 hover:text-emerald-500 disabled:opacity-40 disabled:hover:text-zinc-400 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    >
                      下一页
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              <Sidebar
                profile={profile}
                articles={articles}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategoryClick}
                selectedTag={selectedTag}
                onSelectTag={handleTagClick}
                selectedArchive={selectedArchive}
                onSelectArchive={handleArchiveClick}
                onSelectArticle={handleSelectArticle}
              />
            </div>

          </div>
        )}
      </main>

      {showScrollTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg cursor-pointer scrollbar-thin transition-all hover:scale-105 z-50 flex items-center justify-center animate-fade-in"
          title="回滚至顶部"
        >
          <ArrowUpCircle size={20} />
        </button>
      )}

      <footer className="w-full bg-white dark:bg-[#060a06] border-t border-zinc-100 dark:border-zinc-900/60 py-6 text-center select-none text-xs text-zinc-400 dark:text-zinc-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-1">
            <span className="font-bold text-emerald-500">GreenTech</span>
            <span>© 2026. All rights preserved.</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="text-zinc-600 dark:text-zinc-300 font-bold hover:text-emerald-500 cursor-pointer transition-colors">React 19 + Vite 6 + Express + SQLite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
