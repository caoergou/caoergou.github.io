import zh from './locales/zh.json';
import en from './locales/en.json';

export const languages = {
  zh: 'zh-CN',
  en: 'en-US',
} as const;

export const defaultLang = 'zh';

export type Lang = keyof typeof languages;

export const translations = {
  zh,
  en,
} as const;

export type TranslationKey = typeof zh;

// Helper function to get nested value from object using dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): string | string[] | undefined {
  return path.split('.').reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj) as string | string[] | undefined;
}

// Get translation by key path (e.g., 'site.title')
export function t(lang: Lang, key: string, params?: Record<string, string | number>): string {
  const translation = getNestedValue(translations[lang] as unknown as Record<string, unknown>, key);

  if (!translation) {
    // Fallback to default language
    const fallback = getNestedValue(translations[defaultLang] as unknown as Record<string, unknown>, key);
    if (!fallback) return key;
    if (Array.isArray(fallback)) return key; // Arrays should not be returned as string
    return interpolate(fallback, params);
  }

  if (Array.isArray(translation)) return key; // Arrays should not be returned as string
  return interpolate(translation, params);
}

// Interpolate string with params (e.g., "Hello {name}" with {name: "World"} -> "Hello World")
function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    str
  );
}

// Get all translations for a language
export function getTranslations(lang: Lang): Record<string, unknown> {
  return translations[lang] as unknown as Record<string, unknown>;
}

// Check if a language is valid
export function isValidLang(lang: string): lang is Lang {
  return lang in languages;
}

// Get browser language or default
export function getBrowserLang(): Lang {
  if (typeof window === 'undefined') return defaultLang;

  const browserLang = navigator.language.split('-')[0];
  if (isValidLang(browserLang)) return browserLang;
  return defaultLang;
}

// Get stored language preference or default
export function getStoredLang(): Lang {
  if (typeof window === 'undefined') return defaultLang;

  const stored = localStorage.getItem('lang');
  if (stored && isValidLang(stored)) return stored;
  return defaultLang;
}

// Store language preference
export function setStoredLang(lang: Lang): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lang', lang);
}

// ===== Client-side helpers =====

// Generate client-side translations as a JSON string for injection
export function getClientTranslations(): string {
  return JSON.stringify(translations);
}

// Get the client-side i18n runtime script (shared logic without translations)
export function getI18nClientScript(): string {
  return `
// i18n runtime - translations read from data-translations attribute on this script tag
const _i18nScript = document.currentScript;
const translations = JSON.parse(_i18nScript ? _i18nScript.getAttribute('data-translations') : '{}');

// Helper to get nested value
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc && acc[key] !== undefined ? acc[key] : undefined, obj);
}

// Get translation
function t(lang, key) {
  const value = getNestedValue(translations[lang], key);
  if (value !== undefined) return value;
  return getNestedValue(translations.zh, key) || key;
}

// Global language switching
let currentLang = localStorage.getItem('lang') || 'zh';

function updateAllText(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);

  // Update HTML lang attribute
  document.documentElement.lang = t(lang, 'site.lang');

  // Update elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(lang, key);
    if (text) el.textContent = text;
  });

  // Update meta tags with data-i18n-content
  document.querySelectorAll('[data-i18n-content]').forEach(el => {
    const key = el.getAttribute('data-i18n-content');
    const text = t(lang, key);
    if (text) el.setAttribute('content', text);
  });

  // Update Open Graph locale
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) {
    ogLocale.setAttribute('content', t(lang, 'site.locale'));
  }

  // Update project descriptions (from data attributes)
  document.querySelectorAll('[data-desc-zh]').forEach(el => {
    const text = el.getAttribute(\`data-desc-\${lang}\`);
    if (text) el.textContent = text;
  });

  // Update project demo links (from data attributes)
  document.querySelectorAll('[data-link-zh]').forEach(el => {
    const text = el.getAttribute(\`data-link-\${lang}\`);
    if (text) el.textContent = text;
  });

  // Update thought titles (from data attributes)
  document.querySelectorAll('[data-title-zh]').forEach(el => {
    const text = el.getAttribute(\`data-title-\${lang}\`);
    if (text) el.textContent = text;
  });

  // Update coming soon items
  const comingList = document.getElementById('coming-list');
  if (comingList) {
    const items = t(lang, 'comingSoon.items');
    if (Array.isArray(items)) {
      comingList.innerHTML = items.map(item => \`<div class="coming-item">\${item}</div>\`).join('');
    }
  }

  // Dispatch custom event for other components
  window.dispatchEvent(new CustomEvent('langChange', { detail: { lang } }));
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  updateAllText(currentLang);
});

// Expose to global scope for language toggle
window.__I18N__ = { t, updateAllText, currentLang };
`;
}
