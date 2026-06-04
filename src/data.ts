import { Article, BloggerProfile, VisitorStats } from './types';

export const INITIAL_PROFILE: BloggerProfile = {
  name: "GreenGlue",
  avatar: "/images/avatar.jpg",
  title: "Full-Stack Engineer & Technical Writer",
  bio: "热爱开源与极简主义。长期专注于 Vue 3、React、Vite 以及云原生技术生态的研究，立志于用优雅的代码构建美好的数字化世界。",
  githubUrl: "https://github.com/oawdji",
  techStack: [
    { name: "JavaScript", category: "Language", icon: "Code", proficiency: 5 },
    { name: "TypeScript", category: "Language", icon: "FileCode", proficiency: 5 },
    { name: "Vue 3", category: "Framework", icon: "Layers", proficiency: 5 },
    { name: "React 19", category: "Framework", icon: "Atom", proficiency: 4 },
    { name: "Node.js", category: "Language", icon: "Server", proficiency: 4 },
    { name: "Vite", category: "Tool", icon: "Zap", proficiency: 5 },
    { name: "Tailwind CSS", category: "Tool", icon: "Palette", proficiency: 5 },
    { name: "ECharts", category: "Tool", icon: "BarChart3", proficiency: 4 },
    { name: "Git", category: "Tool", icon: "GitBranch", proficiency: 4 },
    { name: "Docker", category: "Tool", icon: "Container", proficiency: 3 },
    { name: "PostgreSQL", category: "Database", icon: "Database", proficiency: 4 },
    { name: "MongoDB", category: "Database", icon: "DatabaseBackup", proficiency: 3 }
  ]
};

