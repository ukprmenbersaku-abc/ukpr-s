import { LucideIcon } from 'lucide-react';

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: LucideIcon;
  tags: string[];
  gradient: string;
}

export interface NavItem {
  label: string;
  href: string;
}