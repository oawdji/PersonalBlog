import { Router, Request, Response } from 'express';
import { db, schema } from '../db';
import { eq, desc, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

export const articlesRouter = Router();

/** 获取所有文章（游客只看到已发布，管理员看到全部） */
articlesRouter.get('/', (req: Request, res: Response) => {
  try {
    const all = db.select().from(schema.articles).orderBy(desc(schema.articles.createTime)).all();

    // 游客仅返回已发布的文章
    const isAdmin = req.query.admin === 'true';
    const result = isAdmin ? all : all.filter((a) => a.status === 'published');

    // 反序列化 tags
    const parsed = result.map((a) => ({
      ...a,
      tags: JSON.parse(a.tags) as string[],
    }));

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

/** 获取单篇文章 */
articlesRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const article = db
      .select()
      .from(schema.articles)
      .where(eq(schema.articles.id, req.params.id))
      .get();

    if (!article) {
      res.status(404).json({ error: '文章不存在' });
      return;
    }

    res.json({
      ...article,
      tags: JSON.parse(article.tags) as string[],
    });
  } catch (err) {
    res.status(500).json({ error: '获取文章失败' });
  }
});

/** 创建 / 更新文章（需登录） */
articlesRouter.put('/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = db
      .select()
      .from(schema.articles)
      .where(eq(schema.articles.id, id))
      .get();

    const payload = {
      id,
      title: data.title,
      summary: data.summary,
      content: data.content,
      coverImage: data.coverImage || null,
      tags: JSON.stringify(data.tags || []),
      category: data.category,
      createTime: data.createTime || new Date().toISOString().replace('T', ' ').slice(0, 19),
      updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      readTime: data.readTime || 5,
      status: data.status || 'draft',
      views: data.views || 0,
    };

    if (existing) {
      db.update(schema.articles)
        .set({ ...payload, createTime: existing.createTime })
        .where(eq(schema.articles.id, id))
        .run();
    } else {
      db.insert(schema.articles).values(payload).run();
    }

    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: '保存文章失败' });
  }
});

/** 删除文章（需登录） */
articlesRouter.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    db.delete(schema.articles).where(eq(schema.articles.id, req.params.id)).run();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '删除文章失败' });
  }
});

/** 增加文章浏览量 */
articlesRouter.post('/:id/view', (req: Request, res: Response) => {
  try {
    const article = db
      .select({ views: schema.articles.views })
      .from(schema.articles)
      .where(eq(schema.articles.id, req.params.id))
      .get();

    if (!article) {
      res.status(404).json({ error: '文章不存在' });
      return;
    }

    db.update(schema.articles)
      .set({ views: article.views + 1 })
      .where(eq(schema.articles.id, req.params.id))
      .run();

    res.json({ success: true, views: article.views + 1 });
  } catch (err) {
    res.status(500).json({ error: '更新浏览量失败' });
  }
});
