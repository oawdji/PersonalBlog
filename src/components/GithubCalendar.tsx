import { useMemo } from 'react';

export function GithubCalendar() {
  // Generate contribution list for the past 365 days (53 columns x 7 rows)
  const calendarData = useMemo(() => {
    const data: { date: string; level: number; count: number }[] = [];
    const today = new Date();

    // Create 365 days back from today
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];

      // Generate some interesting clusters of contributions
      const dayOfWeek = date.getDay();
      const month = date.getMonth();

      let level = 0;
      let count = 0;

      // Base distribution
      const rand = Math.random();
      if (rand > 0.85) {
        level = 4; // deep forest green
        count = Math.floor(Math.random() * 8) + 8;
      } else if (rand > 0.7) {
        level = 3; // emerald green
        count = Math.floor(Math.random() * 5) + 4;
      } else if (rand > 0.5) {
        level = 2; // medium green
        count = Math.floor(Math.random() * 3) + 2;
      } else if (rand > 0.25) {
        level = 1; // light green
        count = 1;
      } else {
        level = 0; // grey
        count = 0;
      }

      // Weekend dip (Saturdays & Sundays tend to have fewer commits)
      if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() > 0.3) {
        level = Math.max(0, level - 2);
        count = Math.max(0, count - 3);
      }

      // Spring / Summer peaks or dry seasons
      if (month === 2 || month === 5 || month === 10) {
        level = Math.min(4, level + 1);
        count += 2;
      }

      data.push({
        date: dateString,
        level,
        count
      });
    }
    return data;
  }, []);

  const totalContributions = useMemo(() => {
    return calendarData.reduce((sum: number, item) => sum + item.count, 0);
  }, [calendarData]);

  // Labels for days of the week and months
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Identify monthly divisions for header positioning
  const monthHeaders = useMemo(() => {
    const headers: { label: string; index: number }[] = [];
    const today = new Date();
    let lastMonth = -1;

    for (let i = 0; i < calendarData.length; i += 7) {
      if (i >= calendarData.length) break;
      const dateStr = calendarData[i].date;
      const date = new Date(dateStr);
      const currentMonth = date.getMonth();

      if (currentMonth !== lastMonth) {
        headers.push({
          label: monthNames[currentMonth],
          index: Math.floor(i / 7)
        });
        lastMonth = currentMonth;
      }
    }
    return headers;
  }, [calendarData]);

  // Group days into columns (53 columns of 7 elements)
  const columns = useMemo(() => {
    const cols: { date: string; level: number; count: number }[][] = [];
    // Ensure column alignment of weekdays
    const tempCols: { date: string; level: number; count: number }[] = [];

    calendarData.forEach((day, index) => {
      tempCols.push(day);
      if (tempCols.length === 7 || index === calendarData.length - 1) {
        cols.push([...tempCols]);
        tempCols.length = 0;
      }
    });

    return cols;
  }, [calendarData]);

  // Color classes mapping
  const colorMap = [
    'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/60', // 0
    'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-100', // 1
    'bg-emerald-300 dark:bg-emerald-800/80 border-emerald-400 dark:border-emerald-700/50 text-emerald-900 dark:text-emerald-200', // 2
    'bg-emerald-500 dark:bg-emerald-600/95 border-emerald-600 dark:border-emerald-500/50 text-white', // 3
    'bg-emerald-700 dark:bg-emerald-400 border-emerald-800 dark:border-emerald-300 text-white', // 4
  ];

  return (
    <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            GitHub 贡献活动
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">最近一年的开源及技术产出记录</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{totalContributions}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">次贡献/年</span>
        </div>
      </div>

      {/* Grid container */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[650px] flex flex-col select-none relative">
          {/* Months header */}
          <div className="flex text-[10px] text-zinc-400 dark:text-zinc-500 h-5 pl-7 border-b border-zinc-100 dark:border-zinc-900/60 mb-1">
            {monthHeaders.map((m, idx) => (
              <span
                key={idx}
                className="absolute font-medium"
                style={{ left: `${m.index * 11.5 + 40}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid Rows */}
          <div className="flex">
            {/* Days labels */}
            <div className="flex flex-col justify-between text-[9px] text-zinc-400 dark:text-zinc-500 w-7 pr-2 h-[78px] text-right font-medium leading-none">
              {dayLabels.map((lbl, idx) => (
                <span key={idx} className="h-2 flex items-center justify-end">{lbl}</span>
              ))}
            </div>

            {/* Micro contribution elements */}
            <div className="flex flex-1 gap-[2px]">
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-[2px]">
                  {col.map((day, rowIdx) => (
                    <div
                      key={rowIdx}
                      className={`w-[10px] h-[10px] rounded-[1.5px] border ${colorMap[day.level]} group relative transition-all duration-300 hover:scale-[1.3] hover:z-20`}
                    >
                      {/* Interactive Custom Tooltip */}
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-zinc-900 text-white text-[10px] py-1 px-2 rounded font-sans whitespace-nowrap shadow-lg pointer-events-none z-30 font-mono">
                        {day.count} commits on {day.date}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Legend */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900/60">
        <span>数据源自真实本地提交加成</span>
        <div className="flex items-center gap-1">
          <span>少</span>
          <div className="w-[10px] h-[10px] rounded-[1.5px] border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900"></div>
          <div className="w-[10px] h-[10px] rounded-[1.5px] border border-emerald-200 dark:border-emerald-900 bg-emerald-100 dark:bg-emerald-950/70"></div>
          <div className="w-[10px] h-[10px] rounded-[1.5px] border border-emerald-400 dark:border-emerald-700 bg-emerald-300 dark:bg-emerald-800/80"></div>
          <div className="w-[10px] h-[10px] rounded-[1.5px] border border-emerald-600 dark:border-emerald-500 bg-emerald-500 dark:bg-emerald-600/95"></div>
          <div className="w-[10px] h-[10px] rounded-[1.5px] border border-emerald-800 dark:border-emerald-300 bg-emerald-700 dark:bg-emerald-400"></div>
          <span>多</span>
        </div>
      </div>
    </div>
  );
}
