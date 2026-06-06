import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Article, BloggerProfile, VisitorStats, TechItem } from '../types';
import { uploadCoverImage, uploadAvatar } from '../api/client';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Plus, Edit, Trash2, Save, FileText, Layout, Users,
  Eye, CheckCircle, HelpCircle, ArrowLeft, Image, FileEdit,
  Tag, Compass, Check, AlertTriangle, EyeOff, Sparkles, User, Github, Sparkle, Upload, X
} from 'lucide-react';

interface AdminDashboardProps {
  articles: Article[];
  profile: BloggerProfile;
  visitorStats: VisitorStats[];
  onSaveArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onUpdateProfile: (profile: BloggerProfile) => void;
  onBackToBlog: () => void;
  isDarkMode: boolean;
}

export function AdminDashboard({
  articles,
  profile,
  visitorStats,
  onSaveArticle,
  onDeleteArticle,
  onUpdateProfile,
  onBackToBlog,
  isDarkMode
}: AdminDashboardProps) {
  // Tabs: 'posts' | 'editor' | 'profile'
  const [activeTab, setActiveTab] = useState<'posts' | 'editor' | 'profile'>('posts');

  // Stats
  const totalPosts = articles.length;
  const publishedPostsCount = articles.filter(a => a.status === 'published').length;
  const draftPostsCount = articles.filter(a => a.status === 'draft').length;
  const totalViewsNum = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  // --- 1. Articles list management ---
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // --- 2. Article Editor Form state ---
  const [editArticleId, setEditArticleId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** 选择本地图片上传 */
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadCoverImage(file);
      setFormCoverImage(result.url);
    } catch (err: any) {
      alert(err.message || '上传失败');
    } finally {
      setUploading(false);
      // 重置 input 以便同一文件可重复选
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [editorPreviewMode, setEditorPreviewMode] = useState<boolean>(true); // Split view or Write only

  // --- 3. Profile Modification state ---
  const [profName, setProfName] = useState(profile.name);
  const [profAvatar, setProfAvatar] = useState(profile.avatar);
  const [profTitle, setProfTitle] = useState(profile.title);
  const [profBio, setProfBio] = useState(profile.bio);
  const [profGithub, setProfGithub] = useState(profile.githubUrl);
  const [profAvatarUploading, setProfAvatarUploading] = useState(false);
  const profAvatarInputRef = useRef<HTMLInputElement>(null);
  // Stack editing
  const [profTech, setProfTech] = useState<TechItem[]>([...profile.techStack]);
  const [saveProfileSuccess, setSaveProfileSuccess] = useState(false);

  // New States for adding tech items
  const [newTechName, setNewTechName] = useState('');
  const [newTechCategory, setNewTechCategory] = useState<'Language' | 'Framework' | 'Tool' | 'Database'>('Language');
  const [newTechIcon, setNewTechIcon] = useState('Code');
  const [newTechProficiency, setNewTechProficiency] = useState(4);

  // --- ECharts for Visitor PV ---
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || activeTab !== 'posts') return;

    // Standard ECharts Init
    const myChart = echarts.init(chartRef.current, isDarkMode ? 'dark' : undefined);

    // Prepare data
    const xAxisData = visitorStats.map(s => s.date);
    const yAxisData = visitorStats.map(s => s.pv);

    const option = {
      backgroundColor: 'transparent',
      title: {
        text: '近 7 日访客统计 (PV)',
        left: 'left',
        textStyle: {
          color: isDarkMode ? '#e4e4e7' : '#18181b',
          fontSize: 14,
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#10b981',
            width: 1,
            type: 'dashed'
          }
        },
        padding: [8, 12],
        backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
        borderColor: '#10b981',
        borderWidth: 1,
        textStyle: {
          color: isDarkMode ? '#f4f4f5' : '#18181b',
          fontSize: 12
        }
      },
      grid: {
        top: '18%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: isDarkMode ? '#27272a' : '#e4e4e7'
          }
        },
        axisLabel: {
          color: isDarkMode ? '#a1a1aa' : '#71717a',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: {
            color: isDarkMode ? '#27272a' : '#f4f4f5'
          }
        },
        axisLabel: {
          color: isDarkMode ? '#a1a1aa' : '#71717a',
          fontSize: 11
        }
      },
      series: [
        {
          name: '每日访问量',
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#10b981',
            borderColor: '#34d399',
            borderWidth: 2
          },
          lineStyle: {
            color: '#10b981',
            width: 3
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(16, 185, 129, 0.25)'
              },
              {
                offset: 1,
                color: 'rgba(16, 185, 129, 0.01)'
              }
            ])
          },
          data: yAxisData
        }
      ]
    };

    myChart.setOption(option);

    const handleResize = () => {
      myChart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    };
  }, [visitorStats, isDarkMode, activeTab]);

  // Load clean article for creationor editing
  const initArticleForm = (article?: Article) => {
    if (article) {
      setEditArticleId(article.id);
      setFormTitle(article.title);
      setFormSummary(article.summary);
      setFormContent(article.content);
      setFormCoverImage(article.coverImage || '');
      setFormCategory(article.category);
      setFormTags(article.tags.join(', '));
      setFormStatus(article.status);
    } else {
      // Empty slate
      setEditArticleId(null);
      setFormTitle('');
      setFormSummary('');
      setFormContent(
        `# 新文章标题\n\n在此输入 Markdown 内容。支持代码高亮与自动二级结构提取。\n\n## 第一章节\n内容段落...\n\n\`\`\`javascript\nconsole.log("Hello, World!");\n\`\`\`\n\n## 另一个段落\n- 带标签列表\n- 自动提取到侧边栏目录`
      );
      setFormCoverImage('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80');
      setFormCategory('Tech');
      setFormTags('TypeScript, WebDev');
      setFormStatus('published');
    }
    setActiveTab('editor');
  };

  // Article form submission
  const handleSaveArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    // Compute average read time
    const words = formContent.trim().length;
    const estimatedMinutes = Math.max(1, Math.ceil(words / 400));

    // Compile tag strings to list safely
    const compiledTags = formTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    const savedArticle: Article = {
      id: editArticleId || `article-${Date.now()}`,
      title: formTitle,
      summary: formSummary || formContent.slice(0, 100).replace(/[#*`]/g, '') + '...',
      content: formContent,
      coverImage: formCoverImage || undefined,
      tags: compiledTags,
      category: formCategory || 'General',
      createTime: editArticleId
        ? (articles.find(a => a.id === editArticleId)?.createTime || formattedDate)
        : formattedDate,
      updateTime: formattedDate,
      readTime: estimatedMinutes,
      status: formStatus,
      views: editArticleId ? (articles.find(a => a.id === editArticleId)?.views || 0) : 0
    };

    onSaveArticle(savedArticle);
    setActiveTab('posts');
  };

  // Article deletion with double check
  const handleDeleteTrigger = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDeleteArticle(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // Blogger profile updating
  /** 上传头像图片 */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfAvatarUploading(true);
    try {
      const result = await uploadAvatar(file);
      setProfAvatar(result.url);
    } catch (err: any) {
      alert(err.message || '头像上传失败');
    } finally {
      setProfAvatarUploading(false);
      if (profAvatarInputRef.current) profAvatarInputRef.current.value = '';
    }
  };

  // Blogger profile updating
  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BloggerProfile = {
      name: profName,
      avatar: profAvatar,
      title: profTitle,
      bio: profBio,
      githubUrl: profGithub,
      techStack: profTech
    };
    onUpdateProfile(updated);
    setSaveProfileSuccess(true);
    setTimeout(() => setSaveProfileSuccess(false), 2500);
  };

  // Skill score changes in stack list
  const handleSkillScoreChange = (index: number, val: number) => {
    const updated = [...profTech];
    updated[index].proficiency = val;
    setProfTech(updated);
  };

  const [techItemError, setTechItemError] = useState('');

  const handleAddNewTechItem = () => {
    setTechItemError('');
    if (!newTechName.trim()) {
      setTechItemError('请输入技术项名称');
      return;
    }
    const itemExists = profTech.some(item => item.name.toLowerCase() === newTechName.trim().toLowerCase());
    if (itemExists) {
      setTechItemError('该技术项已存在！');
      return;
    }
    const newItem: TechItem = {
      name: newTechName.trim(),
      category: newTechCategory,
      icon: newTechIcon || 'Code',
      proficiency: newTechProficiency
    };
    setProfTech([...profTech, newItem]);
    setNewTechName('');
    setNewTechIcon('Code');
    setNewTechProficiency(4);
  };

  const handleDeleteTechItem = (index: number) => {
    const updated = profTech.filter((_, idx) => idx !== index);
    setProfTech(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBackToBlog}
            className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 mb-2 group cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            返回前台博客
          </button>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            <Layout className="text-emerald-500 w-6 h-6" />
            GreenGlue 管理中心
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">控制内容分发、管理发布状态、校正技术属性与访问跟踪</p>
        </div>

        {/* Dashboard Menu Selector tabs */}
        <div className="flex bg-zinc-100/80 dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200/40 dark:border-zinc-800/60 self-start sm:self-center select-none text-xs">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === 'posts'
                ? 'bg-white dark:bg-zinc-950 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
          >
            文章管理
          </button>
          <button
            onClick={() => initArticleForm()}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === 'editor'
                ? 'bg-white dark:bg-zinc-950 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
          >
            写作后台 Markdown
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === 'profile'
                ? 'bg-white dark:bg-zinc-950 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
          >
            博主简历修改
          </button>
        </div>
      </div>

      {/* --- TAB 1: ARTICLES MANAGEMENT --- */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-zinc-400 dark:text-zinc-400 font-medium">总文章数</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-mono">{totalPosts}</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-teal-500/5 border border-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-450 shadow-inner">
                <CheckCircle size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-zinc-400 dark:text-zinc-400 font-medium">已公开</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-mono">{publishedPostsCount}</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-450 shadow-inner">
                <EyeOff size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-zinc-400 dark:text-zinc-400 font-medium">草稿箱</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-mono">{draftPostsCount}</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                <Eye size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-zinc-400 dark:text-zinc-400 font-medium">总阅读PV</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-mono">{totalViewsNum}</span>
              </div>
            </div>
          </div>

          {/* PV Trend Line Chart (ECharts wrapper) */}
          <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div ref={chartRef} className="w-full h-72 sm:h-80" />
          </div>

          {/* Core Table Grid layout of articles */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-900/60 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm flex items-center gap-2">
                <FileText size={15} className="text-emerald-500" />
                文章全量库
              </h3>
              <button
                onClick={() => initArticleForm()}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/15"
              >
                <Plus size={14} />
                发布新文章
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-900 text-xs sm:text-sm">
                <thead className="bg-zinc-50/50 dark:bg-zinc-900/30">
                  <tr className="font-mono text-zinc-500 dark:text-zinc-450 uppercase text-[10px]">
                    <th scope="col" className="px-6 py-3.5 text-left font-bold">标题 & 摘要</th>
                    <th scope="col" className="px-6 py-3.5 text-left font-bold">发布状态</th>
                    <th scope="col" className="px-6 py-3.5 text-left font-bold">创建时刻</th>
                    <th scope="col" className="px-6 py-3.5 text-left font-bold">累计 PV</th>
                    <th scope="col" className="px-6 py-3.5 scope-center font-bold text-right">操作行为</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col max-w-sm sm:max-w-md">
                          <span
                            onClick={() => initArticleForm(art)}
                            className="font-bold text-zinc-900 dark:text-zinc-150 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer truncate"
                          >
                            {art.title}
                          </span>
                          <span className="text-zinc-400 text-xs truncate mt-0.5">{art.summary}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {art.status === 'published' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            已公布
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-zinc-500 font-semibold font-mono text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                            草稿
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-450 font-mono text-xs">
                        {art.createTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400 font-mono font-bold text-xs">
                        {art.views || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        {deleteConfirmId === art.id ? (
                          <div className="flex items-center justify-end gap-1.5 animate-scale-up">
                            <span className="text-rose-500 font-semibold text-[10px] flex items-center gap-0.5">
                              <AlertTriangle size={11} /> 确认删除？
                            </span>
                            <button
                              onClick={handleDeleteConfirm}
                              className="px-2 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer"
                            >
                              是
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded cursor-pointer"
                            >
                              否
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => initArticleForm(art)}
                              className="p-1 px-2 rounded-lg border border-zinc-100 hover:border-emerald-500/30 text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 hover:bg-emerald-500/5 transition-colors cursor-pointer inline-flex items-center gap-1 text-xs"
                              title="编辑"
                            >
                              <Edit size={12} />
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteTrigger(art.id)}
                              className="p-1 px-2 rounded-lg border border-zinc-100 hover:border-rose-500/30 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 hover:bg-rose-500/5 transition-colors cursor-pointer inline-flex items-center gap-1 text-xs"
                              title="删除"
                            >
                              <Trash2 size={12} />
                              删除
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {articles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-zinc-400 font-mono text-xs">
                        暂无文章数据。点击右上角“发布新文章”按钮以录入内容。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: MARKDOWN WRITER & PREVIEWER --- */}
      {activeTab === 'editor' && (
        <form onSubmit={handleSaveArticleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">

            {/* Action headers */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900/60 pb-3">
              <div className="flex items-center gap-2">
                <FileEdit className="text-emerald-500 w-5 h-5 animate-pulse" />
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">
                  {editArticleId ? '正在修订技术档案' : '创作全新技术文档'}
                </h3>
              </div>

              <div className="flex items-center gap-2 select-none">
                <button
                  type="button"
                  onClick={() => setEditorPreviewMode(!editorPreviewMode)}
                  className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900 text-[11px] font-semibold text-zinc-650 dark:text-zinc-350 hover:text-emerald-600 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Eye size={12} />
                  {editorPreviewMode ? '双栏预览: 开启' : '关闭预览'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('posts')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-md shadow-emerald-500/15"
                >
                  <Save size={14} />
                  保存并返回
                </button>
              </div>
            </div>

            {/* Title & Cover */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">文章标题 *</label>
                <input
                  type="text"
                  required
                  placeholder="标题需要有概括性..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs sm:text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Image size={12} /> 封面图片
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="shrink-0 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-600 hover:text-emerald-600 hover:border-emerald-500/30 disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    {uploading ? (
                      <><span className="w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin" /> 上传中...</>
                    ) : (
                      <><Upload size={13} /> 本地上传</>
                    )}
                  </button>
                  <input
                    type="url"
                    placeholder="或粘贴外部图片 URL..."
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs sm:text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  {formCoverImage && (
                    <button
                      type="button"
                      onClick={() => setFormCoverImage('')}
                      className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition-colors"
                      title="清除封面图"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {formCoverImage && (
                  <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100">
                    <img src={formCoverImage} alt="封面预览" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Category & Tags & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Compass size={12} /> 分类 (Category)
                </label>
                <input
                  type="text"
                  placeholder="如 Vue, React, Vite, Tooling"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs sm:text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Tag size={12} /> 标签 (Tags, 逗号分隔)
                </label>
                <input
                  type="text"
                  placeholder="如 TypeScript, CompositionAPI, Optimization"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs sm:text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">发布状态</label>
                <div className="grid grid-cols-2 gap-2 mt-0.5">
                  <button
                    type="button"
                    onClick={() => setFormStatus('published')}
                    className={`py-1.5 rounded-lg font-semibold text-xs border cursor-pointer transition-colors ${formStatus === 'published'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900 text-zinc-505 dark:text-zinc-400'
                      }`}
                  >
                    公开 (Published)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('draft')}
                    className={`py-1.5 rounded-lg font-semibold text-xs border cursor-pointer transition-colors ${formStatus === 'draft'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                        : 'border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900 text-zinc-505 dark:text-zinc-400'
                      }`}
                  >
                    存入草稿 (Draft)
                  </button>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">文章摘要 / 简介</label>
              <textarea
                rows={2}
                placeholder="在此输入文章的核心简介。建议控制在 100-150 字以内做精细展示..."
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs sm:text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Split Content Writer Area! Left: raw Markdown edit, Right: Live view rendering! */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">文章正文 Markdown 语法编写</label>
              <div className={`grid grid-cols-1 ${editorPreviewMode ? 'lg:grid-cols-2' : ''} gap-4 mt-1 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden`}>

                {/* Writing side */}
                <div className="flex flex-col bg-zinc-50/20 dark:bg-zinc-950 p-2 border-r border-zinc-200 dark:border-zinc-800">
                  <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-[10px] text-zinc-550 border rounded-md self-start font-mono mb-2">编写板 (Raw Input)</div>
                  <textarea
                    rows={18}
                    required
                    placeholder="开始书写正文..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full h-[500px] px-3 py-2 bg-transparent text-xs sm:text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none font-mono resize-none leading-relaxed overflow-y-auto"
                  />
                </div>

                {/* Previews side */}
                {editorPreviewMode && (
                  <div className="flex flex-col bg-white dark:bg-zinc-950 p-4 max-h-[550px] overflow-y-auto">
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold rounded-md self-start font-mono mb-4 flex items-center gap-1 select-none">
                      <Sparkles size={11} className="animate-spin-slow" />
                      实时编译渲染预览 (Live Preview)
                    </div>
                    {formContent ? (
                      <MarkdownRenderer content={formContent} />
                    ) : (
                      <span className="text-zinc-400 italic text-xs py-10 text-center select-none">正文为空时，此处自动显示占位图示说明</span>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        </form>
      )}

      {/* --- TAB 3: BLOGGER SPEC EDITING --- */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main profile form */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm border-b border-zinc-100 dark:border-zinc-900 pb-2 flex items-center gap-2">
              <User size={15} className="text-emerald-500" />
              个人主页与技术栈配置修改
            </h3>

            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-650 mb-1">博主名称</label>
                  <input
                    type="text"
                    required
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs sm:text-sm text-zinc-900 dark:text-zinc-55 focus:outline-none focus:border-emerald-500 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-650 mb-1">头像图片</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={profAvatarInputRef}
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => profAvatarInputRef.current?.click()}
                      disabled={profAvatarUploading}
                      className="shrink-0 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-600 hover:text-emerald-600 hover:border-emerald-500/30 disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      {profAvatarUploading ? (
                        <><span className="w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin" /> 上传中</>
                      ) : (
                        <><Upload size={13} /> 上传</>
                      )}
                    </button>
                    <input
                      type="url"
                      required
                      value={profAvatar}
                      onChange={(e) => setProfAvatar(e.target.value)}
                      placeholder="或粘贴外部头像 URL..."
                      className="flex-1 px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs sm:text-sm text-zinc-900 dark:text-zinc-55 focus:outline-none focus:border-emerald-500 rounded-lg"
                    />
                    {profAvatar && (
                      <button
                        type="button"
                        onClick={() => setProfAvatar('')}
                        className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition-colors"
                        title="清除头像"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {profAvatar && (
                    <div className="mt-2 w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/30 bg-zinc-100">
                      <img src={profAvatar} alt="头像预览" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-650 mb-1">专业技术头衔</label>
                  <input
                    type="text"
                    required
                    value={profTitle}
                    onChange={(e) => setProfTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs sm:text-sm text-zinc-900 dark:text-zinc-55 focus:outline-none focus:border-emerald-500 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-650 mb-1 flex items-center gap-1">
                    <Github size={12} /> GitHub 主页 Url
                  </label>
                  <input
                    type="url"
                    required
                    value={profGithub}
                    onChange={(e) => setProfGithub(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs sm:text-sm text-zinc-900 dark:text-zinc-55 focus:outline-none focus:border-emerald-500 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-655 mb-1">简介 (Bio / Description)</label>
                <textarea
                  rows={4}
                  required
                  value={profBio}
                  onChange={(e) => setProfBio(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs sm:text-sm text-zinc-900 dark:text-zinc-55 focus:outline-none focus:border-emerald-500 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-md"
                >
                  <Check size={14} />
                  保存博主履历
                </button>
              </div>

              {saveProfileSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-lg flex items-center gap-1 mb-2">
                  <Check size={14} /> Profile metadata saved successfully! Your frontpage about details are freshly updated.
                </div>
              )}
            </form>
          </div>

          {/* Proficiency controls (visual score editor) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-1.5 pb-2 border-b border-zinc-100 dark:border-zinc-900">
                  <Sparkle size={13} className="text-emerald-500 animate-spin-slow" />
                  当前技术栈列表 ({profTech.length} 项)
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  点击等级圆圈快捷调整等级（1至5），或点击垃圾桶按钮删除该技能。
                </p>
              </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                {profTech.map((item, index) => (
                  <div key={index} className="flex flex-col gap-2 p-3.5 border border-zinc-150 rounded-xl bg-zinc-50/55 shadow-sm transition-all hover:border-emerald-500/25">
                    {/* First line: Name & Category */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="text-[9px] text-zinc-400 block font-semibold mb-0.5 uppercase tracking-wide">技术名称</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...profTech];
                            updated[index].name = e.target.value;
                            setProfTech(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-zinc-200 rounded-md text-xs font-medium text-zinc-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-400 block font-semibold mb-0.5 uppercase tracking-wide">技术分类</label>
                        <select
                          value={item.category}
                          onChange={(e) => {
                            const updated = [...profTech];
                            updated[index].category = e.target.value as any;
                            setProfTech(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-zinc-200 rounded-md text-xs font-semibold text-zinc-800 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Language">Language (编程语言)</option>
                          <option value="Framework">Framework (框架/库)</option>
                          <option value="Tool">Tool (开发工具)</option>
                          <option value="Database">Database (数据库)</option>
                        </select>
                      </div>
                    </div>

                    {/* Second line: Icon & Proficiency */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] items-end">
                      <div>
                        <label className="text-[9px] text-zinc-400 block font-semibold mb-0.5 uppercase tracking-wide">图标风格</label>
                        <select
                          value={item.icon}
                          onChange={(e) => {
                            const updated = [...profTech];
                            updated[index].icon = e.target.value;
                            setProfTech(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-zinc-200 rounded-md text-xs font-semibold text-zinc-800 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Code">Code (通用代码)</option>
                          <option value="FileCode">FileCode (文件代码)</option>
                          <option value="Layers">Layers (分层架构)</option>
                          <option value="Atom">Atom (React/响应式)</option>
                          <option value="Server">Server (Node/服务端)</option>
                          <option value="Zap">Zap (Vite极速闪电)</option>
                          <option value="Palette">Palette (设计/Tailwind)</option>
                          <option value="BarChart3">BarChart3 (ECharts图表)</option>
                          <option value="GitBranch">GitBranch (Git版本管理)</option>
                          <option value="Container">Container (隔离容器/Docker)</option>
                          <option value="Database">Database (存储/数据库)</option>
                          <option value="DatabaseBackup">DatabaseBackup (备份云包)</option>
                          <option value="Cpu">Cpu (编译核心/wasm)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-400 block font-semibold mb-1 uppercase tracking-wide">星级 & 操作</label>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex gap-1 items-center">
                            {[1, 2, 3, 4, 5].map((stars) => {
                              const isHighlighted = stars <= item.proficiency;
                              return (
                                <button
                                  key={stars}
                                  type="button"
                                  onClick={() => handleSkillScoreChange(index, stars)}
                                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 border cursor-pointer flex items-center justify-center ${isHighlighted
                                      ? 'bg-gradient-to-tr from-emerald-500 to-emerald-600 border-emerald-500 text-white text-[8px] font-bold shadow-sm scale-[1.05]'
                                      : 'bg-zinc-200/60 border-zinc-300 text-zinc-600 hover:border-emerald-500/50 text-[8px]'
                                    }`}
                                >
                                  {stars}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteTechItem(index)}
                            className="text-zinc-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                            title="删除该技能"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {profTech.length === 0 && (
                  <div className="py-8 text-center text-xs text-zinc-400">
                    当前列表为空，请通过下方模块添加。
                  </div>
                )}
              </div>
            </div>

            {/* Addition module */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-1.5">
                  <Plus size={14} className="text-emerald-500" />
                  新增技能标签至技术墙
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  扩展与定义您的技术底座，实时同步至首页技能墙中
                </p>
              </div>

              {techItemError && (
                <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 text-[11px] text-rose-500 rounded-lg">
                  ⚠ {techItemError}
                </div>
              )}

              <div className="space-y-3.5 text-xs text-zinc-700 dark:text-zinc-300">
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">技术项名称 (Name)</label>
                  <input
                    type="text"
                    placeholder="例如: Svelte, Docker, NestJS"
                    value={newTechName}
                    onChange={(e) => {
                      setNewTechName(e.target.value);
                      setTechItemError('');
                    }}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">技术分类</label>
                    <select
                      value={newTechCategory}
                      onChange={(e) => setNewTechCategory(e.target.value as any)}
                      className="w-full px-2 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 rounded-md"
                    >
                      <option value="Language">Language (编程语言)</option>
                      <option value="Framework">Framework (框架/库)</option>
                      <option value="Tool">Tool (开发工具)</option>
                      <option value="Database">Database (数据库)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">图标风格</label>
                    <select
                      value={newTechIcon}
                      onChange={(e) => setNewTechIcon(e.target.value)}
                      className="w-full px-2 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 rounded-md"
                    >
                      <option value="Code">Code (通用代码)</option>
                      <option value="FileCode">FileCode (文件代码)</option>
                      <option value="Layers">Layers (分层架构)</option>
                      <option value="Atom">Atom (React/响应式)</option>
                      <option value="Server">Server (Node/服务端)</option>
                      <option value="Zap">Zap (Vite极速闪电)</option>
                      <option value="Palette">Palette (设计/Tailwind)</option>
                      <option value="BarChart3">BarChart3 (ECharts图表)</option>
                      <option value="GitBranch">GitBranch (Git版本管理)</option>
                      <option value="Container">Container (隔离容器/Docker)</option>
                      <option value="Database">Database (存储/数据库)</option>
                      <option value="DatabaseBackup">DatabaseBackup (备份云包)</option>
                      <option value="Cpu">Cpu (编译核心/wasm)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">设定的初始熟练度 (1至5星)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNewTechProficiency(val)}
                        className={`flex-1 py-1 text-xs font-bold border rounded-md transition-all cursor-pointer ${newTechProficiency === val
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-350 dark:hover:bg-zinc-800'
                          }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddNewTechItem}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-950 text-emerald-800 dark:text-emerald-400 font-bold rounded-lg cursor-pointer transition-all text-center text-xs shadow-sm hover:scale-[1.01]"
                >
                  确认添加至下部列表
                </button>

                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic text-center leading-relaxed">
                  添加或删除技能项后，别忘了点击左侧的「保存博主履历」按钮，将改动同步写入至前台博客和本地缓存！
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
