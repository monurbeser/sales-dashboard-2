'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
  const pathname = usePathname();
  
  // Format the breadcrumb slightly based on pathname logic
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumb = segments.map(s => {
    switch (s) {
      case 'dashboard': return 'Dashboard';
      case 'company': return 'Genel Dashboard';
      case 'sales': return 'Satış Yöneticileri';
      case 'products': return 'Ürün Yöneticileri';
      case 'settings': return 'Altyapı Tanımları';
      case 'sales-managers': return 'Satış Yöneticileri';
      case 'product-managers': return 'Ürün Yöneticileri';
      case 'targets': return 'Hedef Tanımlama';
      case 'invoices': return 'Fatura Yönetimi';
      default: return s;
    }
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center flex-shrink-0 gap-4 border-b bg-white/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 ml-0 lg:ml-64 transition-all pr-16 md:pr-8">
      {/* Spacer for mobile menu button */}
      <div className="lg:hidden ml-12"></div>
      
      <div className="flex flex-1 gap-4 self-stretch lg:gap-6 items-center">
        <div className="flex flex-1 items-center gap-2 text-sm text-slate-500 font-medium">
           {breadcrumb.map((crumb, idx) => (
             <React.Fragment key={idx}>
               {idx > 0 && <span>/</span>}
               <span className={cn(idx === breadcrumb.length - 1 ? "text-slate-900 font-semibold" : "")}>
                 {crumb}
               </span>
             </React.Fragment>
           ))}
        </div>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Ara..."
              className="w-64 pl-9 rounded-full bg-slate-50 border-slate-200"
            />
          </div>
          <Button variant="ghost" size="icon" className="text-slate-500">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
