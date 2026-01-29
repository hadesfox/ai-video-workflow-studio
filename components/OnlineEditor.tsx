import React from 'react';
import { MonitorPlay, Settings, Scissors, Play, SkipBack, SkipForward, Layers, Volume2, Plus } from 'lucide-react';
import { TimelineClip } from '../types';

interface OnlineEditorProps {
  clips?: TimelineClip[];
}

const OnlineEditor: React.FC<OnlineEditorProps> = ({ clips = [] }) => {
  const hasClips = clips.length > 0;

  if (!hasClips) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="z-10 text-center space-y-6 max-w-lg">
          <div className="inline-flex p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl mb-4">
            <MonitorPlay className="w-16 h-16 text-pink-500" />
          </div>
          
          <h2 className="text-3xl font-bold text-white">Vidu 在线云剪辑</h2>
          <p className="text-slate-400 text-lg">
            正在连接云端渲染服务器...
            <br/>
            在此界面，您可以对生成的视频片段进行精细化剪辑、添加特效和字幕。
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center space-x-2 border border-slate-700">
              <Settings size={18} />
              <span>渲染设置</span>
            </button>
            <button className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-lg flex items-center space-x-2 shadow-lg shadow-pink-900/20">
              <Scissors size={18} />
              <span>启动编辑器</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Editor View
  return (
    <div className="h-full flex flex-col bg-slate-950 animate-fade-in">
       {/* 1. Preview Area */}
       <div className="flex-1 flex border-b border-slate-800">
          <div className="flex-1 bg-black flex items-center justify-center relative">
             <div className="aspect-video w-[80%] bg-slate-900 flex items-center justify-center border border-slate-800 shadow-2xl">
                {/* Mock Player */}
                {clips[0] ? (
                   <img src={clips[0].thumbnail || clips[0].videoUrl} className="w-full h-full object-cover opacity-80" alt="Preview"/>
                ) : (
                   <span className="text-slate-600">无预览画面</span>
                )}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 p-2 rounded-full border border-slate-700 backdrop-blur">
                   <SkipBack size={20} className="text-slate-300 hover:text-white cursor-pointer"/>
                   <Play size={24} className="fill-white text-white hover:scale-110 transition-transform cursor-pointer"/>
                   <SkipForward size={20} className="text-slate-300 hover:text-white cursor-pointer"/>
                </div>
             </div>
          </div>
          <div className="w-80 bg-slate-900 border-l border-slate-800 p-4">
             <h3 className="font-bold text-white mb-4">属性面板</h3>
             <div className="space-y-4">
                <div className="bg-slate-800 h-32 rounded-lg"></div>
                <div className="space-y-2">
                   <div className="h-2 bg-slate-800 rounded w-1/3"></div>
                   <div className="h-8 bg-slate-800 rounded w-full"></div>
                </div>
                <div className="space-y-2">
                   <div className="h-2 bg-slate-800 rounded w-1/3"></div>
                   <div className="h-8 bg-slate-800 rounded w-full"></div>
                </div>
             </div>
          </div>
       </div>

       {/* 2. Timeline Area */}
       <div className="h-72 bg-slate-900 flex flex-col shrink-0">
          <div className="h-10 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900">
             <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                <span>00:00:00:00</span>
                <div className="h-4 w-px bg-slate-700"></div>
                <span>FPS: 30</span>
             </div>
             <div className="flex gap-2">
                <button className="p-1 hover:bg-slate-800 rounded"><Settings size={14}/></button>
             </div>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
             {/* Track Headers */}
             <div className="w-32 bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="h-8 border-b border-slate-800/50 bg-slate-800/30"></div> {/* Ruler alignment */}
                <div className="flex-1 flex flex-col">
                   <div className="h-16 border-b border-slate-800 flex items-center justify-center text-slate-500 gap-2">
                      <Layers size={14} /> <span className="text-xs">Video 1</span>
                   </div>
                   <div className="h-16 border-b border-slate-800 flex items-center justify-center text-slate-500 gap-2">
                      <Volume2 size={14} /> <span className="text-xs">Audio 1</span>
                   </div>
                </div>
             </div>

             {/* Timeline Content */}
             <div className="flex-1 relative overflow-x-auto custom-scrollbar bg-slate-950">
                {/* Time Ruler */}
                <div className="h-8 border-b border-slate-800 flex items-end pb-1 px-2 sticky top-0 bg-slate-900 z-10">
                   <div className="flex gap-20 text-[10px] text-slate-500 font-mono select-none">
                      <span>00:00</span><span>00:05</span><span>00:10</span><span>00:15</span><span>00:20</span><span>00:25</span>
                   </div>
                </div>

                {/* Playhead */}
                <div className="absolute top-0 bottom-0 left-4 w-px bg-pink-500 z-20 pointer-events-none">
                   <div className="w-3 h-3 -ml-1.5 bg-pink-500 rotate-45 transform origin-center"></div>
                </div>

                {/* Tracks */}
                <div className="flex flex-col relative py-2">
                   {/* Video Track */}
                   <div className="h-16 mb-2 relative flex items-center px-2">
                      {clips.map((clip, index) => (
                         <div 
                           key={clip.id}
                           className="h-12 bg-blue-900/40 border border-blue-500/50 rounded-md flex items-center justify-center relative group cursor-pointer hover:bg-blue-800/50 mr-1 overflow-hidden"
                           style={{ width: `${Math.max(60, clip.duration * 20)}px` }} // visual approximation
                         >
                            {clip.thumbnail && (
                               <img src={clip.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity" alt=""/>
                            )}
                            <span className="text-[10px] text-blue-200 z-10 font-mono truncate px-1">Clip {index + 1}</span>
                         </div>
                      ))}
                      <div className="h-12 w-12 border border-dashed border-slate-700 rounded-md flex items-center justify-center opacity-50 hover:opacity-100 cursor-pointer">
                         <Plus size={16} className="text-slate-500" />
                      </div>
                   </div>

                   {/* Audio Track (Mock) */}
                   <div className="h-16 relative flex items-center px-2">
                      <div className="h-10 w-[400px] bg-emerald-900/30 border border-emerald-600/30 rounded-md flex items-center justify-center">
                         <span className="text-[10px] text-emerald-400">Background Music.mp3</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default OnlineEditor;