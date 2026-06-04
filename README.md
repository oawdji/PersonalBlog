# GreenTech Blog

极简个人技术博客系统，基于 React 19 + Vite 6 + Express + SQLite 构建。

## 技术栈

| 类别   | 技术                         |
| ------ | ---------------------------- |
| 前端   | React 19 + TypeScript        |
| 构建   | Vite 6                       |
| 样式   | Tailwind CSS 4               |
| 图表   | ECharts 6                    |
| 图标   | Lucide React                 |
| 动画   | Motion (Framer Motion)       |
| 后端   | Express 4                    |
| ORM    | Drizzle ORM                  |
| 数据库 | SQLite (better-sqlite3)      |
| 认证   | JWT                          |

## 项目结构

```
greentech-blog/
├── server/                    # 后端
│   ├── index.ts              # Express 服务器入口
│   ├── migrate.ts            # 数据库迁移（建表）
│   ├── seed.ts               # 种子数据
│   ├── db/
│   │   ├── index.ts          # 数据库连接
│   │   └── schema.ts         # Drizzle 表定义
│   ├── routes/
│   │   ├── articles.ts       # 文章 CRUD API
│   │   ├── profile.ts        # 博主资料 API
│   │   ├── stats.ts          # 访客统计 API
│   │   └── auth.ts           # JWT 认证 API
│   └── middleware/
│       └── auth.ts           # JWT 验证中间件
├── src/                       # 前端
│   ├── api/
│   │   └── client.ts         # API 客户端（类型安全的 fetch 封装）
│   ├── components/           # React 组件
│   └── App.tsx               # 主应用
├── .data/                     # SQLite 数据库文件（gitignore）
└── drizzle.config.ts
```

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库（建表 + 种子数据）
npm run db:setup

# 启动开发服务器（同时启动前端和后端）
npm run dev
```

- 前端：http://localhost:3000
- 后端 API：http://localhost:3001

## 单独运行

```bash
npm run dev:api    # 仅启动后端 API 服务器
npm run dev:web    # 仅启动前端开发服务器
```

## API 接口

| 方法     | 路径                   | 说明             | 认证 |
| -------- | ---------------------- | ---------------- | ---- |
| GET      | /api/articles          | 获取文章列表     | -    |
| GET      | /api/articles/:id      | 获取单篇文章     | -    |
| PUT      | /api/articles/:id      | 创建/更新文章    | JWT  |
| DELETE   | /api/articles/:id      | 删除文章         | JWT  |
| POST     | /api/articles/:id/view | 增加浏览次数     | -    |
| GET      | /api/profile           | 获取博主资料     | -    |
| PUT      | /api/profile           | 更新博主资料     | JWT  |
| GET      | /api/stats             | 获取访客统计     | -    |
| POST     | /api/stats/pv          | 记录一次 PV      | -    |
| POST     | /api/auth/login        | 管理员登录       | -    |

## 管理后台

点击导航栏「博主登录」按钮，密码为 `admin`（可通过环境变量 `ADMIN_PASSWORD` 修改）。

## 生产部署

```bash
# 构建前端
npm run build

# 初始化数据库
npm run db:setup

# 启动生产服务器（Express 同时托管前端静态文件和 API）
npm start
```

访问 http://localhost:3001 即可。

## 环境变量

| 变量           | 说明           | 默认值                         |
| -------------- | -------------- | ------------------------------ |
| `API_PORT`     | API 服务器端口 | 3001                           |
| `ADMIN_PASSWORD` | 管理员密码   | admin                          |
| `JWT_SECRET`   | JWT 签名密钥   | greentech-blog-secret-key-2026 |
