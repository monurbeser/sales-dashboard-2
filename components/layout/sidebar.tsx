'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Settings,
  Target,
  FileText,
  Users,
  Briefcase,
  Home,
  LayoutDashboard,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigation = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard/company',
  },
  {
    title: 'Raporlama',
    icon: BarChart,
    submenu: [
      { title: 'Genel Dashboard', href: '/dashboard/company' },
      { title: 'Kişisel Dashboard (Satış)', href: '/dashboard/sales' },
      { title: 'Kişisel Dashboard (Ürün)', href: '/dashboard/products' },
    ],
  },
  {
    title: 'Altyapı Tanımları',
    icon: Settings,
    submenu: [
      { title: 'Satış Yöneticileri', href: '/settings/sales-managers', icon: Users as any },
      { title: 'Ürün Yöneticileri', href: '/settings/product-managers', icon: Briefcase as any },
    ],
  },
  {
    title: 'Hedef Tanımlama',
    icon: Target,
    submenu: [
      { title: 'Satış Hedefleri', href: '/targets/sales' },
      { title: 'Ürün Hedefleri', href: '/targets/products' },
    ],
  },
  {
    title: 'Fatura Yönetimi',
    icon: FileText,
    href: '/invoices',
  },
];

type NavItem = {
  title: string;
  icon?: any;
  href?: string;
  submenu?: { title: string; href: string; icon?: any }[];
};

export function Sidebar() {
  const pathname = usePathname();

  const NavContent = () => (
    <div className="flex h-full flex-col gap-4 py-4">
      <div className="px-6 pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-blue-500" />
          <span>SalesTracker</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <nav className="flex flex-col gap-2">
          {navigation.map((item, index) => (
            <div key={index} className="flex flex-col space-y-1">
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ) : (
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mt-2">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </div>
                </div>
              )}

              {item.submenu && (
                <div className="ml-4 flex flex-col space-y-1 pl-4 border-l border-slate-700">
                  {item.submenu.map((subItem, subIndex) => {
                    const Icon = subItem.icon as any;
                    return (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === subItem.href || pathname.startsWith(subItem.href + '/')
                            ? 'bg-slate-800 text-white font-medium'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        )}
                      >
                        {Icon && <Icon className="h-3 w-3" />}
                        {subItem.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      
      <div className="px-4 py-4 mt-auto border-t border-slate-800">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
            SS
          </div>
          <div className="flex flex-col">
            <span className="text-white font-medium">Sistem Yöneticisi</span>
            <span className="text-xs">sistem@sirket.com</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex h-screen w-64 flex-col bg-slate-950 text-slate-100 border-r border-slate-800 fixed left-0 top-0">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        {/* @ts-expect-error asChild supported by radix */}
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden fixed left-4 top-4 z-50 bg-slate-950 text-white border-slate-800 hover:bg-slate-800 hover:text-white">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-slate-950 border-r-slate-800 text-slate-100 h-full flex flex-col">
          <NavContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
