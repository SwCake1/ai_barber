import React, { useState, useRef } from 'react';
import { Camera, Upload, RefreshCw, Scissors, ChevronRight, Info, CheckCircle2, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeFace, generateHairstylePreview, AnalysisResult } from './services/gemini';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setPreviews([]);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    setPreviews([]);
    
    try {
      const analysis = await analyzeFace(image);
      if (!analysis || !analysis.recommendations) {
        throw new Error("Некорректный ответ от сервера анализа.");
      }
      setResult(analysis);
      
      // Generate previews
      setIsGenerating(true);
      try {
        const previewPromises = analysis.recommendations.map(async (rec) => {
          try {
            return await generateHairstylePreview(image, rec.name, rec.description);
          } catch (e) {
            console.error(`Failed to generate preview for ${rec.name}:`, e);
            return ""; 
          }
        });
        const generatedImages = await Promise.all(previewPromises);
        setPreviews(generatedImages.filter(img => img !== ""));
      } catch (genError) {
        console.error("Generation failed:", genError);
      } finally {
        setIsGenerating(false);
      }
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "Произошла ошибка при анализе фото. Попробуйте другое изображение.");
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setPreviews([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F0] font-sans selection:bg-[#C5A059] selection:text-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-white/10 p-6 flex justify-between items-center sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C5A059] rounded-full flex items-center justify-center text-[#0A0A0A]">
            <Scissors size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tighter uppercase italic font-serif text-[#C5A059]">BarberAI</h1>
        </div>
        {image && (
          <button 
            onClick={reset}
            className="text-xs uppercase tracking-widest font-bold opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2 text-[#C5A059]"
          >
            <RefreshCw size={14} /> Сбросить
          </button>
        )}
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3"
          >
            <Info size={20} />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-xs uppercase font-bold">Закрыть</button>
          </motion.div>
        )}

        {!image ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <h2 className="text-5xl md:text-7xl font-serif italic mb-8 leading-tight text-[#C5A059]">
              Найди свой идеальный <br /> стиль через науку
            </h2>
            <p className="max-w-xl text-lg opacity-70 mb-12 text-[#F5F5F0]">
              Загрузи фото. Наш ИИ проанализирует пропорции, FAR и угловатость челюсти, чтобы подобрать стрижку, которая тебе действительно подходит.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#C5A059] text-[#0A0A0A] px-12 py-5 rounded-full flex items-center gap-3 font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(197,160,89,0.3)]"
              >
                <Upload size={20} /> Загрузить фото
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleUpload} 
              />
            </div>
          </motion.div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div 
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative w-full max-w-md aspect-[3/4] mb-8 group">
                    <img 
                      src={image} 
                      alt="Original" 
                      className="w-full h-full object-cover rounded-2xl border-4 border-[#C5A059]/30 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      onClick={reset}
                      className="absolute top-4 right-4 bg-[#0A0A0A]/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity text-[#C5A059]"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={startAnalysis}
                    disabled={isAnalyzing}
                    className="bg-[#C5A059] text-[#0A0A0A] px-12 py-5 rounded-full flex items-center gap-4 font-bold text-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_0_30px_rgba(197,160,89,0.2)]"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw size={24} className="animate-spin" /> Анализируем...
                      </>
                    ) : (
                      <>
                        <LayoutGrid size={24} /> Начать биометрический анализ
                      </>
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-16"
                >
                  {/* Step 1: The Photo & Basic Metrics */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <div className="aspect-[3/4] sticky top-32">
                      <img 
                        src={image} 
                        alt="Original" 
                        className="w-full h-full object-cover rounded-2xl border-2 border-[#C5A059]/50 shadow-2xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="space-y-8">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C5A059] block mb-2">01. Биометрия</span>
                        <h3 className="text-4xl font-serif italic mb-6 text-[#F5F5F0]">Профиль лица</h3>
                        
                        <div className="grid grid-cols-2 gap-4 font-mono text-xs uppercase">
                          <div className="p-4 border border-white/10 rounded-xl bg-white/5">
                            <p className="opacity-50 mb-1">Форма</p>
                            <p className="font-bold text-lg text-[#C5A059]">{result.faceShape}</p>
                          </div>
                          <div className="p-4 border border-white/10 rounded-xl bg-white/5">
                            <p className="opacity-50 mb-1">Точность</p>
                            <p className="font-bold text-lg text-[#C5A059]">{(result.confidence * 100).toFixed(0)}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(result.metrics).map(([key, value]) => (
                          <div key={key} className="p-4 border border-white/5 rounded-xl bg-white/[0.02]">
                            <p className="font-mono text-[9px] uppercase opacity-40 mb-1">
                              {key === 'far' ? 'FAR (Aspect)' : 
                               key === 'thirds' ? 'Трети лица' : 
                               key === 'foreheadRatio' ? 'Лоб/Скулы' : 
                               key === 'jawRatio' ? 'Челюсть/Скулы' : 
                               key === 'angularity' ? 'Угловатость' : key}
                            </p>
                            <p className="font-mono font-bold text-xs text-[#C5A059]">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Step 2: The Detailed Analysis Report */}
                  <section className="bg-white/[0.03] border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C5A059] block mb-4">02. Экспертное заключение</span>
                    <h4 className="text-2xl font-serif italic mb-8 flex items-center gap-3 text-[#F5F5F0]">
                      <Info size={24} className="text-[#C5A059]" /> 
                      Почему эти параметры важны?
                    </h4>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-lg leading-relaxed opacity-80 whitespace-pre-line text-[#F5F5F0]">
                        {result.detailedReport}
                      </p>
                    </div>
                  </section>

                  {/* Step 3: Recommendations & Previews */}
                  <section className="space-y-12">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C5A059] block mb-4">03. Рекомендации</span>
                      <h3 className="text-4xl font-serif italic mb-8 text-[#F5F5F0]">Идеальные решения</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {result.recommendations.map((rec, idx) => (
                          <div key={idx} className="p-6 border border-white/10 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                            <div className="w-8 h-8 rounded-full bg-[#C5A059] text-[#0A0A0A] flex items-center justify-center font-mono text-xs mb-4">
                              {idx + 1}
                            </div>
                            <h5 className="font-bold text-lg mb-2 text-[#C5A059]">{rec.name}</h5>
                            <p className="text-sm opacity-70 mb-4 leading-snug text-[#F5F5F0]">{rec.description}</p>
                            <div className="pt-4 border-t border-white/5">
                              <p className="text-[10px] font-mono uppercase opacity-40 mb-1">Инструкция мастеру</p>
                              <p className="text-xs italic text-[#F5F5F0]/60">{rec.barberInstructions}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Previews */}
                    <div className="space-y-8">
                      <div className="flex justify-between items-end">
                        <h4 className="text-2xl font-serif italic text-[#F5F5F0]">Визуальная примерка</h4>
                        {isGenerating && (
                          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#C5A059]">
                            <RefreshCw size={14} className="animate-spin" /> Генерируем образы...
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {previews.length > 0 ? (
                          previews.map((url, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className="group relative"
                            >
                              <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                                <img 
                                  src={url} 
                                  alt={`Preview ${idx}`} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="mt-4">
                                <p className="font-mono text-[10px] uppercase opacity-40 mb-1">Вариант {idx + 1}</p>
                                <p className="font-bold text-[#C5A059]">{result.recommendations[idx]?.name}</p>
                              </div>
                            </motion.div>
                          ))
                        ) : isGenerating ? (
                          [1, 2, 3].map((i) => (
                            <div key={i} className="aspect-[3/4] rounded-2xl bg-white/[0.05] animate-pulse border border-white/10 flex items-center justify-center">
                              <Scissors size={24} className="opacity-10 text-[#C5A059]" />
                            </div>
                          ))
                        ) : null}
                      </div>
                    </div>
                  </section>
                  
                  <div className="pt-12 border-t border-white/10 flex justify-center">
                    <button 
                      onClick={reset}
                      className="text-xs uppercase tracking-widest font-bold text-[#C5A059] opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2"
                    >
                      <RefreshCw size={14} /> Начать заново
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer Decoration */}
      <footer className="mt-24 border-t border-white/10 p-12 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="text-[12vw] font-serif italic opacity-5 uppercase mx-8 text-[#C5A059]">
              BarberAI • Premium Grooming •
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
