import React, { useState, useEffect } from 'react';
import { Asset } from '../types';
import { Layers, User, Package, Map, Wand2, RefreshCw, Save } from 'lucide-react';

interface StageAssetsProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  onNext: () => void;
}

const StageAssets: React.FC<StageAssetsProps> = ({ assets, setAssets, onNext }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CHARACTER' | 'SCENE' | 'PROP'>('ALL');
  const [generating, setGenerating] = useState<string | null>(null);

  // Mock initial asset extraction if empty
  useEffect(() => {
    if (assets.length === 0) {
      const mockAssets: Asset[] = [
        { 
          id: '1', 
          name: '赛博朋克街道', 
          type: 'SCENE', 
          description: '雨夜中霓虹闪烁的街道，银翼杀手风格', 
          inMasterLib: false,
          states: [{ id: '1-s1', name: '默认', description: '初始状态', thumbnailUrls: [] }]
        },
        { 
          id: '2', 
          name: '主角 (Kael)', 
          type: 'CHARACTER', 
          description: '疲惫的侦探，装有义眼，身穿风衣', 
          inMasterLib: true,
          states: [{ id: '2-s1', name: '默认', description: '初始状态', thumbnailUrls: [] }]
        },
        { 
          id: '3', 
          name: '等离子手枪', 
          type: 'PROP', 
          description: '生锈的重型手枪，带有发光的蓝色线圈', 
          inMasterLib: false,
          states: [{ id: '3-s1', name: '默认', description: '初始状态', thumbnailUrls: [] }]
        },
        { 
          id: '4', 
          name: '飞行汽车', 
          type: 'PROP', 
          description: '流线型悬浮车，经过重度改装', 
          inMasterLib: false,
          states: [{ id: '4-s1', name: '默认', description: '初始状态', thumbnailUrls: [] }]
        },
        { 
          id: '5', 
          name: '公寓内景', 
          type: 'SCENE', 
          description: '杂乱的小公寓，到处都是屏幕', 
          inMasterLib: false,
          states: [{ id: '5-s1', name: '默认', description: '初始状态', thumbnailUrls: [] }]
        },
      ];
      setAssets(mockAssets);
    }
  }, [assets.length, setAssets]);

  const filteredAssets = activeTab === 'ALL' ? assets : assets.filter(a => a.type === activeTab);

  const generateImage = (id: string) => {
    setGenerating(id);
    setTimeout(() => {
      setAssets(prev => prev.map(a => 
        a.id === id ? { ...a, imageUrl: `https://picsum.photos/seed/${a.id}/400/400` } : a
      ));
      setGenerating(null);
    }, 1500);
  };

  const generateAll = () => {
    const ungenerated = filteredAssets.filter(a => !a.imageUrl);
    ungenerated.forEach((a, index) => {
       setTimeout(() => generateImage(a.id), index * 500);
    });
  };

  const tabLabels = {
    'ALL': '全部',
    'CHARACTER': '角色',
    'SCENE': '场景',
    'PROP': '道具'
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header & Agent Status */}
      <div className="flex justify-between items-end pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-semibold mb-2">资产提取与生成</h2>
          <div className="flex space-x-4">
             {/* Agent Badges */}
             <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1 rounded text-xs text-blue-300 border border-blue-900/30">
                <Map size={14} /> <span>世界智能体: 活跃</span>
             </div>
             <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1 rounded text-xs text-emerald-300 border border-emerald-900/30">
                <User size={14} /> <span>角色智能体: 活跃</span>
             </div>
          </div>
        </div>
        <button onClick={onNext} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm border border-slate-600">
          保存并前往资产库
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg w-fit">
        {(['ALL', 'CHARACTER', 'SCENE', 'PROP'] as const).map(type => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === type ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tabLabels[type]}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-400">发现 {filteredAssets.length} 个资产</p>
        <button 
          onClick={generateAll}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg shadow-indigo-900/20"
        >
          <Wand2 size={16} />
          <span>生成所有缺失项</span>
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map(asset => (
            <div key={asset.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-colors group relative">
              
              {/* Image Area */}
              <div className="aspect-square bg-slate-950 relative flex items-center justify-center">
                {asset.imageUrl ? (
                  <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                     {generating === asset.id ? (
                        <RefreshCw className="animate-spin text-indigo-500 mx-auto mb-2" />
                     ) : (
                        <Layers className="text-slate-700 mx-auto mb-2" />
                     )}
                     <p className="text-xs text-slate-600">{generating === asset.id ? "绘画中..." : "未生成图像"}</p>
                  </div>
                )}
                
                {/* Overlay Action */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 backdrop-blur-sm">
                   <button 
                     onClick={() => generateImage(asset.id)}
                     className="bg-white text-slate-900 p-2 rounded-full hover:scale-110 transition-transform"
                     title="重新生成"
                   >
                     <RefreshCw size={18} />
                   </button>
                </div>
                
                {/* Type Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md text-white border border-white/10">
                  {asset.type}
                </div>
              </div>

              {/* Info Area */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-200 truncate">{asset.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 h-8">{asset.description}</p>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className={`w-2 h-2 rounded-full ${asset.inMasterLib ? 'bg-emerald-500' : 'bg-slate-700'}`} title={asset.inMasterLib ? "已同步至主库" : "仅本地"} />
                  <span className="text-[10px] text-slate-600 font-mono">ID: {asset.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StageAssets;