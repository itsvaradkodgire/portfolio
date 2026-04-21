'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, FolderCode, Lightbulb, FileText,
  Link2, Gamepad2, Search, BarChart3, ExternalLink, LogOut, Menu, X
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin',           label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/profile',   label: 'Profile',    icon: User },
  { href: '/admin/projects',  label: 'Projects',   icon: FolderCode },
  { href: '/admin/skills',    label: 'Skills',     icon: Lightbulb },
  { href: '/admin/resume',    label: 'Resume & AI',icon: FileText },
  { href: '/admin/contact',   label: 'Contact',    icon: Link2 },
  { href: '/admin/demos',     label: 'Demos',      icon: Gamepad2 },
  { href: '/admin/seo',       label: 'SEO',        icon: Search },
  { href: '/admin/analytics', label: 'Analytics',  icon: BarChart3 },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-40 w-56 bg-bg-deep border-r border-border-subtle
        flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-border-subtle">
          <p className="font-mono text-xs text-text-faint uppercase tracking-widest mb-0.5">admin portal</p>
          <p className="font-mono text-sm text-text-primary">varad kodgire</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`admin-sidebar-link ${active ? 'active' : ''}`}
              >
                <item.icon size={15} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="px-3 pb-4 pt-3 border-t border-border-subtle space-y-0.5">
          <Link
            href="/"
            target="_blank"
            className="admin-sidebar-link"
            onClick={onClose}
          >
            <ExternalLink size={14} />
            <span>Back to Site</span>
          </Link>
          <button onClick={logout} className="admin-sidebar-link w-full text-left hover:text-red-400">
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:ml-56">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 bg-bg-deep/90 backdrop-blur border-b border-border-subtle
                           flex items-center justify-between px-6">
          <button
            className="lg:hidden text-text-muted hover:text-text-primary transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="font-mono text-xs text-text-faint">admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 max-w-5xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
