import React from 'react';
import { WorkflowStage } from '../types';
import { FileText, Image as ImageIcon, Database, Film, Share2, Terminal } from 'lucide-react';

interface SidebarProps {
  currentStage: WorkflowStage;
  setStage: (stage: WorkflowStage) => void;
  projectLoaded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentStage, setStage, projectLoaded }) => {
  
  const navItems = [
    { id: WorkflowStage.SCRIPT, label: '剧本输入', icon: FileText },
    { id: WorkflowStage.ASSETS, label: '资产提取', icon: ImageIcon },
    { id: WorkflowStage.MASTER_LIB, label: '主库管理', icon: Database },
    { id: WorkflowStage.VIDEO, label: '视频生成', icon: Film },
    { id: WorkflowStage.EXPORT, label: '最终导出', icon: Share2 },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      <div className="p-6 flex items-center space-x-2 border-b border-slate-800">
        <Terminal className="text-blue-500 w-6 h-6" />
        <h1 className="font-bold text-lg tracking-wider">VIDU STUDIO</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = currentStage === item.id;
          const isDisabled = !projectLoaded && item.id !== WorkflowStage.SCRIPT;
          
          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && setStage(item.id)}
              disabled={isDisabled}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                  : isDisabled 
                    ? 'opacity-30 cursor-not-allowed text-slate-500' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }
              `}
            >
              <item.icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">当前项目</p>
          <p className="text-sm font-semibold truncate text-slate-300">
            {projectLoaded ? "赛博朋克诺瓦 v1" : "未选择项目"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;