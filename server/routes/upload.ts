import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/** 判断路径是否为本地已上传的文件（相对路径，以 /uploads/ 开头） */
function isLocalUploadPath(url: string): boolean {
  return typeof url === 'string' && url.startsWith('/uploads/');
}

/** 将相对 URL 路径转换为绝对磁盘路径 */
function toAbsolutePath(relativeUrl: string): string {
  return path.join(process.cwd(), 'public', relativeUrl);
}

/** 安全删除旧的本地图片文件 */
function deleteOldFile(avatarUrl: string | undefined | null): void {
  if (!avatarUrl || !isLocalUploadPath(avatarUrl)) return;
  const absolutePath = toAbsolutePath(avatarUrl);
  try {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(`🗑️  已删除旧文件: ${avatarUrl}`);
    }
  } catch (err) {
    console.warn(`⚠️  删除旧文件失败: ${avatarUrl}`, err);
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('仅支持 JPG / PNG / GIF / WebP / SVG 格式'));
    }
  },
});

export const uploadRouter = Router();

/** 上传封面图片（需登录），返回可访问的 URL 路径 */
uploadRouter.post('/', authMiddleware, (req: Request, res: Response) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: '文件大小不能超过 5MB' });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: '请选择要上传的图片' });
      return;
    }

    const url = `/uploads/${req.file.filename}`;
    res.json({ success: true, url, filename: req.file.filename });
  });
});

/** 上传博主头像（需登录），自动删除旧头像文件，返回相对路径 */
uploadRouter.post('/avatar', authMiddleware, (req: Request, res: Response) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: '文件大小不能超过 5MB' });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: '请选择要上传的头像图片' });
      return;
    }

    // 查询当前博主资料，获取旧头像路径
    const profile = db.select().from(schema.profile).where(eq(schema.profile.id, 1)).get();

    // 删除旧头像文件（如果存在且是本地文件）
    if (profile?.avatar) {
      deleteOldFile(profile.avatar);
    }

    // 返回相对路径，数据库只存相对路径
    const url = `/uploads/${req.file.filename}`;
    res.json({ success: true, url, filename: req.file.filename });
  });
});
