import express from 'express';
import path from 'path';
import { articlesRouter } from './routes/articles';
import { profileRouter } from './routes/profile';
import { statsRouter } from './routes/stats';
import { authRouter } from './routes/auth';
import { uploadRouter } from './routes/upload';

const app = express();
const PORT = process.env.API_PORT ? parseInt(process.env.API_PORT) : 3001;

// 中间件
app.use(express.json({ limit: '10mb' }));

// 静态文件：上传的图片
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// API 路由
app.use('/api/articles', articlesRouter);
app.use('/api/profile', profileRouter);
app.use('/api/stats', statsRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);

// 生产环境：托管前端静态文件
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// SPA fallback：非 API 请求返回 index.html
app.get(/^\/(?!api\/|uploads\/).*/, (_req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('GreenTech Blog API is running. Frontend available at http://localhost:' + PORT);
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 GreenTech Blog API server running on http://0.0.0.0:${PORT}`);
  console.log(`   Database: .data/greentech.db`);
  console.log(`   Uploads:  public/uploads/`);
});
