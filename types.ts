import React from 'react';

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: React.ElementType;
  tags: string[];
  gradient: string;
  fontClass?: string;
}

export interface NavItem {
  label: string;
  href: string;
}