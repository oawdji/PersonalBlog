# GreenTech Blog 服务器部署指南

---

## 〇、先回答你的问题：需要装 MySQL 吗？需要宝塔吗？

### 不需要 MySQL

本项目使用 **SQLite**（嵌入式文件数据库），数据存储在项目目录的 `.data/greentech.db` 文件中，**不需要安装 MySQL、PostgreSQL 等任何数据库服务**。

### 宝塔面板：可选，但推荐

| | 不用宝塔（命令行部署） | 用宝塔面板 |
|---|---|---|
| **适合人群** | 熟悉 Linux 命令行的开发者 | 偏好图形界面、不想记命令的同学 |
| **上手难度** | 中等 | 低，点点鼠标即可 |
| **灵活度** | 高，完全自主控制 | 中，受面板功能限制 |
| **资源占用** | 低 | 稍高（面板本身占用一些内存） |
| **SSL 证书** | 手动配置 Certbot / acme.sh | 面板一键申请 Let's Encrypt |
| **推荐指数** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐（新手强烈推荐） |

**结论**：如果你是第一次部署项目，强烈建议安装宝塔面板，后续的 Nginx 配置、SSL 证书、进程守护都可以在面板里可视化操作，省心很多。

下面我会分别给出 **宝塔面板部署方案** 和 **纯命令行部署方案**，你可以任选一种。

---

## 一、服务器基础环境准备

### 1.1 服务器要求

| 项目 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 1 核 | 2 核 |
| 内存 | 1 GB | 2 GB |
| 磁盘 | 10 GB | 20 GB+ |
| 操作系统 | Ubuntu 20.04+ / CentOS 7+ / Debian 11+ |
| 网络 | 公网 IP + 开放 80/443 端口 |

> 推荐阿里云、腾讯云 2C2G 轻量应用服务器即可，一年一百块左右。

### 1.2 Node.js 版本要求

本项目使用 **TypeScript + Vite + Express**，需要 Node.js **18.x 或 20.x LTS 版本**。

---

## 二、方案 A：宝塔面板部署（推荐新手）

### 2.1 安装宝塔面板

SSH 登录服务器后，执行对应系统的安装命令：

**Ubuntu / Debian：**
```bash
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh
```

**CentOS / Rocky Linux：**
```bash
yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh
```

安装完成后，终端会输出面板地址、用户名和密码，记下来。

```
外网面板地址: http://你的IP:xxxxx
内网面板地址: http://你的IP:xxxxx
username: xxxxxxxx
password: xxxxxxxx
```

浏览器打开外网面板地址，登录。

### 2.2 安装环境（宝塔面板内操作）

登录宝塔后，在**软件商店**中一键安装以下软件：

| 软件 | 版本建议 | 说明 |
|------|---------|------|
| Nginx | 1.24+ | Web 服务器 + 反向代理 |
| Node.js 版本管理器 | 最新 | 用于安装和管理 Node.js |
| PM2 管理器 | 最新 | 用于守护 Node.js 进程 |

> **注意**：不需要安装 MySQL、PHP、phpMyAdmin。

### 2.3 安装 Node.js

1. 打开宝塔 **软件商店 → Node.js 版本管理器 → 设置**
2. 在「命令行版本」中安装 **Node.js 20.x LTS**
3. 设置为「命令行版本」

### 2.4 上传项目代码

**方式一：Git 克隆（推荐）**
```bash
# 在宝塔「终端」中执行
cd /www/wwwroot
git clone <你的 Git 仓库地址> greentech-blog
```

**方式二：宝塔文件上传**
1. 宝塔面板 → 文件 → 进入 `/www/wwwroot`
2. 新建目录 `greentech-blog`
3. 把本地项目打包成 zip，上传后解压

### 2.5 安装依赖 & 构建

在宝塔「终端」中执行：

```bash
cd /www/wwwroot/greentech-blog

# 安装依赖
npm install

# 构建前端
npm run build

# 初始化数据库（建表 + 种子数据）
npm run db:setup
```

### 2.6 配置环境变量

在 `/www/wwwroot/greentech-blog` 目录下创建 `.env` 文件：

```bash
# JWT 密钥 —— 务必改成你自己的随机字符串！
JWT_SECRET="你的随机密钥_至少32位随机字符"

# 管理员密码
ADMIN_PASSWORD="你的管理员密码"

# API 端口
API_PORT=3001

# Gemini AI Key（可选，如果不使用 AI 功能可以不填）
GEMINI_API_KEY="你的_GEMINI_KEY"
```

