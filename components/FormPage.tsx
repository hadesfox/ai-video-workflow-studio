import React, { useState } from 'react';
import { 
  Video, Image as ImageIcon, Music, Upload, RefreshCw, 
  Sparkles, Clock, Send, Monitor, History, X, Play
} from 'lucide-react';

interface FormPageProps {
  onBack: () => void;
}

const FormPage: React.FC<FormPageProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="w-full h-full flex gap-6 p-6 animate-fade-in text-slate-200">
      
      {/* Left Panel - Creation Tools */}
      <div className="w-1/3 min-w-[400px] flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Video size={20} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">视频创作工具</h2>
        </div>

        {/* Input Sections Container */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-6 overflow-y-auto">
          
          {/* Reference Images */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <ImageIcon size={16} />
                <span>参考图片 (0/9)</span>
              </div>
              <button className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <Upload size={12} />
                <span>上传</span>
              </button>
            </div>
            <div className="h-24 border border-dashed border-slate-700 rounded-lg flex items-center justify-center bg-slate-950/50 hover:bg-slate-900/50 transition-colors cursor-pointer group">
              <span className="text-xs text-slate-600 group-hover:text-slate-500">暂无图片，点击上方上传</span>
            </div>
          </div>

          {/* Reference Videos */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Video size={16} />
                <span>参考视频 (0/2)</span>
              </div>
              <button className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <Upload size={12} />
                <span>上传</span>
              </button>
            </div>
            <div className="h-24 border border-dashed border-slate-700 rounded-lg flex items-center justify-center bg-slate-950/50 hover:bg-slate-900/50 transition-colors cursor-pointer group">
              <span className="text-xs text-slate-600 group-hover:text-slate-500">暂无视频，点击上方上传</span>
            </div>
          </div>

          {/* Reference Audio */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Music size={16} />
                <span>参考音频 (1/3)</span>
              </div>
              <button className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <Upload size={12} />
                <span>上传</span>
              </button>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex items-center gap-3">
              <Music size={16} className="text-slate-500" />
              <span className="text-xs text-slate-300 flex-1">李靖.wav</span>
              <button className="text-slate-500 hover:text-slate-300">
                <X size={14} />
              </button>
            </div>
          </div>

        </div>

        {/* Prompt Input Area */}
        <div className="h-48 bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 relative">
          <textarea 
            className="w-full h-full bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600 resize-none"
            placeholder="描述你想生成的视频内容... 输入 @ 插入资产"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          
          {/* Bottom Actions */}
          <div className="flex justify-between items-center mt-auto pt-2">
            <div className="flex gap-2">
              <button className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors" title="重置">
                <RefreshCw size={16} />
              </button>
              <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800">
                <Monitor size={14} />
                <span>自动</span>
              </button>
              <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800">
                <Clock size={14} />
                <span>自动</span>
              </button>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-sm transition-colors">
              <Send size={14} />
              <span>发送</span>
            </button>
          </div>
        </div>

      </div>

      {/* Right Panel - Preview & History */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Task Preview */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-slate-200 font-medium">
            <Monitor size={18} className="text-blue-500" />
            <span>任务预览</span>
          </div>
          
          <div className="flex-1 border border-slate-800 rounded-xl bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Placeholder Content */}
            <div className="flex flex-col items-center gap-4 text-slate-600 group-hover:text-slate-500 transition-colors">
              <div className="p-4 rounded-full bg-slate-900/50 border border-slate-800">
                <Sparkles size={32} />
              </div>
              <span className="text-sm">在左侧提交任务开始创作</span>
            </div>
            
            {/* Background Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
          </div>
        </div>

        {/* History Tasks */}
        <div className="h-1/3 bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <History size={18} className="text-slate-400" />
              <span>历史任务</span>
            </div>
            <button className="text-slate-500 hover:text-slate-300 transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center text-slate-600 text-sm border-t border-slate-800/50">
            暂无历史任务
          </div>
        </div>

      </div>

    </div>
  );
};

export default FormPage;
