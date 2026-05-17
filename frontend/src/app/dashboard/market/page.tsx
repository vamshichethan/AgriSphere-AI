'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, IndianRupee, ShoppingCart, Filter, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function MarketPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Mock data or fetch real data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API fetch delay
    setTimeout(() => {
      setListings([
        { id: '1', crop_name: 'Premium Wheat', quantity_quintals: 50, price_per_quintal: 2400, location_state: 'Punjab', location_district: 'Ludhiana', farmer_name: 'Harjit Singh', image_url: null },
        { id: '2', crop_name: 'Basmati Rice', quantity_quintals: 120, price_per_quintal: 3800, location_state: 'Haryana', location_district: 'Karnal', farmer_name: 'Ramesh Kumar', image_url: null },
        { id: '3', crop_name: 'Fresh Tomatoes', quantity_quintals: 15, price_per_quintal: 1200, location_state: 'Maharashtra', location_district: 'Nashik', farmer_name: 'Suresh Patil', image_url: null },
        { id: '4', crop_name: 'Organic Potatoes', quantity_quintals: 80, price_per_quintal: 1500, location_state: 'Uttar Pradesh', location_district: 'Agra', farmer_name: 'Amit Yadav', image_url: null }
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const filteredListings = listings.filter(l => l.crop_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
          <p className="text-neutral-400">Discover and purchase direct from farmers at real-time market rates.</p>
        </div>
        
        {/* Search and Filters */}
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search crops..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:border-green-500 transition-colors text-sm"
            />
          </div>
          <button className="glass-panel p-2.5 rounded-xl border border-neutral-800 hover:bg-white/5 transition-colors text-neutral-400">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl h-80 animate-pulse bg-white/5 border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-2xl overflow-hidden border border-white/10 group flex flex-col"
            >
              {/* Image Area */}
              <div className="h-40 bg-neutral-900 relative flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img src={item.image_url} alt={item.crop_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-700 bg-neutral-900/80">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-medium">No Image</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-medium border border-white/10 flex items-center gap-1 text-white">
                  {item.quantity_quintals} Quintals
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-white mb-1">{item.crop_name}</h3>
                <p className="text-sm text-green-400 flex items-center gap-1 font-medium mb-3">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {item.price_per_quintal.toLocaleString()} / qtl
                </p>
                
                <div className="space-y-2 mt-auto pt-4 border-t border-neutral-800">
                  <div className="flex items-center text-xs text-neutral-400 gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    {item.location_district}, {item.location_state}
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>Seller:</span>
                    <span className="text-neutral-300 font-medium">{item.farmer_name}</span>
                  </div>
                </div>

                <button 
                  onClick={() => toast('Payment gateway integration pending Phase 8', { icon: '💳' })}
                  className="w-full mt-4 bg-white/5 hover:bg-green-500 hover:text-neutral-950 border border-white/10 hover:border-green-500 text-neutral-300 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
