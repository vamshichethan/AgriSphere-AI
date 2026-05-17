'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Sprout, 
  Store, 
  TrendingUp, 
  MessageSquare, 
  LogOut, 
  Menu,
  X,
  User as UserIcon,
  Leaf
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Quick check from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Verify session with backend
    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`, { withCredentials: true })
      .then(res => {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('user');
        toast.error("Session expired. Please log in.");
        router.push('/auth/login');
      })
      .finally(() => setIsChecking(false));
  }, [router]);

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('user');
      router.push('/auth/login');
    } catch (err) {
      toast.error("Failed to log out");
    }
  };

  if (isChecking && !user) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user) return null; // Will redirect in useEffect

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['farmer', 'buyer', 'admin'] },
    { name: 'My Listings', href: '/dashboard/listings', icon: Sprout, roles: ['farmer'] },
    { name: 'Marketplace', href: '/dashboard/market', icon: Store, roles: ['farmer', 'buyer'] },
    { name: 'Disease Detection', href: '/dashboard/diagnosis', icon: Leaf, roles: ['farmer'] },
    { name: 'Yield Analytics', href: '/dashboard/analytics', icon: TrendingUp, roles: ['farmer', 'buyer'] },
    { name: 'AgriBot AI', href: '/dashboard/chat', icon: MessageSquare, roles: ['farmer', 'buyer'] },
  ];

  const allowedNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-neutral-950/50 backdrop-blur-xl">
        <div className="p-6 border-b border-white/10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">AgriFlow</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {allowedNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <span className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-green-500/10 text-green-400 font-medium' 
                    : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                }`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-green-500' : 'text-neutral-500'}`} />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-2">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-white/10">
              <UserIcon className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-neutral-200">{user.name}</p>
              <p className="text-xs text-neutral-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5 text-neutral-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-500" />
            <span className="font-bold">AgriFlow</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/5 rounded-lg text-neutral-400">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-[73px] left-0 right-0 bottom-0 bg-neutral-950/95 backdrop-blur-xl z-20 p-4"
          >
            <div className="space-y-2">
              {allowedNavItems.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <span className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    pathname === item.href ? 'bg-green-500/10 text-green-400' : 'text-neutral-400'
                  }`}>
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 relative">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
