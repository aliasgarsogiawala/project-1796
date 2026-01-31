import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Project 1796',
  description: 'Track your 1796-day journey to transform your life by 2031.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#0a0a0f]">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <main className="flex-1 ml-64 overflow-y-auto">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 px-8 py-4 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-400">System Online</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-slate-200" id="header-time">--:--</div>
                    <div className="text-xs text-slate-500" id="header-date">Loading...</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Page Content */}
            <div className="p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        
        {/* Time update script */}
        <script dangerouslySetInnerHTML={{
          __html: `
            function updateTime() {
              const now = new Date();
              const timeEl = document.getElementById('header-time');
              const dateEl = document.getElementById('header-date');
              if (timeEl) {
                timeEl.textContent = now.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                });
              }
              if (dateEl) {
                dateEl.textContent = now.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric'
                });
              }
            }
            updateTime();
            setInterval(updateTime, 1000);
          `
        }} />
      </body>
    </html>
  );
}
