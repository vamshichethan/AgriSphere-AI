'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, IndianRupee, ShoppingCart, Filter, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const loadRazorpay = () => new Promise<boolean>((resolve) => {
  if (window.Razorpay) return resolve(true);

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

export default function MarketPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setIsLoading(true);
    api.get('/api/listings')
      .then((res) => setListings(res.data.listings || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load marketplace listings.'))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredListings = listings.filter(l => l.crop_name.toLowerCase().includes(search.toLowerCase()));

  const handleBuyNow = async (item: any) => {
    try {
      const quantity = 1;
      const res = await api.post('/api/orders', {
        listing_id: item.id,
        quantity_ordered: quantity,
      });

      if (!res.data.payment_required) {
        toast.success('Order created successfully.');
        return;
      }

      const isLoaded = await loadRazorpay();
      if (!isLoaded || !window.Razorpay) {
        toast.error('Payment checkout could not be loaded. Please try again.');
        return;
      }

      const { order, razorpay_key } = res.data;
      const checkout = new window.Razorpay({
        key: razorpay_key,
        amount: order.amount_paise,
        currency: order.currency,
        name: 'AgriFlow Marketplace',
        description: `${quantity} quintal of ${order.crop_name}`,
        order_id: order.razorpay_order_id,
        handler: async (payment: any) => {
          await api.post('/api/orders/verify-payment', {
            order_id: order.id,
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature,
          });
          toast.success('Payment successful. Order confirmed.');
          setListings((current) => current.map((listing) => (
            listing.id === item.id
              ? { ...listing, quantity_quintals: Number(listing.quantity_quintals) - quantity }
              : listing
          )).filter((listing) => Number(listing.quantity_quintals) > 0));
        },
        prefill: {
          name: JSON.parse(localStorage.getItem('user') || '{}')?.name,
          email: JSON.parse(localStorage.getItem('user') || '{}')?.email,
        },
        theme: { color: '#22c55e' },
      });

      checkout.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not start purchase.');
    }
  };

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
                  onClick={() => handleBuyNow(item)}
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
