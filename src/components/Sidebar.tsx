import { Article, BloggerProfile } from '../types';
import { MapPin, Link as LinkIcon, Github, Mail, Tag, Folder, CalendarRange, Clock } from 'lucide-react';

interface SidebarProps {
  profile: BloggerProfile;
  articles: Article[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  selectedArchive: string | null; // e.g. "2026-06"
  onSelectArchive: (archive: string | null) => void;
  onSelectArticle: (id: string) => void;
}

export function Sidebar({
  profile,
  articles,
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
  selectedArchive,
  onSelectArchive,
  onSelectArticle,
}: SidebarProps) {

  // 1. Calculate categories with post count
  const categoriesMap = articles
    .filter(a => a.status === 'published')
    .reduce((acc, current) => {
      acc[current.category] = (acc[current.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // 2. Calculate tags with post count
  const tagsMap = articles
    .filter(a => a.status === 'published')
    .reduce((acc, current) => {
      current.tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

  // 3. Compute archives: B06 | 归档视图 | 按年/月归档，显示每月文章数量。
  const archivesMap = articles
    .filter(a => a.status === 'published')
    .reduce((acc, current) => {
      // Split "2026-06-01 10:24:00" -> "2026年06月" or "2026-06"
      const dateParts = current.createTime.split(' ')[0].split('-');
      if (dateParts.length >= 2) {
        const key = `${dateParts[0]}-${dateParts[1]}`; // e.g. "2026-06"
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

  // 4. Extract latest 3 articles
  const recentArticles = [...articles]
    .filter(a => a.status === 'published')
    .sort((a, b) => b.createTime.localeCompare(a.createTime))
    .slice(0, 3);

  // Format month to Chinese standard "2026年06月"
  const formatArchiveKey = (key: string) => {
    const parts = key.split('-');
    return `${parts[0]}年${parts[1]}月`;
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-6 select-none">

      {/* Blogger Bio card */}
      <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/10 border border-zinc-100 dark:border-zinc-800"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h2 className="font-bold text-zinc-900 dark:text-zinc-50 text-base flex items-center gap-1">
              {profile.name}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">{profile.title}</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
          {profile.bio}
        </p>

        {/* Short meta details */}
        <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-900/60 pt-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-zinc-400" />
            <span>中国 · 广东</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={13} className="text-zinc-400" />
            <span>greeglue89@gmail.com</span>
          </div>
          <div className="flex items-center gap-2 group">
            <Github size={13} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group-hover:text-emerald-500 transition-colors break-all"
            >
              {profile.githubUrl.replace('https://', '')}
            </a>
          </div>
        </div>
      </div>

      {/* Categories Widget */}
      <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm mb-3.5 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-900/60 pb-2">
          <Folder size={14} className="text-emerald-500" />
          文章分类
        </h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedCategory === null
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
              }`}
          >
            <span>全部文章</span>
            <span className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 py-0.5 px-2 rounded-full font-bold">
              {articles.filter(a => a.status === 'published').length}
            </span>
          </button>
          {Object.entries(categoriesMap).map(([category, count]) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedCategory === category
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
            >
              <span>{category}</span>
              <span className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 py-0.5 px-2 rounded-full font-bold">
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags Widget */}
      <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm mb-3.5 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-900/60 pb-2">
          <Tag size={14} className="text-emerald-500" />
          标签筛选
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectTag(null)}
            className={`px-2.5 py-1 text-xs rounded-lg font-mono cursor-pointer transition-all ${selectedTag === null
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-900 hover:border-emerald-500/20'
              }`}
          >
            #全部
          </button>
          {Object.entries(tagsMap).map(([tag, count]) => (
            <button
              key={tag}
              onClick={() => onSelectTag(tag)}
              className={`px-2.5 py-1 text-xs rounded-lg font-mono cursor-pointer transition-all flex items-center gap-1 ${selectedTag === tag
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-900 hover:border-emerald-500/20'
                }`}
            >
              <span>#{tag}</span>
              <span className={`text-[10px] font-bold ${selectedTag === tag ? 'text-emerald-100' : 'text-zinc-400'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Latest Articles brief */}
      <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm mb-3.5 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-900/60 pb-2">
          <Clock size={14} className="text-emerald-500" />
          最新文章
        </h3>
        <div className="flex flex-col gap-3">
          {recentArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => onSelectArticle(article.id)}
              className="group cursor-pointer flex flex-col min-w-0"
            >
              <h4 className="text-xs sm:text-sm font-semibold text-zinc-850 dark:text-zinc-350 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                {article.title}
              </h4>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
