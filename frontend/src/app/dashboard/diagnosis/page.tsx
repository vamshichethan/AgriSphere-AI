'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, AlertCircle, CheckCircle2, ShieldAlert, Leaf, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function DiagnosisPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); // Reset previous result
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('leaf_image', selectedFile);

    try {
      const res = await api.post('/api/diagnosis/analyze', formData);
      setResult(res.data.diagnosis);
      toast.success("Analysis complete");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to analyze image. Ensure backend and ML services are running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Disease Diagnosis</h1>
        <p className="text-neutral-400">Upload a clear photo of a crop leaf to instantly detect diseases and get treatment plans.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 text-green-500 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold">Upload Image</h2>
          </div>

          <div className="border-2 border-dashed border-neutral-700 hover:border-green-500/50 transition-colors rounded-2xl p-8 text-center bg-neutral-900/50 relative">
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp" 
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {previewUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Leaf preview" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white font-medium">Click to change image</p>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <Leaf className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-300 font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-neutral-500 text-sm">JPG, PNG, or WEBP (max 5MB)</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!selectedFile || isAnalyzing}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-neutral-950 font-bold py-3 rounded-xl transition-all flex items-center justify-center"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Image...</>
            ) : 'Analyze Leaf'}
          </button>
        </div>

        {/* Results Section */}
        <div>
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-6 rounded-2xl border border-green-500/30 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
              
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-neutral-400 text-sm mb-1">{result.crop}</p>
                  <h3 className="text-2xl font-bold text-white capitalize">{result.disease.replace(/_/g, ' ')}</h3>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium border border-green-500/30">
                    <CheckCircle2 className="w-4 h-4" /> {result.confidence}% Match
                  </div>
                </div>
              </div>

              {result.treatment ? (
                <div className="space-y-4">
                  <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                    <h4 className="flex items-center gap-2 text-white font-medium mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-400" /> Symptoms
                    </h4>
                    <p className="text-neutral-400 text-sm">{result.treatment.symptoms}</p>
                  </div>
                  
                  <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                    <h4 className="flex items-center gap-2 text-white font-medium mb-2">
                      <Leaf className="w-4 h-4 text-green-400" /> Organic Treatment
                    </h4>
                    <p className="text-neutral-400 text-sm">{result.treatment.organic_treatment}</p>
                  </div>

                  <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                    <h4 className="flex items-center gap-2 text-white font-medium mb-2">
                      <ShieldAlert className="w-4 h-4 text-blue-400" /> Chemical Treatment
                    </h4>
                    <p className="text-neutral-400 text-sm">{result.treatment.chemical_treatment}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-neutral-900/50 rounded-xl text-center text-neutral-400 text-sm border border-neutral-800">
                  Treatment details unavailable for this disease.
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-dashed border-neutral-800">
              <ShieldAlert className="w-12 h-12 text-neutral-700 mb-4" />
              <h3 className="text-lg font-medium text-neutral-300 mb-2">Awaiting Image</h3>
              <p className="text-neutral-500 text-sm max-w-xs">
                Upload a leaf image and click Analyze. Results will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
