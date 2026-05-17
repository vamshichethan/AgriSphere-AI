'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Target, Calendar, Calculator, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

type YieldFormValues = {
  state: string;
  district: string;
  crop: string;
  season: string;
  area_hectares: number;
};

export default function AnalyticsPage() {
  const [isPredicting, setIsPredicting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [prediction, setPrediction] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const { register, handleSubmit } = useForm<YieldFormValues>({
    defaultValues: {
      state: 'Maharashtra',
      district: 'Pune',
      crop: 'Wheat',
      season: 'Rabi',
      area_hectares: 5.5
    }
  });

  useEffect(() => {
    api.get('/api/yield/historical?state=Maharashtra&crop=Wheat&season=Rabi&from_year=2015')
      .then((res) => {
        const rows = (res.data.data || []).map((row: any) => ({
          year: row.crop_year,
          yield: Number(row.yield_quintals_per_hectare || 0),
        }));
        const byYear = rows.reduce((acc: Record<string, { year: number; total: number; count: number }>, row: any) => {
          if (!acc[row.year]) acc[row.year] = { year: row.year, total: 0, count: 0 };
          acc[row.year].total += row.yield;
          acc[row.year].count += 1;
          return acc;
        }, {});
        setHistory((Object.values(byYear) as Array<{ year: number; total: number; count: number }>)
          .map((row) => ({ year: row.year, yield: Number((row.total / row.count).toFixed(2)) }))
          .sort((a, b) => a.year - b.year));
      })
      .catch(() => toast.error('Failed to load historical yield trends.'))
      .finally(() => setIsLoadingHistory(false));
  }, []);

  const onSubmit = async (data: YieldFormValues) => {
    setIsPredicting(true);
    try {
      const res = await api.post('/api/yield/predict', data);
      setPrediction(res.data.prediction);
      toast.success("Yield prediction calculated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to calculate yield prediction.');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Yield Analytics & Predictor</h1>
        <p className="text-neutral-400">Leverage historical data to forecast crop yields based on region, season, and area.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Predictor Form */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl h-fit">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-xl">
               <Calculator className="w-5 h-5" />
             </div>
             <h2 className="text-xl font-semibold">Predict Yield</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-neutral-400 flex items-center gap-2"><MapPin className="w-4 h-4" /> State</label>
                <input {...register('state')} className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-neutral-400">District</label>
                <input {...register('district')} className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-neutral-400 flex items-center gap-2"><Target className="w-4 h-4" /> Crop</label>
                <select {...register('crop')} className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors appearance-none">
                  <option value="Rice">Rice</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Corn">Corn</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Potato">Potato</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-neutral-400 flex items-center gap-2"><Calendar className="w-4 h-4" /> Season</label>
                <select {...register('season')} className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors appearance-none">
                  <option value="Kharif">Kharif</option>
                  <option value="Rabi">Rabi</option>
                  <option value="Summer">Summer</option>
                  <option value="Whole Year">Whole Year</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-neutral-400">Area (Hectares)</label>
              <input {...register('area_hectares')} type="number" step="0.01" className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>

            <button type="submit" disabled={isPredicting} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-neutral-950 font-bold py-3 rounded-xl transition-all flex items-center justify-center mt-6">
              {isPredicting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Calculate Estimate'}
            </button>
          </form>
        </div>

        {/* Prediction Results */}
        <div className="lg:col-span-7 space-y-6">
          {prediction ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10"><TrendingUp className="w-32 h-32" /></div>
                <p className="text-neutral-400 text-sm font-medium mb-1">Expected Yield</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-emerald-400">{prediction.yield_quintals_per_hectare}</span>
                  <span className="text-neutral-500">Quintals / Ha</span>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10"><Target className="w-32 h-32" /></div>
                <p className="text-neutral-400 text-sm font-medium mb-1">Total Production Estimate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-400">{prediction.estimated_production_quintals}</span>
                  <span className="text-neutral-500">Quintals total</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center h-[200px] border border-dashed border-neutral-800">
               <TrendingUp className="w-10 h-10 text-neutral-700 mb-3" />
               <p className="text-neutral-500">Fill the form to calculate yield predictions.</p>
            </div>
          )}

          <div className="glass-panel p-6 rounded-2xl border border-white/5 h-[300px] flex flex-col">
            <h3 className="font-semibold mb-4">Historical Regional Trends</h3>
            <div className="flex-1 border-t border-neutral-800 pt-4">
              {isLoadingHistory ? (
                <div className="h-full flex items-center justify-center text-neutral-500 text-sm">Loading trends...</div>
              ) : history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="year" stroke="#737373" fontSize={12} />
                    <YAxis stroke="#737373" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 8 }}
                      labelStyle={{ color: '#f5f5f5' }}
                    />
                    <Line type="monotone" dataKey="yield" name="Yield / Ha" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                  No historical records available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
