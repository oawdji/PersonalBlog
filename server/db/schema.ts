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

/** 访客统计表 */
export const visitorStats = sqliteTable('visitor_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(), // MM-DD 格式
  pv: integer('pv').notNull().default(0),
});
