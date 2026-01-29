import React, { useState } from 'react';
import { Project } from '../types';
import { Upload, FilePlus, ArrowRight, Activity, CheckCircle, BrainCircuit } from 'lucide-react';

interface StageScriptProps {
  project: Project | null;
  setProject: (p: Project) => void;
  onNext: () => void;
}

const StageScript: React.FC<StageScriptProps> = ({ project, setProject, onNext }) => {
  const [view, setView] = useState<'SELECT' | 'INPUT' | 'ANALYSIS'>('SELECT');
  const [analyzing, setAnalyzing] = useState(false);
  const [scriptText, setScriptText] = useState('');
  const [scriptType, setScriptType] = useState<'NARRATIVE' | 'PLOT'>('NARRATIVE');

  const handleCreateProject = () => {
    setProject({
      id: Date.now().toString(),
      name: 'New Project',
      scriptType: 'NARRATIVE',
      scriptContent: '',
      createdAt: new Date(),
      lastModified: new Date(),
    });
    setView('INPUT');
  };

  const handleAnalysis = () => {
    setAnalyzing(true);
    setView('ANALYSIS');
    
    // Simulate AI Agent processing
    setTimeout(() => {
      setAnalyzing(false);
      setProject({
        ...project!,
        scriptContent: scriptText,
        scriptType: scriptType
      });
    }, 2500);
  };

  if (view === 'SELECT') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in">
        <h2 className="text-3xl font-light text-slate-100">欢迎使用 Vidu Studio</h2>
        <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
          <button 
            onClick={handleCreateProject}
            className="group flex flex-col items-center justify-center p-10 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500 hover:bg-slate-800 transition-all duration-300"
          >
            <div className="bg-blue-500/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <FilePlus className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">新建项目</h3>
            <p className="text-slate-400 text-sm text-center">从零开始创建新剧本</p>
          </button>

          <button className="group flex flex-col items-center justify-center p-10 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-emerald-500 hover:bg-slate-800 transition-all duration-300">
             <div className="bg-emerald-500/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">打开项目</h3>
            <p className="text-slate-400 text-sm text-center">继续处理现有的 .vidu 文件</p>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'INPUT') {
    return (
      <div className="h-full flex flex-col max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h2 className="text-2xl font-semibold">剧本录入</h2>
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button 
              onClick={() => setScriptType('NARRATIVE')}
              className={`px-4 py-1.5 text-sm rounded-md transition-all ${scriptType === 'NARRATIVE' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              叙事 / 故事
            </button>
            <button 
               onClick={() => setScriptType('PLOT')}
               className={`px-4 py-1.5 text-sm rounded-md transition-all ${scriptType === 'PLOT' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              情节 / 大纲
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden relative group">
          <textarea
            className="w-full h-full bg-transparent p-6 resize-none focus:outline-none text-slate-300 font-mono leading-relaxed"
            placeholder="在此粘贴剧本或开始输入..."
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
          />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="bg-slate-800 text-xs px-3 py-1 rounded border border-slate-600 hover:bg-slate-700">上传 .txt/.pdf</button>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            disabled={!scriptText.length}
            onClick={handleAnalysis}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <BrainCircuit size={20} />
            <span>启动分析智能体</span>
          </button>
        </div>
      </div>
    );
  }

  // Analysis View
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-8">
      {analyzing ? (
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <Activity className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={32} />
          </div>
          <div>
            <h3 className="text-xl font-medium text-white mb-2">AI 智能体正在工作中</h3>
            <p className="text-slate-400">正在解析剧本... 识别角色... 构建世界模型...</p>
          </div>
          <div className="flex gap-4 justify-center text-xs font-mono text-slate-500 mt-4">
             <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800 animate-pulse delay-75">解析场景 1</span>
             <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800 animate-pulse delay-150">提取实体</span>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6 animate-fade-in-up">
          <div className="flex items-center space-x-4 text-emerald-500 mb-6">
            <CheckCircle size={32} />
            <h3 className="text-2xl font-semibold text-white">分析完成</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between p-4 bg-slate-800 rounded-lg">
              <span className="text-slate-400">检测到的场景</span>
              <span className="font-mono text-white">8</span>
            </div>
            <div className="flex justify-between p-4 bg-slate-800 rounded-lg">
              <span className="text-slate-400">识别到的角色</span>
              <span className="font-mono text-white">3</span>
            </div>
            <div className="flex justify-between p-4 bg-slate-800 rounded-lg">
              <span className="text-slate-400">复杂度评分</span>
              <span className="font-mono text-emerald-400">低</span>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button 
              onClick={() => setView('INPUT')}
              className="flex-1 px-4 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              返回编辑
            </button>
             <button 
              onClick={onNext}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg font-medium shadow-lg shadow-blue-900/20"
            >
              <span>前往资产提取</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StageScript;