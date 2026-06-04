import { useState, useEffect } from 'react';
import { INITIAL_ARTICLES, INITIAL_PROFILE, INITIAL_VISITOR_STATS } from './data';
import { Article, BloggerProfile, VisitorStats } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetail } from './components/ArticleDetail';
import { AdminDashboard } from './components/AdminDashboard';
import { GithubCalendar } from './components/GithubCalendar';
import { TechStackWall } from './components/TechStackWall';
import { AboutView } from './components/AboutView';
import { ChevronLeft, ChevronRight, ArrowUpCircle, Sparkles } from 'lucide-react';

export default function App() {
  // --- 1. CORE PERSISTENCE STATES ---
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('greentech_articles');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ARTICLES;
  });

  const [profile, setProfile] = useState<BloggerProfile>(() => {
    const saved = localStorage.getItem('greentech_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_PROFILE;
  });

  const [visitorStats, setVisitorStats] = useState<VisitorStats[]>(() => {
    const saved = localStorage.getItem('greentech_stats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_VISITOR_STATS;
  });

  // Dark mode has been deleted and disabled as requested
  const isDarkMode = false;

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('greentech_is_admin') === 'true';
  });

  // Save states to local storage on mutation
  useEffect(() => {
    localStorage.setItem('greentech_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('greentech_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('greentech_stats', JSON.stringify(visitorStats));
  }, [visitorStats]);

  useEffect(() => {
    localStorage.setItem('greentech_theme', 'light');
    document.documentElement.classList.remove('dark');
  }, []);

  // --- 2. SIMPLE VISIT PV EVENT TRACKING (可选简单埋点) ---
  useEffect(() => {
    // Generate simple MM-DD format based on current local time
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${mm}-${dd}`;

    setVisitorStats((prevStats) => {
      const statsCopy = [...prevStats];
      const todayRecordIdx = statsCopy.findIndex((s) => s.date === dateStr);

      if (todayRecordIdx !== -1) {
        statsCopy[todayRecordIdx] = {
          ...statsCopy[todayRecordIdx],
          pv: (statsCopy[todayRecordIdx].pv || 0) + 1
        };
      } else {
        // Drop oldest and push new today element to maintain sliding 7-day stats
        if (statsCopy.length >= 7) {
          statsCopy.shift();
        }
        statsCopy.push({ date: dateStr, pv: 1 });
      }
      return statsCopy;
    });
  }, []);

  // --- 3. FILTER & NAVIGATION STATES ---
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedArchive, setSelectedArchive] = useState<string | null>(null); // YYYY-MM
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

  // Nav to detailed page
  const handleSelectArticle = (id: string) => {
    setSelectedArticleId(id);
    setIsAdminMode(false);
    setIsAboutMode(false);
  };

  // Tag filter trigger on click
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

  const handleAdminLogin = (password: string): boolean => {
    if (password === 'admin') {
      setIsAdmin(true);
      localStorage.setItem('greentech_is_admin', 'true');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setIsAdminMode(false);
    setIsAboutMode(false);
    localStorage.removeItem('greentech_is_admin');
  };

  // Views increment tracking in actual details page
  const handleIncrementViews = (id: string) => {
    setArticles((prevArticles) =>
      prevArticles.map((art) =>
        art.id === id ? { ...art, views: (art.views || 0) + 1 } : art
      )
    );
  };

  // --- 4. MUTATORS FROM ADMIN ---
  const handleSaveArticle = (savedArticle: Article) => {
    setArticles((prev) => {
      const idx = prev.findIndex((art) => art.id === savedArticle.id);
      if (idx !== -1) {
        // Edit flow
        const updated = [...prev];
        updated[idx] = savedArticle;
        return updated;
      } else {
        // Add flow
        return [savedArticle, ...prev];
      }
    });

    // Make sure tomorrow's calendar or contribution chart gets incremental score!
    setVisitorStats((prevStats) => {
      const statsCopy = [...prevStats];
      if (statsCopy.length > 0) {
        const lastIdx = statsCopy.length - 1;
        statsCopy[lastIdx] = {
          ...statsCopy[lastIdx],
          pv: (statsCopy[lastIdx].pv || 0) + 15 // incremental simulated bump for posting an article!
        };
      }
      return statsCopy;
    });
  };

  const handleDeleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((art) => art.id !== id));
    if (selectedArticleId === id) {
      setSelectedArticleId(null);
    }
  };

  const handleUpdateProfile = (updatedProfile: BloggerProfile) => {
    setProfile(updatedProfile);
  };

  // --- 5. DATA CHUNKING & FILTERING (VISITOR ONLY DISPLAY PUBLISHED) ---
  const filteredArticles = articles
    .filter((art) => {
      // Drafts are strictly removed from visitor's query list
      if (art.status !== 'published') return false;

      // Category filter
      if (selectedCategory && art.category !== selectedCategory) return false;

      // Tag filter
      if (selectedTag && !art.tags.includes(selectedTag)) return false;

      // Month Archive filter (e.g. format: "2026-06")
      if (selectedArchive) {
        const dateParts = art.createTime.split(' ')[0].split('-');
        if (dateParts.length >= 2) {
          const key = `${dateParts[0]}-${dateParts[1]}`;
          if (key !== selectedArchive) return false;
        } else {
          return false;
        }
      }

      // Keyword standard search (case insensitive check across Title, Summary, and Content)
      if (searchQuery.trim()) {
        const keyword = searchQuery.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(keyword);
        const matchesSummary = art.summary.toLowerCase().includes(keyword);
        const matchesContent = art.content.toLowerCase().includes(keyword);
        return matchesTitle || matchesSummary || matchesContent;
      }

      return true;
    })
    // Sort dynamically by views (clicks) or creation time
    .sort((a, b) => {
      if (sortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      return b.createTime.localeCompare(a.createTime);
    });

  // Pagination slice
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPagedArticles = filteredArticles.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredArticles.length / postsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active details object resolve
  const activeArticle = articles.find((art) => art.id === selectedArticleId);

  // Archive title helper text
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

  // Scroll to Top trigger
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

  return (
    <div className="min-h-screen bg-[#fcfdfc] dark:bg-[#090d09] text-zinc-800 dark:text-zinc-200 transition-colors duration-300 font-sans flex flex-col justify-between antialiased">
      
      {/* Dynamic Header / Navbar */}
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

      {/* Main Core Content wrapper */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {isAdminMode ? (
          /* Render Admin dashboard */
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
          /* Render About Me Page */
          <AboutView 
            profile={profile} 
            onBack={handleResetFilters} 
          />
        ) : selectedArticleId && activeArticle ? (
          /* Render Blog Post details page */
          <ArticleDetail
            article={activeArticle}
            onBack={() => setSelectedArticleId(null)}
            onTagClick={handleTagClick}
            onIncrementViews={handleIncrementViews}
          />
        ) : (
          /* Render double-panel lists & widgets layout */
          <div className="space-y-8">
            
            {/* Top banner filter helper indicators */}
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
              
              {/* Left Column Section: Articles Feed */}
              <div className="flex-1 space-y-6 w-full">
                
                {/* Visual Header row */}
                <div className="border-b border-zinc-100 pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                      <span className="w-1.5 h-3.5 rounded bg-emerald-500"></span>
                      文章精选 Feed
                    </h2>
                    <p className="text-[11px] text-zinc-500 mt-0.5">记录程序开发实践、深度洞察以及心智模型</p>
                  </div>

                  {/* Sorting dropdown/controls */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 select-none text-[11px]">
                      <button
                        onClick={() => {
                          setSortBy('date');
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          sortBy === 'date'
                            ? 'bg-white text-emerald-700 font-bold shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                      >
                        按发布时间
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('views');
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          sortBy === 'views'
                            ? 'bg-white text-emerald-700 font-bold shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-800'
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

                {/* Articles mapping */}
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

                {/* Pagination Controls Bar */}
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
                              isCurrent
                                ? 'bg-emerald-600 text-white'
                                : 'text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900'
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

              {/* Right Column Section: Widgets & Bio */}
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

      {/* Floating Scroll-to-Top Button */}
      {showScrollTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg cursor-pointer scrollbar-thin transition-all hover:scale-105 z-50 flex items-center justify-center animate-fade-in"
          title="回滚至顶部"
        >
          <ArrowUpCircle size={20} />
        </button>
      )}

      {/* Footer copyright */}
      <footer className="w-full bg-white dark:bg-[#060a06] border-t border-zinc-100 dark:border-zinc-900/60 py-6 text-center select-none text-xs text-zinc-400 dark:text-zinc-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-1">
            <span className="font-bold text-emerald-500">GreenTech</span>
            <span>© 2026. All rights preserved.</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="text-zinc-600 dark:text-zinc-300 font-bold hover:text-emerald-500 cursor-pointer transition-colors">React 19 + Vite 6 + Tailwind + ECharts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
