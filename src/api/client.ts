/**
 * API 客户端 —— 封装所有后端请求
 *
 * 安全规则：
 * - 公开接口（GET 文章/资料/统计）无需 token
 * - 管理接口（CRUD 文章/资料）需 Bearer token
 * - 密码验证通过后，token 存储在 localStorage 中
 */

const API_BASE = '/api';

// ---- Token 管理 ----

function getToken(): string | null {
  return localStorage.getItem('greentech_token');
}

export function setToken(token: string): void {
  localStorage.setItem('greentech_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('greentech_token');
}

export function hasToken(): boolean {
  return !!getToken();
}

// ---- 通用请求 ----

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `请求失败 (${res.status})`);
  }

  return res.json();
}

// ---- 类型 ----

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage?: string;
  tags: string[];
  category: string;
  createTime: string;
  updateTime: string;
  readTime: number;
  status: 'published' | 'draft';
  views: number;
}

export interface TechItem {
  name: string;
  category: 'Language' | 'Framework' | 'Tool' | 'Database';
  icon: string;
  proficiency: number;
}

export interface BloggerProfile {
  name: string;
  avatar: string;
  title: string;
  bio: string;
  githubUrl: string;
  techStack: TechItem[];
}

export interface VisitorStats {
  date: string;
  pv: number;
}

// ---- 文章 API ----

export async function fetchArticles(admin = false): Promise<Article[]> {
  const query = admin ? '?admin=true' : '';
  return request<Article[]>(`/articles${query}`);
}

export async function fetchArticle(id: string): Promise<Article> {
  return request<Article>(`/articles/${id}`);
}

export async function saveArticle(article: Article): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/articles/${article.id}`, {
    method: 'PUT',
    body: JSON.stringify(article),
  });
}

export async function deleteArticle(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/articles/${id}`, {
    method: 'DELETE',
  });
}

export async function incrementArticleView(id: string): Promise<{ views: number }> {
  return request<{ views: number }>(`/articles/${id}/view`, {
    method: 'POST',
  });
}

// ---- 资料 API ----

export async function fetchProfile(): Promise<BloggerProfile | null> {
  return request<BloggerProfile | null>('/profile');
}

export async function saveProfile(profile: BloggerProfile): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
}

// ---- 统计 API ----

export async function fetchStats(): Promise<VisitorStats[]> {
  return request<VisitorStats[]>('/stats');
}

export async function recordPV(): Promise<{ success: boolean; date: string }> {
  return request<{ success: boolean; date: string }>('/stats/pv', {
    method: 'POST',
  });
}

// ---- 认证 API ----

export async function login(password: string): Promise<{ success: boolean; token: string }> {
  const result = await request<{ success: boolean; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  if (result.token) {
    setToken(result.token);
  }
  return result;
}

export async function verifyToken(): Promise<boolean> {
  try {
    const result = await request<{ valid: boolean }>('/auth/verify');
    return result.valid;
  } catch {
    return false;
  }
}

export function logout(): void {
  clearToken();
}

// ---- 上传 API ----

/** 上传封面图片，返回可访问的 URL */
export async function uploadCoverImage(file: File): Promise<{ url: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: '上传失败' }));
    throw new Error(body.error || `上传失败 (${res.status})`);
  }

  return res.json();
}
