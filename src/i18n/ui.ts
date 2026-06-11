// Client-side i18n utilities for browser JavaScript

export type Lang = 'zh' | 'en';

const translations = {
  zh: {
    site: {
      title: "Eric Cao — 追问 AI 的设计逻辑",
      description: "从大数据工程师起步，如今专注 AI 怎么在企业真正落地。",
    },
    nav: {
      home: "首页",
      blog: "博客"
    },
    hero: {
      title: "代码写久了，会开始追问系统为什么这样设计",
      langToggle: "中"
    },
    stats: {
      regions: "已探索区域",
      skills: "解锁技能",
      days: "冒险天数"
    },
    sections: {
      projects: "作品",
      explorations: "探索方向"
    },
    project: {
      enterRegion: "进入区域",
      requiredSkills: "Required Skills:",
      explorers: "explorers"
    },
    thought: {
      exploring: "探索中"
    },
    comingSoon: {
      title: "Coming Soon",
      items: [
        "个人/团队专属 AI Agent 工作流的从零搭建全流程",
        "企业级场景下 Agent 自动化流程的落地实战记录",
        "大数据与 AI Agent 结合的场景化解决方案",
        "全链路性能优化的系列避坑指南与实战技巧"
      ]
    },
    blog: {
      title: "📜 博客",
      description: "企业 AI 落地 · 开源框架 · 大数据工程",
      emptyTitle: "新地图正在绘制中...",
      emptyDesc: "探险日志即将解锁，敬请期待。"
    }
  },
  en: {
    site: {
      title: "Eric Cao — Big Data & Full-Stack Engineer, focused on practical AI",
      description: "From big data engineer to focusing on how AI actually lands in the enterprise.",
    },
    nav: {
      home: "Home",
      blog: "Blog"
    },
    hero: {
      title: "Full-Stack Explorer",
      langToggle: "EN"
    },
    stats: {
      regions: "Regions",
      skills: "Skills",
      days: "Days"
    },
    sections: {
      projects: "Projects",
      explorations: "Explorations"
    },
    project: {
      enterRegion: "Enter Region",
      requiredSkills: "Required Skills:",
      explorers: "explorers"
    },
    thought: {
      exploring: "Exploring"
    },
    comingSoon: {
      title: "Coming Soon",
      items: [
        "Complete guide to building personal/team AI Agent workflows from scratch",
        "Enterprise Agent automation implementation case studies",
        "Big Data + AI Agent scenario-based solutions",
        "End-to-end performance optimization pitfalls and practical tips"
      ]
    },
    blog: {
      title: "📜 Blog",
      description: "Enterprise AI · Open Source · Data Engineering",
      emptyTitle: "New map is being drawn...",
      emptyDesc: "Adventure logs coming soon."
    }
  }
} as const;

// Get nested value from object using dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): string | string[] | undefined {
  return path.split('.').reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj) as string | string[] | undefined;
}

// Get translation by key path
export function t(lang: Lang, key: string): string | string[] {
  const value = getNestedValue(translations[lang] as unknown as Record<string, unknown>, key);
  if (value !== undefined) return value;

  // Fallback to default language (zh)
  const fallback = getNestedValue(translations.zh as unknown as Record<string, unknown>, key);
  return fallback || key;
}

// Get stored language preference
export function getStoredLang(): Lang {
  const stored = localStorage.getItem('lang');
  if (stored === 'zh' || stored === 'en') return stored;
  return 'zh';
}

// Store language preference
export function setStoredLang(lang: Lang): void {
  localStorage.setItem('lang', lang);
}

// Update HTML lang attribute
export function updateHtmlLang(lang: Lang): void {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
}

// Dispatch language change event
export function dispatchLangChange(lang: Lang): void {
  window.dispatchEvent(new CustomEvent('langChange', { detail: { lang } }));
}
