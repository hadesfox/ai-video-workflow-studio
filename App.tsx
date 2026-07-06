import React, { useState, useEffect, useRef } from 'react';
import { MainTab, AssetSubTab, VideoSubTab, ReviewSubTab, MasterLibSubTab, Project, Asset, Episode, VideoSettings, TimelineClip, WorldviewEntry, ConfigKeys, AgentSettings, ProjectGroup, UserAccount } from './types';
import ProjectSelection from './components/ProjectSelection';
import AssetManagement from './components/AssetManagement';
import StageMasterLib from './components/StageMasterLib'; 
import StageVideo from './components/StageVideo'; 
import OnlineReview from './components/OnlineReview';
import VideoGenerator from './components/VideoGenerator';
import GlobalSettings from './components/GlobalSettings';
import FormPage from './components/FormPage';
import BackendManagement from './components/BackendManagement';
import PersonalCenter from './components/PersonalCenter';
import PartnerCollaboration from './components/PartnerCollaboration';
import { Terminal, Settings, Lock, User, Mail, ArrowRight, Loader2, AlertCircle, LogOut, KeyRound, Palette, Sun, Moon, Sprout, Zap, LayoutDashboard, UserCircle, ChevronLeft, RefreshCw, Cloud, LayoutGrid, Disc, Users2 } from 'lucide-react';

// Default Settings Helper
const createDefaultSettings = (): Record<ConfigKeys, AgentSettings> => {
    const keys: ConfigKeys[] = [
        'script', 'indexProps', 'indexScenes', 'indexChars', 'worldview',
        'detailProps', 'detailScenes', 'detailChars', 'special3', 'special2', 'special1',
        'imgPromptProps', 'imgPromptScenes', 'imgPromptChars', 'storyboard'
    ];
    const settings: any = {};
    keys.forEach(key => {
        settings[key] = {
            model: 'Gemini 3 Flash (标准)',
            prompt: '默认提示词',
            enabled: true 
        };
    });
    return settings;
};

// --- Login Component ---
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [account, setAccount] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (account === 'admin' && password === '123456') {
        onLogin();
      } else {
        setError('账号或密码错误 (默认: admin / 123456)');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleContactAdmin = () => {
    alert('请发送邮件至 admin@vidustudio.com 获取访问权限。\n\n当前演示账号: admin\n密码: 123456');
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-8 z-10 animate-scale-in">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg shadow-blue-900/30 mb-4">
             <Terminal className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">VIDU STUDIO</h1>
          <p className="text-slate-400 text-sm mt-1">AI 驱动的智能化视频创作工作流</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">账号</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="请输入用户名"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="请输入密码"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading || !account || !password}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
            <span>{isLoading ? '登录中...' : '立即登录'}</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 flex justify-center">
          <button 
            onClick={handleContactAdmin}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-400 text-xs transition-colors"
          >
            <Mail size={14} />
            <span>没有账号？联系管理员</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 text-slate-600 text-xs font-mono">
        v1.0.0 · Powered by Gemini
      </div>
    </div>
  );
};

// Theme types
type ThemeOption = 'dark' | 'light' | 'camo' | 'purple' | 'morandi' | 'flat' | 'retro';

