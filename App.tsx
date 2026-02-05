import React, { useState, useEffect, useRef } from 'react';
import { MainTab, AssetSubTab, Project, Asset, Episode, VideoSettings, TimelineClip, WorldviewEntry, ConfigKeys, AgentSettings } from './types';
import ProjectSelection from './components/ProjectSelection';
import AssetManagement from './components/AssetManagement';
import StageMasterLib from './components/StageMasterLib'; // Reuse existing component
import StageVideo from './components/StageVideo'; // Reuse existing component
import OnlineEditor from './components/OnlineEditor';
import GlobalSettings from './components/GlobalSettings';
import BackendManagement from './components/BackendManagement'; // Import Backend Management
import { Terminal, Settings, Lock, User, Mail, ArrowRight, Loader2, AlertCircle, LogOut, KeyRound, Palette, Sun, Moon, Sprout, Zap, LayoutDashboard } from 'lucide-react';

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
            enabled: true // Default all enabled
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

    // Mock Authentication delay
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
      {/* Background Ambience */}
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
type ThemeOption = 'dark' | 'light' | 'camo' | 'purple';

const App: React.FC = () => {
  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- Theme State ---
  const [theme, setTheme] = useState<ThemeOption>('dark');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false); // New state for click interaction

  // --- Global State ---
  const [currentTab, setCurrentTab] = useState<MainTab>(MainTab.PROJECTS);
  const [assetSubTab, setAssetSubTab] = useState<AssetSubTab>(AssetSubTab.IMAGES);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // New: Backend Management State
  const [isBackendOpen, setIsBackendOpen] = useState(false);
  
  // New: Global state to track if user has visited video page (for one-time modal)
  const [hasVisitedVideo, setHasVisitedVideo] = useState(false);

  // Data State
  const [project, setProject] = useState<Project | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [worldview, setWorldview] = useState<WorldviewEntry[]>([]); // New Worldview State
  const [globalSettings, setGlobalSettings] = useState<Record<ConfigKeys, AgentSettings>>(createDefaultSettings()); // New Settings State
  
  // Lifted Episodes State (Persistence for StageVideo) with Script Content
  const [episodes, setEpisodes] = useState<Episode[]>([
    { 
        id: 'ep1', 
        name: '第一集：觉醒', 
        scriptContent: `[场景：雨夜街道]
时间：深夜
角色：Kael（主角）

画面描述：
街道上霓虹灯闪烁，雨水不断冲刷着路面，反射出五颜六色的光芒。全息广告牌在空中悬浮，播放着断断续续的义体广告。

Kael 独自站在路灯下，雨水顺着他宽大的帽檐滴落。他手里紧紧攥着一张发黄的全息照片，眼神中透露出迷茫和疲惫。

Kael (独白): "我不知道我是谁，但我知道我要找什么。这种感觉就像大脑里植入了一段死循环的代码，无法停止，也无法破解。"

镜头缓慢推进，给到 Kael 的特写。他的左眼是一只明显的义眼，此时正收缩着红色的光圈，似乎在扫描着周围的信息。`,
        shots: [] 
    },
    { 
        id: 'ep2', 
        name: '第二集：追逐', 
        scriptContent: `[场景：高速公路隧道]
时间：夜间
角色：Kael, 追击者

画面描述：
Kael 驾驶着一辆改装过的浮空车，在拥挤的车流中极速穿梭。发动机发出刺耳的轰鸣声，车身剧烈震动。

身后，两架黑色的无人机紧追不舍。红色的激光瞄准线在 Kael 的车身上扫过，随后是几束高能激光擦着车身飞过，溅起一片耀眼的火花。

Kael 咬紧牙关，猛打方向盘，浮空车侧身滑行，险之又险地钻入了一条狭窄的废弃隧道。

追击者 (通讯频道): "目标已进入 D-4 区域，所有单位准备拦截。重复，这不是演习。"`,
        shots: [] 
    },
    { 
        id: 'ep3', 
        name: '第三集：对决', 
        scriptContent: `[场景：废弃工厂核心区]
时间：黎明前
角色：Kael, Vesper（反派）

画面描述：
这里是城市的边缘，巨大的废弃工厂如同钢铁巨兽的骨架。生锈的机械臂悬挂在半空，偶尔发出吱呀的声响。

Vesper 穿着一身剪裁完美的白色西装，一尘不染，与周围肮脏、油腻的环境形成了鲜明对比。他站在高处的平台上，俯视着下方的 Kael。

Vesper (冷笑): "你以为你能改变什么吗？Kael。你不过是泰瑞尔公司的一件废弃产品，一段产生了错误的程序。"

Kael 拔出腰间的旧式左轮，枪口由于充能而微微发光。他的眼神不再迷茫，而是充满了坚定。

Kael: "也许我是个错误。但有时候，正是错误导致了系统的进化。今天，我就要终结你的代码。"`,
        shots: [] 
    },
  ]);

  // Lifted Video Settings (Persistence)
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
      ratio: '16:9',
      resolution: '1080p',
      duration: '5s'
  });

  // Editor State (Passing data from Video to Editor)
  const [editorClips, setEditorClips] = useState<TimelineClip[]>([]);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null); // Ref for theme menu

  useEffect(() => {
    // Apply theme to document root
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

  // --- Navigation ---
  const tabs = [
    { id: MainTab.PROJECTS, label: '项目选择' },
    { id: MainTab.ASSETS, label: '资产管理' },
    { id: MainTab.MASTER_LIB, label: 'Vidu主体库管理' },
    { id: MainTab.VIDEO, label: '视频管理' },
    { id: MainTab.EDITOR, label: '在线编辑' },
  ];

  const handleProjectSelect = () => {
    setCurrentTab(MainTab.ASSETS); // Auto jump to assets after selection
  };

  const handleSettingsSave = (newSettings: Record<ConfigKeys, AgentSettings>) => {
      setGlobalSettings(newSettings);
      setIsSettingsOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowUserMenu(false);
    setIsBackendOpen(false); // Reset backend mode
    setProject(null); // Optional: clear project on logout
  };

  const handleChangePassword = () => {
    alert("演示模式：修改密码功能暂不可用");
    setShowUserMenu(false);
  };

  // --- Render Content ---
  const renderContent = () => {
    switch (currentTab) {
      case MainTab.PROJECTS:
        return (
          <ProjectSelection 
            currentProject={project} 
            setProject={setProject} 
            onProjectSelected={handleProjectSelect}
            onOpenSettings={() => setIsSettingsOpen(true)}
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
            onNext={() => setCurrentTab(MainTab.EDITOR)}
            hasVisitedVideo={hasVisitedVideo}
            setHasVisitedVideo={setHasVisitedVideo}
          />
        );
      case MainTab.EDITOR:
        return <OnlineEditor clips={editorClips} />;
      default:
        return <div className="p-10 text-center">页面施工中...</div>;
    }
  };

  // If not logged in, show Login Screen
  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  // If Backend Mode is active, show Backend Management
  if (isBackendOpen) {
    return <BackendManagement onExit={() => setIsBackendOpen(false)} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30 animate-fade-in transition-colors duration-300">
      
      {/* 1. Top Navigation Bar */}
      <header className="h-18 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative transition-colors duration-300">
        
        {/* Left Logo */}
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity mr-8"
          onClick={() => setCurrentTab(MainTab.PROJECTS)}
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-lg shadow-blue-900/20">
             <Terminal className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-wide text-slate-200 hidden md:block">VIDU STUDIO</span>
        </div>

        {/* Center Tabs */}
        <nav className="flex-1 flex items-center justify-center space-x-2 h-full">
          {tabs.map((tab) => {
             const isActive = currentTab === tab.id;
             const isDisabled = !project && tab.id !== MainTab.PROJECTS;
             
             return (
               <button
                 key={tab.id}
                 onClick={() => !isDisabled && setCurrentTab(tab.id)}
                 disabled={isDisabled}
                 className={`
                   relative flex flex-col items-center justify-center h-full px-6 min-w-[100px] transition-all duration-200
                   ${isActive 
                      ? 'text-slate-100 bg-slate-800/50 border-b-2 border-blue-500' 
                      : isDisabled
                        ? 'text-slate-600 cursor-not-allowed'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }
                 `}
               >
                 <span className={`text-sm font-medium ${isActive ? 'mt-1' : ''}`}>{tab.label}</span>
                 
                 {/* Secondary Sub-tabs embedded inside the button */}
                 {isActive && tab.id === MainTab.ASSETS && (
                   <div className="flex space-x-3 mt-1 mb-1 text-[10px] font-bold tracking-wide animate-fade-in">
                      <span 
                        onClick={(e) => { e.stopPropagation(); setAssetSubTab(AssetSubTab.EPISODES); }}
                        className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors hover:bg-white/10 ${assetSubTab === AssetSubTab.EPISODES ? 'text-blue-400' : 'text-slate-500'}`}
                      >
                        剧集管理
                      </span>
                      <span className="text-slate-700">|</span>
                      <span 
                        onClick={(e) => { e.stopPropagation(); setAssetSubTab(AssetSubTab.IMAGES); }}
                        className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors hover:bg-white/10 ${assetSubTab === AssetSubTab.IMAGES ? 'text-blue-400' : 'text-slate-500'}`}
                      >
                        图片资产
                      </span>
                      <span className="text-slate-700">|</span>
                      <span 
                        onClick={(e) => { e.stopPropagation(); setAssetSubTab(AssetSubTab.TTS); }}
                        className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors hover:bg-white/10 ${assetSubTab === AssetSubTab.TTS ? 'text-blue-400' : 'text-slate-500'}`}
                      >
                        TTS配音
                      </span>
                   </div>
                 )}
               </button>
             );
          })}
        </nav>

        {/* Right Settings & User */}
        <div className="flex items-center space-x-4 ml-8">
           {project && (
             <div className="hidden xl:flex items-center space-x-2 text-xs text-slate-500 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="max-w-[120px] truncate">{project.name}</span>
             </div>
           )}
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="p-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
             title="全局设置"
           >
             <Settings size={22} />
           </button>

           {/* Theme Switcher (Changed to Click) */}
           <div className="relative" ref={themeMenuRef}>
              <button 
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className={`p-2.5 rounded-full transition-colors ${isThemeMenuOpen ? 'text-blue-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                title="切换样式风格"
              >
                <Palette size={22} />
              </button>
              {/* Dropdown - Click to Show */}
              {isThemeMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 animate-fade-in origin-top-right z-50">
                   <button onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors ${theme === 'light' ? 'text-blue-400' : 'text-slate-300'}`}>
                      <Sun size={14} /> 日光模式
                   </button>
                   <button onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors ${theme === 'dark' ? 'text-blue-400' : 'text-slate-300'}`}>
                      <Moon size={14} /> 黑夜模式
                   </button>
                   <button onClick={() => { setTheme('camo'); setIsThemeMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors ${theme === 'camo' ? 'text-emerald-400' : 'text-slate-300'}`}>
                      <Sprout size={14} /> 迷彩风格
                   </button>
                   <button onClick={() => { setTheme('purple'); setIsThemeMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors ${theme === 'purple' ? 'text-purple-400' : 'text-slate-300'}`}>
                      <Zap size={14} /> 电光紫
                   </button>
                </div>
              )}
           </div>

           {/* User Dropdown */}
           <div className="relative" ref={userMenuRef}>
             <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-1 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors border-2 border-slate-800 hover:border-slate-700 shadow-lg"
             >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold bg-indigo-600">
                   A
                </div>
             </button>
             
             {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-scale-in origin-top-right z-50">
                   <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-sm font-bold text-slate-200">Admin</p>
                      <p className="text-xs text-slate-500 truncate">admin@vidustudio.com</p>
                   </div>
                   <div className="p-1">
                      <button 
                        onClick={() => { setIsBackendOpen(true); setShowUserMenu(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                      >
                         <LayoutDashboard size={16} /> 后台管理
                      </button>
                      <button 
                        onClick={handleChangePassword}
                        className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                      >
                         <KeyRound size={16} /> 修改密码
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                      >
                         <LogOut size={16} /> 退出登录
                      </button>
                   </div>
                </div>
             )}
           </div>
        </div>
      </header>

      {/* 3. Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 relative bg-grid-pattern">
        {renderContent()}
      </main>

      {/* 4. Global Settings Modal */}
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