import { Router, Request, Response } from 'express';
import { signToken } from '../middleware/auth';

export const authRouter = Router();

/** 管理员登录 */
authRouter.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

  if (password === ADMIN_PASSWORD) {
    const token = signToken();
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: '密码错误' });
  }
});

/** 验证 token 是否有效 */
authRouter.get('/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.json({ valid: false });
    return;
  }

  try {
    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET || 'greentech-blog-secret-key-2026');
    res.json({ valid: true });
  } catch {
    res.json({ valid: false });
  }
});