### 2.7 配置 PM2 守护进程

1. 宝塔面板 → **PM2 管理器 → 设置 → 添加项目**
2. 填写如下信息：

| 字段 | 值 |
|------|-----|
| 项目名称 | `greentech-blog` |
| 启动文件 | `/www/wwwroot/greentech-blog/package.json` |
| 运行目录 | `/www/wwwroot/greentech-blog` |
| 启动命令 | `npm start` |
| 环境变量 | `NODE_ENV=production` |

3. 点击「添加」后，点击「启动」
4. 确认状态为绿色 **online**

> 或者直接用命令：`pm2 start npm --name "greentech-blog" -- start`

### 2.8 配置 Nginx 反向代理

1. 宝塔面板 → **网站 → 添加站点**
2. 填写你的域名，如 `blog.yourdomain.com`
3. 创建站点后，点击站点右侧的「设置」→「反向代理」
4. 添加反向代理：

| 字段 | 值 |
|------|-----|
| 代理名称 | `greentech-api` |
| 目标 URL | `http://127.0.0.1:3001` |
| 发送域名 | `$host` |

5. 点击「保存」

同时需要在「配置文件」中，在 `server` 块内添加以下配置（处理上传文件大小限制和静态资源缓存）：

```nginx
# 上传文件大小限制
client_max_body_size 20m;

# 静态资源缓存
location /assets {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 2.9 配置 SSL 证书

1. 宝塔面板 → **网站 → 你的站点 → 设置 → SSL**
2. 选择 **Let's Encrypt** → 勾选域名 → 点击「申请」
3. 申请成功后，开启「强制 HTTPS」

### 2.10 开放防火墙端口

宝塔面板 → **安全**，确保以下端口已放行：

| 端口 | 说明 |
|------|------|
| 80 | HTTP |
| 443 | HTTPS |
| 22 | SSH |

**云服务商安全组**（阿里云/腾讯云等）也需要在控制台放行 80 和 443 端口。

### 2.11 完成

浏览器访问 `https://你的域名`，应该能看到博客首页。

管理后台入口：点击导航栏「博主登录」，使用你设置的 `ADMIN_PASSWORD` 登录。

---

## 三、方案 B：纯命令行部署（适合有 Linux 经验者）

### 3.1 SSH 登录并更新系统

```bash
ssh root@你的服务器IP

# Ubuntu/Debian
apt update && apt upgrade -y

# CentOS
yum update -y
```

### 3.2 安装 Node.js 20.x LTS

```bash
# 使用 NodeSource 仓库安装
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v   # 应输出 v20.x.x
npm -v    # 应输出 10.x.x
```

如果是 CentOS：
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

### 3.3 安装必要工具

```bash
# better-sqlite3 需要编译工具
sudo apt install -y build-essential python3 git

# 安装 PM2（进程守护）
sudo npm install -g pm2

# 安装 Nginx
sudo apt install -y nginx
```

### 3.4 创建项目目录 & 部署代码

```bash
# 创建目录
sudo mkdir -p /var/www/greentech-blog
sudo chown $USER:$USER /var/www/greentech-blog

# 克隆项目
cd /var/www
git clone <你的 Git 仓库地址> greentech-blog
```

### 3.5 安装依赖 & 构建

```bash
cd /var/www/greentech-blog

# 安装依赖
npm install

# 构建前端
npm run build

# 初始化数据库
npm run db:setup
```

### 3.6 创建 .env 文件

```bash
cat > /var/www/greentech-blog/.env << 'EOF'
JWT_SECRET="你的随机密钥_至少32位随机字符"
ADMIN_PASSWORD="你的管理员密码"
API_PORT=3001
GEMINI_API_KEY="你的_GEMINI_KEY（可选）"
EOF
```

> 生成随机密钥：`openssl rand -base64 32`

### 3.7 配置 PM2 守护进程

```bash
# 启动项目
cd /var/www/greentech-blog
pm2 start npm --name "greentech-blog" -- start

# 保存进程列表，服务器重启后自动恢复
pm2 save

# 设置开机自启
pm2 startup
# 执行输出的那行 sudo 命令
```

常用 PM2 命令：
```bash
pm2 status          # 查看运行状态
pm2 logs greentech-blog   # 查看日志
pm2 restart greentech-blog   # 重启
pm2 stop greentech-blog      # 停止
```

