# GreenTech Blog

极简个人技术博客系统，基于 React 19 + Vite 6 + TypeScript + Tailwind CSS 构建。

## 功能

- **文章管理**：发布、编辑、删除，支持草稿/发布状态隔离
- **Markdown 写作**：左右分栏实时预览编辑器
- **多维筛选**：按分类、标签、归档、关键词搜索
- **后台管理**：管理员密码认证，文章与个人资料管理
- **数据统计**：ECharts 访客趋势折线图、GitHub 风格贡献热力图
- **技术栈墙**：个人技能熟练度可视化展示
- **纯前端**：基于 localStorage 持久化，无需后端

## 技术栈

| 类别   | 技术                         |
| ------ | ---------------------------- |
| 框架   | React 19 + TypeScript        |
| 构建   | Vite 6                       |
| 样式   | Tailwind CSS 4               |
| 图表   | ECharts 6                    |
| 图标   | Lucide React                 |
| 动画   | Motion (Framer Motion)       |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 管理后台

点击导航栏「登录」按钮，密码为 `admin`。

## 构建部署

```bash
npm run build   # 输出到 dist/
npm run preview # 预览生产构建
```
