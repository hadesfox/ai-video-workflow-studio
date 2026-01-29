import React from 'react';
import { CheckCheck, MonitorPlay, Film, Share, Download, ExternalLink } from 'lucide-react';

const StageExport: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center animate-fade-in">
      <div className="max-w-3xl w-full space-y-8">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-full mb-2">
            <CheckCheck className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-4xl font-bold text-white">制作完成</h2>
          <p className="text-slate-400 text-lg">您的视频项目已成功生成并组装完毕。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500 transition-all group cursor-pointer">
            <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Download className="text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">本地导出</h3>
            <p className="text-sm text-slate-400 mb-4">下载 MP4 文件和独立素材包到您的设备。</p>
            <button className="w-full py-2 bg-slate-800 group-hover:bg-blue-600 text-white rounded transition-colors text-sm">下载 .zip</button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500 transition-all group cursor-pointer">
            <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Film className="text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">发送至 Premiere</h3>
            <p className="text-sm text-slate-400 mb-4">导出 XML 序列和链接媒体以供非编软件编辑。</p>
             <button className="w-full py-2 bg-slate-800 group-hover:bg-purple-600 text-white rounded transition-colors text-sm">导出 XML</button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-pink-500 transition-all group cursor-pointer">
            <div className="bg-pink-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MonitorPlay className="text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">在线编辑器</h3>
            <p className="text-sm text-slate-400 mb-4">在 Vidu 在线云编辑器中打开项目进行微调。</p>
             <button className="w-full py-2 bg-slate-800 group-hover:bg-pink-600 text-white rounded transition-colors text-sm flex items-center justify-center space-x-2">
               <span>打开编辑器</span>
               <ExternalLink size={14} />
             </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StageExport;