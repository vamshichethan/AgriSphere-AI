'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { ArrowRight, User, Mail, Lock, MapPin, Navigation, Loader2 } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['farmer', 'buyer']),
  state: z.string().optional(),
  district: z.string().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'farmer'
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/signup`, data);
      if (res.data.success) {
        toast.success(res.data.message);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4 relative overflow-hidden py-12">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] -z-10 translate-x-1/3 translate-y-1/3" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="inline-flex items-center text-sm text-neutral-400 hover:text-green-400 transition-colors mb-6">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Home
        </Link>

        <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
           
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Join AgriFlow</h1>
            <p className="text-neutral-400 text-sm">Create your account to start trading</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selection */}
            <div className="flex gap-4 mb-2">
              <label className={`flex-1 cursor-pointer border rounded-xl py-3 text-center transition-all ${selectedRole === 'farmer' ? 'border-green-500 bg-green-500/10 text-green-400 font-medium' : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:bg-neutral-800/50'}`}>
                <input type="radio" value="farmer" {...register('role')} className="hidden" />
                Farmer
              </label>
              <label className={`flex-1 cursor-pointer border rounded-xl py-3 text-center transition-all ${selectedRole === 'buyer' ? 'border-green-500 bg-green-500/10 text-green-400 font-medium' : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:bg-neutral-800/50'}`}>
                <input type="radio" value="buyer" {...register('role')} className="hidden" />
                Buyer
              </label>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input {...register('name')} type="text" className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all text-neutral-100 placeholder:text-neutral-600" placeholder="Full Name" />
              </div>
              {errors.name && <p className="text-red-400 text-xs ml-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input {...register('email')} type="email" className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all text-neutral-100 placeholder:text-neutral-600" placeholder="Email Address" />
              </div>
              {errors.email && <p className="text-red-400 text-xs ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input {...register('password')} type="password" className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all text-neutral-100 placeholder:text-neutral-600" placeholder="Password (min. 6 chars)" />
              </div>
              {errors.password && <p className="text-red-400 text-xs ml-1">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input {...register('state')} type="text" className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all text-neutral-100 placeholder:text-neutral-600" placeholder="State" />
              </div>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input {...register('district')} type="text" className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all text-neutral-100 placeholder:text-neutral-600" placeholder="District" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-neutral-950 font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center mt-2">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-neutral-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-green-500 hover:text-green-400 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
