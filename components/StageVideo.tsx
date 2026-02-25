import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Shot, Asset, Episode, ExtendedShot, VideoSettings, TimelineClip, GenerationError, VideoSubTab } from '../types';
import { Play, Clapperboard, Download, Loader2, Maximize2, Settings2, Folder, Film, ChevronLeft, ChevronRight, Wand2, Image as ImageIcon, Video, PanelLeftClose, PanelLeftOpen, FileVideo, Pin, PinOff, Plus, Sparkles, RefreshCw, AlertCircle, X, CheckCircle2, Monitor, Clock, Ratio, AlertTriangle, ArrowRight, Scissors, Share, Map, User, Edit3, Save, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface StageVideoProps {
  episodes: Episode[];
  setEpisodes: React.Dispatch<React.SetStateAction<Episode[]>>;
  assets: Asset[];
  videoSettings: VideoSettings;
  setVideoSettings: React.Dispatch<React.SetStateAction<VideoSettings>>;
  setEditorClips: React.Dispatch<React.SetStateAction<TimelineClip[]>>;
  goToAssets: () => void;
  onNext: () => void;
  hasVisitedVideo: boolean;
  setHasVisitedVideo: (visited: boolean) => void;
  subTab?: VideoSubTab; // Optional prop for subTab
}

const StageVideo: React.FC<StageVideoProps> = ({ episodes, setEpisodes, assets, videoSettings, setVideoSettings, setEditorClips, goToAssets, onNext, hasVisitedVideo, setHasVisitedVideo, subTab = VideoSubTab.VIDU }) => {
  // --- Sidebar & Layout State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPinned, setIsPinned] = useState(false); // Default to unpinned per request
  
  // Track active video index for each shot (for carousel)
  const [activeVideoIndices, setActiveVideoIndices] = useState<Record<string, number>>({});
  const [activeEpisodeId, setActiveEpisodeId] = useState<string>('ep1');

  // --- Generation State ---
  const [generating, setGenerating] = useState(false); // Global generating state (for storyboard)
  const [videoGeneratingMap, setVideoGeneratingMap] = useState<Record<string, boolean>>({});
  const [isBatchGenerating, setIsBatchGenerating] = useState(false); // Batch generation lock

  // --- Error Handling State ---
  const [errors, setErrors] = useState<GenerationError[]>([]);
  // const [showErrorModal, setShowErrorModal] = useState(false); // Removed centralized modal trigger
  // const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null); // Removed centralized modal state
  const [dismissedErrorShots, setDismissedErrorShots] = useState<Set<string>>(new Set());

  // --- Settings State ---
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // --- New Bubble Tracking State ---
  const [viewedShots, setViewedShots] = useState<Set<string>>(new Set());

  // --- Modal States ---
  const [downloadModal, setDownloadModal] = useState<{
     isOpen: boolean;
     type: 'EPISODE' | 'FULL';
     includeHistory: boolean;
  }>({ isOpen: false, type: 'EPISODE', includeHistory: false });

  const [exportModal, setExportModal] = useState(false);

  // Redirect/Warning Modal State
  const [redirectModal, setRedirectModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
  }>({ isOpen: false, title: '', message: '', actionLabel: '' });

  // Prompt Editing State
  const [editingShotId, setEditingShotId] = useState<string | null>(null);

  // Get active episode data
  const activeEpisode = episodes.find(e => e.id === activeEpisodeId);

  // Initial Load Effect for Settings (Controlled by App state)
  useEffect(() => {
      if (!hasVisitedVideo) {
          setShowSettingsModal(true);
          setHasVisitedVideo(true);
      }
  }, [hasVisitedVideo, setHasVisitedVideo]);

  // --- Helpers ---

  // Extract assets helper
  const extractAssetsFromPrompt = (prompt: string) => {
    const regex = /【@(.*?)】/g;
    const matches = [...prompt.matchAll(regex)];
    const linkedAssets: { name: string; url: string; type: string }[] = [];

    matches.forEach(match => {
      const tagContent = match[1]; 
      const [assetName, stateName] = tagContent.split('-');
      
      const asset = assets.find(a => a.name === assetName);
      if (asset) {
        const state = stateName ? asset.states.find(s => s.name === stateName) : asset.states[0];
        if (state && state.mainImageUrl) {
          linkedAssets.push({
            name: tagContent,
            url: state.mainImageUrl,
            type: asset.type
          });
        }
      }
    });
    return linkedAssets;
  };

  const checkShotIssues = (prompt: string): boolean => {
      if (!prompt.trim()) return true; 
      const regex = /【@(.*?)】/g;
      const matches = [...prompt.matchAll(regex)];
      for (const match of matches) {
          const tagContent = match[1];
          const [assetName] = tagContent.split('-');
          const asset = assets.find(a => a.name === assetName);
          if (!asset) return true; 
      }
      return false;
  };

  const checkAssetsExist = () => assets.length > 0;
  const checkAssetImagesExist = () => assets.some(a => a.imageUrl || a.states.some(s => !!s.mainImageUrl));

  const generateShotPrompt = (index: number) => {
    // ... (same as before)
    const chars = assets.filter(a => a.type === 'CHARACTER');
    const scenes = assets.filter(a => a.type === 'SCENE');
    const props = assets.filter(a => a.type === 'PROP');

    const char = chars.length > 0 ? chars[Math.floor(Math.random() * chars.length)] : null;
    const scene = scenes.length > 0 ? scenes[Math.floor(Math.random() * scenes.length)] : null;
    const prop = props.length > 0 ? props[Math.floor(Math.random() * props.length)] : null;

    let prompt = `镜头 ${index + 1}: `;
    const scenario = Math.random();
    if (char && scene && scenario > 0.6) {
      const charState = char.states[0]?.name || '默认';
      const sceneState = scene.states[0]?.name || '默认';
      prompt += `中景镜头，【@${char.name}-${charState}】站在【@${scene.name}-${sceneState}】中央，神情凝重。`;
    } else if (char && prop && scenario > 0.3) {
      const charState = char.states[0]?.name || '默认';
      const propState = prop.states[0]?.name || '默认';
      prompt += `特写镜头，【@${char.name}-${charState}】正在仔细检查手中的【@${prop.name}-${propState}】。`;
    } else if (scene) {
      const sceneState = scene.states[0]?.name || '默认';
      prompt += `全景镜头，展示了【@${scene.name}-${sceneState}】的宏大景象，光影交错。`;
    } else {
      prompt += "神秘的黑影在迷雾中穿行。";
    }
    return prompt;
  };

  // --- Actions ---

  const handleGenerateStoryboard = () => {
    if (!activeEpisode) return;
    if (!checkAssetsExist()) {
       setRedirectModal({
          isOpen: true,
          title: "资产库为空",
          message: "您还没有提取任何资产。AI 需要基于资产来构建分镜画面，请先前往「资产管理」进行提取。",
          actionLabel: "前往提取资产"
       });
       return;
    }
    
    setGenerating(true);
    setTimeout(() => {
      // Increased length to 10 for better testing
      const newShots: ExtendedShot[] = Array.from({ length: 10 }).map((_, idx) => ({
        id: `shot-${activeEpisodeId}-${Date.now()}-${idx}`,
        description: generateShotPrompt(idx),
        duration: 3 + Math.floor(Math.random() * 5),
        status: 'PENDING',
        videoVersions: []
      }));
      setEpisodes(prev => prev.map(ep => 
        ep.id === activeEpisodeId ? { ...ep, shots: newShots } : ep
      ));
      setGenerating(false);
    }, 1500);
  };

  // Updated: Handle One Click Batch Generation with Type
  const handleOneClickVideo = (type: 'SUBJECT' | 'IMAGE') => {
    if (!activeEpisode) return;
    if (!checkAssetImagesExist()) {
      setRedirectModal({
         isOpen: true,
         title: "缺失资产图片",
         message: "检测到您的资产尚未生成图片。视频生成模型需要参考资产的视觉形象，请先前往「资产管理」完成生图。",
         actionLabel: "前往生成图片"
      });
      return;
    }
    const idsToGen = activeEpisode.shots.filter(s => s.status === 'PENDING').map(s => s.id);
    if (idsToGen.length === 0) return;

    setIsBatchGenerating(true); // Disable global buttons

    setVideoGeneratingMap(prev => {
      const next = { ...prev };
      idsToGen.forEach(id => next[id] = true);
      return next;
    });

    // Reset viewed status and dismissed errors
    setViewedShots(prev => {
        const next = new Set(prev);
        idsToGen.forEach(id => next.delete(id));
        return next;
    });
    setDismissedErrorShots(new Set());

    setEpisodes(prev => prev.map(ep => {
      if (ep.id !== activeEpisodeId) return ep;
      return {
        ...ep,
        shots: ep.shots.map(s => idsToGen.includes(s.id) ? { ...s, status: 'GENERATING' } : s)
      };
    }));

    // Generate in staggered manner
    idsToGen.forEach((id, idx) => {
      setTimeout(() => {
        const newVideoUrl = `https://picsum.photos/seed/${id}-${type}/800/450`;
        setEpisodes(prev => prev.map(ep => {
           if (ep.id !== activeEpisodeId) return ep;
           return {
             ...ep,
             shots: ep.shots.map(s => s.id === id ? { 
               ...s, 
               status: 'COMPLETED',
               videoUrl: newVideoUrl,
               videoVersions: [newVideoUrl]
             } : s)
           };
        }));
        setVideoGeneratingMap(prev => ({ ...prev, [id]: false }));
        
        // Unlock batch button when last item finishes
        if (idx === idsToGen.length - 1) {
            setIsBatchGenerating(false);
        }
      }, 2000 + (idx * 1500));
    });
  };

  // Updated: Handle Single Shot Generation with 3 Types
  const handleSingleShotGenerate = (shotId: string, type: 'IMAGE' | 'SUBJECT' | 'SCENE') => {
    if (!checkAssetImagesExist()) {
      setRedirectModal({
         isOpen: true,
         title: "缺失资产图片",
         message: "检测到您的资产尚未生成图片。视频生成模型需要参考资产的视觉形象，请先前往「资产管理」完成生图。",
         actionLabel: "前往生成图片"
      });
      return;
    }
    setVideoGeneratingMap(prev => ({ ...prev, [shotId]: true }));
    
    // Remove from viewed so "New" appears later
    setViewedShots(prev => {
        const next = new Set(prev);
        next.delete(shotId);
        return next;
    });
    
    // Reset dismissed error state for this shot to allow error to show if it fails again
    setDismissedErrorShots(prev => {
        const next = new Set(prev);
        next.delete(shotId);
        return next;
    });

    setEpisodes(prev => prev.map(ep => {
      if (ep.id !== activeEpisodeId) return ep;
      return {
        ...ep,
        shots: ep.shots.map(s => s.id === shotId ? { ...s, status: 'GENERATING' } : s)
      };
    }));

    setTimeout(() => {
        // Randomly simulate an error (20% chance)
        const isError = Math.random() < 0.2;

        if (isError) {
            const errorData: GenerationError = {
                id: Date.now().toString(),
                shotId: shotId, // Fix: Added shotId
                episodeName: activeEpisode?.name || 'Unknown Episode',
                shotIndex: activeEpisode?.shots.findIndex(s => s.id === shotId)! + 1,
                message: "生成请求被拒绝",
                detail: `ErrorCode: 429 - Resource Exhausted.\nPrompt: ${activeEpisode?.shots.find(s=>s.id===shotId)?.description.substring(0, 20)}... \nModel: ${type === 'IMAGE' ? 'Image-to-Video' : 'Subject-to-Video'}`,
                timestamp: new Date()
            };
            setErrors(prev => [errorData, ...prev]);
            
            setEpisodes(prev => prev.map(ep => {
                if (ep.id !== activeEpisodeId) return ep;
                return {
                    ...ep,
                    shots: ep.shots.map(s => s.id === shotId ? { ...s, status: 'ERROR' } : s)
                };
            }));
        } else {
            const newVideoUrl = `https://picsum.photos/seed/${shotId}-${type}-${Date.now()}/800/450`;
            setEpisodes(prev => prev.map(ep => {
                if (ep.id !== activeEpisodeId) return ep;
                return {
                    ...ep,
                    shots: ep.shots.map(s => {
                        if (s.id !== shotId) return s;
                        const updatedVersions = [...(s.videoVersions || []), newVideoUrl];
                        setActiveVideoIndices(prevIndices => ({
                            ...prevIndices,
                            [shotId]: updatedVersions.length - 1
                        }));
                        return { 
                            ...s, 
                            status: 'COMPLETED',
                            videoUrl: newVideoUrl,
                            videoVersions: updatedVersions
                        };
                    })
                };
            }));
        }
        setVideoGeneratingMap(prev => ({ ...prev, [shotId]: false }));
    }, 2500);
  };

  const handleShotPromptChange = (shotId: string, newText: string) => {
     setEpisodes(prev => prev.map(ep => {
        if (ep.id !== activeEpisodeId) return ep;
        return {
           ...ep,
           shots: ep.shots.map(s => s.id === shotId ? { ...s, description: newText } : s)
        };
     }));
  };

  const markAsViewed = (shotId: string) => {
      if (!viewedShots.has(shotId)) {
          setViewedShots(prev => new Set(prev).add(shotId));
      }
  };

  const handleEnterFullscreen = (elementId: string) => {
      const el = document.getElementById(elementId);
      if (el) {
          if (el.requestFullscreen) {
              el.requestFullscreen();
          }
      }
  };

  // --- Download & Export Logic ---

  const handleVideoDownload = () => {
     setDownloadModal({ isOpen: true, type: 'EPISODE', includeHistory: false });
  };
  
  const handleFullDownload = () => {
     setDownloadModal({ isOpen: true, type: 'FULL', includeHistory: false });
  };

  const confirmDownload = () => {
     setDownloadModal({ ...downloadModal, isOpen: false });
     const typeText = downloadModal.type === 'EPISODE' ? '当前分集视频' : '整部视频项目';
     const rangeText = downloadModal.includeHistory ? '(包含所有历史版本)' : '(仅下载选中版本)';
     alert(`开始打包下载 ${typeText} ${rangeText}...`);
  };

  const handleSingleVideoDownload = (url: string) => {
      // Create a temporary anchor to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-${Date.now()}.mp4`; // Mock filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const handleExportToEditor = () => {
     // Gather selected videos
     const clips: TimelineClip[] = [];
     
     // Helper to process an episode
     const processEpisode = (ep: Episode) => {
        ep.shots.forEach(shot => {
           if (shot.status === 'COMPLETED' && shot.videoVersions && shot.videoVersions.length > 0) {
              const activeIndex = activeVideoIndices[shot.id] ?? (shot.videoVersions.length - 1);
              const selectedUrl = shot.videoVersions[activeIndex];
              clips.push({
                 id: `clip-${shot.id}`,
                 shotId: shot.id,
                 videoUrl: selectedUrl,
                 duration: shot.duration,
                 thumbnail: selectedUrl // Simplified mock
              });
           }
        });
     };

     // For now, let's export ALL episodes logic or just active? Usually Editor takes whole project.
     // Let's assume we export the ACTIVE episode for editing.
     if (activeEpisode) {
        processEpisode(activeEpisode);
     }

     setEditorClips(clips);
     setExportModal(false);
     onNext(); // Jump to Editor
  };

  const handleExportToCapCut = () => {
     setExportModal(false);
     alert("已生成剪映草稿文件 (.jianyin)，请查收下载。");
  };

  const handleSettings = () => setShowSettingsModal(true);
  
  const handleMainContentClick = () => {
    if (!isPinned && isSidebarOpen) setIsSidebarOpen(false);
  };

  const scrollToShot = (shotId: string) => {
    const el = document.getElementById(`shot-card-${shotId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // --- Carousel Helpers ---
  const getShotVersions = (shot: ExtendedShot): string[] => {
      if (shot.videoVersions && shot.videoVersions.length > 0) return shot.videoVersions;
      if (shot.videoUrl) return [shot.videoUrl];
      return [];
  };

  const handlePrevVideo = (e: React.MouseEvent, shotId: string, total: number) => {
      e.stopPropagation();
      setDismissedErrorShots(prev => new Set(prev).add(shotId)); // Dismiss error on navigation
      setActiveVideoIndices(prev => {
          const current = prev[shotId] || 0;
          return { ...prev, [shotId]: (current - 1 + total) % total };
      });
  };

  const handleNextVideo = (e: React.MouseEvent, shotId: string, total: number) => {
      e.stopPropagation();
      setDismissedErrorShots(prev => new Set(prev).add(shotId)); // Dismiss error on navigation
      setActiveVideoIndices(prev => {
          const current = prev[shotId] || 0;
          return { ...prev, [shotId]: (current + 1) % total };
      });
  };

  // --- Download Stats Calculation ---
  const downloadStats = useMemo(() => {
     let totalShots = 0;
     let completedShots = 0;
     let totalVideos = 0; // Includes history if selected

     const countEpisode = (ep: Episode) => {
        totalShots += ep.shots.length;
        ep.shots.forEach(s => {
           if (s.status === 'COMPLETED') {
              completedShots++;
              if (downloadModal.includeHistory && s.videoVersions) {
                 totalVideos += s.videoVersions.length;
              } else {
                 totalVideos += 1; // Only active
              }
           }
        });
     };

     if (downloadModal.type === 'EPISODE' && activeEpisode) {
         countEpisode(activeEpisode);
     } else {
         episodes.forEach(countEpisode);
     }
     
     return { 
        totalShots, 
        completedShots, 
        totalVideos,
        label: downloadModal.type === 'EPISODE' ? (activeEpisode?.name || '当前分集') : '整部视频项目' 
     };
  }, [downloadModal.type, downloadModal.includeHistory, activeEpisode, episodes]);

  // Helper to render highlighted prompt text
  const renderHighlightedPrompt = (text: string) => {
      const parts = text.split(/(【@[^】]+】)/g);
      return (
          <>
              {parts.map((part, index) => {
                  if (part.startsWith('【@') && part.endsWith('】')) {
                      return (
                          <span key={index} className="text-blue-400 font-bold bg-blue-500/10 px-1 rounded mx-0.5">
                              {part}
                          </span>
                      );
                  }
                  return <span key={index}>{part}</span>;
              })}
          </>
      );
  };


  // --- Render ---

  return (
    <div className="h-full flex flex-col bg-slate-950 animate-fade-in relative overflow-hidden">
      
      {/* 1. Sidebar (Episodes) */}
      <div 
        className={`absolute top-0 bottom-0 left-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 z-20 flex flex-col ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0'
        }`}
      >
         <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
               <Folder size={18} className="text-blue-500" />
               分集列表
            </h3>
            <div className="flex items-center gap-1">
               <button 
                  onClick={() => setIsPinned(!isPinned)} 
                  className={`transition-colors p-1.5 rounded-lg ${
                    isPinned 
                      ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                  title={isPinned ? "取消固定 (点击右侧自动收起)" : "固定侧边栏"}
               >
                  {isPinned ? <Pin size={16} className="fill-current rotate-45" /> : <PinOff size={16} />}
               </button>
               
               <button 
                  onClick={() => { setIsPinned(false); setIsSidebarOpen(false); }}
                  className="text-slate-500 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
               >
                  <PanelLeftClose size={16} />
               </button>
            </div>
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {episodes.map(ep => (
               <button
                  key={ep.id}
                  onClick={() => setActiveEpisodeId(ep.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${
                     activeEpisodeId === ep.id 
                     ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                     : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
               >
                  <span className="truncate">{ep.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeEpisodeId === ep.id ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                     {ep.shots.length} 镜头
                  </span>
               </button>
            ))}
            <button className="w-full mt-2 py-2 border border-dashed border-slate-700 text-slate-500 rounded-lg text-xs hover:border-slate-500 hover:text-slate-300 transition-colors">
               + 新增分集
            </button>
         </div>
      </div>

      {/* 2. Main Content Area */}
      <div 
         onClick={handleMainContentClick}
         className={`flex-1 flex flex-col transition-all duration-300 h-full relative ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}
      >
         
         {/* Top Header */}
         <div className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center justify-between px-6 shrink-0 relative">
            <div className={`flex items-center gap-3 transition-all ${!isSidebarOpen ? 'pl-12' : ''}`}>
               <Film className="text-purple-500" size={20} />
               <h2 className="text-lg font-bold text-white">{activeEpisode?.name}</h2>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                  onClick={(e) => { e.stopPropagation(); handleFullDownload(); }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-sm transition-colors"
               >
                  <FileVideo size={16} />
                  <span>下载整部视频</span>
               </button>
               <button 
                  onClick={(e) => { e.stopPropagation(); handleSettings(); }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-sm transition-colors"
               >
                  <Settings2 size={16} />
                  <span>视频生成设置</span>
               </button>
            </div>
         </div>

         {/* Sub-Header */}
         <div className="h-14 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
               <span>共 {activeEpisode?.shots.length || 0} 个镜头</span>
            </div>
            <div className="flex items-center gap-3">
               <button 
                  onClick={(e) => { e.stopPropagation(); handleGenerateStoryboard(); }}
                  disabled={generating || (activeEpisode?.shots.length || 0) > 0} 
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                  title={(activeEpisode?.shots.length || 0) > 0 ? "分镜已生成" : "生成分镜"}
               >
                  {generating ? <Loader2 className="animate-spin" size={16} /> : <Clapperboard size={16} />}
                  <span>生成分镜</span>
               </button>
               <div className="w-px h-6 bg-slate-800 mx-1"></div>
               
               {/* Global Action 1: Subject Video (Only visible in VIDU tab) */}
               {subTab === VideoSubTab.VIDU && (
                   <button 
                      onClick={(e) => { e.stopPropagation(); handleOneClickVideo('SUBJECT'); }}
                      disabled={!activeEpisode?.shots.length || isBatchGenerating}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-purple-900/20 disabled:opacity-50 transition-all active:scale-95"
                   >
                      {isBatchGenerating && <Loader2 className="animate-spin" size={16} />}
                      <User size={16} />
                      <span>一键生成主体视频</span>
                   </button>
               )}

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

               <button 
                  onClick={(e) => { e.stopPropagation(); handleVideoDownload(); }}
                  disabled={!activeEpisode?.shots.length}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  title="下载本集视频"
               >
                  <Download size={16} />
                  <span>下载本集视频</span>
               </button>
               <button 
                  onClick={(e) => { e.stopPropagation(); setExportModal(true); }}
                  disabled={!activeEpisode?.shots.length}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-700 hover:bg-pink-600 text-white border border-pink-600 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors shadow-lg shadow-pink-900/20"
               >
                  <Share size={16} />
                  <span>一键导出剪辑</span>
               </button>
            </div>
         </div>

         {/* Content Area: Split View */}
         <div className="flex-1 flex overflow-hidden">
            
            {/* Left: Script Content (Sticky/Scrollable) */}
            {activeEpisode && (
                <div className="w-[25%] min-w-[200px] max-w-[400px] bg-slate-950 border-r border-slate-800 p-6 overflow-y-auto custom-scrollbar shrink transition-all duration-300">
                    <div className="mb-4 flex items-center gap-2 text-slate-400">
                        <FileText size={18} />
                        <h3 className="font-bold text-sm uppercase tracking-wider">本集剧本</h3>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                        {activeEpisode.scriptContent || "暂无剧本内容..."}
                    </div>
                </div>
            )}

            {/* Right: Storyboard Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50 relative scroll-smooth pr-16 custom-scrollbar"> 
                {!activeEpisode?.shots.length ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                        <Clapperboard size={48} className="opacity-20" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-300 mb-2">暂无分镜</h3>
                    <p className="max-w-md text-center text-sm mb-6">
                        该分集尚未生成任何分镜脚本。请点击右上角的 "生成分镜" 按钮，AI 将基于剧本和资产自动构建画面。
                    </p>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleGenerateStoryboard(); }}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-lg"
                    >
                        立即生成分镜
                    </button>
                </div>
                ) : (
                <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto pb-20">
                    {activeEpisode.shots.map((shot, index) => {
                        const linkedAssets = extractAssetsFromPrompt(shot.description);
                        const isVideoGenerating = videoGeneratingMap[shot.id];
                        
                        // Handle Multi-Version Logic
                        const versions = getShotVersions(shot);
                        const activeIndex = activeVideoIndices[shot.id] ?? (versions.length > 0 ? versions.length - 1 : 0);
                        const activeVideoUrl = versions[activeIndex];
                        
                        // Logic to show error or video
                        const currentError = errors.find(e => e.shotId === shot.id);
                        const isErrorState = shot.status === 'ERROR' && !dismissedErrorShots.has(shot.id);
                        
                        // If checking for video, allow it if it's completed OR if it was an error but dismissed
                        const hasVideo = !!activeVideoUrl && (shot.status === 'COMPLETED' || (shot.status === 'ERROR' && dismissedErrorShots.has(shot.id)));
                        
                        const isEditing = editingShotId === shot.id;

                        return (
                            <div 
                            id={`shot-card-${shot.id}`}
                            key={shot.id} 
                            className={`bg-slate-900 border rounded-xl overflow-hidden flex flex-col md:flex-row group transition-colors shadow-sm ${isErrorState ? 'border-red-500/50' : 'border-slate-800 hover:border-slate-600'}`}
                            >
                            
                            {/* Left: Video Preview (Larger Size) */}
                            <div className="w-full md:w-[420px] aspect-video bg-black relative shrink-0 border-r border-slate-800 group/media">
                                {hasVideo && !isErrorState ? (
                                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                                        {/* Use img to display preview since these are dummy URLs */}
                                        <img 
                                            id={`video-${shot.id}`} 
                                            src={activeVideoUrl} 
                                            className="w-full h-full object-cover opacity-90" 
                                            alt={`Shot ${index + 1}`}
                                        />
                                        
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        {/* Play Button - marks as viewed on click */}
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                markAsViewed(shot.id); 
                                            }}
                                            className="bg-white/20 backdrop-blur-sm p-3 rounded-full transition-transform transform scale-100 opacity-60 hover:opacity-100 hover:scale-110 pointer-events-auto"
                                        >
                                            <Play className="fill-white text-white ml-1" size={24} />
                                        </button>
                                        </div>
                                        
                                        {/* Buttons to navigate versions */}
                                        {versions.length > 1 && (
                                            <>
                                                <button 
                                                    onClick={(e) => handlePrevVideo(e, shot.id, versions.length)}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-opacity opacity-0 group-hover/media:opacity-100 z-10"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <button 
                                                    onClick={(e) => handleNextVideo(e, shot.id, versions.length)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-opacity opacity-0 group-hover/media:opacity-100 z-10"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </>
                                        )}
                                        
                                        {/* Action Buttons on Hover */}
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/media:opacity-100 transition-all z-20">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleSingleVideoDownload(activeVideoUrl); }}
                                                className="p-2 bg-black/60 hover:bg-blue-600 text-white rounded-lg backdrop-blur-sm"
                                                title="下载此视频"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </div>

                                        {/* Fullscreen Button on Hover (Bottom Right) */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEnterFullscreen(`video-${shot.id}`); }}
                                            className="absolute bottom-2 right-2 p-2 bg-black/60 hover:bg-white/20 text-white rounded-lg opacity-0 group-hover/media:opacity-100 transition-all z-20 backdrop-blur-sm pointer-events-auto"
                                            title="全屏预览"
                                        >
                                            <Maximize2 size={18} />
                                        </button>

                                        {/* Pagination Dots */}
                                        {versions.length > 1 && (
                                            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                                                {versions.map((_, vIdx) => (
                                                    <div 
                                                        key={vIdx}
                                                        className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${vIdx === activeIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950 relative">
                                        {isVideoGenerating || shot.status === 'GENERATING' ? (
                                        <>
                                            <Loader2 className="animate-spin text-purple-500 mb-2" size={32} />
                                            <span className="text-xs text-purple-400 font-medium animate-pulse">视频生成中...</span>
                                        </>
                                        ) : isErrorState ? (
                                            <div className="flex flex-col items-center px-4 text-center">
                                                <AlertCircle size={32} className="text-red-500 mb-2" />
                                                <span className="text-sm font-bold text-red-400 mb-1">生成失败</span>
                                                <span className="text-xs text-slate-400 line-clamp-3">{currentError?.detail || "未知错误，请重试"}</span>
                                                
                                                {/* Navigation buttons even in error state if versions exist */}
                                                {versions.length > 0 && (
                                                    <div className="flex gap-4 mt-4">
                                                        <button 
                                                            onClick={(e) => handlePrevVideo(e, shot.id, versions.length)}
                                                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
                                                            title="查看之前版本"
                                                        >
                                                            <ChevronLeft size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => handleNextVideo(e, shot.id, versions.length)}
                                                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
                                                            title="查看之前版本"
                                                        >
                                                            <ChevronRight size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                        <>
                                            <Video size={32} className="opacity-20 mb-2" />
                                            <span className="text-xs">等待生成</span>
                                        </>
                                        )}
                                        
                                        {!isVideoGenerating && shot.status !== 'GENERATING' && !isErrorState && (
                                        <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 backdrop-blur-sm transition-all flex-col gap-2">
                                            {/* Buttons for quick access on overlay */}
                                            <div className="flex gap-2">
                                                <button onClick={() => handleSingleShotGenerate(shot.id, 'IMAGE')} className="p-2 bg-blue-600 rounded-lg text-white shadow" title="图生视频"><ImageIcon size={16}/></button>
                                                <button onClick={() => handleSingleShotGenerate(shot.id, 'SUBJECT')} className="p-2 bg-purple-600 rounded-lg text-white shadow" title="主体生视频"><User size={16}/></button>
                                                <button onClick={() => handleSingleShotGenerate(shot.id, 'SCENE')} className="p-2 bg-emerald-600 rounded-lg text-white shadow" title="场景图生视频"><Map size={16}/></button>
                                            </div>
                                            <span className="text-xs text-white font-medium">选择生成模式</span>
                                        </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-xs text-white font-mono border border-white/10 pointer-events-none">
                                    SHOT {String(index + 1).padStart(2, '0')}
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] text-slate-300 border border-white/10 pointer-events-none">
                                    {shot.duration}s
                                </div>
                            </div>

                            {/* Right: Controls & Prompt */}
                            <div className="flex-1 p-5 flex flex-col min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <Wand2 size={14} className="text-indigo-400" />
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">分镜提示词 (Prompt)</label>
                                        <button 
                                            onClick={() => setEditingShotId(isEditing ? null : shot.id)}
                                            className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                                            title={isEditing ? "完成编辑" : "修改提示词"}
                                        >
                                            {isEditing ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Edit3 size={14} />}
                                        </button>
                                    </div>
                                    
                                    {/* 3 Separate Generate Buttons */}
                                    <div className="flex items-center gap-1.5">
                                        <button 
                                            onClick={() => handleSingleShotGenerate(shot.id, 'IMAGE')}
                                            disabled={isVideoGenerating || shot.status === 'GENERATING'}
                                            className="flex items-center gap-1 px-2 py-1.5 bg-slate-800 hover:bg-blue-600 hover:text-white border border-slate-700 text-slate-300 rounded text-xs transition-all disabled:opacity-50"
                                            title="图生视频"
                                        >
                                            <ImageIcon size={12} />
                                            <span>图生视频</span>
                                        </button>
                                        <button 
                                            onClick={() => handleSingleShotGenerate(shot.id, 'SUBJECT')}
                                            disabled={isVideoGenerating || shot.status === 'GENERATING'}
                                            className="flex items-center gap-1 px-2 py-1.5 bg-slate-800 hover:bg-purple-600 hover:text-white border border-slate-700 text-slate-300 rounded text-xs transition-all disabled:opacity-50"
                                            title="主体生视频"
                                        >
                                            <User size={12} />
                                            <span>主体生视频</span>
                                        </button>
                                        <button 
                                            onClick={() => handleSingleShotGenerate(shot.id, 'SCENE')}
                                            disabled={isVideoGenerating || shot.status === 'GENERATING'}
                                            className="flex items-center gap-1 px-2 py-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-300 rounded text-xs transition-all disabled:opacity-50"
                                            title="场景图生视频"
                                        >
                                            <Map size={12} />
                                            <span>场景图生视频</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Auto-growing Prompt Editor (Grid Method) */}
                                <div className="relative w-full min-h-[7rem] border border-slate-800 rounded-lg bg-slate-950 grid grid-cols-1 overflow-hidden transition-all focus-within:ring-1 focus-within:ring-blue-500/50">
                                    {/* Replicator / Display */}
                                    <div className={`p-3 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words col-start-1 row-start-1 ${isEditing ? 'invisible' : 'text-slate-200'} custom-scrollbar`}>
                                        {isEditing ? shot.description + ' ' : renderHighlightedPrompt(shot.description)}
                                    </div>
                                    
                                    {/* Textarea */}
                                    {isEditing && (
                                        <textarea 
                                            value={shot.description}
                                            onChange={(e) => handleShotPromptChange(shot.id, e.target.value)}
                                            className="w-full h-full p-3 bg-transparent text-sm font-mono leading-relaxed text-slate-200 caret-blue-500 focus:outline-none resize-none overflow-hidden col-start-1 row-start-1"
                                            autoFocus
                                            spellCheck={false}
                                        />
                                    )}
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-800/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ImageIcon size={14} className="text-emerald-400" />
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">关联资产</label>
                                    </div>
                                    {linkedAssets.length > 0 ? (
                                        <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
                                        {linkedAssets.map((asset, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-800 rounded-lg pr-3 pl-1 py-1 border border-slate-700 shrink-0">
                                                <div className="w-8 h-8 rounded bg-black overflow-hidden shrink-0">
                                                    <img src={asset.url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-medium text-slate-200 truncate max-w-[100px]">{asset.name.replace('【@', '').replace('】', '').split('-')[0]}</span>
                                                    <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{asset.name.replace('【@', '').replace('】', '').split('-')[1]}</span>
                                                </div>
                                            </div>
                                        ))}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-600 italic pl-1">
                                        未检测到关联资产。
                                        </div>
                                    )}
                                </div>

                            </div>
                            </div>
                        );
                    })}
                </div>
                )}
            </div>
         </div>

        {/* 3. Right-side Mini Map (Navigation) */}
        {activeEpisode && activeEpisode.shots.length > 0 && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end gap-2 pointer-events-none">
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-2 rounded-2xl flex flex-col gap-2 shadow-xl pointer-events-auto max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {activeEpisode.shots.map((shot, idx) => {
                        const isGenerating = videoGeneratingMap[shot.id] || shot.status === 'GENERATING';
                        const hasIssue = checkShotIssues(shot.description);
                        const isCompleted = shot.status === 'COMPLETED';
                        const isError = shot.status === 'ERROR';
                        
                        // "New" Bubble Logic: If completed AND NOT in viewedShots
                        const isNew = isCompleted && !viewedShots.has(shot.id);
                        
                        let bgColor = 'bg-white';
                        if (hasIssue || isError) bgColor = 'bg-red-500';
                        else if (isGenerating) bgColor = 'bg-yellow-500 animate-pulse';
                        else if (isCompleted) bgColor = 'bg-emerald-500';

                        return (
                            <div key={shot.id} className="relative group">
                                <button
                                    onClick={(e) => { e.stopPropagation(); scrollToShot(shot.id); }}
                                    className={`w-3 h-3 rounded-sm transition-all hover:scale-150 relative ${bgColor} shadow-sm block`}
                                >
                                </button>
                                {/* Tooltip placed to the left with pointer-events-none to prevent flickering */}
                                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    分镜 {idx + 1}
                                </div>
                                {isNew && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full shadow-sm pointer-events-none animate-pulse border border-slate-900">
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )}

      {!isSidebarOpen && (
         <button 
            onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(true); }}
            className="absolute top-4 left-4 z-50 p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 shadow-lg hover:bg-slate-700 hover:text-white transition-colors"
            title="展开分集列表"
         >
            <PanelLeftOpen size={20} />
         </button>
      )}

      {/* Video Generation Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
           <div className="bg-slate-900 w-full max-w-md rounded-xl border border-slate-700 shadow-2xl p-6 animate-scale-in">
              
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                     <div className="bg-purple-600/20 p-2.5 rounded-full text-purple-500">
                         <Settings2 size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-white">生成参数设置</h3>
                 </div>
                 <button onClick={() => setShowSettingsModal(false)} className="text-slate-500 hover:text-white transition-colors">
                     <X size={20} />
                 </button>
              </div>

              {/* FIRST TIME PROMPT */}
              <div className="mb-4 bg-purple-500/10 border border-purple-500/20 text-purple-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Settings2 size={16} />
                  <span>首次进入，请先确认或修改视频生成参数。</span>
              </div>

              <div className="space-y-6">
                  {/* Aspect Ratio */}
                  <div>
                      <label className="text-sm font-medium text-slate-400 mb-3 block flex items-center gap-2">
                          <Ratio size={16} /> 视频宽高比 (Aspect Ratio)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                          {['16:9', '9:16', '1:1', '21:9'].map(ratio => (
                              <button
                                  key={ratio}
                                  onClick={() => setVideoSettings({...videoSettings, ratio})}
                                  className={`py-3 rounded-lg border text-sm font-medium transition-all ${
                                      videoSettings.ratio === ratio 
                                      ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                  }`}
                              >
                                  {ratio}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Resolution */}
                  <div>
                      <label className="text-sm font-medium text-slate-400 mb-3 block flex items-center gap-2">
                          <Monitor size={16} /> 分辨率 (Resolution)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                          {['720p', '1080p', '2K', '4K'].map(res => (
                              <button
                                  key={res}
                                  onClick={() => setVideoSettings({...videoSettings, resolution: res})}
                                  className={`py-3 rounded-lg border text-sm font-medium transition-all ${
                                      videoSettings.resolution === res 
                                      ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                  }`}
                              >
                                  {res}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Duration */}
                  <div>
                      <label className="text-sm font-medium text-slate-400 mb-3 block flex items-center gap-2">
                          <Clock size={16} /> 生成时长 (Duration)
                      </label>
                      <div className="flex gap-3 bg-slate-800 p-1 rounded-lg">
                          {['5s', '10s'].map(dur => (
                              <button
                                  key={dur}
                                  onClick={() => setVideoSettings({...videoSettings, duration: dur})}
                                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                                      videoSettings.duration === dur 
                                      ? 'bg-purple-600 text-white shadow-md' 
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                              >
                                  {dur}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="mt-8 flex justify-end">
                  <button 
                      onClick={() => setShowSettingsModal(false)}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-purple-900/20"
                  >
                      保存设置
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* Redirect/Warning Modal */}
      {redirectModal.isOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-6">
              <div className="bg-slate-900 w-full max-w-md rounded-xl border border-red-500/30 shadow-2xl p-6 animate-scale-in text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <AlertTriangle className="text-red-500" size={32} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{redirectModal.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      {redirectModal.message}
                  </p>
                  
                  <div className="flex gap-3 justify-center">
                      <button 
                          onClick={() => setRedirectModal({ ...redirectModal, isOpen: false })}
                          className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                      >
                          稍后再说
                      </button>
                      <button 
                          onClick={() => {
                              setRedirectModal({ ...redirectModal, isOpen: false });
                              goToAssets();
                          }}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20 flex items-center gap-2"
                      >
                          <span>{redirectModal.actionLabel}</span>
                          <ArrowRight size={16} />
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Download Confirmation Modal */}
      {downloadModal.isOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
             <div className="bg-slate-900 w-full max-w-md rounded-xl border border-slate-700 shadow-2xl p-6 animate-scale-in">
                 
                 <div className="flex items-center gap-3 mb-6">
                     <div className="bg-blue-600/20 p-3 rounded-full text-blue-500">
                         <Download size={24} />
                     </div>
                     <div>
                         <h3 className="text-xl font-bold text-white">确认下载</h3>
                         <p className="text-sm text-slate-400">
                            {downloadModal.type === 'EPISODE' ? '打包下载当前分集视频' : '打包下载整部项目所有视频'}
                         </p>
                     </div>
                 </div>

                 <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg border border-slate-800 mb-6">
                     <div className="flex justify-between items-center">
                         <span className="text-slate-400 text-sm">下载范围</span>
                         <span className="text-white font-medium">{downloadStats.label}</span>
                     </div>
                     <div className="h-px bg-slate-700/50"></div>
                     <div className="flex justify-between items-center">
                         <span className="text-slate-400 text-sm">包含镜头总数</span>
                         <span className="text-white font-medium">{downloadStats.totalShots} 个</span>
                     </div>
                     <div className="flex justify-between items-center">
                         <span className="text-slate-400 text-sm">预计下载文件数</span>
                         <span className={`font-medium ${downloadStats.totalVideos > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                             {downloadStats.totalVideos} 个视频
                         </span>
                     </div>
                     
                     {/* Checkbox for Including History */}
                     <div className="pt-2 flex items-center gap-2">
                        <input 
                           type="checkbox" 
                           id="includeHistory"
                           checked={downloadModal.includeHistory}
                           onChange={(e) => setDownloadModal({...downloadModal, includeHistory: e.target.checked})}
                           className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                        />
                        <label htmlFor="includeHistory" className="text-sm text-slate-300 cursor-pointer select-none">
                           同时下载所有历史版本 (未选中则仅下载当前展示视频)
                        </label>
                     </div>
                 </div>

                 <div className="flex justify-end gap-3">
                     <button 
                         onClick={() => setDownloadModal({ ...downloadModal, isOpen: false })}
                         className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                     >
                         取消
                     </button>
                     <button 
                         onClick={confirmDownload}
                         className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20 flex items-center gap-2"
                     >
                         <CheckCircle2 size={16} />
                         <span>确认下载</span>
                     </button>
                 </div>

             </div>
         </div>
      )}

      {/* Export Confirmation Modal */}
      {exportModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
             <div className="bg-slate-900 w-full max-w-md rounded-xl border border-pink-500/30 shadow-2xl p-6 animate-scale-in">
                 
                 <div className="flex items-center gap-3 mb-6">
                     <div className="bg-pink-600/20 p-3 rounded-full text-pink-500">
                         <Scissors size={24} />
                     </div>
                     <div>
                         <h3 className="text-xl font-bold text-white">一键导出剪辑</h3>
                         <p className="text-sm text-slate-400">
                            将选中视频发送至后期制作流程
                         </p>
                     </div>
                 </div>

                 <div className="grid grid-cols-1 gap-4 mb-2">
                     <button 
                         onClick={handleExportToCapCut}
                         className="flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg group transition-colors"
                     >
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold">LV</div>
                           <div className="text-left">
                              <div className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">导出到剪映</div>
                              <div className="text-xs text-slate-500">生成 .jianyin 草稿文件</div>
                           </div>
                        </div>
                        <Share size={18} className="text-slate-500 group-hover:text-white" />
                     </button>

                     <button 
                         onClick={handleExportToEditor}
                         className="flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg group transition-colors"
                     >
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center text-white">
                              <Monitor size={20} />
                           </div>
                           <div className="text-left">
                              <div className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">导出到在线编辑器</div>
                              <div className="text-xs text-slate-500">自动排列轨道并开始云剪辑</div>
                           </div>
                        </div>
                        <Share size={18} className="text-slate-500 group-hover:text-white" />
                     </button>
                 </div>

                 <div className="mt-4 flex justify-center">
                     <button 
                         onClick={() => setExportModal(false)}
                         className="text-slate-500 hover:text-white text-sm"
                     >
                         取消
                     </button>
                 </div>

             </div>
         </div>
      )}

      </div>
    </div>
  );
};

export default StageVideo;