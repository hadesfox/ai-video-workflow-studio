import React, { useState, useEffect, useRef } from 'react';
import { X, Save, LayoutTemplate, Search, ChevronDown, ToggleLeft, ToggleRight } from 'lucide-react';
import { ConfigKeys, AgentSettings } from '../types';

interface GlobalSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: Record<ConfigKeys, AgentSettings>;
  onSave: (settings: Record<ConfigKeys, AgentSettings>) => void;
}

// 配置项标签映射 - Adjusted order and split keys
const FIELD_LABELS: Record<ConfigKeys, string> = {
  script: '剧本',
  indexProps: '索引提取-道具',
  indexScenes: '索引提取-场景',
  indexChars: '索引提取-人物',
  worldview: '世界观提取',
  detailProps: '资产详情-道具',
  detailScenes: '资产详情-场景',
  detailChars: '资产详情-人物',
  special3: '特殊状态提示词-道具',
  special2: '特殊状态提示词-场景',
  special1: '特殊状态提示词-人物',
  imgPromptProps: '主状态提示词-道具',
  imgPromptScenes: '主状态提示词-场景',
  imgPromptChars: '主状态提示词-人物',
  storyboard: '分镜提示词'
};

// 模型选项
const MODEL_OPTIONS = [
  'Gemini 3 Flash (标准)', 
  'Gemini 3 Pro (高智)', 
  'Gemini Flash-Lite (极速)',
  'Gemini 2.5 Flash'
];

// 针对每个环节的提示词选项 (扩充风格化选项)
const PROMPT_OPTIONS: Record<ConfigKeys, string[]> = {
  script: [
    '剧本分析-通用', '剧本分析-2D动画适配', '剧本分析-影视化写实', '剧本分析-3D视觉化', '剧本分析-结构化'
  ],
  indexProps: [
    '索引提取-通用-道具', '索引提取-2D风格化物品', '索引提取-写实道具', '索引提取-3D资产规格', '索引提取-细粒度'
  ],
  indexScenes: [
    '索引提取-通用-场景', '索引提取-2D背景绘制', '索引提取-实拍取景地', '索引提取-3D场景搭建', '索引提取-氛围优先'
  ],
  indexChars: [
    '索引提取-通用-人物', '索引提取-二次元人设', '索引提取-真人选角', '索引提取-3D角色建模', '索引提取-性格侧写'
  ],
  worldview: [
    '世界观提取-通用', '世界观提取-动画美术风格', '世界观提取-电影摄影风格', '世界观提取-3D渲染风格', '世界观提取-物理法则'
  ],
  detailProps: [
    '资产详情-通用-道具', '资产详情-赛璐珞风格描述', '资产详情-电影级道具质感', '资产详情-PBR材质描述', '资产详情-高精度'
  ],
  detailScenes: [
    '资产详情-通用-场景', '资产详情-新海诚/吉卜力风', '资产详情-好莱坞电影布光', '资产详情-UE5场景描述', '资产详情-概念设计'
  ],
  detailChars: [
    '资产详情-通用-人物', '资产详情-日漫风格', '资产详情-真实摄影人像', '资产详情-皮克斯/迪士尼3D', '资产详情-DND卡片风格'
  ],
  special3: ['特殊状态(物)-通用', '特殊状态(物)-卡通道具(2D)', '特殊状态(物)-物理道具(真人)', '特殊状态(物)-高模道具(3D)'],
  special2: ['特殊状态(景)-通用', '特殊状态(景)-手绘背景(2D)', '特殊状态(景)-实拍置景(真人)', '特殊状态(景)-环境渲染(3D)'],
  special1: ['特殊状态(人)-通用', '特殊状态(人)-夸张表情(2D)', '特殊状态(人)-特效化妆(真人)', '特殊状态(人)-角色建模(3D)'],
  
  // Split Image Prompts
  imgPromptProps: [
    '主状态(物)-通用', '主状态(物)-Niji动漫风', '主状态(物)-产品级写实', '主状态(物)-Octane渲染', '主状态(物)-单体透视'
  ],
  imgPromptScenes: [
    '主状态(景)-通用', '主状态(景)-Niji动漫风', '主状态(景)-电影级写实', '主状态(景)-Unreal Engine 5', '主状态(景)-广角构图'
  ],
  imgPromptChars: [
    '主状态(人)-通用', '主状态(人)-Niji动漫风', '主状态(人)-电影级写实', '主状态(人)-皮克斯风格', '主状态(人)-半身肖像'
  ],

  storyboard: [
    '分镜-通用', '分镜-日式动画分镜', '分镜-电影实拍分镜', '分镜-3D动态预览', '分镜-广告分镜'
  ]
};