### 3.8 配置 Nginx 反向代理

```bash
sudo nano /etc/nginx/sites-available/greentech-blog
```

粘贴以下配置：

```nginx
server {
    listen 80;
    server_name blog.yourdomain.com;   # 改成你的域名

    client_max_body_size 20m;

    # 静态资源缓存
    location /assets {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 反向代理到 Node.js
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/greentech-blog /etc/nginx/sites-enabled/
sudo nginx -t            # 测试配置
sudo systemctl reload nginx
```

### 3.9 配置 SSL 证书（Let's Encrypt）

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 申请证书（自动配置 Nginx）
sudo certbot --nginx -d blog.yourdomain.com

# 设置自动续期
sudo certbot renew --dry-run
```

### 3.10 防火墙

```bash
# Ubuntu (ufw)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

**不要忘记在云服务商控制台的安全组中放行 80 和 443 端口！**

### 3.11 完成

浏览器访问 `https://你的域名`，确认部署成功。

---

## 四、常见问题与排查

### Q1：npm install 报错（better-sqlite3 编译失败）

```bash
# 确保安装了编译工具
sudo apt install -y build-essential python3

# 清理后重试
rm -rf node_modules package-lock.json
npm install
```

### Q2：启动后页面 404

检查 `dist` 目录是否存在：
```bash
ls -la /var/www/greentech-blog/dist/
```

如果没有，重新构建：
```bash
npm run build
```

### Q3：图片上传失败

1. 检查 `public/uploads` 目录权限：
   ```bash
   chmod 755 /var/www/greentech-blog/public/uploads
   ```
2. Nginx 配置中确保 `client_max_body_size` 足够大（建议 20m）

### Q4：数据库被锁定 / SQLITE_BUSY

项目已开启 WAL 模式，一般情况下不会出现。如果出现，重启进程即可：
```bash
pm2 restart greentech-blog
```

### Q5：如何更新部署

```bash
cd /var/www/greentech-blog

# 拉取最新代码
git pull

# 安装新依赖（如有）
npm install

# 重新构建前端
npm run build

# 重启服务
pm2 restart greentech-blog
```

### Q6：数据库文件需要备份吗？

必须备份！SQLite 数据全部在单个文件中：

```bash
# 手动备份
cp /var/www/greentech-blog/.data/greentech.db ~/backup/greentech-$(date +%Y%m%d).db

# 设置定时备份（crontab）
0 3 * * * cp /var/www/greentech-blog/.data/greentech.db ~/backup/greentech-$(date +\%Y\%m\%d).db
```

---

## 五、项目文件结构说明

```
greentech-blog/
├── server/               # 后端
│   ├── index.ts          # Express 入口
│   ├── routes/           # API 路由
│   │   ├── articles.ts   # 文章 CRUD
│   │   ├── auth.ts       # 认证
│   │   ├── profile.ts    # 博主资料
│   │   ├── stats.ts      # 访问统计
│   │   └── upload.ts     # 图片上传
│   ├── db/
│   │   ├── index.ts      # 数据库连接
│   │   └── schema.ts     # 表结构定义
│   ├── migrate.ts        # 建表脚本
│   └── seed.ts           # 种子数据
├── src/                  # 前端（React）
├── dist/                 # 构建产物（部署时必需要有）
├── public/uploads/       # 上传文件目录（需要写权限）
├── .data/                # SQLite 数据库文件（需要读写权限）
│   └── greentech.db
├── .env                  # 环境变量（需手动创建）
├── package.json
└── vite.config.ts
```

---

## 六、快速检查清单

部署完成后，逐项确认：

- [ ] Node.js 版本 >= 18.x
- [ ] `npm install` 无报错
- [ ] `npm run build` 构建成功，`dist/` 目录存在
- [ ] `npm run db:setup` 数据库初始化成功，`.data/greentech.db` 存在
- [ ] `.env` 文件已创建，JWT_SECRET 已修改
- [ ] PM2 进程状态为 online
- [ ] Nginx 反向代理配置正确
- [ ] SSL 证书已申请并生效
- [ ] 80 / 443 端口已开放（服务器防火墙 + 云安全组）
- [ ] 域名 DNS 已解析到服务器 IP
- [ ] 浏览器访问 `https://你的域名` 正常显示

---

> **最后提醒**：部署完成后记得把默认的 `ADMIN_PASSWORD` 和 `JWT_SECRET` 改成安全的随机值！
