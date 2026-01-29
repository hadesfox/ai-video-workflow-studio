import React, { useState } from 'react';
import { MainTab, AssetSubTab, Project, Asset, Episode, VideoSettings, TimelineClip, WorldviewEntry, ConfigKeys, AgentSettings } from './types';
import ProjectSelection from './components/ProjectSelection';
import AssetManagement from './components/AssetManagement';
import StageMasterLib from './components/StageMasterLib'; // Reuse existing component
import StageVideo from './components/StageVideo'; // Reuse existing component
import OnlineEditor from './components/OnlineEditor';
import GlobalSettings from './components/GlobalSettings';
import { Terminal, Settings } from 'lucide-react';

// Default Settings Helper
const createDefaultSettings = (): Record<ConfigKeys, AgentSettings> => {
    const keys: ConfigKeys[] = [
        'script', 'indexProps', 'indexScenes', 'indexChars', 'worldview',
        'detailProps', 'detailScenes', 'detailChars', 'special1', 'special2', 'special3',
        'imgPrompt', 'storyboard'
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

const App: React.FC = () => {
  // --- Global State ---
  const [currentTab, setCurrentTab] = useState<MainTab>(MainTab.PROJECTS);
  const [assetSubTab, setAssetSubTab] = useState<AssetSubTab>(AssetSubTab.IMAGES);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Data State
  const [project, setProject] = useState<Project | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [worldview, setWorldview] = useState<WorldviewEntry[]>([]); // New Worldview State
  const [globalSettings, setGlobalSettings] = useState<Record<ConfigKeys, AgentSettings>>(createDefaultSettings()); // New Settings State
  
  // Lifted Episodes State (Persistence for StageVideo)
  const [episodes, setEpisodes] = useState<Episode[]>([
    { id: 'ep1', name: '第一集：觉醒', shots: [] },
    { id: 'ep2', name: '第二集：追逐', shots: [] },
    { id: 'ep3', name: '第三集：对决', shots: [] },
  ]);

  // Lifted Video Settings (Persistence)
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
      ratio: '16:9',
      resolution: '1080p',
      duration: '5s'
  });

  // Editor State (Passing data from Video to Editor)
  const [editorClips, setEditorClips] = useState<TimelineClip[]>([]);

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

  // --- Render Content ---
  const renderContent = () => {
    switch (currentTab) {
      case MainTab.PROJECTS:
        return (
          <ProjectSelection 
            currentProject={project} 
            setProject={setProject} 
            onProjectSelected={handleProjectSelect}
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
          />
        );
      case MainTab.EDITOR:
        return <OnlineEditor clips={editorClips} />;
      default:
        return <div className="p-10 text-center">页面施工中...</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* 1. Top Navigation Bar */}
      <header className="h-18 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
        
        {/* Left Logo */}
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity mr-8"
          onClick={() => setCurrentTab(MainTab.PROJECTS)}
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-lg shadow-blue-900/20">
             <Terminal className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-wide text-white hidden md:block">VIDU STUDIO</span>
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
                      ? 'text-white bg-slate-800/50 border-b-2 border-blue-500' 
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

        {/* Right Settings */}
        <div className="flex items-center space-x-4 ml-8">
           {project && (
             <div className="hidden xl:flex items-center space-x-2 text-xs text-slate-500 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="max-w-[120px] truncate">{project.name}</span>
             </div>
           )}
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
           >
             <Settings size={22} />
           </button>
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