// 辅助函数：快速生成指定风格的配置
const createStyleConfig = (styleType: '2D' | 'REAL' | '3D'): Record<ConfigKeys, AgentSettings> => {
  const config: any = {};
  const defaultModel = 'Gemini 3 Flash (标准)';
  
  // 简单的关键词映射帮助选择正确的提示词索引
  const getPrompt = (key: ConfigKeys) => {
    const options = PROMPT_OPTIONS[key];
    const match = options.find(opt => {
      if (styleType === '2D') return opt.includes('2D') || opt.includes('动漫') || opt.includes('二次元') || opt.includes('动画') || opt.includes('日漫') || opt.includes('赛璐珞') || opt.includes('新海诚');
      if (styleType === 'REAL') return opt.includes('真人') || opt.includes('写实') || opt.includes('实拍') || opt.includes('影视') || opt.includes('电影') || opt.includes('Photo') || opt.includes('产品级');
      if (styleType === '3D') return opt.includes('3D') || opt.includes('渲染') || opt.includes('UE5') || opt.includes('建模') || opt.includes('皮克斯') || opt.includes('Octane') || opt.includes('Unreal');
      return false;
    });
    return match || options[0]; // Fallback to first option
  };

  (Object.keys(FIELD_LABELS) as ConfigKeys[]).forEach(key => {
    config[key] = {
      model: defaultModel,
      prompt: getPrompt(key),
      enabled: true
    };
  });
  return config;
};

// 模板定义 (风格化)
const TEMPLATES: Record<string, { label: string; config: Record<ConfigKeys, AgentSettings> }> = {
  '2d': {
    label: '2D 动画模式 (Anime/Cartoon)',
    config: createStyleConfig('2D')
  },
  'realism': {
    label: '真人实拍模式 (Cinematic/Realism)',
    config: createStyleConfig('REAL')
  },
  '3d': {
    label: '3D 渲染模式 (3D Render/CGI)',
    config: createStyleConfig('3D')
  }
};

