export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage?: string;
  tags: string[];
  category: string;
  createTime: string; // YYYY-MM-DD HH:mm:ss
  updateTime: string;
  readTime: number; // estimated reading minutes
  status: 'published' | 'draft';
  views: number;
}

export interface TechItem {
  name: string;
  category: 'Language' | 'Framework' | 'Tool' | 'Database';
  icon: string; // Lucide icon name or emoji or clean short text
  proficiency: number; // 1 to 5 stars or lights
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
  date: string; // YYYY-MM-DD
  pv: number;
}
