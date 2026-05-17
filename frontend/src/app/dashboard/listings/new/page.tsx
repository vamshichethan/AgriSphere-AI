'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Upload, IndianRupee, Scale, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

type ListingFormValues = {
  crop_name: string;
  quantity_quintals: number;
  price_per_quintal: number;
  location_state: string;
  location_district: string;
  description: string;
};

export default function NewListingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ListingFormValues>();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ListingFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('crop_name', data.crop_name);
      formData.append('quantity_quintals', String(data.quantity_quintals));
      formData.append('price_per_quintal', String(data.price_per_quintal));
      formData.append('location_state', data.location_state);
      formData.append('location_district', data.location_district);
      formData.append('description', data.description || '');
      if (selectedFile) formData.append('crop_image', selectedFile);

      await api.post('/api/listings', formData);
      toast.success("Crop listed successfully!");
      router.push('/dashboard/listings');
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/listings" className="p-2 glass-panel rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-neutral-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Create New Listing</h1>
          <p className="text-neutral-400 text-sm">Post your harvested crop to the real-time marketplace.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload Area */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Crop Image</label>
            <div className="border-2 border-dashed border-neutral-700 hover:border-green-500/50 rounded-2xl p-6 text-center bg-neutral-900/50 relative transition-colors h-48 flex items-center justify-center">
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-neutral-500 mb-2" />
                  <p className="text-sm font-medium text-neutral-300">Click to upload photo</p>
                  <p className="text-xs text-neutral-500 mt-1">Make sure it's well-lit and clear</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Crop Name</label>
            <input 
              {...register('crop_name', { required: 'Crop name is required' })}
              type="text" 
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-neutral-100"
              placeholder="e.g. Premium Basmati Rice"
            />
            {errors.crop_name && <p className="text-red-400 text-xs mt-1">{errors.crop_name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                 <Scale className="w-4 h-4 text-neutral-500" /> Quantity Available
              </label>
              <div className="relative">
                <input 
                  {...register('quantity_quintals', { required: 'Quantity is required', min: 1 })}
                  type="number" 
                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 pl-4 pr-16 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-neutral-100"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">Quintals</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-neutral-500" /> Price per Quintal
              </label>
              <input 
                {...register('price_per_quintal', { required: 'Price is required', min: 100 })}
                type="number" 
                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-neutral-100"
                placeholder="₹ 0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">State</label>
              <input
                {...register('location_state', { required: 'State is required' })}
                type="text"
                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-neutral-100"
                placeholder="e.g. Karnataka"
              />
              {errors.location_state && <p className="text-red-400 text-xs mt-1">{errors.location_state.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-300">District</label>
              <input
                {...register('location_district', { required: 'District is required' })}
                type="text"
                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-neutral-100"
                placeholder="e.g. Bengaluru Rural"
              />
              {errors.location_district && <p className="text-red-400 text-xs mt-1">{errors.location_district.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Description (Optional)</label>
            <textarea 
              {...register('description')}
              rows={4}
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-neutral-100 resize-none"
              placeholder="Describe the quality, harvest date, and any other details..."
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-neutral-950 font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center mt-2 shadow-lg shadow-green-500/20"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish to Marketplace'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
