'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, IndianRupee, Sprout, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function MyListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/api/listings/mine')
      .then((res) => setListings(res.data.listings || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load your listings.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/listings/${id}`);
      setListings((current) => current.filter((item) => item.id !== id));
      toast.success('Listing deleted.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Listings</h1>
          <p className="text-neutral-400">Manage your active crop listings on the AgriFlow marketplace.</p>
        </div>
        <Link 
          href="/dashboard/listings/new" 
          className="bg-green-500 hover:bg-green-600 text-neutral-950 px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
        >
          <Plus className="w-5 h-5" />
          Create Listing
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 w-full bg-white/5 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {listings.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/10 hover:border-green-500/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{item.crop_name}</h3>
                  <p className="text-sm text-neutral-400">Listed on {item.created_at}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 w-full md:w-auto">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Available Stock</p>
                  <p className="font-medium text-white">{item.quantity_quintals} Quintals</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Price / Qtl</p>
                  <p className="font-medium text-green-400 flex items-center">
                    <IndianRupee className="w-3.5 h-3.5 mr-0.5" /> {item.price_per_quintal}
                  </p>
                </div>
                <div className="flex gap-2 ml-auto md:ml-4">
                  <button className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Edit listing">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete listing"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-panel py-16 rounded-2xl flex flex-col items-center justify-center border border-dashed border-neutral-700">
          <Sprout className="w-12 h-12 text-neutral-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No active listings</h3>
          <p className="text-neutral-400 mb-6 text-sm">You haven't listed any crops on the marketplace yet.</p>
          <Link href="/dashboard/listings/new" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Create Your First Listing
          </Link>
        </div>
      )}
    </div>
  );
}
