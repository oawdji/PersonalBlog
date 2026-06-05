import { Router, Request, Response } from 'express';
import { db, schema } from '../db';
import { sql } from 'drizzle-orm';

export const statsRouter = Router();

/** 获取最近 7 天访客统计（实时从 page_views 聚合计算） */
statsRouter.get('/', (_req: Request, res: Response) => {
  try {
    // 用 SQLite 的 strftime 按日期分组，统计最近 7 天每天的 PV
    const rows = db
      .all<{ date: string; pv: number }>(
        sql`SELECT strftime('%m-%d', created_at) as date, COUNT(*) as pv
            FROM page_views
            WHERE created_at >= date('now', '-6 days')
            GROUP BY date
            ORDER BY date ASC`
      );

    // 补全 7 天内没有数据的日期（pv = 0）
    const result: { date: string; pv: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${mm}-${dd}`;
      const found = rows.find((r) => r.date === dateStr);
      result.push({ date: dateStr, pv: found ? found.pv : 0 });
    }

    res.json(result);
  } catch (err) {
    console.error('Stats query error:', err);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

/** 记录一次 PV（插入一条访问事件） */
statsRouter.post('/pv', (_req: Request, res: Response) => {
  try {
    db.insert(schema.pageViews).values({
      createdAt: new Date().toISOString(),
    }).run();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '记录 PV 失败' });
  }
});
