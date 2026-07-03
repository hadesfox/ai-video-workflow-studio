import React, { useState } from 'react';
import { 
  Video, Image as ImageIcon, Music, Upload, RefreshCw, 
  Sparkles, Clock, Send, Monitor, History, X, ChevronDown, CheckCircle2, Play, Volume2, Maximize, MoreVertical, ArrowLeft, Folder, Search, Plus
} from 'lucide-react';

interface FormPageProps {
  onBack: () => void;
}

const historyTasks = [
  {
    id: 'cgt-20260318160726-cr1mf',
    duration: '3分22秒',
    date: '2026/3/18 16:07:45',
    prompt: '角色站位：在【@镇诡司-指挥中心_主状态】下，【@柳寒衣_女队长常态】站在中央指挥台，四周是【@镇诡师若干_作战常态】。镜头1：特写/快剪...',
    image: 'https://picsum.photos/seed/task1/100/50'
  },
  {
    id: 'cgt-20260318160729-rl6nh',
    duration: '4分42秒',
    date: '2026/3/18 16:07:44',
    prompt: '角色站位：在【@血色礼堂-走廊_主状态】中，【@林路_青年常态】站在中央，【@反派A_歹徒常态】与【@反派B_歹徒常态】正疯狂从拐角处狂奔而...',
    image: 'https://picsum.photos/seed/task2/100/50'
  },
  {
    id: 'cgt-20260318160732-kxxfw',
    duration: '3分27秒',
    date: '2026/3/18 16:07:39',
    prompt: '角色站位：在【@血色礼堂-走廊_主状态】中，【@林路_青年常态】面对着【@幽冥狮王_橘猫状态】。镜头1：特写，【@幽冥狮王_橘猫状态】耳朵抖...',
    image: 'https://picsum.photos/seed/task3/100/50'
  },
  {
    id: 'cgt-20260318142341-51gx6',
    duration: '2分11秒',
    date: '2026/3/18 14:23:43',
    prompt: '全局固定参数，无字幕，镜头运动自然稳定，无抖动，无快速模糊，生成音效，无BGM。画面整体滤镜为发丝呈现自然蓬松感，皮肤白皙如陶瓷般水嫩...',
    image: 'https://picsum.photos/seed/task4/100/50'
  }
];

const mockProjects = [
  { id: 'p1', name: '测试项目1' },
  { id: 'p2', name: '测试项目2' },
];

const mockSubjects = [
  { id: 's1', projectId: 'p1', name: '主角A', image: 'https://picsum.photos/seed/s1/200/200' },
  { id: 's2', projectId: 'p1', name: '反派B', image: 'https://picsum.photos/seed/s2/200/200' },
  { id: 's3', projectId: 'p1', name: '场景C', image: 'https://picsum.photos/seed/s3/200/200' },
  { id: 's4', projectId: 'p2', name: '道具D', image: 'https://picsum.photos/seed/s4/200/200' },
  { id: 's5', projectId: 'p2', name: '角色E', image: 'https://picsum.photos/seed/s5/200/200' },
];

