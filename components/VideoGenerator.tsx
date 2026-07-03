import React from 'react';
import { Upload, Play, RefreshCw, UploadCloud } from 'lucide-react';

const VideoGenerator: React.FC = () => {
  return (
    <div className="flex h-full w-full p-4 gap-4 bg-theme-page">
      {/* 左侧栏 */}
      <div className="w-96 flex flex-col gap-4">
        <div className="flex-1 bg-theme-panel border border-theme-border rounded-xl p-4 overflow-y-auto">
          {['资产图片', '参考图片', '参考视频', '参考音频'].map((title, i) => (
            <div key={i} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">{title} (0/9)</span>
                <button className="text-xs text-blue-400 flex items-center gap-1">
                  <Upload size={12} /> 上传
                </button>
              </div>
              <div className="border border-dashed border-theme-border rounded-lg h-24 flex items-center justify-center text-xs text-slate-500">
                暂无{title}，点击上方上传
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-theme-panel border border-theme-border rounded-xl p-4 h-40">
          <textarea 
            className="w-full h-full bg-theme-card border border-theme-border rounded-lg p-3 text-sm text-slate-200 outline-none"
            placeholder="描述你想生成的视频内容... 输入 @ 插入资产"
          />
        </div>
      </div>

      {/* 右侧主内容区域 */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex-1 bg-theme-panel border border-theme-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-bold text-white">任务预览</span>
            <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded">生成成功</span>
          </div>
          <div className="flex-1 bg-black rounded-lg flex items-center justify-center relative">
             <Play className="text-white w-16 h-16 opacity-50" />
          </div>
          <div className="h-12 flex items-center justify-between mt-4">
             <div className="w-full h-1 bg-slate-700 rounded-full">
                <div className="w-1/3 h-full bg-blue-500 rounded-full"></div>
             </div>
          </div>
        </div>

        <div className="h-72 bg-theme-panel border border-theme-border rounded-xl p-4 overflow-y-auto">
           <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-300">历史任务</span>
              <RefreshCw size={16} className="text-slate-500 cursor-pointer" />
           </div>
           {[1, 2, 3].map((i) => (
             <div key={i} className="flex gap-4 p-3 border-b border-theme-border last:border-0 items-center">
                <div className="w-10 h-10 bg-slate-700 rounded"></div>
                <div className="flex-1 text-xs">
                   <p className="text-slate-200 font-bold">cgt-20260424170023-1m46g</p>
                   <p className="text-slate-500">动作和舞蹈，生成在公园草坪跳舞。</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
