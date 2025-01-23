"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, History, Settings, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { 
    icon: <LayoutDashboard className="w-5 h-5" />, 
    label: 'Dashboard', 
    href: '/dashboard/main' 
  },
  { 
    icon: <Search className="w-5 h-5" />, 
    label: 'New Analysis', 
    href: '/dashboard/analysis' 
  },
  { 
    icon: <History className="w-5 h-5" />, 
    label: 'Reports History', 
    href: '/dashboard/reports' 
  },
  { 
    icon: <Settings className="w-5 h-5" />, 
    label: 'Settings', 
    href: '/dashboard/settings' 
  },
];

interface SidebarProps {
  onSignOut: () => Promise<void> | void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onSignOut, className }) => {
  const pathname = usePathname();

  return (
    <aside className={cn("w-64 flex flex-col bg-white border-r shadow-sm", className)}>
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-3 px-6 h-16 border-b">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-semibold text-lg">Fuzzing Tool</span>
        </div>
        
        <nav className="relative flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 mb-1 relative z-10"
                >
                  <span className="relative z-20">{item.icon}</span>
                  <span className="relative z-20">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-secondary opacity-20 rounded-md z-0"
                      layoutId="sidebar-highlight"
                      initial={{opacity : 0.8}} // Prevents lag by not animating the initial state
                      animate={{ opacity: 0.8 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }} // Reduced duration for faster transition
                    />
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onSignOut}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
