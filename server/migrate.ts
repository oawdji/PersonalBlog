/**
 * 数据库迁移脚本：根据 schema 自动建表（如果表不存在）
 * 运行方式：npx tsx server/migrate.ts
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), '.data', 'greentech.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');

console.log('📦 正在初始化数据库表结构...\n');

// 建表 SQL（与 Drizzle schema 保持一致）
const CREATE_SQL = `
CREATE TABLE IF NOT EXISTS articles (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  summary     TEXT NOT NULL,
  content     TEXT NOT NULL,
  cover_image TEXT,
  tags        TEXT NOT NULL DEFAULT '[]',
  category    TEXT NOT NULL,
  create_time TEXT NOT NULL,
  update_time TEXT NOT NULL,
  read_time   INTEGER NOT NULL DEFAULT 5,
  status      TEXT NOT NULL DEFAULT 'draft',
  views       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS profile (
  id         INTEGER PRIMARY KEY DEFAULT 1,
  name       TEXT NOT NULL,
  avatar     TEXT NOT NULL,
  title      TEXT NOT NULL,
  bio        TEXT NOT NULL,
  github_url TEXT NOT NULL,
  tech_stack TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS page_views (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL
);
`;

sqlite.exec(CREATE_SQL);

// 验证
const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('✅ 已创建的表:', tables.map((t: any) => t.name).join(', '));
console.log('\n数据库迁移完成！');
sqlite.close();
