import React, { useState, useEffect, useRef } from 'react';
import { 
  File, Folder, MoreVertical, Share2, ExternalLink, Link, CheckCircle2, 
  Upload, ListFilter, Grid, List, Search, Plus, Trash2, Copy, Move, 
  Download, Image as ImageIcon, Video, Music, MoreHorizontal, ChevronRight,
  Zap, DownloadCloud, History, MessageSquare, Play, Maximize2, Trash, Edit3, FolderPlus, FileVideo,
  Check, LayoutGrid, LayoutDashboard, UserCircle, Square, ArrowUpRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReviewItem, ReviewSubTab } from '../types';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { zhCN } from 'date-fns/locale';

registerLocale('zh', zhCN);

interface OnlineReviewProps {
  clips?: any[];
  subTab?: ReviewSubTab;
}


const VideoReviewPlayer: React.FC<{ item: ReviewItem, onClose: () => void }> = ({ item, onClose }) => {
  type Comment = { id: string, text: string, username: string, timestamp: number };
  type Annotation = { 
    id: string, 
    time: number, 
    text: string, 
    username: string, 
    avatar: string, 
    timestamp: number,
    drawing?: { points: {x: number, y: number}[] }[],
    snapshot?: string,
    comments?: Comment[]
  };

  const [annotationsV1, setAnnotationsV1] = useState<Annotation[]>([
    { id: 'a1', time: 5, text: 'V1: 开场镜头有点暗', username: '杨', avatar: 'https://i.pravatar.cc/32?u=a', timestamp: Date.now() },
  ]);
  const [annotationsV2, setAnnotationsV2] = useState<Annotation[]>([
    { id: 'a2', time: 53, text: '1111', username: '364', avatar: 'https://i.pravatar.cc/32?u=a', timestamp: Date.now(), comments: [] },
    { id: 'a3', time: 65, text: '22', username: '364', avatar: 'https://i.pravatar.cc/32?u=b', timestamp: Date.now() },
  ]);

  const [currentVersion, setCurrentVersion] = useState('v2');
  const [highlightedAnnoId, setHighlightedAnnoId] = useState<string | null>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);
  const [finalPaths, setFinalPaths] = useState<{points: {x: number, y: number}[]}[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  const annotations = currentVersion === 'v1' ? annotationsV1 : annotationsV2;
  const setAnnotations = currentVersion === 'v1' ? setAnnotationsV1 : setAnnotationsV2;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(e => console.error("Playback failed:", e));
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const frameStep = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const setVolumeLevel = (v: number) => {
    setVolume(v);
    if(videoRef.current) videoRef.current.volume = v;
  };
  
  const setRate = (r: number) => {
    setPlaybackRate(r);
    if(videoRef.current) videoRef.current.playbackRate = r;
  };

  const handleSendAnnotation = () => {
    if (!newAnnotation.trim()) return;
    setAnnotations([...annotations, {
      id: Math.random().toString(36).substr(2, 9),
      time: currentTime,
      text: newAnnotation,
      username: '364',
      avatar: 'https://i.pravatar.cc/32?u=364',
      timestamp: Date.now(),
      drawing: finalPaths.length > 0 ? finalPaths : undefined,
      snapshot: canvasRef.current?.toDataURL() || ''
    }]);
    setNewAnnotation('');
    setFinalPaths([]);
    setCurrentPath([]);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setIsDrawing(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#141414] text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a2a] bg-[#1e1e1e] shrink-0">
        <div className="flex items-center gap-2">
            <button onClick={onClose} className="hover:text-white mr-4"><ChevronRight className="rotate-180" size={20}/></button>
            <div className="flex items-center text-sm">
                <span className="text-sm font-medium">{item.name}</span>
                <select 
                    value={currentVersion}
                    onChange={(e) => setCurrentVersion(e.target.value)}
                    className="bg-transparent text-xs px-2 py-1 ml-2 outline-none cursor-pointer"
                >
                    {['v2', 'v1'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
            <button className="flex items-center gap-1.5 hover:text-white"><div className="w-2 h-2 rounded-full border border-slate-500"></div> 设置审阅状态</button>
            <button className="text-blue-500 font-medium hover:text-blue-400">流程推进</button>
            <div className="w-px h-4 bg-white/10 mx-2" />
            <button className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500"><Share2 size={14}/> 分享</button>
            <button className="p-2 hover:bg-white/10 rounded"><Download size={16}/></button>
            <button className="p-2 hover:bg-white/10 rounded"><Maximize2 size={16}/></button>
            <button className="p-2 hover:bg-white/10 rounded"><LayoutDashboard size={16}/></button>
            <button className="p-2 hover:bg-white/10 rounded"><MoreVertical size={16}/></button>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-h-0 bg-black">
          <div className="flex-1 relative flex items-center justify-center min-h-0" ref={containerRef}>
            <video 
              ref={videoRef}
              src="https://tuhua-agent.sparkaigc.cn/prod/video/20260413/1776069943779-870116.mp4" 
              className="w-full h-full object-contain"
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            />
             <canvas
                ref={canvasRef}
                className={`absolute inset-0 z-20 ${isDrawing ? 'cursor-crosshair' : 'pointer-events-none'}`}
                onMouseDown={(e) => {
                    if (!isDrawing || !canvasRef.current) return;
                    const rect = canvasRef.current.getBoundingClientRect();
                    setCurrentPath([{x: e.clientX - rect.left, y: e.clientY - rect.top}]);
                }}
                onMouseMove={(e) => {
                     if (!isDrawing || currentPath.length === 0 || !canvasRef.current) return;
                     const rect = canvasRef.current.getBoundingClientRect();
                     const newPoint = {x: e.clientX - rect.left, y: e.clientY - rect.top};
                     
                     const ctx = canvasRef.current.getContext('2d');
                     if (!ctx) return;
                     ctx.strokeStyle = 'red';
                     ctx.lineWidth = 2;
                     ctx.beginPath();
                     const lastPoint = currentPath[currentPath.length-1];
                     ctx.moveTo(lastPoint.x, lastPoint.y);
                     ctx.lineTo(newPoint.x, newPoint.y);
                     ctx.stroke();
                     
                     setCurrentPath([...currentPath, newPoint]);
                }}
                onMouseUp={() => {
                    if (!isDrawing || currentPath.length === 0) return;
                    setFinalPaths([...finalPaths, {points: currentPath}]);
                    setCurrentPath([]);
                }}
            />
          </div>
          
          {/* Video Controls and Annotation Bar */}
          <div className="bg-[#1e1e1e] border-t border-[#2a2a2a]">
              {/* Annotation Input */}
              <div className="p-3">
                  <input 
                    value={newAnnotation}
                    onChange={(e) => setNewAnnotation(e.target.value)}
                    placeholder="写批注..."
                    className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg p-3 text-sm placeholder:text-slate-600 focus:border-blue-500/50 outline-none"
                  />
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                     <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1.5 text-blue-500 hover:text-blue-400"><span className="text-base">🌍</span> 所有人群可见</button>
                        <button className="flex items-center gap-1.5 text-blue-500 hover:text-blue-400">⭐ {formatTime(currentTime)}</button>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="flex gap-1 text-slate-400">
                           <button onClick={() => setIsDrawing(!isDrawing)} className={`p-1.5 rounded hover:bg-white/10 ${isDrawing ? 'text-blue-500' : ''}`}><Edit3 size={16}/></button>
                           <button className="p-1.5 rounded hover:bg-white/10"><Square size={16}/></button>
                           <button className="p-1.5 rounded hover:bg-white/10"><ArrowUpRight size={16}/></button>
                           <button className="p-1.5 rounded hover:bg-white/10">T</button>
                        </div>
                        <button onClick={handleSendAnnotation} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg">发送</button>
                     </div>
                  </div>
              </div>
              
              {/* Media Controls */}
              <div className="flex items-center justify-between text-base text-slate-400 px-4 pb-3">
                 <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="text-white hover:text-white/80">{isPlaying ? '⏸️' : '▶️'}</button>
                    <button onClick={() => frameStep(-1/30)} className="hover:text-white"><ChevronRight className="rotate-180" size={18}/></button>
                    <button onClick={() => frameStep(1/30)} className="hover:text-white"><ChevronRight size={18}/></button>
                    <span className="font-mono text-white text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
                 </div>
                 <div className="flex items-center gap-4 text-sm">
                    <span>720 高清</span>
                    <button onClick={() => setRate(playbackRate === 1 ? 2 : 1)} className="cursor-pointer hover:text-white">倍速</button>
                    <button><MoreVertical size={18} className="hover:text-white"/></button>
                 </div>
              </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-[#141414] border-l border-white/5 flex flex-col">
          {/* Sidebar Tabs */}
          <div className="flex items-center px-4 pt-4 pb-2">
             <button className="text-sm font-medium border-b-2 border-blue-500 text-white pb-1 mr-6">批注</button>
             <button className="text-sm text-slate-500 pb-1 hover:text-slate-300">文件信息</button>
          </div>
          
          {/* Annotation Filters */}
          <div className="flex items-center px-4 py-2 gap-2 text-xs text-slate-400 border-b border-white/5">
             <select className="bg-transparent"><option>按时间码</option></select>
             <select className="bg-transparent"><option>v2版本</option></select>
             <div className="flex-1" />
             <button>🔍</button>
             <button>筛选</button>
          </div>

          {/* Annotations List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {annotations.map(anno => (
                  <div key={anno.id} className="bg-[#1a1a1a] p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                          <img src={anno.avatar} alt="" className="w-6 h-6 rounded-full" />
                          <span className="text-xs font-medium text-white">{anno.username}</span>
                          <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{formatTime(anno.time)}</span>
                      </div>
                      <div className="text-sm text-slate-200">{anno.text}</div>
                      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                          <span>{new Date(anno.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                          <div className="flex gap-2">
                              <span className="hover:text-blue-400 cursor-pointer">编辑批注</span>
                              <span className="hover:text-blue-400 cursor-pointer">回复</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const OnlineReview: React.FC<OnlineReviewProps> = ({ clips = [], subTab }) => {
  if (subTab === ReviewSubTab.FINAL_DELIVERY) {
    return <div className="h-full flex items-center justify-center text-slate-500">成稿交付页面暂无内容...</div>
  }
  const [items, setItems] = useState<ReviewItem[]>([
    {
      id: '1',
      name: '测试多版本视频.mp4',
      type: 'FILE',
      fileType: 'VIDEO',
      duration: '01:45',
      thumbnailUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&q=80',
      createdAt: '2026-05-12 10:11',
      updatedAt: '2026-05-12 10:11',
      versions: ['v1', 'v2']
    },
    {
      id: '2',
      name: '25.mp4',
      type: 'FILE',
      fileType: 'VIDEO',
      duration: '01:33',
      thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
      createdAt: '2026-05-11 16:23',
      updatedAt: '2026-05-11 16:23'
    },
    {
      id: '3',
      name: '24.mp4',
      type: 'FILE',
      fileType: 'VIDEO',
      duration: '01:39',
      thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80',
      createdAt: '2026-05-07 16:55',
      updatedAt: '2026-05-07 16:55'
    },
    {
      id: '4',
      name: '23.mp4',
      type: 'FILE',
      fileType: 'VIDEO',
      duration: '01:40',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542204113-6d0e82845c47?w=400&q=80',
      createdAt: '2026-05-07 16:54',
      updatedAt: '2026-05-07 16:54'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'FILE' | 'SHARE' | 'TRASH'>('FILE');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLinkShareModalOpen, setIsLinkShareModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{type: 'FILE', item: ReviewItem} | {type: 'VERSION', item: ReviewItem, version: string} | null>(null);
  const [newName, setNewName] = useState('');
  const [managingItem, setManagingItem] = useState<ReviewItem | null>(null);
  const [versions, setVersions] = useState<string[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  
  const handleStartRenameFile = (item: ReviewItem) => {
      setRenameTarget({type: 'FILE', item});
      setNewName(item.name);
      setIsRenameModalOpen(true);
      setContextMenu(null);
  };
  
  const handleStartRenameVersion = (item: ReviewItem, version: string) => {
      setRenameTarget({type: 'VERSION', item, version});
      setNewName(version);
      setIsRenameModalOpen(true);
  };
  
  const handleConfirmRename = () => {
      if (!renameTarget) return;
      setItems(items.map(i => i.id === renameTarget.item.id ? {...i, name: newName} : i));
      setIsRenameModalOpen(false);
      setRenameTarget(null);
      setNewName('');
  };

  useEffect(() => {
    if (managingItem) {
      const updatedItem = items.find(i => i.id === managingItem.id);
      if (updatedItem) {
        setManagingItem(updatedItem);
        setVersions(updatedItem.versions || []);
      }
    }
  }, [items, managingItem?.id]);

  const handleDeleteVersion = (versionToDelete: string) => {
    if (!managingItem) return;
    const newVersions = versions.filter(v => v !== versionToDelete);
    setItems(items.map(item => item.id === managingItem.id ? {...item, versions: newVersions} : item));
  };

  const handleUploadVersion = (item: ReviewItem) => {
      const newVersion = 'v' + ((item.versions?.length || 0) + 1);
      const newVersions = [...(item.versions || []), newVersion];
      setItems(items.map(i => i.id === item.id ? {...i, versions: newVersions} : i));
      alert("上传成功");
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
      setDraggedIdx(index);
      e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (index: number) => {
      if (draggedIdx === null || draggedIdx === index) return;
      
      const newVersions = [...versions];
      const draggedItem = newVersions[draggedIdx];
      newVersions.splice(draggedIdx, 1);
      newVersions.splice(index, 0, draggedItem);
      
      setVersions(newVersions);
      setDraggedIdx(index);
      if (managingItem) {
         setItems(items.map(item => item.id === managingItem.id ? {...item, versions: newVersions} : item));
      }
  };
  const [shareConfig, setShareConfig] = useState({
    name: '',
    version: 'all',
    allowDownload: true,
    allowAnnotations: true,
    passwordProtected: true,
    password: '9698',
    expiration: false,
    expirationDate: ''
  });

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: ReviewItem | null } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, string>>({}); // itemId -> statusId
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [reviewingItem, setReviewingItem] = useState<ReviewItem | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const statusOptions = [
    { id: 'PENDING', label: '待审阅', color: '#f87171' },
    { id: 'REVIEWING', label: '审阅中', color: '#fbbf24' },
    { id: 'FEEDBACK', label: '意见汇总完毕', color: '#60a5fa' },
    { id: 'APPROVED', label: '通过', color: '#4ade80' },
    { id: 'NONE', label: '移除状态', color: '#94a3b8', isRemove: true },
  ];

  const handleToggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    setSelectedIds(items.map(i => i.id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleUpdateStatus = (statusId: string) => {
    const newStatuses = { ...reviewStatuses };
    selectedIds.forEach(id => {
      if (statusId === 'NONE') {
        delete newStatuses[id];
      } else {
        newStatuses[id] = statusId;
      }
    });
    setReviewStatuses(newStatuses);
    setShowStatusMenu(false);
  };

  const handleContextMenu = (e: React.MouseEvent, item: ReviewItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const handleItemClick = (id: string, multi: boolean) => {
    if (multi) {
      handleToggleSelect(id);
    } else {
      setSelectedIds([id]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateFolder = () => {
    const newFolder: ReviewItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: '新建文件夹',
      type: 'FOLDER',
      createdAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].substr(0, 5),
      updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].substr(0, 5)
    };
    setItems([newFolder, ...items]);
  };

  const handleUploadFile = () => {
    const newFile: ReviewItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: '未命名视频.mp4',
      type: 'FILE',
      fileType: 'VIDEO',
      duration: '00:00',
      thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
      createdAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].substr(0, 5),
      updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].substr(0, 5)
    };
    setItems([newFile, ...items]);
  };

  const renderThumbnail = (item: ReviewItem) => {
    if (item.type === 'FOLDER') {
      return (
        <div className="w-full h-full flex p-3 gap-1 bg-theme-panel/60">
           <div className="flex-1 bg-theme-panel border border-theme-border/50 rounded flex items-center justify-center">
              <File className="text-blue-400" size={24} />
           </div>
           <div className="w-14 flex flex-col gap-1">
              <div className="flex-1 bg-theme-panel border border-theme-border rounded flex items-center justify-center">
                 <File className="text-blue-400" size={12} />
              </div>
              <div className="flex-1 bg-theme-panel border border-theme-border rounded flex items-center justify-center text-[10px] text-theme-secondary">
                 + 4
              </div>
           </div>
        </div>
      );
    }

    if (item.fileType === 'AUDIO') {
      return (
        <div className="w-full h-full relative p-2 overflow-hidden bg-black/40">
           <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-80 mix-blend-screen scale-x-150 grayscale" />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-end gap-0.5 h-8">
                 {[1,2,3,4,3,5,2,4,1,3,2].map((h, i) => (
                    <div key={i} className="w-0.5 bg-blue-500/50" style={{ height: `${h * 20}%` }} />
                 ))}
              </div>
           </div>
           <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
             <div className="flex items-center gap-0.5 mr-1">
                <div className="w-0.5 h-1.5 bg-white/50" />
                <div className="w-0.5 h-3 bg-white" />
                <div className="w-0.5 h-2 bg-white/50" />
             </div>
             {item.duration} <span className="text-[8px] opacity-50 ml-1">stereo</span>
           </div>
        </div>
      );
    }

    return (
      <img src={item.thumbnailUrl} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
    );
  };

  return (
    <div className="h-full flex flex-col bg-theme-page text-theme-primary font-sans overflow-hidden">
      {reviewingItem ? (
        <VideoReviewPlayer item={reviewingItem} onClose={() => setReviewingItem(null)} />
      ) : (
        <div className="flex-1 flex flex-col h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-theme-border bg-theme-page shrink-0">
        <div className="flex-1" />
        
        <div className="flex items-center gap-4">
          <div className="relative flex items-center bg-slate-900/50 border border-theme-border rounded-full px-3 py-1.5">
            <Search size={14} className="text-slate-500 mr-2" />
            <input 
              type="text" 
              placeholder="搜索文件" 
              className="bg-transparent border-none outline-none text-xs w-48 placeholder:text-slate-600"
            />
          </div>
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs">杨</div>
          <button className="text-slate-400 text-sm">顿/帧</button>
          <button className="text-slate-400">←</button>
        </div>
      </div>

      {/* Second Nav Bar */}
      <div className="flex items-center justify-between border-b border-theme-border h-14 shrink-0 bg-theme-panel">
        <div className="flex items-center gap-8 h-full px-4">
          {['文件', '分享', '回收站'].map((tab, idx) => {
            const tabKey = ['FILE', 'SHARE', 'TRASH'][idx] as 'FILE' | 'SHARE' | 'TRASH';
            const isActive = activeTab === tabKey;
            return (
              <button 
                key={tab}
                onClick={() => setActiveTab(tabKey)}
                className={`h-full px-4 text-sm font-medium relative transition-colors ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab}
                {isActive && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center px-6 gap-6">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-4 border-r border-theme-border pr-6">
              <span className="text-xs text-slate-500">选中 {selectedIds.length} 项</span>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white"><Download size={16} /></button>
                <button className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white"><LayoutDashboard size={16} /></button>
                <button className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white"><MoreVertical size={16} /></button>
              </div>
              
              {/* Set Status Button */}
              <div className="relative">
                <button 
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <div className="w-2 h-2 rounded-full border border-slate-600"></div>
                  <span>设置审阅状态</span>
                </button>

                {showStatusMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a2336] border border-theme-border rounded-xl shadow-2xl p-1 z-50">
                    {statusOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => handleUpdateStatus(opt.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-xs text-slate-300 transition-colors"
                      >
                        <div className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: opt.isRemove ? 'transparent' : opt.color, border: opt.isRemove ? '1px solid #94a3b8' : 'none' }}></div>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-medium rounded text-white transition-colors">分享</button>
            </div>
          )}

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">共 {items.length} 项</span>
            <button className="text-sm text-slate-400 flex items-center gap-1">更新时间 ▾</button>
            <button className="text-slate-400"><ListFilter size={18} /></button>
            <button className="text-slate-400"><Grid size={18} /></button>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
             <button className="px-4 py-1.5 bg-theme-panel border border-theme-border rounded-lg text-theme-primary text-sm font-medium">收集</button>
             <button onClick={handleUploadFile} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg text-white">上传 ▾</button>
             <button onClick={handleCreateFolder} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg text-white">新建 ▾</button>
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 overflow-y-auto py-6 px-6 scroll-smooth" onClick={() => {
        setContextMenu(null);
        handleClearSelection();
      }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <motion.div 
                key={item.id}
                layout
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(item.id, e.metaKey || e.ctrlKey);
                }}
                onDoubleClick={() => setReviewingItem(item)}
                onContextMenu={(e) => handleContextMenu(e, item)}
                className={`group relative flex flex-col bg-theme-card/40 border rounded-xl overflow-hidden cursor-pointer transition-all ${isSelected ? 'border-theme-accent shadow-lg shadow-theme-accent/10 bg-theme-card/60' : 'border-theme-border/50 hover:border-theme-border hover:bg-theme-card/60'}`}
              >
                {/* Selection Circle */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSelect(item.id);
                  }}
                  className={`absolute top-3 left-3 z-20 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-black/20 border-white/40 opacity-0 group-hover:opacity-100'}`}
                >
                  {isSelected && <Check size={12} className="text-white" strokeWidth={4} />}
                </div>

                {/* Status Badge */}
                {reviewStatuses[item.id] && (
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[10px] font-bold text-white border border-white/10">
                    <div 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: statusOptions.find(o => o.id === reviewStatuses[item.id])?.color }}
                    ></div>
                    <span>{statusOptions.find(o => o.id === reviewStatuses[item.id])?.label}</span>
                  </div>
                )}

                {/* Thumbnail Area */}
                <div className="aspect-video bg-theme-panel relative flex items-center justify-center overflow-hidden">
                  {renderThumbnail(item)}

                  {/* Badges/Info */}
                  {item.version && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10">
                      {item.version}
                    </div>
                  )}
                  {item.duration && item.fileType !== 'AUDIO' && (
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Play size={10} fill="currentColor" /> {item.duration}
                    </div>
                  )}

                  {item.fileType === 'IMAGE' && (
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm p-1 rounded">
                       <ImageIcon size={12} />
                    </div>
                  )}
                </div>

                {/* Info Area */}
                <div className="p-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-slate-200 truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight">{item.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">{item.createdAt}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                       e.stopPropagation();
                       const rect = e.currentTarget.getBoundingClientRect();
                       handleContextMenu({clientX: rect.left, clientY: rect.bottom + 5, preventDefault: () => {}} as any, item);
                    }}
                    className="p-1 hover:bg-white/10 rounded-lg text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div 
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-[100] w-64 bg-theme-card border border-theme-border rounded-xl shadow-2xl p-1 overflow-visible"
          >
            <div className="group/share relative">
              <ContextMenuItem 
                icon={<Share2 size={14}/>} 
                label="分享" 
                hasSubmenu={true} 
              />
              {/* Share Submenu */}
              <div className="absolute left-full top-0 ml-1 w-56 bg-theme-card border border-theme-border rounded-xl shadow-2xl p-1 opacity-0 pointer-events-none group-hover/share:opacity-100 group-hover/share:pointer-events-auto transition-opacity z-50">
                <ContextMenuItem 
                  icon={<MessageSquare size={14}/>} 
                  label="审阅分享" 
                  badge="2/10" 
                  extra={true} 
                  onClick={() => {
                    setContextMenu(null);
                    setShareConfig({ ...shareConfig, name: contextMenu.item?.name || '' });
                    setIsShareModalOpen(true);
                  }}
                />
                <ContextMenuItem icon={<Play size={14}/>} label="演示分享" badge="升级" />
                <ContextMenuItem icon={<FolderPlus size={14}/>} label="交付分享" badge="升级" />
                <div className="h-px bg-white/5 my-1" />
                <div className="px-3 py-2 text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer text-center">查看不同分享类型的使用差异</div>
              </div>
            </div>
            
            <div className="h-px bg-white/5 my-1" />
            
            {/* Removed actions */}
            
            <div className="h-px bg-white/5 my-1" />

            {contextMenu.item?.type === 'FILE' && (
              <>
                <div className="group/status relative">
                  <ContextMenuItem 
                      icon={<CheckCircle2 size={14}/>} 
                      label="设置审阅状态"
                      hasSubmenu={true}
                  />
                  {/* Status Submenu */}
                  <div className="absolute left-full top-0 ml-1 w-48 bg-theme-card border border-theme-border rounded-xl shadow-2xl p-1 opacity-0 pointer-events-none group-hover/status:opacity-100 group-hover/status:pointer-events-auto transition-opacity z-50">
                    {statusOptions.map(opt => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (contextMenu.item) {
                            const itemId = contextMenu.item.id;
                            const newStatuses = { ...reviewStatuses };
                            if (opt.id === 'NONE') {
                                delete newStatuses[itemId];
                            } else {
                                newStatuses[itemId] = opt.id;
                            }
                            setReviewStatuses(newStatuses);
                            setContextMenu(null);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-xs text-slate-300 transition-colors cursor-pointer"
                      >
                        <div className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: opt.isRemove ? 'transparent' : opt.color, border: opt.isRemove ? '1px solid #94a3b8' : 'none' }}></div>
                        <span>{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ContextMenuItem icon={<Upload size={14}/>} label="上传版本" onClick={() => handleUploadVersion(contextMenu.item!)} />
                <ContextMenuItem 
                  icon={<History size={14}/>} 
                  label="管理版本" 
                  onClick={() => {
                      setManagingItem(contextMenu.item);
                      setIsVersionModalOpen(true);
                      setContextMenu(null);
                  }} 
                />
              </>
            )}

            <div className="h-px bg-white/5 my-1" />
            
            <ContextMenuItem icon={<Edit3 size={14}/>} label="重命名" onClick={() => handleStartRenameFile(contextMenu.item!)} />
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      )}
      
      {/* Modals */}
      <AnimatePresence>
        {isRenameModalOpen && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/50" onClick={() => setIsRenameModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-theme-panel w-[400px] rounded-2xl p-6 shadow-2xl border border-theme-border" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">重命名</h3>
                <button onClick={() => setIsRenameModalOpen(false)}><X size={16} /></button>
              </div>
              <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-black/30 border border-theme-border rounded p-2 text-sm mb-6" />
              <button onClick={handleConfirmRename} className="w-full bg-blue-600 text-white py-2 rounded-lg">确认</button>
            </motion.div>
          </div>
        )}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50" onClick={() => setIsShareModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-theme-panel w-[400px] rounded-2xl p-6 shadow-2xl border border-theme-border" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">创建分享 2/10</h3>
                <button onClick={() => setIsShareModalOpen(false)}><X size={16} /></button>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-xs text-slate-400 mb-1 block">分享名称</label>
                    <input value={shareConfig.name} onChange={e => setShareConfig({...shareConfig, name: e.target.value})} className="w-full bg-black/30 border border-theme-border rounded p-2 text-sm" />
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span>分享版本</span>
                    <span className="text-blue-500 cursor-pointer">全部版本 ❯</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span>允许下载</span>
                    <input type="checkbox" checked={shareConfig.allowDownload} onChange={e => setShareConfig({...shareConfig, allowDownload: e.target.checked})} />
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span>允许批注</span>
                    <input type="checkbox" checked={shareConfig.allowAnnotations} onChange={e => setShareConfig({...shareConfig, allowAnnotations: e.target.checked})} />
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                       <span>密码保护</span>                
                       <input type="checkbox" checked={shareConfig.passwordProtected} onChange={e => setShareConfig({...shareConfig, passwordProtected: e.target.checked})} />
                    </div>
                    {shareConfig.passwordProtected && (
                       <input value={shareConfig.password} onChange={e => setShareConfig({...shareConfig, password: e.target.value})} className="w-24 bg-black/30 border border-theme-border rounded p-1 text-sm text-center" placeholder="密码" />
                    )}
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span>过期时间</span>
                      <input type="checkbox" checked={shareConfig.expiration} onChange={e => setShareConfig({...shareConfig, expiration: e.target.checked})} />
                    </div>
                    {shareConfig.expiration && (
                       <DatePicker
                          selected={shareConfig.expirationDate ? new Date(shareConfig.expirationDate) : null}
                          onChange={(date: Date | null) => setShareConfig({...shareConfig, expirationDate: date?.toISOString() || ''})}
                          showTimeSelect
                          dateFormat="yyyy-MM-dd HH:mm"
                          locale="zh"
                          className="w-full bg-black/30 border border-theme-border rounded p-2 text-sm text-theme-primary"
                          placeholderText="请选择过期时间"
                       />
                    )}
                 </div>
                 <button onClick={() => { setIsShareModalOpen(false); setIsLinkShareModalOpen(true); }} className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4">链接分享</button>
              </div>
            </motion.div>
          </div>
        )}
        {isLinkShareModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50" onClick={() => setIsLinkShareModalOpen(false)}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-theme-panel w-[400px] rounded-2xl p-6 shadow-2xl border border-theme-border text-center" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">通过链接分享</h3>
                  <button onClick={() => setIsLinkShareModalOpen(false)}><X size={16} /></button>
                </div>
                <div className="bg-black/30 p-4 rounded-lg text-sm text-left mb-6 text-slate-300">
                    <p>请点击链接，审阅{shareConfig.name}</p>
                    <p>链接：https://mdl.ink/T1A7yY</p>
                    <p>密码：{shareConfig.password}</p>
                </div>
                <button onClick={() => {
                    navigator.clipboard.writeText(`请点击链接，审阅${shareConfig.name}\n链接：https://mdl.ink/T1A7yY\n密码：${shareConfig.password}`);
                    const btn = document.getElementById('copyBtn');
                    if (btn) {
                        btn.textContent = '已复制';
                        setTimeout(() => btn.textContent = '复制', 2000);
                    }
                }} id="copyBtn" className="w-full bg-blue-600 text-white py-2 rounded-lg mb-4">复制</button>
                <div className="text-sm text-blue-400 cursor-pointer" onClick={() => setIsLinkShareModalOpen(false)}>通过扫码分享</div>
             </motion.div>
          </div>
        )}
        {isVersionModalOpen && managingItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50" onClick={() => setIsVersionModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-theme-panel w-[500px] rounded-2xl p-6 shadow-2xl border border-theme-border" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">管理版本</h3>
                <button onClick={() => setIsVersionModalOpen(false)}><X size={16} /></button>
              </div>
              <div className="space-y-3">
                 {versions.map((v, index) => (
                    <div 
                      key={`${v}-${index}`} 
                      className="group flex items-center gap-3 bg-black/30 p-3 rounded-lg border border-theme-border cursor-move"
                      draggable
                      onDragStart={(e) => onDragStart(e, index)}
                      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
                      onDragEnd={() => setDraggedIdx(null)}
                    >
                       <Move size={16} className="text-slate-500 cursor-grab" />
                       <span className="font-mono text-xs text-slate-400 w-8">{v}</span>
                       <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center"><Video size={16} /></div>
                       <div className="flex-1 text-sm">{managingItem.name}</div>
                       <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                           <button onClick={() => handleStartRenameVersion(managingItem, v)} className="p-1 hover:bg-white/10 rounded"><Edit3 size={14}/></button>
                           <button onClick={() => handleDeleteVersion(v)} className="p-1 hover:bg-white/10 rounded text-red-400"><Trash2 size={14}/></button>
                       </div>
                    </div>
                 ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ContextMenuItem = ({ icon, label, badge, hasSubmenu, extra, className = "", onClick }: any) => (
  <div onClick={onClick} className={`flex items-center justify-between px-3 py-2 text-[13px] rounded-lg cursor-pointer hover:bg-white/5 group transition-colors ${className}`}>
    <div className="flex items-center gap-3">
      <span className="text-slate-400 group-hover:text-white transition-colors">{icon}</span>
      <span className="text-slate-300 group-hover:text-white">{label}</span>
    </div>
    {badge && (
      <span className={`text-[10px] px-1 rounded font-bold ${badge.includes('升级') ? 'bg-orange-500/10 text-orange-500' : 'text-slate-500'}`}>
        {badge}
      </span>
    )}
    {hasSubmenu && <ChevronRight size={14} className="text-slate-600" />}
    {extra && <span className="text-slate-600 ml-1 cursor-help hover:text-slate-400">?</span>}
  </div>
);

export default OnlineReview;
