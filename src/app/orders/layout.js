'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';

export default function OrdersLayout({ children }) {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="flex flex-col min-h-screen" style={{ 
      background: isDarkMode 
        ? 'linear-gradient(to bottom, var(--bg-color), var(--panel-dark))' 
        : 'linear-gradient(to bottom, var(--bg-color), var(--panel-charcoal))'
    }}>
      <Header activePage="orders" />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
} 