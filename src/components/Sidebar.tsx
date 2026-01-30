'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '◐' },
  { href: '/goals', label: 'Goals', icon: '◎' },
  { href: '/journal', label: 'Journal', icon: '◉' },
  { href: '/timeline', label: 'Timeline', icon: '◈' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#111] border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="block">
          <h1 className="text-2xl font-bold gradient-text">1796 Days</h1>
          <p className="text-xs text-gray-500 mt-1">Journey to Jan 1, 2031</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-800">
        <Link
          href="/journal/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <span>+</span>
          <span>New Entry</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-gray-600">
        Your journey, your story
      </div>
    </aside>
  );
}
