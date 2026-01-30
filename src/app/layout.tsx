import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Project 1796 - Transform Your Life by 2031',
  description: 'Your personal journey tracker. 1796 days to achieve your dreams, document your progress, and become the person you want to be.',
  keywords: ['goal tracking', 'journaling', 'personal development', '2031', 'habits', 'productivity'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen bg-[#050508] overflow-x-hidden">
        {/* Background gradient orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="orb orb-primary w-[600px] h-[600px] -top-48 -left-48 opacity-20" />
          <div className="orb orb-accent w-[500px] h-[500px] top-1/2 -right-48 opacity-15" />
          <div className="orb orb-secondary w-[400px] h-[400px] bottom-0 left-1/3 opacity-10" />
        </div>
        
        <div className="flex min-h-screen relative z-10">
          <Sidebar />
          <main className="flex-1 ml-72 p-8 pb-20">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
