import React from 'react';
import { Project, NavItem } from './types';

// Custom Icons based on user SVG
const PixMorphIcon = ({ size = 24, className }: { size?: number | string, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    className={className}
  >
    <defs>
      <linearGradient id="pix-morph-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366f1"/>
        <stop offset="100%" stopColor="#a855f7"/>
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#pix-morph-gradient)"/>
    <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(12 12) scale(0.65) translate(-12 -12)">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </g>
  </svg>
);

const KaishintouIcon = ({ size = 24, className }: { size?: number | string, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 32 32" 
    width={size} 
    height={size} 
    className={className}
  >
    <circle cx="16" cy="16" r="16" fill="#22c55e"/>
    <g transform="translate(4, 4)">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.79 8.55-9.76 10H11Z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
    </g>
  </svg>
);

const ColorPaletteIcon = ({ size = 24, className }: { size?: number | string, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className={className}
  >
    <rect width="100" height="100" rx="24" fill="#ffffff" />
    <circle cx="50" cy="38" r="20" fill="#3b82f6" />
    <circle cx="33" cy="66" r="20" fill="#ec4899" />
    <circle cx="67" cy="66" r="20" fill="#eab308" />
  </svg>
);

const SQLiteStudioIcon = ({ size = 24, className }: { size?: number | string, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 64 64" 
    width={size} 
    height={size} 
    className={className}
  >
    <defs>
      <linearGradient id="sqlite-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366f1"/>
        <stop offset="50%" stopColor="#a855f7"/>
        <stop offset="100%" stopColor="#ec4899"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#sqlite-grad)" />
    <g transform="translate(16, 14)">
      <ellipse cx="16" cy="6" rx="14" ry="5" fill="none" stroke="white" strokeWidth="3.5" />
      <path d="M2 6 v 24 a 14 5 0 0 0 28 0 v -24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 18 a 14 5 0 0 0 28 0" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

export const PROJECTS: Project[] = [
  {
    id: 'pix-morph',
    name: 'Pix Morph',
    description: '画像の変換や編集をもっと手軽に。直感的な操作で画像を編集できるツール。',
    url: 'https://ukpr-image.pages.dev/',
    icon: PixMorphIcon,
    tags: ['Image Processing', 'Converter', 'Utility'],
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'sqlite-studio',
    name: 'SQLite Studio',
    description: 'ブラウザ上でSQLiteデータベースを直接操作・管理。インストール不要で、すぐに開発を始められます。',
    url: 'https://ukpr-sqlite.pages.dev/',
    icon: SQLiteStudioIcon,
    tags: ['Database', 'DevTool', 'SQL'],
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    description: 'デザインのインスピレーションを加速させる。美しいカラーパレットを瞬時に生成・調整できるツール。',
    url: 'https://color-palette-tool.pages.dev/',
    icon: ColorPaletteIcon,
    tags: ['Design', 'Color', 'Generator'],
    gradient: 'from-amber-400 to-orange-500'
  },
  {
    id: 'kaishintou',
    name: '筑摩野改新党',
    description: 'UKPR-Sが関わったプロジェクト。中学校の生徒会に対する新しい可能性を生み出すためのサイト。',
    url: 'https://kaishintou.pages.dev/',
    icon: KaishintouIcon,
    tags: ['Collaboration', 'Community', 'Web Site'],
    gradient: 'from-green-500 to-emerald-600',
    fontClass: 'font-zen'
  }
];

export const NAV_ITEMS: NavItem[] = [
  { label: 'Projects', href: '#projects' },
  { label: 'About', href: '#about' },
];

export const APP_NAME = "UKPR-S";
export const APP_TAGLINE = "Empowering the Web with AI-Driven Tools";
