'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidebar = pathname !== '/' && !pathname.startsWith('/auth/');

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 ${showSidebar ? 'p-8' : ''}`}>
        {children}
      </main>
    </div>
  );
}