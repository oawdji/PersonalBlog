import { Router, Request, Response } from 'express';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';

export const statsRouter = Router();

/** 获取最近 7 天访客统计 */
statsRouter.get('/', (_req: Request, res: Response) => {
  try {
    const rows = db
      .select()
      .from(schema.visitorStats)
      .orderBy(schema.visitorStats.date)
      .all();

    // 返回最近 7 条
    const recent = rows.slice(-7).map((r) => ({
      date: r.date,
      pv: r.pv,
    }));

    res.json(recent);
  } catch (err) {
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

/** 记录一次 PV */
statsRouter.post('/pv', (req: Request, res: Response) => {
  try {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${mm}-${dd}`;

    const existing = db
      .select()
      .from(schema.visitorStats)
      .where(eq(schema.visitorStats.date, dateStr))
      .get();

    if (existing) {
      db.update(schema.visitorStats)
        .set({ pv: existing.pv + 1 })
        .where(eq(schema.visitorStats.date, dateStr))
        .run();
    } else {
      // 只保留最近 7 天的记录，超出则删除最旧的
      const all = db.select().from(schema.visitorStats).orderBy(schema.visitorStats.date).all();
      if (all.length >= 7) {
        db.delete(schema.visitorStats)
          .where(eq(schema.visitorStats.date, all[0].date))
          .run();
      }
      db.insert(schema.visitorStats).values({ date: dateStr, pv: 1 }).run();
    }

    res.json({ success: true, date: dateStr });
  } catch (err) {
    res.status(500).json({ error: '记录 PV 失败' });
  }
});
