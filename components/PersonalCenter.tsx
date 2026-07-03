import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, ChevronLeft, Terminal, Zap, RefreshCw, Palette, Play, Info, Layers, Sliders, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalAsset {
  id: string;
  thumbnail: string;
  type: 'video' | 'image';
  url: string;
  prompt: string;
  parameters?: {
    ratio: string;
    resolution: string;
    duration?: string;
    model: string;
    seed: number;
  };
  referenceImage?: string;
  createdAt: string;
}

interface PersonalCenterProps {
  onExit: () => void;
  username: string;
  email: string;
}

const PersonalCenter: React.FC<PersonalCenterProps> = ({ onExit, username, email }) => {
  const [assets, setAssets] = useState<PersonalAsset[]>([]);
  const [activeAssetType, setActiveAssetType] = useState<'video' | 'image'>('video');
  const [displayCount, setDisplayCount] = useState(32);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<PersonalAsset | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Mock data generation
  useEffect(() => {
    const mockAssets: PersonalAsset[] = Array.from({ length: 128 }).map((_, i) => ({
      id: `${i % 2 === 0 ? 'v' : 'i'}-${i}`,
      thumbnail: `https://picsum.photos/seed/${i + 100}/400/225`,
      type: i % 2 === 0 ? 'video' : 'image',
      url: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
      prompt: i % 2 === 0 ? `Cyberpunk city street with neon lights, raining, close up of a ${i % 3 === 0 ? 'cybernetic eye' : 'neon sign'}` : `A magical forest landscape with glowing plants and ${i % 3 === 0 ? 'ancient ruins' : 'floating wisps'}`,
      parameters: {
        ratio: '16:9',
        resolution: '1080p',
        duration: '5s',
        model: 'Model-V1',
        seed: Math.floor(Math.random() * 1000000),
      },
      referenceImage: `https://picsum.photos/seed/${i + 200}/200/200`,
      createdAt: '2023-10-27',
    }));
    setAssets(mockAssets);
  }, []);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredAssets.length) {
          setDisplayCount(prev => prev + 32);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [displayCount, searchQuery, activeAssetType]);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => a.type === activeAssetType && a.prompt.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [assets, searchQuery, activeAssetType]);

  const currentBatch = filteredAssets.slice(0, displayCount);

  return (
    <div className="fixed inset-0 z-[100] bg-theme-page flex flex-col font-sans text-theme-primary">
      {/* 1. Header (Same as Homepage Title Bar) */}
      <header className="shrink-0 h-18 bg-theme-panel border-b border-theme-border z-10">
        <div className="h-full flex items-center justify-between px-6">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onExit}
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-lg">
               <Terminal className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-wide text-white hidden sm:block">FREELITE</span>
          </div>

          {/* Center Text */}
          <div className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-white tracking-widest">
            个人中心
          </div>

          {/* Right Interface Icons (Unchanged) */}
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors"><Zap size={18} /></button>
                <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors"><RefreshCw size={18} /></button>
                <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors"><Palette size={18} /></button>
             </div>
             <button 
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-800"
              onClick={onExit}
             >
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
             </button>
          </div>
        </div>
      </header>

      {/* 2. Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Search Header */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveAssetType('image')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeAssetType === 'image' ? 'bg-slate-700 text-white' : 'bg-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                图片
              </button>
              <button 
                onClick={() => setActiveAssetType('video')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeAssetType === 'video' ? 'bg-slate-700 text-white' : 'bg-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                视频
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                {activeAssetType === 'video' ? '我的全部视频' : '我的全部图片'}
                <span className="ml-2 text-sm font-normal text-slate-500">{filteredAssets.length} 个资产</span>
              </h2>
              <div className="relative group w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="搜索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-theme-card border border-theme-border rounded-xl py-2 pl-10 pr-4 text-sm text-theme-primary outline-none focus:border-theme-accent/50 focus:ring-1 focus:ring-theme-accent/20 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Video Grid (4 per row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {currentBatch.map((asset, idx) => (
                <motion.div 
                  key={asset.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx % 12) * 0.05 }}
                  onClick={() => setSelectedAsset(asset)}
                  className="group relative aspect-video bg-theme-card rounded-2xl overflow-hidden border border-theme-border/50 cursor-pointer hover:border-theme-accent/50 transition-all shadow-lg hover:shadow-theme-accent/10"
                >
                  <img src={asset.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-theme-page via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  
                  {asset.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-blue-600 p-3 rounded-full shadow-xl shadow-blue-500/30 scale-90 group-hover:scale-100 transition-transform">
                        <Play className="text-white fill-white" size={24} />
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed bg-theme-page/60 backdrop-blur-md p-2 rounded-lg border border-theme-border/30">
                      {asset.prompt}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More Trigger */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center mt-12">
            {displayCount < filteredAssets.length && (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="animate-spin text-blue-500" size={20} />
                <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Loading assets...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Expanded Asset Detail View */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-theme-page/95 backdrop-blur-2xl flex items-center justify-center p-4 lg:p-8"
          >
            <div className="relative w-full max-w-7xl aspect-[16/9] lg:aspect-auto lg:h-[85vh] bg-theme-panel rounded-3xl overflow-hidden shadow-2xl border border-theme-border flex flex-col lg:flex-row">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedAsset(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-theme-card/80 hover:bg-slate-800 rounded-full text-theme-secondary hover:text-white transition-all backdrop-blur-md border border-theme-border/50"
              >
                <X size={20} />
              </button>

              {/* Left: Preview */}
              <div className="flex-[3] bg-black relative group flex items-center justify-center overflow-hidden">
                {selectedAsset.type === 'video' ? (
                  <video 
                    src={selectedAsset.url} 
                    autoPlay 
                    controls 
                    className="max-h-full w-full object-contain"
                  />
                ) : (
                  <img 
                    src={selectedAsset.url} 
                    alt={selectedAsset.prompt}
                    className="max-h-full w-full object-contain"
                  />
                )}
              </div>

              {/* Right: Toolbar / Details */}
              <div className="flex-1 bg-theme-page border-l border-theme-border flex flex-col overflow-y-auto custom-scrollbar">
                
                {/* Header Information */}
                <div className="p-6 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sliders size={16} className="text-blue-500" />
                    生成参数
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-theme-card p-3 rounded-xl border border-theme-border/50">
                      <p className="text-[10px] text-theme-secondary font-bold uppercase mb-1">画幅比例</p>
                      <p className="text-sm text-theme-primary font-mono">{selectedAsset.parameters?.ratio || 'N/A'}</p>
                    </div>
                    <div className="bg-theme-card p-3 rounded-xl border border-theme-border/50">
                      <p className="text-[10px] text-theme-secondary font-bold uppercase mb-1">分辨率</p>
                      <p className="text-sm text-theme-primary font-mono">{selectedAsset.parameters?.resolution || 'N/A'}</p>
                    </div>
                    {selectedAsset.parameters?.duration && (
                      <div className="bg-theme-card p-3 rounded-xl border border-theme-border/50">
                        <p className="text-[10px] text-theme-secondary font-bold uppercase mb-1">时长</p>
                        <p className="text-sm text-theme-primary font-mono">{selectedAsset.parameters.duration}</p>
                      </div>
                    )}
                    <div className="bg-theme-card p-3 rounded-xl border border-theme-border/50">
                      <p className="text-[10px] text-theme-secondary font-bold uppercase mb-1">模型</p>
                      <p className="text-sm text-theme-primary font-mono">{selectedAsset.parameters?.model || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Reference Image */}
                {selectedAsset.referenceImage && (
                  <div className="p-6 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <ImageIcon size={16} className="text-purple-500" />
                      参考图
                    </h3>
                    <div className="relative group aspect-square rounded-2xl overflow-hidden border border-theme-border bg-theme-panel shadow-inner">
                      <img src={selectedAsset.referenceImage} alt="Reference" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {/* Prompt */}
                <div className="p-6 flex-1">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MessageSquare size={16} className="text-green-500" />
                    生成提示词
                  </h3>
                  <div className="bg-theme-card/50 p-4 rounded-2xl border border-theme-border/50 text-theme-secondary text-sm leading-relaxed font-sans shadow-inner italic">
                  "{selectedAsset.prompt}"
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                      <RefreshCw size={18} />
                      重新生成
                    </button>
                    <button className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700">
                      <Zap size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalCenter;
