'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, IndianRupee, ShoppingBag, Bell, Leaf, MapPin } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      setUser(JSON.parse(saved));
      setLoading(false);
    }
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-neutral-400 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {user?.district ? `${user.district}, ${user.state}` : 'Location not set'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="glass-panel p-2 rounded-xl relative hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5 text-neutral-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
          </button>
          {user?.role === 'farmer' && (
             <Link href="/dashboard/listings/new" className="bg-green-500 hover:bg-green-600 text-neutral-950 px-4 py-2 rounded-xl font-medium transition-colors">
               + New Listing
             </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: user?.role === 'farmer' ? 'Active Listings' : 'Active Orders', value: '0', icon: Sprout, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: user?.role === 'farmer' ? 'Total Earnings' : 'Total Spent', value: '₹0', icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Market Deals', value: '24', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 rounded-2xl flex items-center gap-4"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold text-white mb-4 mt-10">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.role === 'farmer' && (
          <Link href="/dashboard/diagnosis">
            <motion.div whileHover={{ y: -5 }} className="glass-panel p-5 rounded-2xl border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-colors cursor-pointer group">
              <Leaf className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">Detect Disease</h3>
              <p className="text-xs text-neutral-400">Upload leaf photo for AI analysis</p>
            </motion.div>
          </Link>
        )}
        <Link href="/dashboard/market">
          <motion.div whileHover={{ y: -5 }} className="glass-panel p-5 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
            <ShoppingBag className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-1">Marketplace</h3>
            <p className="text-xs text-neutral-400">Browse current crop listings</p>
          </motion.div>
        </Link>
        <Link href="/dashboard/analytics">
          <motion.div whileHover={{ y: -5 }} className="glass-panel p-5 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
            <Sprout className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-1">Yield Predictor</h3>
            <p className="text-xs text-neutral-400">Forecast upcoming harvests</p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