export const INITIAL_VISITOR_STATS: VisitorStats[] = [
  { date: "05-28", pv: 145 },
  { date: "05-29", pv: 189 },
  { date: "05-30", pv: 210 },
  { date: "05-31", pv: 165 },
  { date: "06-01", pv: 280 },
  { date: "06-02", pv: 310 },
  { date: "06-03", pv: 345 }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: "vue3-best-practices",
    title: "Vue 3 组合式 API (Composition API) 与 Pinia 开发实战最佳配置",
    category: "Vue",
    tags: ["Vue3", "State Management", "TypeScript"],
    summary: "在 Vue 3 项目开发中，如何优雅地组织 Composition API 代码，以及如何结合 Pinia 和 TypeScript 实现类型安全的全局状态管理？本文将为你梳理一套高效规范的架构方案。",
    coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    createTime: "2026-06-01 10:24:00",
    updateTime: "2026-06-01 10:24:00",
    readTime: 6,
    status: "published",
    views: 1250,
    content: `# Vue 3 组合式 API 开发实战最佳配置

随着 Vue 3 的普及，其组合式 API (Composition API) 已经成为了前端组件构建的事实标准。然而，很多开发者在实际项目中面临着代码组织松散、状态流转不清晰等问题。

本文将为你深度拆解 **Vue 3 + Pinia + TypeScript** 的高水准开发实践。

## 目录
在阅读前，请确认你已对 Vue 3 基础有一定了解。

## 一、为什么首选组合式 API？

相对于传统的选项式 API (Options API)，组合式 API 具有两大核心优势：
1. **更优雅的代码复用**：不用再被 \`mixins\` 的命名冲突和来源不明折磨，支持利用 \`Composables\` 进行模块化拆分。
2. **极佳的类型推导**：自然而然支持 TypeScript，不再需要为 \`this\` 上诡异的附加属性配置复杂的 Type 定义。

> 💡 记住一个基本原则：一个 Composable 函数应该只做一件事，并返回只读的数据状态和修改它的方法。

## 二、组合式 API 推荐组织结构

在编写 \`<script setup>\` 时，建议遵从以下顺序排列代码，以形成统一的团队规范：

\`\`\`typescript
// 1. 外部库 / Vue 核心 API 导入
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// 2. 自定义 Composable / Pinia Store 导入
import { useUserStore } from '@/stores/user';
import { useLoading } from '@/composables/loading';

// 3. TypeScript 接口/类型定义
interface Props {
  userId: string;
  theme?: 'light' | 'dark';
}

// 4. 组件属性 (Props) / 事件 (Emits) 定义
const props = withDefaults(defineProps<Props>(), {
  theme: 'light'
});
const emit = defineEmits(['update', 'close']);

// 5. 状态声明 (Reactive / Ref)
const userInfo = ref<any>(null);
const { loading, startLoading, stopLoading } = useLoading();

// 6. 计算属性 (Computed)
const isActive = computed(() => userInfo.value?.status === 'active');

// 7. 方法函数 (Methods)
const fetchUserData = async () => {
  startLoading();
  try {
    userInfo.value = await userStore.loadProfile(props.userId);
  } finally {
    stopLoading();
  }
};

// 8. 生命周期钩子 (Lifecycle Hooks)
onMounted(() => {
  fetchUserData();
});
\`\`\`

---

## 三、代码高亮与表格展示

为了在博客中良好地展示代码片段，我们需要配置相应的 Markdown 代码块渲染：

| 机制 | 描述 | 适用场景 |
| :--- | :--- | :--- |
| Composable | 基于逻辑切分的自定义 Hooks | 逻辑复用、封装副作用 |
| Pinia Stores | 基于 Flux 的单向全局状态 | 跨页面共享的全局状态 |
| Normal Helpers | 纯 JS 纯函数工具类 | 无状态的普通计算、格式化 |

### 示例代码

这是一个典型的 TypeScript 范型帮助函数：

\`\`\`typescript
function uniqueArray<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

// 调用示例
const original = [1, 2, 2, 3, 4, 4, 5];
const resolved = uniqueArray(original);
console.log(resolved); // output: [1, 2, 3, 4, 5]
\`\`\`

## 四、写在最后

统一的代码规范和清晰的状态管理是技术成长过程中必不可少的一步。祝大家在 Vue 3 的生态中开发愉快！`
  },
  {
    id: "react19-compiler-deep-dive",
    title: "深度解析 React 19 Compiler 与自动 Memo 带来的全新变革",
    category: "React",
    tags: ["React19", "Compiler", "Performance"],
    summary: "React 19 最大的更新之一莫过于 React Compiler（曾用名 React Forget）。它将如何彻底改变我们的开发习惯？你是否真的可以对 useMemo 与 useCallback 彻底说再见？",
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
    createTime: "2026-05-28 14:15:00",
    updateTime: "2026-05-28 14:15:00",
    readTime: 8,
    status: "published",
    views: 980,
    content: `# 深度解析 React 19 Compiler 核心逻辑

作为前端界的一枚重磅炸弹，**React 19** 的发布标志着手动优化的时代即将终结。React Compiler (自动记忆化编译器) 的引入让开发体验提升了一大步。

## 目录
1. 背景：手动性能优化的痛点
2. 什么是 React Compiler？
3. 原理剖析：自动 memo 是如何工作的
4. 手动优化的遗留使用场景

---

## 一、背景：手动性能优化的痛点

在过去的 React 开发中，我们不得不经常写出类似以下的代码：

\`\`\`javascript
const memoizedData = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

const handleClick = useCallback(() => {
  console.log('Clicked', id);
}, [id]);
\`\`\`

这种设计存在两个问题：
- **心智负担重**：很容易写错依赖项数组导致 bug 或重复渲染。
- **干扰代码美感**：充斥着大量包装代码，组件内部看起来不够纯净。

## 二、什么是 React Compiler？

React Compiler 是一系列构建时（Build-time）工具。它会分析你的组件并自动对多余的渲染做出短路处理：

> 🎯 **它的目标**：只要组件接收的 \`Props\` 没有改变，或者依赖状态没有变化，即便父组件重新渲染了，子组件也将维持其状态而不需要重新运行。

## 三、编译器内部工作原理

以下是编译器如何将原本低效的组件转换为高效率字节码的示意：

\`\`\`javascript
// 编译前：每次父组件渲染都会重新分配一个新的对象并重新计算。
function Profile({ user }) {
  const settings = { theme: 'dark' };
  return <UserDetail user={user} config={settings} />;
}

// 编译后 (概念伪代码)：编译器会自动缓存此 settings 并在组件被调用时进行复用。
function Profile_Compiled({ user }) {
  const $ = useMemoCache(2); // React 19 内部存储槽
  let settings;
  if ($[0] === Symbol.for('react.memo_cache_sentinel')) {
    settings = { theme: 'dark' };
    $[0] = settings;
  } else {
    settings = $[0];
  }
  ...
}
\`\`\`

## 四、常见问题疑问

### 1. 所有的组件都会被编译吗？
React 编译器是有安全保障机制的。如果分析出你的代码违反了 **React 纯函数规则** (比如直接在 render 期间修改了外部变量)，编译器会自动跳过该组件的优化而不会强行报错。

### 2. ECharts/图表类组件也需要这个吗？
大部分纯 UI 状态图表在封装后非常适合交给 React Compiler。只要数据不变，就不会触发 canvas 对象的重新创建。

## 总结
React Compiler 是极具划时代意义的一步。它降低了框架对开发者底层的干预门槛，让新手也能在不用深度掌握 rerender 机制的前提下，写出具有工业级性能的 web 网页。`
  },
  {
    id: "vite-modern-assets-handling",
    title: "Vite 超大静态资源加载与工程化精细配置实践",
    category: "Vite",
    tags: ["Vite", "Build-tools", "Webpack"],
    summary: "在复杂项目中，大量的静态文件、动态导入、分包策略往往让打包的 dist 体积失控。本文分享如何在 Vite 6 下做按需打包、资源压缩与强缓存配置的最佳实践。",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    createTime: "2026-05-15 09:30:00",
    updateTime: "2026-05-15 09:30:00",
    readTime: 5,
    status: "published",
    views: 740,
    content: `# Vite 静态资源加载与细粒度产物控制

Vite 凭借着极速的冷启动在前端开发群落中已经攻陷了城池。但在打包到生产（Production）的时候，我们需要更加细化的策略来让资源加载如丝般顺滑。

## 一、CSS 样式隔离与加载优化

在 Vite 中，TailwindCSS 的引入是非常方便的：
\`\`\`css
/* index.css */
@import "tailwindcss";
\`\`\`
Vite 在打包时会自动提取所有的样式并生成压缩好的 CSS 文件。针对大文件样式，可以通过 postcss 或 css 预处理器进行拆分。

## 二、精细分包：SplitChunks 实战

为了防止生成体积超过 2MB 的巨大 \`index.js\` 包，我们需要在 \`vite.config.ts\` 中配置 Rollup 的打包策略：

\`\`\`typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('echarts')) return 'vendor-echarts';
            if (id.includes('react')) return 'vendor-react-core';
            return 'vendor-utils';
          }
        }
      }
    }
  }
});
\`\`\`

以此实现合理分流，大大缩短了多核浏览器拉取脚本文件的整体耗时！`
  },
  {
    id: "unpublished-draft-post",
    title: "【草稿】未来技术展望：WebAssembly 与边缘计算的融合",
    category: "Security",
    tags: ["Rust", "Wasm", "Edge"],
    summary: "这是一篇还未完成的文章草稿，重点讨论 Rust 编译为 WebAssembly 之后如何在 Cloudflare Workers、Fastly Compute 等边缘侧展现极致性能。草稿不应被未登录的普通用户看到。",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    createTime: "2026-06-02 23:55:00",
    updateTime: "2026-06-03 01:20:00",
    readTime: 4,
    status: "draft",
    views: 0,
    content: `# 【草稿】WebAssembly 与边缘计算的未来

本篇文章还处于深度创作中，这是一份草稿内容。

### 待补充的方向：
1. Rust 编写 WebAssembly 函数，生成 WASI 包并运行在边缘算力节点上。
2. 与 Edge SQL/FireStore 的直连性能跑分检测。
3. 动态图片编解码优化在边缘云节点的低延迟测试。

*提示：后台编辑已保存，正式发版前请将状态设定为“已发布 (Published)”状态。*`
  }
];
