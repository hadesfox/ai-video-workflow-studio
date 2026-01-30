import React, { useState, useEffect } from 'react';
import { Episode, Asset, VideoSettings, TimelineClip, Shot } from '../types';
import { 
  Clapperboard, Play, Download, Settings, Image as ImageIcon, 
  Film, Share2, Plus, MoreHorizontal, FileText, Loader2, 
  ChevronRight, RefreshCw, Wand2, Trash2, Edit2, CheckCircle2,
  AlertCircle, ChevronDown, MonitorPlay, Layout, FolderOpen
} from 'lucide-react';

interface StageVideoProps {
  episodes: Episode[];
  setEpisodes: React.Dispatch<React.SetStateAction<Episode[]>>;
  assets: Asset[];
  videoSettings: VideoSettings;
  setVideoSettings: (s: VideoSettings) => void;
  setEditorClips: (clips: TimelineClip[]) => void;
  goToAssets: () => void;
  onNext: () => void;
  hasVisitedVideo: boolean;
  setHasVisitedVideo: (b: boolean) => void;
}

const StageVideo: React.FC<StageVideoProps> = ({ 
  episodes, setEpisodes, assets, videoSettings, setVideoSettings, 
  setEditorClips, goToAssets, onNext, hasVisitedVideo, setHasVisitedVideo 
}) => {
  const [activeEpisodeId, setActiveEpisodeId] = useState<string>(episodes[0]?.id || '');
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [exportModal, setExportModal] = useState(false);

  const activeEpisode = episodes.find(e => e.id === activeEpisodeId) || episodes[0];

  useEffect(() => {
    if (!hasVisitedVideo) {
        // Mock showing a tutorial or intro
        setHasVisitedVideo(true);
    }
  }, []);

  const handleVideoDownload = () => {
    alert("正在打包下载本集视频...");
  };

  const handleOneClickVideo = (mode: 'TEXT' | 'IMAGE') => {
     setIsBatchGenerating(true);
     setTimeout(() => {
        setIsBatchGenerating(false);
        // This would update shot status in a real app
     }, 3000);
  };

  return (
    <div className="flex h-full bg-slate-950 animate-fade-in overflow-hidden">
        {/* Left Sidebar: Episode List */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                    <FolderOpen size={18} className="text-blue-500" />
                    分集列表
                </h3>
                <div className="flex gap-2">
                    <button className="text-slate-500 hover:text-white"><Settings size={14}/></button>
                    <button className="text-slate-500 hover:text-white"><Layout size={14}/></button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {episodes.map(ep => (
                    <div 
                        key={ep.id}
                        onClick={() => setActiveEpisodeId(ep.id)}
                        className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all ${
                            activeEpisodeId === ep.id 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'hover:bg-slate-800 text-slate-400'
                        }`}
                    >
                        <span className="text-sm font-medium">{ep.name}</span>
                        <span className="text-xs opacity-70 bg-black/20 px-2 py-0.5 rounded-full">{ep.shots.length} 镜头</span>
                    </div>
                ))}
                <button className="w-full mt-2 py-2 border border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-blue-400 hover:border-blue-500 flex items-center justify-center gap-2 text-sm transition-colors">
                    <Plus size={14} /> 新增分集
                </button>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Header Toolbar */}
            <div className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <Clapperboard className="text-purple-500" size={20} />
                    <h2 className="text-lg font-bold text-white">{activeEpisode?.name}</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-700 rounded-lg text-slate-300 text-sm hover:bg-slate-800 transition-colors">
                        <Download size={14} /> 下载整部视频
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-700 rounded-lg text-slate-300 text-sm hover:bg-slate-800 transition-colors">
                        <Settings size={14} /> 视频生成设置
                    </button>
                </div>
            </div>

            {/* Sub Toolbar (Actions) */}
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
               <div className="text-sm text-slate-500">共 {activeEpisode?.shots.length || 0} 个镜头</div>
               <div className="flex gap-3">
                   <button className="flex items-center gap-2 px-4 py-2 bg-indigo-900/50 text-indigo-300 border border-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-900 transition-colors">
                       <Film size={16} /> 生成分镜
                   </button>
                   <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-purple-900/20 transition-colors">
                       <Play size={16} /> 一键生成主体视频
                   </button>
                   
                   {/* Global Action 2: Image Video */}
                   <button 
                      onClick={(e) => { e.stopPropagation(); handleOneClickVideo('IMAGE'); }}
                      disabled={!activeEpisode?.shots.length || isBatchGenerating}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20 disabled:opacity-50 transition-all active:scale-95"
                   >
                      {isBatchGenerating && <Loader2 className="animate-spin" size={16} />}
                      <ImageIcon size={16} />
                      <span>一键生成图生视频</span>
                   </button>
    
                   {/* Download Button - Modified to include text */}
                   <button 
                      onClick={(e) => { e.stopPropagation(); handleVideoDownload(); }}
                      disabled={!activeEpisode?.shots.length}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                   >
                      <Download size={16} />
                      <span>下载本集视频</span>
                   </button>

                   <button 
                      onClick={(e) => { e.stopPropagation(); setExportModal(true); }}
                      disabled={!activeEpisode?.shots.length}
                      className="flex items-center gap-2 px-4 py-2 bg-pink-700 hover:bg-pink-600 text-white border border-pink-600 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors shadow-lg shadow-pink-900/20"
                   >
                      <Share2 size={16} /> 一键导出剪辑
                   </button>
               </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Script Panel */}
                <div className="w-80 border-r border-slate-800 bg-slate-900/50 p-4 overflow-y-auto">
                    <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                        <FileText size={14}/> 本集剧本
                    </h3>
                    <div className="text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                        {activeEpisode?.scriptContent || "暂无剧本内容..."}
                    </div>
                </div>

                {/* Shot List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/20">
                    {(!activeEpisode?.shots || activeEpisode.shots.length === 0) ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <Film size={48} className="opacity-20 mb-4" />
                            <p>本集暂无分镜，请点击“生成分镜”</p>
                        </div>
                    ) : (
                        activeEpisode.shots.map((shot, idx) => (
                            <div key={shot.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-6">
                                {/* Video Player Placeholder */}
                                <div className="w-[320px] aspect-video bg-black rounded-lg border border-slate-800 flex items-center justify-center relative group">
                                    <span className="text-xs text-slate-600">等待生成</span>
                                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 px-1 rounded text-slate-400">{shot.duration}s</span>
                                    <div className="absolute top-2 left-2 text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">SHOT {String(idx+1).padStart(2, '0')}</div>
                                </div>

                                {/* Controls */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-slate-500 uppercase">分镜提示词 (PROMPT)</div>
                                            <textarea 
                                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-300 h-20 resize-none focus:border-blue-500 outline-none"
                                                defaultValue={shot.description}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-400 hover:text-white" title="图生视频"><ImageIcon size={16}/></button>
                                            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-400 hover:text-white" title="主体生成"><Wand2 size={16}/></button>
                                        </div>
                                    </div>
                                    
                                    {/* Assets */}
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                            <CheckCircle2 size={12} className="text-emerald-500"/> 关联资产
                                        </div>
                                        {/* Mock Asset Chips */}
                                        <div className="flex gap-2">
                                            {assets.slice(0, 2).map(a => (
                                                <div key={a.id} className="flex items-center gap-2 bg-slate-800 border border-slate-700 pr-2 rounded-md overflow-hidden">
                                                    <div className="w-6 h-6 bg-black">
                                                        {a.imageUrl && <img src={a.imageUrl} className="w-full h-full object-cover" alt={a.name}/>}
                                                    </div>
                                                    <span className="text-[10px] text-slate-300">{a.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
        
        {/* Export Modal Placeholder */}
        {exportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="bg-slate-900 p-8 rounded-xl border border-slate-700 text-center animate-scale-in">
                    <h3 className="text-xl font-bold text-white mb-4">导出功能开发中</h3>
                    <button onClick={() => setExportModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">关闭</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default StageVideo;