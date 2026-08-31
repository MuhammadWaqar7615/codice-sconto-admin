'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AUTH_TOKEN_STORAGE_KEY } from '@/config/auth';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'D' },
    { name: 'Coupons', href: '/dashboard/coupons', icon: 'C' },
    { name: 'Categories', href: '/dashboard/categories', icon: 'K' },
    { name: 'Subcategories', href: '/dashboard/subcategories', icon: 'S' },
    { name: 'Sliders', href: '/dashboard/sliders', icon: 'L' },
    { name: 'Promo banners', href: '/dashboard/promo-banners', icon: 'P' },
    { name: 'Badges', href: '/dashboard/badges', icon: 'B' },
    { name: 'Blog', href: '/dashboard/blog', icon: 'G' },
    { name: 'Users', href: '/dashboard/users', icon: 'U' },
    { name: 'Public stores', href: '/negozi', icon: 'S' },
    { name: 'Public offers', href: '/offerte', icon: 'O' },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 h-16 sticky top-0 z-20 shadow-sm w-full">
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        <button 
          onClick={() => setIsOpen(true)}
          className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 -mr-2"
          aria-label="Open sidebar menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-black/50 transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white shadow-sm transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between md:justify-center px-4 md:px-0 border-b border-gray-200 shrink-0">
          <h1 className="text-xl font-bold text-gray-800 hidden md:block">Admin Panel</h1>
          <h1 className="text-xl font-bold text-gray-800 md:hidden">Menu</h1>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none p-2 -mr-2"
            aria-label="Close sidebar menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs font-bold text-gray-600">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Profile/Logout Area */}
        <div className="p-4 border-t border-gray-200 shrink-0">
          <form action="/api/auth/logout" method="POST" onSubmit={handleLogout}>
            <button type="submit" className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50">
              <span className="mr-3 flex h-6 w-6 items-center justify-center rounded bg-red-50 text-xs font-bold">X</span>
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}