import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Header } from '@/components/layout/header';
import { ToastProvider } from '@/components/providers/toast-provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-neutral-50">
        <Sidebar />
        <Header />
        <main className="lg:pl-60 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </ToastProvider>
  );
}
