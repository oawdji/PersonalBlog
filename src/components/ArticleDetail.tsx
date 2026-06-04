import React, { useState, useEffect, useRef } from 'react';
import { Article } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ChevronLeft, Calendar, Eye, Hash, List, Sparkles } from 'lucide-react';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  onTagClick: (tag: string) => void;
  onIncrementViews: (id: string) => void;
}

export function ArticleDetail({ article, onBack, onTagClick, onIncrementViews }: ArticleDetailProps) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const lastIncrementedId = useRef<string | null>(null);

  // 浏览冷却时间：同一篇文章 1 小时内只计 1 次浏览
  const VIEW_COOLDOWN_MS = 60 * 60 * 1000;
  const VIEW_STORAGE_KEY = 'greentech_article_views';

  // Increment views once on load（用 ref 防止 React Strict Mode 双重调用，用 localStorage 做 1 小时冷却）
  useEffect(() => {
    if (lastIncrementedId.current !== article.id) {
      lastIncrementedId.current = article.id;

      const now = Date.now();
      const viewMap: Record<string, number> = JSON.parse(
        localStorage.getItem(VIEW_STORAGE_KEY) || '{}'
      );
      const lastView = viewMap[article.id];

      // 没有记录 或 已超过 1 小时冷却期 → 计入浏览
      if (!lastView || now - lastView > VIEW_COOLDOWN_MS) {
        viewMap[article.id] = now;
        localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(viewMap));
        onIncrementViews(article.id);
      }
    }

    // Smooth scroll page to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

  // Dynamic active heading highlight based on scroll position!
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      // Find current heading that corresponds to scroll position
      let currentActiveId = '';
      for (let i = 0; i < headings.length; i++) {
        const headingElement = document.getElementById(headings[i].id);
        if (headingElement) {
          const top = headingElement.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            currentActiveId = headings[i].id;
          }
        }
      }
      
      if (currentActiveId) {
        setActiveHeadingId(currentActiveId);
      } else if (headings.length > 0) {
        setActiveHeadingId(headings[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const handleTOCClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const headingElement = document.getElementById(id);
    if (headingElement) {
      const offsetTop = headingElement.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setActiveHeadingId(id);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 group cursor-pointer transition-colors"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        返回文章列表
      </button>

      {/* Main detail page layout with right Sticky Table of Contents (TOC) */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Left Section: Blog Core */}
        <article className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-900 rounded-3xl p-6 sm:p-10 shadow-sm overflow-hidden w-full">
          {/* Cover image if available */}
          {article.coverImage && (
            <div className="w-full h-56 sm:h-80 md:h-96 rounded-2xl overflow-hidden mb-8 border border-zinc-100 dark:border-zinc-900 shadow-md">
              <img 
                src={article.coverImage} 
                alt={article.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Metadata Block */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono mb-4 select-none">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-zinc-400" />
              {article.createTime}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={13} className="text-zinc-400" />
              {article.views} 次浏览
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3.5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight mb-6">
            {article.title}
          </h1>

          {/* Summary / abstract box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/45 dark:border-zinc-900 text-zinc-650 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed mb-8 select-none">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1 flex items-center gap-1">
              <Sparkles size={14} />
              摘要 (Abstract)
            </span>
            {article.summary}
          </div>

          {/* Inner Content Rendered via MarkdownRenderer */}
          <div className="border-t border-zinc-100 dark:border-zinc-900 pt-8" id="article-markdown-content">
            <MarkdownRenderer 
              content={article.content} 
              onHeadingsParsed={setHeadings} 
            />
          </div>

          {/* Tag labels footer */}
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-900 select-none">
            {article.tags.map((tag) => (
              <span
                key={tag}
                onClick={() => onTagClick(tag)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors cursor-pointer"
              >
                <Hash size={11} className="text-zinc-400" />
                {tag}
              </span>
            ))}
          </div>
        </article>

        {/* Right Section: Sticky Table of Contents (TOC) */}
        {headings.length > 0 && (
          <aside className="hidden lg:block w-72 shrink-0 sticky top-24 select-none bg-white dark:bg-zinc-950 p-5 border border-zinc-100 dark:border-zinc-900 rounded-2xl shadow-sm">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-4 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-2">
              <List size={14} className="text-emerald-500" />
              目录导航
            </h3>
            
            <nav className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1 text-xs">
              {headings.map((h, index) => {
                const isActive = activeHeadingId === h.id;
                
                // Indention padding based on heading size level
                const indentClass = 
                  h.level === 1 ? 'pl-0' :
                  h.level === 2 ? 'pl-3' :
                  h.level === 3 ? 'pl-6' : 'pl-9';

                return (
                  <a
                    key={index}
                    href={`#${h.id}`}
                    onClick={(e) => handleTOCClick(h.id, e)}
                    className={`block leading-relaxed py-1 rounded-md transition-all duration-300 hover:text-emerald-600 dark:hover:text-emerald-400 ${indentClass} ${
                      isActive 
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold border-l-2 border-emerald-500 pl-1.5 -ml-1.5 bg-emerald-500/[0.03]' 
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {h.text}
                  </a>
                );
              })}
            </nav>
          </aside>
        )}
      </div>
    </div>
  );
}
