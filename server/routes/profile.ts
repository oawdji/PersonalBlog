import { Router, Request, Response } from 'express';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

export const profileRouter = Router();

/** 获取博主资料 */
profileRouter.get('/', (_req: Request, res: Response) => {
  try {
    const row = db.select().from(schema.profile).where(eq(schema.profile.id, 1)).get();

    if (!row) {
      res.json(null);
      return;
    }

    res.json({
      ...row,
      techStack: JSON.parse(row.techStack),
    });
  } catch (err) {
    res.status(500).json({ error: '获取资料失败' });
  }
});

/** 更新博主资料（需登录） */
profileRouter.put('/', authMiddleware, (req: Request, res: Response) => {
  try {
    const data = req.body;
    const existing = db.select().from(schema.profile).where(eq(schema.profile.id, 1)).get();

    const payload = {
      name: data.name,
      avatar: data.avatar,
      title: data.title,
      bio: data.bio,
      githubUrl: data.githubUrl,
      techStack: JSON.stringify(data.techStack || []),
    };

    if (existing) {
      db.update(schema.profile).set(payload).where(eq(schema.profile.id, 1)).run();
    } else {
      db.insert(schema.profile).values({ id: 1, ...payload }).run();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '更新资料失败' });
  }
});