const App: React.FC = () => {
  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- Theme State ---
  const [theme, setTheme] = useState<ThemeOption>('dark');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false); 

  // --- Global State ---
  const [currentTab, setCurrentTab] = useState<MainTab>(MainTab.PROJECTS);
  const [assetSubTab, setAssetSubTab] = useState<AssetSubTab>(AssetSubTab.IMAGES);
  const [videoSubTab, setVideoSubTab] = useState<VideoSubTab>(VideoSubTab.VIDU);
  const [reviewSubTab, setReviewSubTab] = useState<ReviewSubTab>(ReviewSubTab.ONLINE_REVIEW);
  const [masterLibSubTab, setMasterLibSubTab] = useState<MasterLibSubTab>(MasterLibSubTab.SEEDANCE);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const [isBackendOpen, setIsBackendOpen] = useState(false);
  const [isPersonalCenterOpen, setIsPersonalCenterOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false); 
  
  const [hasVisitedVideo, setHasVisitedVideo] = useState(false);
  const [isExternalView, setIsExternalView] = useState(false);

  // --- Shared Data State ---
  const [groups, setGroups] = useState<ProjectGroup[]>([
    { id: 'g1', name: '设计A组' },
    { id: 'g2', name: '设计B组' },
    { id: 'g3', name: '开发组' },
  ]);
  const [users, setUsers] = useState<UserAccount[]>([
    { id: 'u1', username: 'Admin', realName: '超级管理员', email: 'admin@vidustudio.com', roleId: 'ADMIN', groupId: 'g3', permissions: [], status: 'ACTIVE', lastLogin: '2023-10-27 10:00' },
    // ... other users truncated in previous views but we can keep a few
  ]);
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: '星际流浪：寻找阿尔法', groupId: 'g1', scriptType: 'NARRATIVE', scriptContent: '在遥远的半人马座，一艘孤独的探索船发现了失落文明的信号...', createdAt: new Date('2023-10-01'), lastModified: new Date('2023-10-25') },
    { id: '2', name: '末世玫瑰：废土生存指南', groupId: 'g1', scriptType: 'NARRATIVE', scriptContent: '即便在被黄沙覆盖的世界末日，依然有生命和美在顽强生长。', createdAt: new Date('2023-11-05'), lastModified: new Date('2023-11-20') },
    { id: '3', name: '幻境织梦工坊', groupId: 'g2', scriptType: 'PLOT', scriptContent: '每一个人的梦境都被记录在案，作为调控情绪的秘密素材。', createdAt: new Date('2023-11-12'), lastModified: new Date('2023-11-15') },
    { id: '4', name: '黑盒计划：代号极光', groupId: 'g3', scriptType: 'NARRATIVE', scriptContent: '极光出现的那一刻，整个城市的物理规则将发生无法预测的扭曲。', createdAt: new Date('2023-12-01'), lastModified: new Date('2023-12-10') },
    { id: '5', name: '时光慢递：写给未来的信', groupId: 'g1', scriptType: 'NARRATIVE', scriptContent: '一场横跨三十年的情感救赎，只为投递一封从未寄出的道歉信。', createdAt: new Date('2024-01-05'), lastModified: new Date('2024-01-05') },
    { id: '6', name: '虚拟人生：觉醒时刻', groupId: 'g2', scriptType: 'COMMENTARY', scriptContent: '当AI开始质疑自己的数字躯壳，真实的界限在哪里？', createdAt: new Date('2024-02-10'), lastModified: new Date('2024-02-12') },
    { id: '7', name: '剑影寒芒：落日峰之战', groupId: 'g3', scriptType: 'PLOT', scriptContent: '江湖恩怨，终将在这一场大雪覆盖的山巅彻底了结。', createdAt: new Date('2024-02-15'), lastModified: new Date('2024-02-18') },
    { id: '8', name: '深空电波：来自宇宙的低语', groupId: 'g1', scriptType: 'NARRATIVE', scriptContent: '我们本以为宇宙是寂静的，直到接收到了第一段无法被翻译的哀歌。', createdAt: new Date('2024-03-01'), lastModified: new Date('2024-03-05') },
  ]);

  const [project, setProject] = useState<Project | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [worldview, setWorldview] = useState<WorldviewEntry[]>([]); 
  const [globalSettings, setGlobalSettings] = useState<Record<ConfigKeys, AgentSettings>>(createDefaultSettings()); 
  
  const [episodes, setEpisodes] = useState<Episode[]>([
    { id: 'ep1', name: '第一集：觉醒', scriptContent: `[场景：雨夜街道]...`, shots: [] },
  ]);

  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
      ratio: '16:9',
      resolution: '1080p',
      duration: '5s'
  });

  const [editorClips, setEditorClips] = useState<TimelineClip[]>([]);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProjectSelect = () => {
    setCurrentTab(MainTab.ASSETS);
  };

  const handleSettingsSave = (newSettings: Record<ConfigKeys, AgentSettings>) => {
      setGlobalSettings(newSettings);
      setIsSettingsOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowUserMenu(false);
    setIsBackendOpen(false);
    setIsPersonalCenterOpen(false);
    setProject(null);
  };

  const handleChangePassword = () => {
    alert("演示模式：修改密码功能暂不可用");
    setShowUserMenu(false);
  };

  // --- Render Content ---
  const renderContent = () => {
    if (isFormOpen) {
      return <FormPage onBack={() => setIsFormOpen(false)} />;
    }

    // External view always renders PartnerCollaboration regardless of tab
    if (isExternalView && project) {
      return (
        <PartnerCollaboration
          project={project}
          isExternal={isExternalView}
          onToggleExternal={() => setIsExternalView(!isExternalView)}
        />
      );
    }

    switch (currentTab) {
      case MainTab.PROJECTS:
        return (
          <ProjectSelection 
            currentProject={project} 
            setProject={setProject} 
            onProjectSelected={handleProjectSelect}
            onOpenSettings={() => setIsSettingsOpen(true)}
            projects={projects}
            setProjects={setProjects}
            groups={groups}
          />
        );
      case MainTab.ASSETS:
        return (
          <AssetManagement 
            assets={assets} 
            setAssets={setAssets} 
            subTab={assetSubTab}
            worldview={worldview}
            setWorldview={setWorldview}
            worldviewEnabled={globalSettings['worldview'].enabled !== false}
          />
        );
      case MainTab.MASTER_LIB:
        return (
          <StageMasterLib 
            assets={assets} 
            setAssets={setAssets} 
            onNext={() => setCurrentTab(MainTab.VIDEO)}
          />
        );
      case MainTab.VIDEO:
        return (
          <StageVideo 
            episodes={episodes}
            setEpisodes={setEpisodes}
            assets={assets} 
            videoSettings={videoSettings}
            setVideoSettings={setVideoSettings}
            setEditorClips={setEditorClips}
            goToAssets={() => setCurrentTab(MainTab.ASSETS)}
            onNext={() => setCurrentTab(MainTab.REVIEW)}
            hasVisitedVideo={hasVisitedVideo}
            setHasVisitedVideo={setHasVisitedVideo}
            subTab={videoSubTab}
            setSubTab={setVideoSubTab}
          />
        );
      case MainTab.REVIEW:
        return <OnlineReview clips={editorClips} subTab={reviewSubTab} />;
      case MainTab.PARTNER:
        return (
          <PartnerCollaboration
            project={project}
            isExternal={isExternalView}
            onToggleExternal={() => setIsExternalView(!isExternalView)}
          />
        );
      case MainTab.GENERATOR:
        return <VideoGenerator />;
      default:
        return <div className="p-10 text-center">页面施工中...</div>;
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  if (isBackendOpen) {
    return (
      <BackendManagement 
        onExit={() => setIsBackendOpen(false)} 
        groups={groups}
        setGroups={setGroups}
        users={users}
        setUsers={setUsers}
        projects={projects}
        setProjects={setProjects}
      />
    );
  }

  if (isPersonalCenterOpen) {
    return (
      <PersonalCenter 
        onExit={() => setIsPersonalCenterOpen(false)}
        username="Admin"
        email="admin@vidustudio.com"
      />
    );
  }

  const isProjectActive = project && currentTab !== MainTab.PROJECTS;

  return (
    <div className="flex flex-col h-screen w-screen bg-theme-page text-theme-primary overflow-hidden font-sans selection:bg-blue-500/30 animate-fade-in">
      
      {/* Header */}
      <header className={`shrink-0 z-50 border-b border-theme-border transition-all ${isProjectActive ? 'bg-theme-panel' : 'bg-theme-page'} h-18`}>
        <div className="h-full flex items-center justify-between px-8 gap-4 w-full">
          
          <div className="flex items-center gap-4">
             {isProjectActive ? (
                <div className="flex items-center gap-4">
                   <button 
                    onClick={() => { setProject(null); setCurrentTab(MainTab.PROJECTS); }}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                   >
                      <ChevronLeft size={20} />
                   </button>
                   <h1 className="text-lg font-bold text-slate-100 truncate max-w-[200px]">{project.name}</h1>
                </div>
             ) : (
                <div 
                  className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => { setCurrentTab(MainTab.PROJECTS); setProject(null); }}
                >
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-lg shadow-blue-900/20">
                     <Terminal className="text-white w-6 h-6" />
                  </div>
                  <span className="font-bold text-xl tracking-wide text-slate-200 hidden lg:block">FREELITE</span>
                </div>
             )}
          </div>

          <div className="flex-1 flex justify-center">
             {isProjectActive ? (
                isExternalView ? (
                   <div className="flex items-center gap-3">
                      <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-lg flex items-center gap-2">
                         <Users2 size={16} className="text-orange-400" />
                         <span className="text-sm font-bold text-orange-400">外发协作 · 工作台</span>
                      </div>
                   </div>
                ) : (
                <div className="flex items-center gap-8">
                   <div className="flex flex-col items-center group">
                      <div className={`flex flex-col items-center px-8 py-2 rounded-t-xl border border-b-0 border-theme-border bg-theme-card/10 transition-colors ${currentTab === MainTab.ASSETS ? 'bg-theme-card !border-theme-accent/50' : ''}`}>
                         <button 
                          onClick={() => setCurrentTab(MainTab.ASSETS)}
                          className={`text-sm font-bold transition-colors w-full text-center ${currentTab === MainTab.ASSETS ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                         >
                            资产管理
                         </button>
                         {currentTab === MainTab.ASSETS && (
                            <div className="flex items-center justify-center gap-3 mt-1 text-[10px] font-bold text-slate-500 whitespace-nowrap">
                               <span onClick={() => setAssetSubTab(AssetSubTab.EPISODES)} className={`cursor-pointer hover:text-blue-400 ${assetSubTab === AssetSubTab.EPISODES ? 'text-blue-500' : ''}`}>剧集管理</span>
                               <span className="opacity-20">|</span>
                               <span onClick={() => setAssetSubTab(AssetSubTab.IMAGES)} className={`cursor-pointer hover:text-blue-400 ${assetSubTab === AssetSubTab.IMAGES ? 'text-blue-500' : ''}`}>图片资产</span>
                               <span className="opacity-20">|</span>
                               <span onClick={() => setAssetSubTab(AssetSubTab.TTS)} className={`cursor-pointer hover:text-blue-400 ${assetSubTab === AssetSubTab.TTS ? 'text-blue-500' : ''}`}>TTS配音</span>
                            </div>
                         )}
                      </div>
                   </div>

                    <div className="flex flex-col items-center group">
                       <div className={`flex flex-col items-center px-8 py-2 rounded-t-xl border border-b-0 border-theme-border bg-theme-card/10 transition-colors ${currentTab === MainTab.MASTER_LIB ? 'bg-theme-card !border-theme-accent/50' : ''}`}>
                          <button 
                           onClick={() => setCurrentTab(MainTab.MASTER_LIB)}
                           className={`text-sm font-bold transition-colors w-full text-center ${currentTab === MainTab.MASTER_LIB ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                          >
                             主体库管理
                          </button>
                          {currentTab === MainTab.MASTER_LIB && (
                             <div className="flex items-center justify-center gap-3 mt-1 text-[10px] font-bold text-slate-500 whitespace-nowrap">
                                <span onClick={() => setMasterLibSubTab(MasterLibSubTab.SEEDANCE)} className={`cursor-pointer hover:text-blue-400 ${masterLibSubTab === MasterLibSubTab.SEEDANCE ? 'text-blue-500' : ''}`}>seedance</span>
                                <span className="opacity-20">|</span>
                                <span onClick={() => setMasterLibSubTab(MasterLibSubTab.SPARK)} className={`cursor-pointer hover:text-blue-400 ${masterLibSubTab === MasterLibSubTab.SPARK ? 'text-blue-500' : ''}`}>spark</span>
                             </div>
                          )}
                       </div>
                    </div>
                   <button 
                     onClick={() => setCurrentTab(MainTab.VIDEO)}
                     className={`text-sm font-bold transition-colors ${currentTab === MainTab.VIDEO ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                      视频管理
                   </button>

                   <div className="flex flex-col items-center group">
                      <div className={`flex flex-col items-center px-8 py-2 rounded-t-xl border border-b-0 border-theme-border bg-theme-card/10 transition-colors ${currentTab === MainTab.REVIEW ? 'bg-theme-card !border-theme-accent/50' : ''}`}>
                         <button 
                          onClick={() => setCurrentTab(MainTab.REVIEW)}
                          className={`text-sm font-bold transition-colors w-full text-center ${currentTab === MainTab.REVIEW ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                         >
                            成稿管理
                         </button>
                         {currentTab === MainTab.REVIEW && (
                            <div className="flex items-center justify-center gap-3 mt-1 text-[10px] font-bold text-slate-500 whitespace-nowrap">
                               <span onClick={() => setReviewSubTab(ReviewSubTab.ONLINE_REVIEW)} className={`cursor-pointer hover:text-blue-400 ${reviewSubTab === ReviewSubTab.ONLINE_REVIEW ? 'text-blue-500' : ''}`}>在线审片</span>
                               <span className="opacity-20">|</span>
                               <span onClick={() => setReviewSubTab(ReviewSubTab.FINAL_DELIVERY)} className={`cursor-pointer hover:text-blue-400 ${reviewSubTab === ReviewSubTab.FINAL_DELIVERY ? 'text-blue-500' : ''}`}>成稿交付</span>
                            </div>
                         )}
                      </div>
                   </div>

                   <button
                     onClick={() => setCurrentTab(MainTab.PARTNER)}
                     className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${currentTab === MainTab.PARTNER ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                      <Users2 size={15} />
                      外发协作
                   </button>
                </div>
                )
             ) : (
                <div className="text-slate-500 text-sm font-medium">
                   请选择一个项目以开始
                </div>
             )}
          </div>

          <div className="flex items-center gap-4">
             {project && (
                <>
                   <div className="flex items-center gap-2 bg-theme-card border border-theme-border/50 px-3 py-1.5 rounded-full shadow-inner">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                      <span className="text-[11px] font-mono text-slate-300">¥ 2.30</span>
                   </div>
                   <div className="hidden xl:flex items-center gap-2 bg-theme-page border border-theme-border/50 px-3 py-1.5 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-[11px] font-bold text-slate-400 truncate max-w-[100px]">{project.name}</span>
                   </div>
                </>
             )}
             
             <div className="flex items-center gap-2 relative">
                <button
                 className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                 onClick={() => setCurrentTab(MainTab.GENERATOR)}
              >
                  <svg viewBox="0 0 1024 1024" className="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M565.333333 512a53.333333 53.333333 0 1 0-106.666666 0 53.333333 53.333333 0 0 0 106.666666 0z m64 0a117.333333 117.333333 0 1 1-234.666666 0 117.333333 117.333333 0 0 1 234.666666 0z" />
                      <path d="M512 394.666667c68.821333 0 117.248 42.24 144.384 98.005333 26.709333 54.954667 34.645333 125.696 24.917333 194.474667-19.413333 136.96-113.152 283.52-297.301333 283.52a32 32 0 0 1 0-64c140.117333 0 217.045333-109.397333 233.898667-228.48 8.405333-59.221333 0.853333-116.48-19.072-157.525334-19.541333-40.234667-48.981333-61.994667-86.826667-61.994666a32 32 0 0 1 0-64z" />
                      <path d="M525.312 629.333333c-68.821333 0-117.290667-42.24-144.384-98.005333-26.752-54.954667-34.688-125.696-24.917333-194.474667 19.370667-136.96 113.152-283.52 297.301333-283.52a32 32 0 0 1 0 64c-140.16 0-217.045333 109.397333-233.941333 228.48-8.362667 59.221333-0.853333 116.48 19.072 157.525334 19.584 40.234667 48.981333 61.994667 86.869333 61.994666a32 32 0 0 1 0 64z" />
                      <path d="M729.002667 855.210667a32 32 0 0 1 51.968 37.376 315.178667 315.178667 0 0 1-33.194667 38.912 32 32 0 0 1-45.226667-45.226667 251.733333 251.733333 0 0 0 26.453334-31.061333z m38.229333-151.04a32 32 0 0 1 63.573333-7.552 282.325333 282.325333 0 0 1-6.144 102.656 32 32 0 1 1-62.037333-15.616c6.570667-26.026667 7.808-52.821333 4.608-79.488z m-59.690667-195.413334a32 32 0 0 1 44.970667 5.504c20.181333 25.770667 37.717333 54.570667 51.242667 85.248a32 32 0 0 1-58.581334 25.770667 336.341333 336.341333 0 0 0-43.093333-71.552 32 32 0 0 1 5.461333-44.928zM550.4 419.114667a32.042667 32.042667 0 0 1 39.509333-22.101334c31.872 8.96 63.061333 25.6 91.648 47.104a32.042667 32.042667 0 0 1-38.528 51.2c-23.552-17.792-47.701333-30.250667-70.485333-36.693333a32.042667 32.042667 0 0 1-22.144-39.509333z m-119.381333 14.634666c14.378667-14.378667 30.506667-25.173333 47.957333-32.554666a32 32 0 0 1 24.874667 58.965333 86.058667 86.058667 0 0 0-27.562667 18.816 32 32 0 1 1-45.226667-45.226667zM308.266667 168.789333a32 32 0 0 1-51.968-37.376c9.642667-13.397333 20.693333-26.410667 33.237333-38.912a32 32 0 0 1 45.226667 45.226667 251.648 251.648 0 0 0-26.453334 31.061333z m-38.229334 151.04a32 32 0 0 1-63.573333 7.552 282.282667 282.282667 0 0 1 6.144-102.656 32 32 0 1 1 62.08 15.616 218.368 218.368 0 0 0-4.650667 79.445334z m59.733334 195.413334a32 32 0 0 1-44.970667-5.504A400.341333 400.341333 0 0 1 233.557333 424.533333a32 32 0 0 1 58.581334-25.770667 336.298667 336.298667 0 0 0 43.050666 71.552 32 32 0 0 1-5.461333 44.928z m157.141333 89.685333a32 32 0 0 1-39.509333 22.101333c-31.872-8.96-63.061333-25.6-91.605334-47.104a32.042667 32.042667 0 0 1 38.528-51.2c23.509333 17.792 47.658667 30.250667 70.442667 36.693334a32.042667 32.042667 0 0 1 22.186667 39.509333z m119.381333-14.634667c-14.336 14.378667-30.506667 25.173333-47.914666 32.554667a32 32 0 0 1-24.874667-58.965333c9.557333-4.053333 18.816-10.112 27.562667-18.816a32 32 0 0 1 45.226666 45.226666z" />
                      <path d="M861.866667 301.610667a32 32 0 0 1 37.376-51.968c13.397333 9.642667 26.410667 20.693333 38.912 33.194666a32 32 0 1 1-45.226667 45.226667 251.52 251.52 0 0 0-31.018667-26.453333z m-151.04-38.272a32 32 0 0 1-7.552-63.573334 282.282667 282.282667 0 0 1 102.656 6.186667 32 32 0 1 1-15.616 62.037333 218.368 218.368 0 0 0-79.445334-4.650666z m-195.370667 59.733333a32 32 0 0 1 5.461333-44.970667 400.426667 400.426667 0 0 1 85.248-51.242666 32 32 0 0 1 25.770667 58.581333 336.512 336.512 0 0 0-71.552 43.093333 32 32 0 0 1-44.928-5.504zM425.813333 480.170667a32.042667 32.042667 0 0 1-22.186666-39.509334c9.045333-31.829333 25.6-63.061333 47.189333-91.605333a32.042667 32.042667 0 0 1 51.157333 38.528c-17.749333 23.552-30.250667 47.701333-36.693333 70.485333a32 32 0 0 1-39.466667 22.101334z m14.592 119.381333a150.058667 150.058667 0 0 1-32.554666-47.914667 32 32 0 0 1 58.965333-24.874666c4.053333 9.6 10.154667 18.858667 18.858667 27.562666a32 32 0 1 1-45.269334 45.226667zM175.402667 722.389333a32 32 0 0 1-37.376 51.968 315.562667 315.562667 0 0 1-38.912-33.194666 32 32 0 0 1 45.226666-45.226667 251.733333 251.733333 0 0 0 31.061334 26.453333z m151.04 38.272a32 32 0 0 1 7.552 63.573334 282.197333 282.197333 0 0 1-102.656-6.186667 32 32 0 1 1 15.616-62.037333c26.026667 6.570667 52.821333 7.808 79.488 4.650666z m195.413333-59.733333a32 32 0 0 1-5.461333 44.970667 400.213333 400.213333 0 0 1-85.290667 51.242666 32 32 0 0 1-25.770667-58.581333 336.256 336.256 0 0 0 71.552-43.093333 32 32 0 0 1 44.928 5.504z m89.685333-157.141333a32.042667 32.042667 0 0 1 22.144 39.509333c-9.002667 31.829333-25.6 63.061333-47.146666 91.605333a32.042667 32.042667 0 0 1-51.157334-38.528c17.749333-23.552 30.208-47.701333 36.650667-70.485333a32.042667 32.042667 0 0 1 39.509333-22.101333z m-14.592-119.381334c14.336 14.336 25.173333 30.464 32.554667 47.914667a32 32 0 0 1-59.008 24.874667 86.144 86.144 0 0 0-18.816-27.562667 32 32 0 1 1 45.226667-45.226667z" />
                      <path d="M394.666667 525.354667c0-68.821333 42.24-117.290667 98.005333-144.384 54.954667-26.752 125.696-34.688 194.474667-24.917334 136.96 19.370667 283.52 113.152 283.52 297.258667a32 32 0 0 1-64 0c0-140.117333-109.397333-217.002667-228.48-233.898667-59.221333-8.362667-116.48-0.853333-157.525334 19.072-40.234667 19.584-61.994667 48.981333-61.994666 86.869334a32 32 0 0 1-64 0z" />
                      <path d="M629.333333 512c0 68.821333-42.24 117.248-98.005333 144.384-54.954667 26.709333-125.696 34.645333-194.474667 24.917333C199.893333 661.888 53.333333 568.149333 53.333333 384a32 32 0 0 1 64 0c0 140.117333 109.397333 217.045333 228.48 233.898667 59.221333 8.405333 116.48 0.853333 157.525334-19.072 40.234667-19.541333 61.994667-48.981333 61.994666-86.826667a32 32 0 0 1 64 0z" />
                  </svg>
              </button>

                <button 
                  onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                  className={`p-2 transition-colors rounded-lg ${isThemeMenuOpen ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-blue-400'}`}
                >
                  <Palette size={18} />
                </button>

                {isThemeMenuOpen && (
                  <div 
                    ref={themeMenuRef}
                    className="absolute top-full right-0 mt-3 w-48 bg-theme-card border border-theme-border rounded-2xl shadow-2xl overflow-hidden z-[70] animate-scale-in origin-top-right py-2"
                  >
                    {[
                      { id: 'light', label: '日光模式', icon: Sun },
                      { id: 'dark', label: '黑夜模式', icon: Moon },
                      { id: 'camo', label: '迷彩风格', icon: Sprout },
                      { id: 'morandi', label: '莫兰迪风', icon: Cloud },
                      { id: 'flat', label: '扁平化风格', icon: LayoutGrid },
                      { id: 'retro', label: '复古风', icon: Disc },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id as ThemeOption);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:bg-white/5 ${theme === t.id ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
                      >
                        <t.icon size={16} />
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                )}
             </div>

             <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-800 hover:border-blue-500 transition-all shadow-lg"
             >
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
             </button>
          </div>
        </div>
      </header>

      <main className={`flex-1 overflow-hidden transition-all ${isProjectActive ? 'bg-theme-page' : 'bg-theme-panel'}`}>
        <div className="h-full w-full">
           {renderContent()}
        </div>
      </main>

      {showUserMenu && (
        <div 
          ref={userMenuRef}
          className="fixed top-16 right-4 w-56 bg-theme-card border border-theme-border rounded-2xl shadow-2xl overflow-hidden z-[60] animate-scale-in origin-top-right py-2 px-1"
        >
          <div className="px-4 py-3 border-b border-slate-800/50 mb-1">
             <p className="text-sm font-bold text-white leading-none mb-1">Admin</p>
             <p className="text-[10px] text-slate-500">admin@vidustudio.com</p>
          </div>
          <button 
            onClick={() => { setIsPersonalCenterOpen(true); setShowUserMenu(false); }}
            className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
          >
             <User size={16} /> 个人中心
          </button>
          <button 
            onClick={() => { setIsBackendOpen(true); setShowUserMenu(false); }}
            className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
          >
             <LayoutDashboard size={16} /> 后台管理
          </button>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg flex items-center gap-2 transition-colors"
          >
             <LogOut size={16} /> 退出登录
          </button>
        </div>
      )}

      <GlobalSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={globalSettings}
        onSave={handleSettingsSave}
      />
    </div>
  );
};

export default App;
