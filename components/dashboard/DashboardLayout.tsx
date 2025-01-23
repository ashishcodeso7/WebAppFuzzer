"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Shield } from 'lucide-react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
        // Call the logout endpoint to clear the authentication cookie
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include', // Ensure cookies are sent with the request
        });

        // Redirect to the homepage or login page
        window.location.href = '/';
    } catch (error) {
        console.error('Logout failed:', error);
    }
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <div className="lg:hidden border-b bg-white">
        <div className="flex items-center gap-3 px-4 h-14">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              {/* Framer Motion animation for the Sidebar */}
              <motion.div
                initial={{ x: -250 }}
                animate={{ x: 0 }}
                exit={{ x: -250 }}
                transition={{ duration: 0.3 }}
              >
                <Sidebar onSignOut={handleSignOut} />
              </motion.div>
            </SheetContent>
          </Sheet>
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-semibold">Fuzzing Tool</span>
        </div>
      </div>

      {/* Desktop Navigation */}
      <Sidebar 
        onSignOut={handleSignOut} 
        className="hidden lg:flex lg:fixed lg:inset-y-0"
      />

      {/* Main Content with animation */}
      <motion.div
        className="lg:pl-64"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;
