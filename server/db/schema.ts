import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/** 文章表 */
export const articles = sqliteTable('articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  content: text('content').notNull(),
  coverImage: text('cover_image'),
  tags: text('tags').notNull(), // JSON 序列化的字符串数组
  category: text('category').notNull(),
  createTime: text('create_time').notNull(),
  updateTime: text('update_time').notNull(),
  readTime: integer('read_time').notNull().default(5),
  status: text('status').notNull().default('draft'),
  views: integer('views').notNull().default(0),
});

/** 博主资料表（单行） */
export const profile = sqliteTable('profile', {
  id: integer('id').primaryKey().default(1),
  name: text('name').notNull(),
  avatar: text('avatar').notNull(),
  title: text('title').notNull(),
  bio: text('bio').notNull(),
  githubUrl: text('github_url').notNull(),
  techStack: text('tech_stack').notNull(), // JSON 序列化
});

/** 页面访问事件表（每次访问记录一行，统计时实时聚合） */
export const pageViews = sqliteTable('page_views', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  createdAt: text('created_at').notNull(), // ISO 时间戳 2026-06-04T12:30:00.000Z
});