const FormPage: React.FC<FormPageProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(mockProjects[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<any[]>([]);

  const filteredSubjects = mockSubjects.filter(s => 
    s.projectId === selectedProject && 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSubject = (subject: any) => {
    if (selectedSubjects.length < 9 && !selectedSubjects.find(s => s.id === subject.id)) {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
    setIsSubjectModalOpen(false);
  };
  
  const handleRemoveSubject = (id: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s.id !== id));
  };

  return (
    <div className="w-full h-full flex gap-6 p-6 animate-fade-in text-slate-200">
      
      {/* Left Panel - Creation Tools */}
      <div className="w-1/3 min-w-[400px] flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Video size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">视频创作工具</h2>
          </div>
          <button 
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="返回系统"
          >
            <X size={20} />
          </button>
        </div>

        {/* Input Sections Container */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-6 overflow-y-auto">
          
          {/* Reference Images */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <ImageIcon size={16} />
                <span>参考图片 ({selectedSubjects.length}/9)</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsSubjectModalOpen(true)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Folder size={12} />
                  <span>主体库</span>
                </button>
                <button className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  <Upload size={12} />
                  <span>上传</span>
                </button>
              </div>
            </div>
            {selectedSubjects.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {selectedSubjects.map((subject) => (
                  <div key={subject.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-700 group">
                    <img src={subject.image} alt={subject.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => handleRemoveSubject(subject.id)}
                        className="text-red-400 hover:text-red-300 bg-black/50 p-1 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-center py-1 truncate px-1 text-white">
                      {subject.name}
                    </div>
                  </div>
                ))}
                {selectedSubjects.length < 9 && (
                  <div className="aspect-square border border-dashed border-slate-700/50 rounded-lg flex items-center justify-center bg-slate-900/20 hover:bg-slate-800/40 transition-colors cursor-pointer group">
                    <Plus size={20} className="text-slate-600 group-hover:text-slate-500" />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-20 border border-dashed border-slate-700/50 rounded-lg flex items-center justify-center bg-slate-900/20 hover:bg-slate-800/40 transition-colors cursor-pointer group">
                <span className="text-xs text-slate-600 group-hover:text-slate-500">暂无图片，点击上方上传或从主体库选择</span>
              </div>
            )}
          </div>

          {/* Reference Videos */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Video size={16} />
                <span>参考视频 (0/3)</span>
              </div>
              <button className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <Upload size={12} />
                <span>上传</span>
              </button>
            </div>
            <div className="h-20 border border-dashed border-slate-700/50 rounded-lg flex items-center justify-center bg-slate-900/20 hover:bg-slate-800/40 transition-colors cursor-pointer group">
              <span className="text-xs text-slate-600 group-hover:text-slate-500">暂无视频，点击上方上传</span>
            </div>
          </div>

          {/* Reference Audio */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Music size={16} />
                <span>参考音频 (0/3)</span>
              </div>
              <button className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <Upload size={12} />
                <span>上传</span>
              </button>
            </div>
            <div className="h-20 border border-dashed border-slate-700/50 rounded-lg flex items-center justify-center bg-slate-900/20 hover:bg-slate-800/40 transition-colors cursor-pointer group">
              <span className="text-xs text-slate-600 group-hover:text-slate-500">暂无音频，点击上方上传</span>
            </div>
          </div>

        </div>

        {/* Prompt Input Area */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 relative shrink-0">
          <textarea 
            className="w-full h-32 bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600 resize-none"
            placeholder="描述你想生成的视频内容... 输入 @ 插入资产"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          
          {/* Bottom Actions */}
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800/50">
            <div className="flex gap-2">
              <button className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800" title="重置">
                <RefreshCw size={14} />
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800">
                <Monitor size={14} />
                <span>自动</span>
                <ChevronDown size={12} className="ml-1 opacity-70" />
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800">
                <Clock size={14} />
                <span>自动</span>
                <ChevronDown size={12} className="ml-1 opacity-70" />
              </button>
            </div>
            
            <button className="flex items-center gap-2 px-6 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-lg text-sm transition-colors">
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <Monitor size={18} className="text-blue-500" />
              <span>任务预览</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">生成成功</span>
              <span className="text-xs text-slate-400 font-mono">cgt-20260318160726-cr1mf</span>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors">
                <span>展开信息</span>
                <ArrowLeft size={14} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 border border-slate-800 rounded-xl bg-black flex flex-col relative overflow-hidden group">
            {/* Video Content Placeholder */}
            <div className="flex-1 flex items-center justify-center bg-black">
              <img src="https://picsum.photos/seed/scifi/800/400" alt="Video frame" className="h-full object-contain" />
            </div>
            
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Progress bar */}
              <div className="h-1 bg-slate-600/50 rounded-full overflow-hidden cursor-pointer">
                <div className="h-full bg-white w-1/15 rounded-full"></div>
              </div>
              {/* Controls */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <button className="hover:text-blue-400 transition-colors"><Play size={18} fill="currentColor" /></button>
                  <span className="text-xs font-medium">0:01 / 0:15</span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="hover:text-blue-400 transition-colors"><Volume2 size={18} /></button>
                  <button className="hover:text-blue-400 transition-colors"><Maximize size={18} /></button>
                  <button className="hover:text-blue-400 transition-colors"><MoreVertical size={18} /></button>
                </div>
              </div>
            </div>
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
          
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
            {historyTasks.map(task => (
              <div key={task.id} className="flex items-center gap-4 p-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl transition-colors cursor-pointer group">
                <div className="shrink-0 pl-1">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">{task.id}</span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-emerald-500/70">{task.duration}</span>
                      <span className="text-slate-500">{task.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 truncate">{task.prompt}</p>
                </div>
                <div className="shrink-0 w-20 h-10 rounded bg-slate-900 overflow-hidden border border-slate-700 group-hover:border-slate-500 transition-colors">
                  <img src={task.image} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Subject Library Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Folder className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white">主体库</h2>
              </div>
              <button 
                onClick={() => setIsSubjectModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Sidebar - Projects */}
              <div className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
                <div className="p-4 border-b border-slate-800">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">项目分类</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                  {mockProjects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        selectedProject === project.id 
                          ? 'bg-indigo-500/20 text-indigo-300 font-medium' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Folder className="w-4 h-4" />
                      <span className="truncate">{project.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content - Subjects */}
              <div className="flex-1 flex flex-col bg-slate-900">
                {/* Search Bar */}
                <div className="p-6 border-b border-slate-800">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="搜索主体名称..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Subjects Grid */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  {filteredSubjects.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {filteredSubjects.map(subject => {
                        const isSelected = selectedSubjects.some(s => s.id === subject.id);
                        return (
                          <div 
                            key={subject.id}
                            onClick={() => handleAddSubject(subject)}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer group transition-all ${
                              isSelected 
                                ? 'border-indigo-500 opacity-50 cursor-not-allowed' 
                                : 'border-slate-700 hover:border-indigo-400'
                            }`}
                          >
                            <img src={subject.image} alt={subject.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-sm font-medium text-white truncate">{subject.name}</p>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-indigo-500 text-white p-1 rounded-full">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}
                            {!isSelected && (
                              <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transform translate-y-2 group-hover:translate-y-0 transition-all">
                                  添加至参考
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <Folder className="w-12 h-12 mb-4 opacity-20" />
                      <p>该分类下暂无主体</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FormPage;
