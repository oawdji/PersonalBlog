# GreenTech Blog

极简个人技术博客系统，前后端分离架构。

## 技术栈

| 类别     | 技术                      |
| -------- | ------------------------- |
| 框架     | React 19 + TypeScript     |
| 构建     | Vite 6                    |
| 样式     | Tailwind CSS 4            |
| 图表     | ECharts 6                 |
| 图标     | Lucide React              |
| 动画     | Motion (Framer Motion)    |
| 后端     | Express 4                 |
| 数据库   | SQLite (better-sqlite3)   |
| ORM      | Drizzle ORM               |
| 认证     | JWT                       |

## 前端功能

### 博客主页

- **文章列表**：卡片式展示，支持按发布时间 / 点击量排序，每页 5 篇
- **多维筛选**：按分类、标签、归档月份筛选，全局关键词搜索（标题 + 摘要 + 正文）
- **文章详情**：Markdown 渲染，右侧悬浮目录导航，自动滚动高亮
- **访问统计**：ECharts 折线图展示近 7 日 PV 趋势，浏览计数带 1 小时冷却

### 管理后台（需登录）

- **文章管理**：新增 / 编辑 / 删除，支持草稿与发布状态切换
- **Markdown 编辑器**：左右分栏，左侧编辑 + 右侧实时预览
- **封面图上传**：支持本地上传或外部 URL，上传后即时预览
- **博主资料**：编辑昵称、头像、简介、GitHub、技术栈（含熟练度星级）

### 关于页面

- **博主介绍**：头像、头衔、个人简介、GitHub 链接
- **技术栈墙**：按 Language / Framework / Tool / Database 分类展示，1-5 星熟练度
- **贡献热力图**：GitHub 风格的 365 天贡献日历

### 前端组件

| 组件                | 说明                          |
| ------------------- | ----------------------------- |
| `Navbar`            | 导航栏：搜索框、登录入口      |
| `ArticleCard`       | 文章卡片：封面、标签、元信息  |
| `ArticleDetail`     | 文章详情：正文 + 目录导航     |
| `MarkdownRenderer`  | 自研 Markdown 渲染器          |
| `Sidebar`           | 侧边栏：分类/标签/归档/最新   |
| `AdminDashboard`    | 后台：文章 + 编辑 + 资料管理  |
| `AboutView`         | 关于页：博主展示              |
| `TechStackWall`     | 技术栈熟练度墙                |
| `GithubCalendar`    | GitHub 风格贡献日历           |

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库（建表 + 种子数据）
npm run db:setup

# 启动开发模式（前端 3000 + 后端 3001 同时启动）
npm run dev
```

- 前端：http://localhost:3000
- 后端：http://localhost:3001

## 管理后台

点击导航栏「博主登录」，默认密码 `admin`（通过环境变量 `ADMIN_PASSWORD` 可修改）。

## 数据表结构

后端使用 SQLite，通过 Drizzle ORM 管理，共 3 张表：

### articles（文章表）

| 字段          | 类型     | 说明                              |
| ------------- | -------- | --------------------------------- |
| `id`          | TEXT PK  | 文章唯一标识                      |
| `title`       | TEXT     | 标题                              |
| `summary`     | TEXT     | 摘要                              |
| `content`     | TEXT     | 正文（Markdown）                  |
| `cover_image` | TEXT?    | 封面图 URL                        |
| `tags`        | TEXT     | 标签（JSON 数组）                 |
| `category`    | TEXT     | 分类                              |
| `create_time` | TEXT     | 创建时间 YYYY-MM-DD HH:mm:ss      |
| `update_time` | TEXT     | 更新时间                          |
| `read_time`   | INTEGER  | 预估阅读分钟数，默认 5            |
| `status`      | TEXT     | `published`（已发布）\| `draft`（草稿） |
| `views`       | INTEGER  | 浏览次数，默认 0                  |

### profile（博主资料表，单行）

| 字段         | 类型     | 说明                      |
| ------------ | -------- | ------------------------- |
| `id`         | INTEGER  | 主键，固定为 1            |
| `name`       | TEXT     | 博主昵称                  |
| `avatar`     | TEXT     | 头像 URL                  |
| `title`      | TEXT     | 头衔 / 职位               |
| `bio`        | TEXT     | 个人简介                  |
| `github_url` | TEXT     | GitHub 主页链接           |
| `tech_stack` | TEXT     | 技术栈（JSON 数组，含熟练度） |

### visitor_stats（访客统计表）

| 字段   | 类型    | 说明                  |
| ------ | ------- | --------------------- |
| `id`   | INTEGER | 自增主键              |
| `date` | TEXT    | 日期 MM-DD            |
| `pv`   | INTEGER | 当日浏览量，默认 0    |

## 环境变量

| 变量              | 说明        | 默认值                         |
| ----------------- | ----------- | ------------------------------ |
| `API_PORT`        | 后端端口    | 3001                           |
| `ADMIN_PASSWORD`  | 管理员密码  | admin                          |
| `JWT_SECRET`      | JWT 密钥    | greentech-blog-secret-key-2026 |

## 生产部署

```bash
npm run build      # 构建前端到 dist/
npm run db:setup   # 初始化数据库
npm start          # 启动生产服务（Express 托管前端 + API）
```

访问 http://localhost:3001
