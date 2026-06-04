import { useState } from 'react';
import { TechItem } from '../types';
import * as LucideIcons from 'lucide-react';

interface TechStackWallProps {
  techStack: TechItem[];
}

export function TechStackWall({ techStack }: TechStackWallProps) {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Language' | 'Framework' | 'Tool' | 'Database'>('All');

  const categories: { label: string; value: typeof activeCategory }[] = [
    { label: '全部技术', value: 'All' },
    { label: '编程语言', value: 'Language' },
    { label: '框架 / 库', value: 'Framework' },
    { label: '工程化 & 工具', value: 'Tool' },
    { label: '数据存储', value: 'Database' }
  ];

  const filteredStack = techStack.filter(item => 
    activeCategory === 'All' ? true : item.category === activeCategory
  );

  // Dynamically resolve icon based on store string name
  const renderItemIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
    // Fallback if not found
    return <LucideIcons.Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  };

  // Profit score custom graphic render (battery slots / glowing circles instead of numbers)
  const renderProficiencyGlow = (score: number) => {
    return (
      <div className="flex gap-1.5 items-center mt-1" aria-label={`熟练度 ${score}/5`}>
        {[1, 2, 3, 4, 5].map((index) => {
          const isActive = index <= score;
          return (
            <div
              key={index}
              className={`w-3.5 h-1.5 rounded-full transition-all duration-500 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                  : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base flex items-center gap-1.5">
            <LucideIcons.LayoutGrid className="w-4 h-4 text-emerald-500" />
            技术栈与技能墙
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">目前所掌握和在生产环境中深度使用的技术集群</p>
        </div>
      </div>

      {/* Categories Switchers */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-300 border ${
              activeCategory === cat.value
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 shadow-sm scale-[1.02]'
                : 'bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 border-zinc-100 dark:border-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid displaying the skill walls */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredStack.map((item, index) => (
          <div
            key={index}
            className="group relative flex items-center gap-3 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/20 dark:bg-zinc-900/20 hover:bg-white dark:hover:bg-zinc-900 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300"
          >
            {/* Round Icon Backdrop */}
            <div className="w-9 h-9 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {renderItemIcon(item.icon)}
            </div>

            {/* Name and graphical proficiency indicators */}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-medium text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {item.name}
              </span>
              <div className="flex items-center gap-1.5 mt-1 select-none">
                {renderProficiencyGlow(item.proficiency)}
              </div>
            </div>
          </div>
        ))}
        {filteredStack.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-zinc-400">
            暂无此分类的技术项
          </div>
        )}
      </div>
    </div>
  );
}
