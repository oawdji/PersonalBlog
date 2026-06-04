import React from 'react';
import { Article } from '../types';
import { Calendar, Eye, Hash, ArrowUpRight, ChevronRight } from 'lucide-react';

interface ArticleCardProps {
  key?: string;
  article: Article;
  onSelect: (id: string) => void;
  onTagClick: (tag: string) => void;
}

export function ArticleCard({ article, onSelect, onTagClick }: ArticleCardProps) {

  return (
    <article 
      onClick={() => onSelect(article.id)}
      className="group relative flex flex-col sm:flex-row gap-5 p-5 bg-white dark:bg-zinc-950/80 border border-zinc-200/60 dark:border-zinc-900 rounded-2xl hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/[0.02] cursor-pointer transition-all duration-300"
    >
      {/* Article Cover Image (Loves Unsplash) */}
      {article.coverImage && (
        <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shrink-0 relative">
          <img 
            src={article.coverImage} 
            alt={article.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/50 text-white font-semibold text-[10px] uppercase tracking-wider backdrop-blur-sm">
            {article.category}
          </div>
        </div>
      )}

      {/* Article Meta */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono mb-2">
            {!article.coverImage && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 font-semibold uppercase text-[10px]">
                {article.category}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-zinc-400" />
              {article.createTime.split(' ')[0]}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} className="text-zinc-400" />
              {article.views}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 line-clamp-2">
            {article.title}
          </h2>

          {/* Summary */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Tags with click trigger */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-zinc-100/50 dark:border-zinc-900/50">
          <div className="flex flex-wrap gap-1.5 max-w-[80%]">
            {article.tags.map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  e.stopPropagation(); // prevent card click select article
                  onTagClick(tag);
                }}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100/60 dark:bg-zinc-900 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors cursor-pointer"
              >
                <Hash size={10} className="text-zinc-400" />
                {tag}
              </span>
            ))}
          </div>

          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1.5 transition-transform duration-300 inline-flex items-center gap-0.5">
            阅读全文
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </article>
  );
}
