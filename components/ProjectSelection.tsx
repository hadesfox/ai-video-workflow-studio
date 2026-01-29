import React, { useState, useRef } from 'react';
import { Project } from '../types';
import { Plus, FolderOpen, Clock, FileText, ArrowRight, Edit2, Trash2, X, Sparkles, BookOpen, Mic, CheckCircle2, ArrowRightLeft, PlayCircle, Film, UploadCloud, File as FileIcon, Eye, Check, AlignLeft } from 'lucide-react';

interface ProjectSelectionProps {
  currentProject: Project | null;
  setProject: (p: Project) => void;
  onProjectSelected: () => void;
}

const ProjectSelection: React.FC<ProjectSelectionProps> = ({ currentProject, setProject, onProjectSelected }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [newScriptContent, setNewScriptContent] = useState('');
  
  const [scriptType, setScriptType] = useState<'COMMENTARY' | 'PLOT'>('COMMENTARY'); // Default Commentary
  const [isUploadedScript, setIsUploadedScript] = useState<boolean>(true); // Only for Commentary
  
  // Conversion / Analysis States
  const [isConverting, setIsConverting] = useState(false);
  const [convertedScript, setConvertedScript] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false); // For script reader
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local Project List
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: '赛博朋克诺瓦 v1', scriptType: 'NARRATIVE', scriptContent: '在一个被霓虹灯淹没的城市里，侦探Kael醒来，发现自己丢失了昨晚的记忆。窗外，巨大的全息广告牌正在播放着Tyrell公司的最新义体广告...', createdAt: new Date('2023-10-01'), lastModified: new Date('2023-10-25') },
    { id: '2', name: '火星救援行动', scriptType: 'PLOT', scriptContent: '第一幕：飞船坠毁。第二幕：寻找水源。第三幕：发现外星遗迹。', createdAt: new Date('2023-09-15'), lastModified: new Date('2023-09-20') },
    { id: '3', name: '魔法学院日常', scriptType: 'NARRATIVE', scriptContent: '艾米丽挥舞着魔杖，但是什么也没发生。教授叹了口气。', createdAt: new Date('2023-08-10'), lastModified: new Date('2023-08-12') },
  ]);

  // Editing State
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // --- Handlers ---

  const handleCreateComplete = (finalContent: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `新项目 ${new Date().toLocaleDateString()}`,
      scriptType: scriptType === 'COMMENTARY' ? 'COMMENTARY' : 'NARRATIVE', 
      scriptContent: finalContent,
      createdAt: new Date(),
      lastModified: new Date(),
    };
    
    setProjects([newProject, ...projects]);
    setProject(newProject);
    setShowCreateModal(false);
    resetCreateForm();
    onProjectSelected();
  };

  const generateLongMockScript = () => {
    let script = `# 纪录片：星际文明的崛起与陨落 (AI 剧本转换版)
生成时间: ${new Date().toLocaleString()}
预估时长: 45分钟

---

## 序幕：起源

[画面 001]
描述：深邃的宇宙背景，无数星系像尘埃一样散落。镜头缓慢推进，穿过猎户座星云，色彩斑斓的气体云在黑暗中涌动。
运镜：推镜头 (Dolly In) -> 缓慢
音效：低沉的宇宙背景噪音，逐渐增强的宏大管弦乐。
解说词："在一百三十八亿年前，这里什么都没有。没有光，没有时间，只有无尽的虚空。直到那个奇点的爆发，赋予了这一切意义。"

[画面 002]
描述：一颗原始的行星正在形成，岩浆在大地上奔流，天空中陨石如雨点般落下。
运镜：俯拍 (High Angle) -> 快速掠过地表
音效：巨大的撞击声，岩浆流动的滋滋声。
解说词："混乱，是秩序的母亲。在数十亿年的混沌中，生命所需的元素正在熔炉中锻造。"

---

## 第一章：觉醒

[画面 003]
描述：原始海洋的特写，单细胞生物在显微镜视角下分裂、游动。
解说词："最初的火花微不足道，但在浩瀚的时间长河中，它点燃了进化的引信。"

`;
    
    // 生成重复段落以模拟长文本 (模拟约 50 个场景)
    for (let i = 1; i <= 20; i++) {
        script += `
## 第${i}幕：文明的第 ${i} 次跃迁

[画面 ${String(i + 3).padStart(3, '0')}]
描述：全景镜头展示第 ${i} 代文明的城市中心。巨大的${i % 2 === 0 ? '水晶' : '金属'}尖塔直插云霄，飞行载具在空中形成光流。
运镜：环绕镜头 (Orbit)
解说词："当历史的车轮滚动到第 ${i} 个纪元，我们以为我们已经掌握了真理。能源不再是问题，戴森球包裹了恒星，每一焦耳的能量都被贪婪地汲取。"

[画面 ${String(i + 4).padStart(3, '0')}]
描述：街道上的行人特写。他们穿着${i % 2 === 0 ? '极简主义的长袍' : '外骨骼装甲'}，眼神中透露出${i % 2 === 0 ? '智慧与平静' : '狂热与不安'}。
解说词："但技术不仅仅带来了繁荣。看这些面孔，${i % 2 === 0 ? '他们在思考存在的意义' : '他们在渴望更多的征服'}。这就是矛盾的螺旋，也是毁灭的伏笔。"

[画面 ${String(i + 5).padStart(3, '0')}]
描述：虚拟会议室内部。全息投影显示着星图，红色的警告区域正在扩散。
解说词："警报声最初是微弱的，被繁荣的喧嚣所掩盖。直到不可逆转的临界点到来。"
`;
    }

    script += `
---

## 终章：轮回

[画面 099]
描述：废墟。曾经辉煌的城市现在被植被覆盖（或被沙尘掩埋）。镜头拉远，看到这颗星球孤独地悬浮在太空中。
解说词："一切归于寂静。但这不是结束，只是另一个开始。星尘会再次聚集，新的恒星会再次点燃。"

[画面 100]
描述：黑屏。屏幕中央出现一行白字：“致所有探索者”。
解说词：(留白 3秒) "我们终将在群星间重逢。"
`;

    return script;
  };

  const handleConvertScript = () => {
     if (!newScriptContent) return;
     setIsConverting(true);
     setTimeout(() => {
        // Generate a LONG mock script
        const converted = generateLongMockScript();
        setConvertedScript(converted);
        setIsConverting(false);
     }, 1500);
  };

  const resetCreateForm = () => {
     setUploadedFileName(null);
     setNewScriptContent('');
     setScriptType('COMMENTARY');
     setIsUploadedScript(true);
     setConvertedScript(null);
     setIsConverting(false);
     setShowPreviewModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setUploadedFileName(file.name);
          // Mock reading file
          setNewScriptContent(`(模拟读取的文件内容: ${file.name}) \n\n这是从文件中读取的原始解说词文本。`);
      }
  };

  const handleCardClick = (proj: Project) => {
    setProject(proj);
    onProjectSelected();
  };

  const handleEditClick = (e: React.MouseEvent, proj: Project) => {
    e.stopPropagation(); 
    setEditingProject({ ...proj }); 
  };

  const handleSaveEdit = () => {
    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? editingProject : p));
      if (currentProject?.id === editingProject.id) {
        setProject(editingProject);
      }
      setEditingProject(null);
    }
  };

  const handleDelete = () => {
    if (editingProject) {
      if (window.confirm(`确定要删除项目 "${editingProject.name}" 吗？`)) {
        setProjects(prev => prev.filter(p => p.id !== editingProject.id));
        setEditingProject(null);
      }
    }
  };

  // --- Render ---

  return (
    <div className="max-w-7xl mx-auto pt-8 px-6 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-4">
        <div>
           <h2 className="text-3xl font-bold text-white mb-2">项目库</h2>
           <p className="text-slate-400">选择一个项目开始创作，或创建新剧本。</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* New Project Card */}
        <div 
          onClick={() => setShowCreateModal(true)}
          className="group cursor-pointer min-h-[220px] rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-900/30 hover:bg-slate-900/80 transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="bg-slate-800 group-hover:bg-blue-600 text-slate-400 group-hover:text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 shadow-lg group-hover:scale-110 group-hover:shadow-blue-500/50">
            <Plus size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 group-hover:text-white transition-colors">新建项目</h3>
          <p className="text-sm text-slate-500 mt-2 group-hover:text-blue-200/70">开始新的剧本创作</p>
        </div>

        {/* Project List */}
        {projects.map((proj) => (
          <div 
            key={proj.id}
            onClick={() => handleCardClick(proj)}
            className={`
              group relative flex flex-col bg-slate-900 border rounded-xl p-5 cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 hover:border-slate-600
              ${currentProject?.id === proj.id ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-slate-800'}
            `}
          >
            {/* Project Card Content (Same as before) */}
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg transition-colors ${currentProject?.id === proj.id ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-800'}`}>
                <FolderOpen size={24} />
              </div>
              <button 
                onClick={(e) => handleEditClick(e, proj)}
                className="opacity-0 group-hover:opacity-100 p-2 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 rounded-lg transition-all transform hover:scale-105 shadow-sm border border-slate-700 hover:border-transparent"
              >
                <Edit2 size={16} />
              </button>
            </div>
            <div className="flex-1">
               <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                 {proj.name}
               </h3>
               <div className="flex items-center space-x-2 text-xs text-slate-500 mb-4">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700/50">
                    {proj.scriptType === 'COMMENTARY' ? '解说视频' : '剧情短片'}
                  </span>
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1"/> 
                    {proj.lastModified.toLocaleDateString()}
                  </span>
               </div>
               <p className="text-sm text-slate-400 line-clamp-2 mb-2 font-mono bg-slate-950/50 p-2 rounded border border-slate-800/50 h-16">
                 {proj.scriptContent || "暂无预览内容"}
               </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
               <div className="flex items-center text-slate-500 text-xs font-medium group-hover:text-blue-400 transition-colors">
                  <span>进入管理</span>
                  <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
           <div className="bg-slate-900 w-full max-w-3xl rounded-xl border border-slate-700 shadow-2xl flex flex-col animate-scale-in overflow-hidden max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg"><Plus size={20} className="text-white"/></div>
                    创建新项目
                 </h2>
                 <button onClick={() => { setShowCreateModal(false); resetCreateForm(); }} className="text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                 </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 
                 {/* 1. Script Input - FILE UPLOAD REPLACEMENT */}
                 <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                       <FileText size={16} className="text-blue-500"/> 剧本上传 (支持 .txt, .pdf, .docx)
                    </label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-40 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl bg-slate-950 hover:bg-slate-900 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 group"
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".txt,.pdf,.docx,.doc" 
                            onChange={handleFileUpload}
                        />
                        {uploadedFileName ? (
                            <div className="flex flex-col items-center text-blue-400 animate-scale-in">
                                <FileIcon size={40} className="mb-2" />
                                <span className="font-semibold">{uploadedFileName}</span>
                                <span className="text-xs text-slate-500 mt-1">点击更换文件</span>
                            </div>
                        ) : (
                            <>
                                <UploadCloud size={40} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                                <div className="text-center">
                                    <p className="text-slate-400 group-hover:text-slate-200 font-medium">点击上传剧本文件</p>
                                    <p className="text-xs text-slate-600 mt-1">最大支持 50MB</p>
                                </div>
                            </>
                        )}
                    </div>
                 </div>

                 {/* 2. Script Type Selection */}
                 <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                       <BookOpen size={16} className="text-purple-500"/> 选择剧本类型
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                          onClick={() => setScriptType('COMMENTARY')}
                          className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${scriptType === 'COMMENTARY' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                       >
                          <Mic size={24} />
                          <span className="font-bold">解说 (Commentary)</span>
                       </button>
                       <button 
                          onClick={() => setScriptType('PLOT')}
                          className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${scriptType === 'PLOT' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                       >
                          <Film size={24} />
                          <span className="font-bold">剧情 (Plot)</span>
                       </button>
                    </div>
                 </div>

                 {/* 3. Conditional Logic for Commentary */}
                 {scriptType === 'COMMENTARY' && (
                    <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 space-y-5 animate-fade-in">
                       
                       {/* Upload Toggle */}
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">是否上传的解说剧本?</span>
                          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                             <button 
                                onClick={() => setIsUploadedScript(true)}
                                className={`px-4 py-1.5 rounded-md text-sm transition-all ${isUploadedScript ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                             >
                                是
                             </button>
                             <button 
                                onClick={() => { setIsUploadedScript(false); setConvertedScript(null); }}
                                className={`px-4 py-1.5 rounded-md text-sm transition-all ${!isUploadedScript ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                             >
                                否
                             </button>
                          </div>
                       </div>

                       {/* Action Area */}
                       {!isUploadedScript ? (
                          // Flow: No -> Convert -> Show Completed -> Preview Modal -> Confirm
                          <div className="space-y-4">
                             {!convertedScript ? (
                                <button 
                                   onClick={handleConvertScript}
                                   disabled={!newScriptContent || isConverting}
                                   className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                   {isConverting ? (
                                      <><ArrowRightLeft className="animate-spin" size={18}/> <span>正在转换剧本...</span></>
                                   ) : (
                                      <><Sparkles size={18}/> <span>转换剧本 (AI 适配)</span></>
                                   )}
                                </button>
                             ) : (
                                <div className="space-y-4 animate-scale-in">
                                   <div className="flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 gap-2">
                                       <CheckCircle2 size={20} />
                                       <span className="font-medium">剧本转换完成</span>
                                   </div>
                                   
                                   <div className="grid grid-cols-2 gap-3">
                                       <button 
                                          onClick={() => setShowPreviewModal(true)}
                                          className="py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 border border-slate-600 transition-colors"
                                       >
                                          <Eye size={18} /> <span>预览剧本</span>
                                       </button>
                                       <button 
                                          onClick={() => handleCreateComplete(convertedScript)}
                                          className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                                       >
                                          <Check size={18} /> <span>确认并拆分</span>
                                       </button>
                                   </div>
                                </div>
                             )}
                          </div>
                       ) : (
                          // Flow: Yes -> Split
                          <button 
                             onClick={() => handleCreateComplete(newScriptContent || "模拟内容")}
                             disabled={!newScriptContent}
                             className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50"
                          >
                             <ArrowRight size={18}/> <span>拆分剧本 (进入资产管理)</span>
                          </button>
                       )}
                    </div>
                 )}

                 {/* Plot Logic (Updated to Split Script) */}
                 {scriptType === 'PLOT' && (
                    <div className="animate-fade-in">
                        <button 
                           onClick={() => handleCreateComplete(newScriptContent || "模拟内容")}
                           disabled={!newScriptContent}
                           className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50"
                        >
                           <ArrowRight size={18}/> <span>拆分剧本 (进入资产管理)</span>
                        </button>
                    </div>
                 )}
                 
              </div>
           </div>
        </div>
      )}

      {/* SCRIPT PREVIEW MODAL (FULL SCREEN) */}
      {showPreviewModal && convertedScript && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 w-[95vw] h-[95vh] rounded-xl border border-slate-700 shadow-2xl flex flex-col animate-scale-in">
                {/* Full Screen Modal Header */}
                <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-xl shrink-0">
                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FileText size={24} className="text-blue-500" />
                            剧本阅览模式
                        </h3>
                        <div className="h-6 w-px bg-slate-700 mx-2"></div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                             <AlignLeft size={16} />
                             <span>字数统计: {convertedScript.length} 字</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowPreviewModal(false)}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-600"
                        >
                            关闭阅览
                        </button>
                    </div>
                </div>
                
                {/* Full Screen Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-950 p-0">
                    <div className="max-w-5xl mx-auto py-12 px-8 min-h-full">
                        <div className="prose prose-invert prose-lg max-w-none font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {convertedScript}
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end shrink-0">
                    <button 
                        onClick={() => { setShowPreviewModal(false); }}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 text-lg flex items-center gap-2"
                    >
                        <Check size={20} />
                        <span>确认无误，关闭预览</span>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Edit Modal (Preserved existing logic) */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 w-full max-w-md rounded-xl border border-slate-700 shadow-2xl p-6 relative animate-scale-in">
            <button 
              onClick={() => setEditingProject(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Edit2 size={20} className="mr-2 text-blue-500"/>
              编辑项目信息
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">项目名称</label>
                <input 
                  type="text" 
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
               <button onClick={handleDelete} className="flex items-center text-red-500 hover:text-red-400 text-sm px-3 py-2 rounded hover:bg-red-500/10 transition-colors">
                 <Trash2 size={16} className="mr-1.5" /> 删除项目
               </button>
               <div className="flex space-x-3">
                 <button onClick={() => setEditingProject(null)} className="px-4 py-2 text-slate-400 hover:text-white text-sm">取消</button>
                 <button onClick={handleSaveEdit} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20">保存更改</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelection;