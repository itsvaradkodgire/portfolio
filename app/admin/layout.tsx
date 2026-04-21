import type { Metadata } from 'next';
import { AdminLayout } from '@/app/components/admin/AdminLayout';

export const metadata: Metadata = {
  title: 'Admin Portal — Varad Kodgire',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
