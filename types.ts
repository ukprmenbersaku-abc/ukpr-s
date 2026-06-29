import React from 'react';

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  tags: string[];
  gradient: string;
  fontClass?: string;
}

export interface NavItem {
  label: string;
  href: string;
}