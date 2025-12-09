import { Image, Database, Palette, Wand2 } from 'lucide-react';
import { Project, NavItem } from './types';

export const PROJECTS: Project[] = [
  {
    id: 'pix-morph',
    name: 'Pix Morph',
    description: '画像の変換や編集をもっと手軽に。直感的な操作で画像を編集できるツール。',
    url: 'https://ukpr-image.pages.dev/',
    icon: Image,
    tags: ['Image Processing', 'Converter', 'Utility'],
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'sqlite-studio',
    name: 'SQLite Studio',
    description: 'ブラウザ上でSQLiteデータベースを直接操作・管理。インストール不要で、すぐに開発を始められます。',
    url: 'https://ukpr-sqlite.pages.dev/',
    icon: Database,
    tags: ['Database', 'DevTool', 'SQL'],
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    description: 'デザインのインスピレーションを加速させる。美しいカラーパレットを瞬時に生成・調整できるツール。',
    url: 'https://color-palette-tool.pages.dev/',
    icon: Palette,
    tags: ['Design', 'Color', 'Generator'],
    gradient: 'from-amber-400 to-orange-500'
  }
];

export const NAV_ITEMS: NavItem[] = [
  { label: 'Projects', href: '#projects' },
  { label: 'About', href: '#about' },
];

export const APP_NAME = "UKPR-S";
export const APP_TAGLINE = "Empowering the Web with AI-Driven Tools";