// Searchable Select Component
const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "请选择..." 
}: { 
  options: string[]; 
  value: string; 
  onChange: (val: string) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <div 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearchTerm("");
        }}
        className="w-full h-full bg-transparent text-gray-700 text-sm px-3 py-2 outline-none cursor-pointer hover:bg-gray-50 rounded transition-colors flex justify-between items-center"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={14} className="text-gray-400 ml-2 shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full bg-white border border-gray-200 shadow-xl rounded mt-1 flex flex-col min-w-[200px]" style={{ maxHeight: '300px' }}>
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white rounded-t">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索提示词..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs pl-8 pr-2 py-1.5 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 text-gray-700 border-l-2 border-transparent hover:border-blue-500 transition-colors ${opt === value ? 'bg-blue-50 font-medium border-l-blue-500 text-blue-700' : ''}`}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-xs text-gray-400 text-center">无匹配项</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [activeTab, setActiveTab] = useState<'AGENT' | 'GEN'>('AGENT');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  const [config, setConfig] = useState<Record<ConfigKeys, AgentSettings>>(currentSettings);

  // Sync state when props change
  useEffect(() => {
      if (isOpen) {
          setConfig(currentSettings);
          // Simple logic to detect template, defaults to custom for simplicity
          setSelectedTemplate('custom');
      }
  }, [isOpen, currentSettings]);

  // 当模板改变时，更新配置
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateKey = e.target.value;
    setSelectedTemplate(templateKey);
    if (templateKey in TEMPLATES) {
      setConfig(TEMPLATES[templateKey].config);
    }
  };

  // 处理单个配置项变更
  const handleConfigChange = (key: ConfigKeys, field: keyof AgentSettings, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
    setSelectedTemplate('custom'); // 只要手动修改了，就变成自定义
  };

  const handleSave = () => {
      onSave(config);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      {/* 弹窗容器 */}
      <div className="bg-slate-300 w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden rounded-none">
        
        {/* 1. 顶部标题 */}
        <div className="bg-gray-400/80 p-3 flex justify-center items-center relative border-b border-gray-400">
          <h3 className="text-gray-800 font-medium">全局设置</h3>
        </div>

        {/* 2. 主体区域 */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* 左侧侧边栏 */}
          <div className="w-48 bg-gray-500 flex flex-col pt-4 shrink-0">
            <button 
              onClick={() => setActiveTab('AGENT')}
              className={`py-3 px-6 text-left font-medium text-sm transition-colors ${
                activeTab === 'AGENT' 
                  ? 'bg-green-600 text-white' // 选中态：绿色背景
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
            >
              agent配置
            </button>
            <button 
              onClick={() => setActiveTab('GEN')}
              className={`py-3 px-6 text-left font-medium text-sm transition-colors ${
                activeTab === 'GEN' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
            >
              生成设置
            </button>
          </div>

          {/* 右侧内容区 */}
          <div className="flex-1 bg-gray-300 p-8 overflow-y-auto">
            
            {/* 顶部：模板选择 */}
            <div className="bg-white/50 p-4 rounded mb-8 flex items-center space-x-4 border border-white">
              <div className="flex items-center space-x-2 text-gray-700 font-bold">
                <LayoutTemplate size={20} />
                <span>配置模板:</span>
              </div>
              <select 
                value={selectedTemplate}
                onChange={handleTemplateChange}
                className="flex-1 bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              >
                {Object.entries(TEMPLATES).map(([key, t]) => (
                  <option key={key} value={key}>{t.label}</option>
                ))}
                <option value="custom">自定义 (Custom)</option>
              </select>
            </div>

            {/* 标题：各环节agent */}
            {activeTab === 'AGENT' && (
              <div>
                <h4 className="text-gray-700 mb-4 font-bold border-l-4 border-green-600 pl-3">各环节 Agent 配置</h4>
                
                {/* 表头 */}
                <div className="flex text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
                   <div className="w-48 pl-2">配置项</div>
                   <div className="flex-1 px-2">模型选择 (Model)</div>
                   <div className="flex-1 px-2">提示词 (Prompt)</div>
                   <div className="w-20 text-center">启用</div>
                </div>

                <div className="space-y-[1px] bg-gray-300 border border-gray-300 rounded overflow-hidden">
                  
                  {/* 渲染配置项 */}
                  {(Object.keys(FIELD_LABELS) as ConfigKeys[]).map((key) => (
                    <div key={key} className="flex flex-col md:flex-row md:items-center bg-gray-300 group">
                      {/* Label */}
                      <div className="md:w-48 py-3 text-sm text-gray-800 font-medium pl-4 bg-gray-200/50 flex items-center h-full">
                        {FIELD_LABELS[key]}
                      </div>
                      
                      {/* Controls Container */}
                      <div className="flex-1 flex space-x-[1px] bg-gray-300 relative">
                         {/* Disabled Overlay if not enabled */}
                         {config[key] && config[key].enabled === false && key !== 'worldview' && ( // Allow viewing worldview row but it might just be the switch for others
                             <div className="absolute inset-0 bg-gray-200/50 z-10 cursor-not-allowed"></div>
                         )}

                         {/* Model Select */}
                         <div className="flex-1 bg-white p-1">
                            <select
                              value={config[key] ? config[key].model : MODEL_OPTIONS[0]}
                              onChange={(e) => handleConfigChange(key, 'model', e.target.value)}
                              disabled={config[key] && config[key].enabled === false}
                              className="w-full h-full bg-transparent text-gray-700 text-sm px-3 py-2 outline-none cursor-pointer hover:bg-gray-50 rounded transition-colors disabled:cursor-not-allowed disabled:text-gray-400"
                            >
                              {MODEL_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                         </div>

                         {/* Prompt Select */}
                         <div className="flex-1 bg-white p-1 relative">
                            {config[key] && config[key].enabled !== false ? (
                                <SearchableSelect 
                                    options={PROMPT_OPTIONS[key]}
                                    value={config[key].prompt}
                                    onChange={(val) => handleConfigChange(key, 'prompt', val)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center px-3 text-sm text-gray-400 italic">
                                    未启用
                                </div>
                            )}
                         </div>

                         {/* Enable Switch (Only for Worldview currently requested, but structure supports all) */}
                         <div className="w-20 bg-white flex items-center justify-center border-l border-gray-100">
                             {key === 'worldview' ? (
                                 <button 
                                    onClick={() => handleConfigChange(key, 'enabled', !config[key].enabled)}
                                    className={`transition-colors ${config[key].enabled !== false ? 'text-green-600' : 'text-gray-400'}`}
                                    title={config[key].enabled !== false ? '点击禁用' : '点击启用'}
                                 >
                                     {config[key].enabled !== false ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                 </button>
                             ) : (
                                 <span className="text-gray-300">-</span>
                             )}
                         </div>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            )}

            {/* Placeholder for Gen Settings */}
            {activeTab === 'GEN' && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-400 rounded-xl">
                <p>暂无生成设置项</p>
                <p className="text-sm mt-2">请切换至 Agent 配置进行调整</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. 底部按钮区 */}
        <div className="h-20 bg-blue-400 flex items-center justify-center space-x-12 shrink-0 border-t-4 border-blue-500">
           <button 
             onClick={handleSave}
             className="w-40 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-lg transition-all font-medium text-base tracking-wide flex items-center justify-center space-x-2"
           >
             <Save size={18} />
             <span>保存配置</span>
           </button>
           <button 
             onClick={onClose}
             className="w-40 py-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/40 rounded shadow-lg transition-all font-medium text-base tracking-wide flex items-center justify-center space-x-2"
           >
             <X size={18} />
             <span>取消</span>
           </button>
        </div>

      </div>
    </div>
  );
};

export default GlobalSettings;