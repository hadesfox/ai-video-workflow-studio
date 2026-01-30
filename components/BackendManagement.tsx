import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Settings, 
  MessageSquare, 
  FileText, 
  Users, 
  LayoutGrid, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  CheckCircle2,
  Save,
  FilePlus,
  Key,
  Shield,
  MoreHorizontal,
  X,
  Check,
  AlertTriangle,
  Lock,
  ChevronRight,
  UserCog,
  Send,
  Bot,
  User as UserIcon,
  ToggleLeft,
  ToggleRight,
  Filter,
  ChevronDown,
  List
} from 'lucide-react';

interface BackendManagementProps {
  onExit: () => void;
}

// --- Mock Data Types ---

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  settings: Record<string, { model: string; promptId: string }>;
}

interface UserAccount {
  id: string;
  username: string;
  email: string;
  roleId: string;
  permissions: string[]; // Extra specific permissions
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

interface Permission {
  id: string;
  category: string;
  label: string;
}

interface ConfigItem {
  id: string;
  name: string;
  code: string;
  type: string;
  provider: 'GEMINI' | 'OPENAI' | 'ANTHROPIC';
  model: string;
  thinking: boolean;
}

// --- Mock Data ---

// Mapped keys with filter codes for the dropdown logic
const CONFIG_KEYS = [
  { key: 'script', label: '剧本分析', filterCode: 'script_analysis' },
  { key: 'indexProps', label: '索引提取-道具', filterCode: 'asset_index_props' },
  { key: 'indexScenes', label: '索引提取-场景', filterCode: 'asset_index_scenes' },
  { key: 'indexChars', label: '索引提取-人物', filterCode: 'asset_index_chars' },
  { key: 'worldview', label: '世界观提取', filterCode: 'worldview_extract' },
  { key: 'detailProps', label: '资产详情-道具', filterCode: 'asset_detail_props' },
  { key: 'detailScenes', label: '资产详情-场景', filterCode: 'asset_detail_scenes' },
  { key: 'detailChars', label: '资产详情-人物', filterCode: 'asset_detail_chars' },
  { key: 'imgPrompt', label: '生图提示词', filterCode: 'image_gen_prompt' },
  { key: 'storyboard', label: '分镜提示词', filterCode: 'storyboard_gen' },
];

const MODEL_OPTIONS = [
  'gemini-3-flash-preview', 
  'gemini-3-pro-preview', 
  'gemini-flash-lite-latest',
  'gemini-2.5-flash'
];

// Enhanced Mock Data for "Prompt Configuration Management" Page
const MOCK_CONFIG_LIST: ConfigItem[] = [
  // Script Analysis
  { id: 'conf_script_01', name: '剧本分析-通用标准版', code: 'script_analysis', type: '通用', provider: 'GEMINI', model: 'gemini-3-pro-preview', thinking: true },
  { id: 'conf_script_02', name: '剧本分析-创意发散版', code: 'script_analysis', type: '创意', provider: 'GEMINI', model: 'gemini-3-pro-preview', thinking: true },
  
  // Index Props
  { id: 'conf_idx_p_01', name: '道具提取-细粒度', code: 'asset_index_props', type: '通用', provider: 'GEMINI', model: 'gemini-3-flash-preview', thinking: false },
  { id: 'conf_idx_p_02', name: '道具提取-仅关键物品', code: 'asset_index_props', type: '精简', provider: 'GEMINI', model: 'gemini-3-flash-preview', thinking: false },

  // Index Scenes
  { id: 'conf_idx_s_01', name: '场景提取-氛围优先', code: 'asset_index_scenes', type: '通用', provider: 'GEMINI', model: 'gemini-3-flash-preview', thinking: false },
  
  // Index Chars
  { id: 'conf_idx_c_01', name: '角色提取-外貌优先', code: 'asset_index_chars', type: '通用', provider: 'GEMINI', model: 'gemini-3-flash-preview', thinking: false },

  // Worldview
  { id: 'conf_wv_01', name: '世界观-赛博朋克风', code: 'worldview_extract', type: '风格化', provider: 'GEMINI', model: 'gemini-3-pro-preview', thinking: true },
  { id: 'conf_wv_02', name: '世界观-通用设定', code: 'worldview_extract', type: '通用', provider: 'GEMINI', model: 'gemini-3-flash-preview', thinking: false },

  // Detail Props
  { id: 'conf_det_p_01', name: '道具详情-3D材质', code: 'asset_detail_props', type: '3D渲染', provider: 'GEMINI', model: 'gemini-3-flash-preview', thinking: false },
  { id: 'conf_det_p_02', name: '道具详情-2D手绘', code: 'asset_detail_props', type: '2D动画', provider: 'GEMINI', model: 'gemini-3-flash-preview', thinking: false },

  // Detail Scenes
  { id: 'conf_det_s_01', name: '场景详情-电影布光', code: 'asset_detail_scenes', type: '写实', provider: 'GEMINI', model: 'gemini-3-pro-preview', thinking: false },
  { id: 'conf_det_s_02', name: '场景详情-新海诚风', code: 'asset_detail_scenes', type: '2D动画', provider: 'GEMINI', model: 'gemini-3-flash-preview', thinking: false },

  // Detail Chars
  { id: 'conf_det_c_01', name: '角色详情-真人写实', code: 'asset_detail_chars', type: '写实', provider: 'GEMINI', model: 'gemini-3-pro-preview', thinking: false },
  { id: 'conf_det_c_02', name: '角色详情-日漫风格', code: 'asset_detail_chars', type: '2D动画', provider: 'GEMINI', model: 'gemini-3-flash-preview', thinking: false },

  // Image Gen
  { id: 'conf_img_01', name: '生图-Midjourney V6适配', code: 'image_gen_prompt', type: 'MJ', provider: 'GEMINI', model: 'gemini-2.5-flash', thinking: false },
  { id: 'conf_img_02', name: '生图-Stable Diffusion XL', code: 'image_gen_prompt', type: 'SD', provider: 'GEMINI', model: 'gemini-2.5-flash', thinking: false },

  // Storyboard
  { id: 'conf_sb_01', name: '分镜-动态运镜描述', code: 'storyboard_gen', type: '视频', provider: 'GEMINI', model: 'gemini-3-pro-preview', thinking: true },
  { id: 'conf_sb_02', name: '分镜-静态构图描述', code: 'storyboard_gen', type: '绘图', provider: 'GEMINI', model: 'gemini-3-flash-preview', thinking: false },
];

const PERMISSIONS_LIST: Permission[] = [
  { id: 'SYS_VIEW', category: '系统', label: '访问后台' },
  { id: 'SYS_ADMIN', category: '系统', label: '系统设置管理' },
  { id: 'USER_READ', category: '用户', label: '查看用户列表' },
  { id: 'USER_WRITE', category: '用户', label: '编辑/新增用户' },
  { id: 'ROLE_MANAGE', category: '用户', label: '角色权限配置' },
  { id: 'PROMPT_READ', category: '提示词', label: '查看提示词配置' },
  { id: 'PROMPT_WRITE', category: '提示词', label: '修改提示词模板' },
  { id: 'ASSET_MANAGE', category: '业务', label: '资产管理' },
  { id: 'VIDEO_GEN', category: '业务', label: '视频生成能力' },
];

const INITIAL_ROLES: Role[] = [
  { id: 'ADMIN', name: '管理员 (Admin)', permissions: PERMISSIONS_LIST.map(p => p.id) },
  { id: 'EDITOR', name: '操作员 (Editor)', permissions: ['SYS_VIEW', 'PROMPT_READ', 'ASSET_MANAGE', 'VIDEO_GEN'] },
  { id: 'VIEWER', name: '访客 (Viewer)', permissions: ['SYS_VIEW', 'PROMPT_READ'] },
];

const INITIAL_USERS: UserAccount[] = [
  { id: 'u1', username: 'Admin', email: 'admin@vidustudio.com', roleId: 'ADMIN', permissions: [], status: 'ACTIVE', lastLogin: '2023-10-27 10:00' },
  { id: 'u2', username: 'Editor01', email: 'editor@vidustudio.com', roleId: 'EDITOR', permissions: [], status: 'ACTIVE', lastLogin: '2023-10-26 15:30' },
  { id: 'u3', username: 'Guest', email: 'guest@vidustudio.com', roleId: 'VIEWER', permissions: [], status: 'INACTIVE', lastLogin: '2023-09-01 09:00' },
];

// Pre-configured templates with IDs from MOCK_CONFIG_LIST
const INITIAL_TEMPLATES: TemplateConfig[] = [
  {
    id: 'tpl_2d',
    name: '2D 动画模式',
    description: '适用于日式动漫、美式卡通等扁平化风格',
    settings: {
      script: { model: 'gemini-3-flash-preview', promptId: 'conf_script_01' },
      indexProps: { model: 'gemini-3-flash-preview', promptId: 'conf_idx_p_01' },
      indexScenes: { model: 'gemini-3-flash-preview', promptId: 'conf_idx_s_01' },
      indexChars: { model: 'gemini-3-flash-preview', promptId: 'conf_idx_c_01' },
      worldview: { model: 'gemini-3-flash-preview', promptId: 'conf_wv_02' },
      detailProps: { model: 'gemini-3-flash-preview', promptId: 'conf_det_p_02' }, // 2D
      detailScenes: { model: 'gemini-3-flash-preview', promptId: 'conf_det_s_02' }, // 2D
      detailChars: { model: 'gemini-3-flash-preview', promptId: 'conf_det_c_02' }, // 2D
      imgPrompt: { model: 'gemini-2.5-flash', promptId: 'conf_img_01' },
      storyboard: { model: 'gemini-3-flash-preview', promptId: 'conf_sb_02' },
    }
  },
  {
    id: 'tpl_real',
    name: '真人实拍模式',
    description: '适用于电影质感、写实摄影风格',
    settings: {
      script: { model: 'gemini-3-pro-preview', promptId: 'conf_script_02' },
      indexProps: { model: 'gemini-3-flash-preview', promptId: 'conf_idx_p_01' },
      indexScenes: { model: 'gemini-3-flash-preview', promptId: 'conf_idx_s_01' },
      indexChars: { model: 'gemini-3-flash-preview', promptId: 'conf_idx_c_01' },
      worldview: { model: 'gemini-3-pro-preview', promptId: 'conf_wv_01' },
      detailProps: { model: 'gemini-3-pro-preview', promptId: 'conf_det_p_01' }, // 3D/Real
      detailScenes: { model: 'gemini-3-pro-preview', promptId: 'conf_det_s_01' }, // Real
      detailChars: { model: 'gemini-3-pro-preview', promptId: 'conf_det_c_01' }, // Real
      imgPrompt: { model: 'gemini-2.5-flash', promptId: 'conf_img_02' },
      storyboard: { model: 'gemini-3-pro-preview', promptId: 'conf_sb_01' },
    }
  },
  {
    id: 'tpl_3d',
    name: '3D 渲染模式',
    description: '适用于皮克斯风格、CGI、游戏引擎渲染风格',
    settings: {
        script: { model: 'gemini-3-flash-preview', promptId: 'conf_script_01' },
        indexProps: { model: 'gemini-3-flash-preview', promptId: 'conf_idx_p_01' },
        indexScenes: { model: 'gemini-3-flash-preview', promptId: 'conf_idx_s_01' },
        indexChars: { model: 'gemini-3-flash-preview', promptId: 'conf_idx_c_01' },
        worldview: { model: 'gemini-3-flash-preview', promptId: 'conf_wv_01' },
        detailProps: { model: 'gemini-3-flash-preview', promptId: 'conf_det_p_01' }, // 3D
        detailScenes: { model: 'gemini-3-flash-preview', promptId: 'conf_det_s_01' }, // Reuse Real
        detailChars: { model: 'gemini-3-flash-preview', promptId: 'conf_det_c_01' }, // Reuse Real
        imgPrompt: { model: 'gemini-2.5-flash', promptId: 'conf_img_01' },
        storyboard: { model: 'gemini-3-flash-preview', promptId: 'conf_sb_01' },
    }
  }
];

// --- Searchable Dropdown Component ---

interface SearchableConfigDropdownProps {
    options: ConfigItem[];
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

const SearchableConfigDropdown: React.FC<SearchableConfigDropdownProps> = ({ options, value, onChange, placeholder = "选择配置..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Get selected item for display
    const selectedItem = options.find(opt => opt.id === value);

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
        opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Trigger Button */}
            <div 
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) setSearchTerm("");
                }}
                className={`w-full bg-slate-50 dark:bg-slate-800 border ${isOpen ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-300 dark:border-slate-700'} rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-700`}
            >
                <div className="flex flex-col items-start overflow-hidden w-full">
                    {selectedItem ? (
                        <div className="flex flex-col w-full">
                           <span className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate w-full">{selectedItem.name}</span>
                           <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full">{selectedItem.model}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-slate-400">{placeholder}</span>
                    )}
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 flex flex-col overflow-hidden animate-scale-in origin-top">
                    {/* Search Input */}
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 sticky top-0">
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="搜索..."
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-1.5 pl-8 pr-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div 
                                    key={opt.id}
                                    onClick={() => {
                                        onChange(opt.id);
                                        setIsOpen(false);
                                    }}
                                    className={`px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 border-l-2 transition-colors ${
                                        opt.id === value 
                                            ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 text-blue-700 dark:text-blue-300' 
                                            : 'border-transparent text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    <div className="text-sm font-medium">{opt.name}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 rounded text-slate-500 font-mono">{opt.model}</span>
                                        <span className="text-[10px] text-slate-400">{opt.type}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-slate-400">无匹配配置</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const BackendManagement: React.FC<BackendManagementProps> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState('TYPE_MGMT');

  // --- Template State ---
  const [templates, setTemplates] = useState<TemplateConfig[]>(INITIAL_TEMPLATES);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('tpl_2d');
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  
  // Manage Templates Modal
  const [showManageTemplatesModal, setShowManageTemplatesModal] = useState(false);

  // --- Account & Role State ---
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  
  // User Permissions Drawer
  const [showUserPermDrawer, setShowUserPermDrawer] = useState(false);
  const [permDrawerUser, setPermDrawerUser] = useState<UserAccount | null>(null);

  // Role Config Drawer
  const [showRoleDrawer, setShowRoleDrawer] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('ADMIN');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  // --- Config Mgmt State ---
  const [configList, setConfigList] = useState<ConfigItem[]>(MOCK_CONFIG_LIST);
  const [searchConfig, setSearchConfig] = useState('');

  // --- Chatbot State ---
  const [chatMessages, setChatMessages] = useState([
    { id: 1, role: 'model', text: '你好！我是 AI 助手，有什么可以帮你的吗？' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatSettings, setChatSettings] = useState({
    model: 'gemini-2.5-flash',
    context: true,
    systemPrompt: 'You are a helpful assistant.'
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { id: 'CONFIG_MGMT', label: '提示词配置管理', icon: LayoutGrid },
    { id: 'TYPE_MGMT', label: '提示词类型管理', icon: Settings },
    { id: 'CHATBOT', label: 'Chatbot', icon: MessageSquare },
    { id: 'TEMPLATE_CONFIG', label: '提示词模板配置', icon: FileText },
    { id: 'ACCOUNT_MGMT', label: '账号管理', icon: Users },
  ];

  // Mock data for Type Management table
  const tableData = [
    { id: 1, name: '动漫生分镜', code: 'TEXT_GENERATION', desc: '动漫生分镜', sort: 1, status: true },
    { id: 2, name: 'vidu+真人', code: 'VIDEO_GENERATION', desc: 'vidu生分镜', sort: 1, status: true },
    { id: 3, name: '通用自动化生成', code: 'UNIVERSAL_GENERATE', desc: '自动化管线类型', sort: 1, status: true },
  ];

  // --- Template Handlers ---

  const currentTemplate = templates.find(t => t.id === currentTemplateId) || templates[0];

  const handleTemplateSettingChange = (key: string, field: 'model' | 'promptId', value: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== currentTemplateId) return t;
      return {
        ...t,
        settings: {
          ...t.settings,
          [key]: {
            ...t.settings[key],
            [field]: value
          }
        }
      };
    }));
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return;
    const newTpl: TemplateConfig = {
      id: `tpl_${Date.now()}`,
      name: newTemplateName,
      description: '自定义模板',
      settings: JSON.parse(JSON.stringify(currentTemplate.settings))
    };
    setTemplates([...templates, newTpl]);
    setCurrentTemplateId(newTpl.id);
    setShowNewTemplateModal(false);
    setNewTemplateName('');
  };

  const handleDeleteTemplate = (idToDelete: string) => {
    if (templates.length <= 1) {
      alert("至少保留一个模板");
      return;
    }
    if (confirm(`确定要删除此模板吗？`)) {
      const newTemplates = templates.filter(t => t.id !== idToDelete);
      setTemplates(newTemplates);
      if (currentTemplateId === idToDelete) {
          setCurrentTemplateId(newTemplates[0].id);
      }
    }
  };

  // --- User Handlers ---

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const roleId = formData.get('roleId') as string;
    
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, username, email, roleId } : u));
    } else {
      const newUser: UserAccount = {
        id: `u_${Date.now()}`,
        username,
        email,
        roleId,
        permissions: [],
        status: 'ACTIVE',
        lastLogin: '-'
      };
      setUsers([...users, newUser]);
    }
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('确定要删除此用户吗？')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const getUserPermissions = (user: UserAccount) => {
    const role = roles.find(r => r.id === user.roleId);
    const rolePerms = role ? role.permissions : [];
    return Array.from(new Set([...rolePerms, ...user.permissions]));
  };

  const openUserPermDrawer = (user: UserAccount) => {
    setPermDrawerUser(user);
    setShowUserPermDrawer(true);
  };

  // --- Role Handlers ---

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    const newId = `ROLE_${Date.now()}`;
    const newRole: Role = {
      id: newId,
      name: newRoleName,
      permissions: ['SYS_VIEW']
    };
    setRoles([...roles, newRole]);
    setSelectedRoleId(newId);
    setShowAddRoleModal(false);
    setNewRoleName('');
  };

  const toggleRolePermission = (permId: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id !== selectedRoleId) return r;
      const hasPerm = r.permissions.includes(permId);
      return {
        ...r,
        permissions: hasPerm ? r.permissions.filter(p => p !== permId) : [...r.permissions, permId]
      };
    }));
  };

  // --- Chatbot Handlers ---
  
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMessage = { id: Date.now(), role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    
    setTimeout(() => {
        setChatMessages(prev => [...prev, { id: Date.now() + 1, role: 'model', text: '这是一个模拟回复。AI 正在思考...' }]);
        if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 1000);
  };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --- Render ---

  return (
    <div className="flex h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-20">
        <div 
          className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          onClick={onExit}
          title="返回 Vidu Studio"
        >
           <Terminal className="text-blue-600 dark:text-blue-500 w-6 h-6 mr-2" />
           <span className="font-bold text-lg tracking-wide text-slate-800 dark:text-slate-100">Spark Agent</span>
        </div>

        <div className="flex-1 py-4 space-y-1">
           {menuItems.map(item => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors border-r-2 ${
                 activeTab === item.id 
                   ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500' 
                   : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
               }`}
             >
               <item.icon size={18} className="mr-3" />
               {item.label}
             </button>
           ))}
        </div>
        
        <div className="p-4 text-xs text-center text-slate-400 border-t border-slate-200 dark:border-slate-800">
           Spark Agent ©2026 Created by Shenzhi
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
         <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-8 shrink-0 shadow-sm z-10">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
         </div>

         <div className="flex-1 overflow-auto p-8 relative">
            
            {/* CONFIG_MGMT: 提示词配置管理 */}
            {activeTab === 'CONFIG_MGMT' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in flex flex-col h-full">
                    {/* Header Toolbar */}
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                                <FileText size={18} />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">提示词配置列表</span>
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-0.5 rounded font-medium">
                                {configList.length} 个配置
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input 
                                    type="text" 
                                    placeholder="按类型筛选" 
                                    value={searchConfig}
                                    onChange={(e) => setSearchConfig(e.target.value)}
                                    className="pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                            </div>
                            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-500/20">
                                <Plus size={16} /> 新增配置
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <div className="min-w-[1000px]">
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
                                <div className="col-span-3">配置名称</div>
                                <div className="col-span-2">唯一标识</div>
                                <div className="col-span-2">所属类型</div>
                                <div className="col-span-1">服务提供方</div>
                                <div className="col-span-2">模型</div>
                                <div className="col-span-1">思考模式</div>
                                <div className="col-span-1 text-center">操作</div>
                            </div>

                            {configList.filter(c => c.type.includes(searchConfig)).map((item) => (
                                <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors items-center text-sm text-slate-700 dark:text-slate-300">
                                    <div className="col-span-3 font-medium">{item.name}</div>
                                    <div className="col-span-2">
                                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{item.code}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50">
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className="col-span-1">
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{item.provider}</span>
                                    </div>
                                    <div className="col-span-2 font-mono text-xs text-slate-500">{item.model}</div>
                                    <div className="col-span-1 text-xs text-slate-500">{item.thinking ? '开启' : '关闭'}</div>
                                    <div className="col-span-1 flex justify-center gap-3">
                                        <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs transition-colors">
                                            <Edit size={14} /> 编辑
                                        </button>
                                        <button className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs transition-colors">
                                            <Trash2 size={14} /> 删除
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Pagination Mock */}
                    <div className="p-4 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 shrink-0">
                        <span>共 {configList.length} 条记录</span>
                        <div className="flex gap-2 items-center">
                            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">&lt;</button>
                            <button className="w-8 h-8 flex items-center justify-center border border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded font-medium">1</button>
                            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">&gt;</button>
                            
                            <div className="flex items-center gap-2 ml-4">
                                <select className="bg-transparent border border-slate-200 dark:border-slate-700 rounded py-1 px-2 focus:outline-none">
                                    <option>10 / page</option>
                                </select>
                                <span>Go to</span>
                                <input type="text" className="w-10 border border-slate-200 dark:border-slate-700 rounded py-1 px-2 bg-transparent text-center" />
                                <span>Page</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TYPE_MGMT: 提示词类型管理 */}
            {activeTab === 'TYPE_MGMT' && (
               <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                            <LayoutGrid size={18} />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">提示词类型列表</span>
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded font-medium">3 个类型</span>
                     </div>
                     <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-500/20">
                        <Plus size={16} /> 新增类型
                     </button>
                  </div>

                  <div className="w-full overflow-x-auto">
                     <div className="min-w-[800px] grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <div className="col-span-2">类型名称</div>
                        <div className="col-span-2">类型编码</div>
                        <div className="col-span-4">描述</div>
                        <div className="col-span-1 text-center">排序</div>
                        <div className="col-span-1 text-center">状态</div>
                        <div className="col-span-2 text-center">操作</div>
                     </div>

                     {tableData.map((row) => (
                        <div key={row.id} className="min-w-[800px] grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors items-center text-sm text-slate-700 dark:text-slate-300 group">
                           <div className="col-span-2 font-medium">{row.name}</div>
                           <div className="col-span-2">
                               <span className="font-mono text-xs bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/50">{row.code}</span>
                           </div>
                           <div className="col-span-4 text-slate-500 dark:text-slate-400 truncate">{row.desc}</div>
                           <div className="col-span-1 text-center font-mono text-slate-500">{row.sort}</div>
                           <div className="col-span-1 flex justify-center">
                              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-800/50">
                                 <CheckCircle2 size={12} /> 启用
                              </span>
                           </div>
                           <div className="col-span-2 flex justify-center gap-4 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs transition-colors">
                                 <Edit size={14} /> 编辑
                              </button>
                              <button className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs transition-colors">
                                 <Trash2 size={14} /> 删除
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* CHATBOT: 聊天机器人 */}
            {activeTab === 'CHATBOT' && (
               <div className="h-full flex flex-col space-y-4 animate-fade-in">
                  
                  {/* Top Configuration Panel */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm shrink-0">
                     <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-200 font-bold">
                        <Settings size={18} />
                        <h3>配置</h3>
                     </div>
                     
                     <div className="space-y-4 pl-2">
                        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                           <ChevronRight size={14} className="rotate-90" /> 
                           模型设置 (Model, System Prompt)
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <div className="flex justify-between mb-1.5">
                                 <label className="text-xs font-bold text-slate-500">Model:</label>
                                 <div className="flex items-center gap-2 text-xs">
                                    <span className="font-bold text-slate-500">Context:</span>
                                    <button 
                                       onClick={() => setChatSettings({...chatSettings, context: !chatSettings.context})}
                                       className={`transition-colors ${chatSettings.context ? 'text-blue-600' : 'text-slate-400'}`}
                                    >
                                       {chatSettings.context ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                    </button>
                                    <span className="text-slate-600">{chatSettings.context ? 'History On' : 'History Off'}</span>
                                 </div>
                              </div>
                              <select 
                                 value={chatSettings.model}
                                 onChange={(e) => setChatSettings({...chatSettings, model: e.target.value})}
                                 className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
                              >
                                 {MODEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                           </div>
                           
                           <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1.5">System Prompt:</label>
                              <textarea 
                                 value={chatSettings.systemPrompt}
                                 onChange={(e) => setChatSettings({...chatSettings, systemPrompt: e.target.value})}
                                 className="w-full h-[38px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 resize-none overflow-hidden"
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                     <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/50">
                        {chatMessages.map((msg) => (
                           <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'model' ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
                                 {msg.role === 'model' ? <Bot size={18} /> : <UserIcon size={18} />}
                              </div>
                              <div className={`max-w-[70%] p-3 rounded-xl text-sm leading-relaxed shadow-sm ${
                                 msg.role === 'model' 
                                    ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none' 
                                    : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-blue-900 dark:text-blue-100 rounded-tr-none'
                              }`}>
                                 {msg.text}
                              </div>
                           </div>
                        ))}
                        <div ref={chatEndRef} />
                     </div>

                     {/* Input Area */}
                     <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="relative">
                           <input 
                              type="text" 
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder="Type a message... (Enter to send)"
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 dark:text-slate-200"
                           />
                           <button 
                              onClick={handleSendMessage}
                              disabled={!chatInput.trim()}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                           >
                              <Send size={16} />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* TEMPLATE_CONFIG: 提示词模板配置 (List Layout) */}
            {activeTab === 'TEMPLATE_CONFIG' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in flex flex-col h-full">
                 
                 {/* Top Control Bar */}
                 <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                       <label className="text-sm font-bold text-slate-500 dark:text-slate-400">选择编辑模板:</label>
                       <div className="relative">
                          <select 
                            value={currentTemplateId}
                            onChange={(e) => setCurrentTemplateId(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-8 min-w-[200px]"
                          >
                             {templates.map(t => (
                               <option key={t.id} value={t.id}>{t.name}</option>
                             ))}
                          </select>
                       </div>
                       <p className="text-xs text-slate-500 max-w-md hidden md:block border-l pl-4 border-slate-300 dark:border-slate-700 italic">
                          {currentTemplate.description}
                       </p>
                    </div>
                    
                    <div className="flex gap-3">
                       <button 
                          onClick={() => setShowManageTemplatesModal(true)}
                          className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                       >
                          <Settings size={16} /> 管理模板
                       </button>
                       <button 
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-md shadow-blue-500/20 transition-colors"
                       >
                          <Save size={16} /> 保存配置
                       </button>
                    </div>
                 </div>

                 {/* Configuration List */}
                 <div className="flex-1 overflow-auto">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
                        <div className="col-span-3">功能模块 (Module)</div>
                        <div className="col-span-3">模型选择 (Model)</div>
                        <div className="col-span-6">提示词配置 (Prompt Configuration)</div>
                    </div>

                    {/* Rows */}
                    {CONFIG_KEYS.map((item) => {
                       const setting = currentTemplate.settings[item.key] || { model: MODEL_OPTIONS[0], promptId: '' };
                       
                       // Filter configs based on the mapping code
                       const availableConfigs = configList.filter(c => c.code === item.filterCode);
                       const selectedConfig = configList.find(c => c.id === setting.promptId);

                       return (
                          <div key={item.key} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 items-start hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                             
                             {/* Label */}
                             <div className="col-span-3 pt-2">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                                   <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                   {item.label}
                                </h3>
                                <span className="text-xs text-slate-400 font-mono ml-3">{item.key}</span>
                             </div>

                             {/* Model Select */}
                             <div className="col-span-3">
                                <select 
                                   value={setting.model}
                                   onChange={(e) => handleTemplateSettingChange(item.key, 'model', e.target.value)}
                                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
                                >
                                   {MODEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                             </div>
                             
                             {/* Config Dropdown */}
                             <div className="col-span-6">
                                <SearchableConfigDropdown 
                                    options={availableConfigs}
                                    value={setting.promptId}
                                    onChange={(val) => handleTemplateSettingChange(item.key, 'promptId', val)}
                                    placeholder={`选择 ${item.label} 配置...`}
                                />
                                {selectedConfig && (
                                    <div className="mt-2 flex items-center gap-2 text-xs">
                                        <span className="text-slate-400">已选配置:</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{selectedConfig.name}</span>
                                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">{selectedConfig.type}</span>
                                        <span className="bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-mono">{selectedConfig.provider}</span>
                                    </div>
                                )}
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>
            )}

            {/* ACCOUNT_MGMT: 账号管理 */}
            {activeTab === 'ACCOUNT_MGMT' && (
               <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">
                            <Users size={18} />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">系统账号列表</span>
                     </div>
                     <div className="flex gap-3">
                        <button 
                            onClick={() => { setEditingUser(null); setShowUserModal(true); }}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-500/20"
                        >
                            <Plus size={16} /> 新增用户
                        </button>
                        {/* New Button next to Add User */}
                        <button 
                            onClick={() => setShowRoleDrawer(true)}
                            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Shield size={16} /> 角色权限配置
                        </button>
                     </div>
                  </div>

                  <div className="w-full overflow-x-auto">
                     <div className="min-w-[900px] grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <div className="col-span-3">用户信息</div>
                        <div className="col-span-2">角色 (Role)</div>
                        <div className="col-span-3">权限预览</div>
                        <div className="col-span-1 text-center">状态</div>
                        <div className="col-span-2">最后登录</div>
                        <div className="col-span-1 text-right">操作</div>
                     </div>

                     {users.map((user) => {
                        const userRole = roles.find(r => r.id === user.roleId);
                        const roleName = userRole ? userRole.name : 'Unknown';
                        const effectivePerms = getUserPermissions(user);

                        return (
                        <div key={user.id} className="min-w-[900px] grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors items-center text-sm text-slate-700 dark:text-slate-300">
                           <div className="col-span-3 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                 {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                 <span className="font-medium text-slate-900 dark:text-white">{user.username}</span>
                                 <span className="text-xs text-slate-500">{user.email}</span>
                              </div>
                           </div>
                           <div className="col-span-2">
                               <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                                  user.roleId === 'ADMIN' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' : 
                                  'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                               }`}>
                                  {user.roleId === 'ADMIN' && <Shield size={10} />}
                                  {roleName}
                               </span>
                           </div>
                           <div className="col-span-3 flex flex-wrap gap-1">
                              {effectivePerms.slice(0, 3).map(pId => {
                                const p = PERMISSIONS_LIST.find(def => def.id === pId);
                                return p ? (
                                    <span key={pId} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200 dark:border-slate-700">{p.label}</span>
                                ) : null;
                              })}
                              {effectivePerms.length > 3 && <span className="text-[10px] text-slate-400">+{effectivePerms.length - 3}</span>}
                           </div>
                           <div className="col-span-1 flex justify-center">
                              {user.status === 'ACTIVE' ? (
                                <span className="w-2 h-2 rounded-full bg-green-500" title="Active"></span>
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-red-500" title="Inactive"></span>
                              )}
                           </div>
                           <div className="col-span-2 text-xs text-slate-500 font-mono">
                              {user.lastLogin}
                           </div>
                           <div className="col-span-1 flex justify-end gap-2">
                              <button 
                                 onClick={() => { setEditingUser(user); setShowUserModal(true); }}
                                 className="p-1 text-slate-400 hover:text-blue-500 transition-colors" 
                                 title="编辑用户信息"
                              >
                                 <Edit size={14} />
                              </button>
                              <button 
                                 onClick={() => openUserPermDrawer(user)}
                                 className="p-1 text-slate-400 hover:text-amber-500 transition-colors" 
                                 title="查看/配置权限"
                              >
                                 <Key size={14} />
                              </button>
                              <button 
                                 onClick={() => handleDeleteUser(user.id)}
                                 className="p-1 text-slate-400 hover:text-red-500 transition-colors" 
                                 title="删除"
                              >
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        </div>
                     );
                    })}
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* --- Modals & Drawers --- */}

      {/* Manage Templates Modal */}
      {showManageTemplatesModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in flex flex-col max-h-[80vh]">
               {/* Header */}
               <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                     <List size={20} className="text-blue-500"/>
                     模板管理
                  </h3>
                  <button onClick={() => setShowManageTemplatesModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                     <X size={20}/>
                  </button>
               </div>

               {/* List */}
               <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {templates.map(tpl => (
                     <div key={tpl.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 group">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{tpl.name}</span>
                              {currentTemplateId === tpl.id && (
                                 <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded border border-green-200 dark:border-green-800">当前使用</span>
                              )}
                           </div>
                           <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tpl.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                              onClick={() => handleDeleteTemplate(tpl.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="删除模板"
                           >
                              <Trash2 size={18} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Footer */}
               <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button 
                     onClick={() => setShowNewTemplateModal(true)}
                     className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-md shadow-blue-500/20 transition-colors"
                  >
                     <Plus size={16} /> 新增模板
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* New Template Modal (Triggered from Manage Modal or Main) */}
      {showNewTemplateModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-scale-in">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">另存为新模板</h3>
               <p className="text-xs text-slate-500 mb-4">将基于当前 "{currentTemplate.name}" 的配置创建副本。</p>
               <input 
                  type="text" 
                  value={newTemplateName} 
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="请输入模板名称"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                  autoFocus
               />
               <div className="flex justify-end gap-3">
                  <button onClick={() => setShowNewTemplateModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">取消</button>
                  <button onClick={handleCreateTemplate} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">确认创建</button>
               </div>
            </div>
         </div>
      )}

      {/* User Edit Modal */}
      {showUserModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-scale-in">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                     {editingUser ? '编辑用户' : '新增用户'}
                  </h3>
                  <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={20}/></button>
               </div>
               
               <form onSubmit={handleSaveUser} className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">用户名</label>
                     <input 
                        name="username"
                        defaultValue={editingUser?.username}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">邮箱</label>
                     <input 
                        name="email"
                        type="email"
                        defaultValue={editingUser?.email}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">角色</label>
                     <select 
                        name="roleId"
                        defaultValue={editingUser?.roleId || roles[0].id}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                     >
                        {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                     </select>
                  </div>
                  
                  {!editingUser && (
                     <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg flex gap-2 items-start text-xs text-yellow-700 dark:text-yellow-400">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <span>默认密码为 123456，请通知用户登录后尽快修改。</span>
                     </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                     <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">取消</button>
                     <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md">保存</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Role Permission Config Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-[480px] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 ${showRoleDrawer ? 'translate-x-0' : 'translate-x-full'}`}
      >
         <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
               <Shield className="text-blue-500" size={20} />
               角色权限配置
            </h3>
            <button onClick={() => setShowRoleDrawer(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
               <X size={20} />
            </button>
         </div>
         
         <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex gap-2">
               <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">选择角色</label>
                  <select 
                     value={selectedRoleId}
                     onChange={(e) => setSelectedRoleId(e.target.value)}
                     className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                     {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                     ))}
                  </select>
               </div>
               <div className="flex items-end gap-2">
                  <button 
                     onClick={() => setShowAddRoleModal(true)}
                     className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                     title="新增角色"
                  >
                     <Plus size={20} />
                  </button>
                  <button 
                     onClick={() => { if(roles.length > 1) { /* Mock Delete */ } }}
                     className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                     title="删除当前角色"
                  >
                     <Trash2 size={20} />
                  </button>
               </div>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div>
               <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">权限分配 (选中即绑定)</h4>
               <div className="space-y-3">
                  {PERMISSIONS_LIST.map((perm) => {
                     const currentRole = roles.find(r => r.id === selectedRoleId);
                     const isChecked = currentRole?.permissions.includes(perm.id);
                     return (
                        <label key={perm.id} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                           isChecked 
                              ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500/50' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}>
                           <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => toggleRolePermission(perm.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                           />
                           <div className="ml-3">
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{perm.label}</span>
                              <span className="ml-2 text-xs text-slate-500 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{perm.category}</span>
                           </div>
                        </label>
                     );
                  })}
               </div>
            </div>
         </div>
      </div>

      {/* Add Role Modal */}
      {showAddRoleModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-scale-in">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">新增角色</h3>
               <input 
                  type="text" 
                  value={newRoleName} 
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="输入角色名称 (如: Audit Manager)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                  autoFocus
               />
               <div className="flex justify-end gap-3">
                  <button onClick={() => setShowAddRoleModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">取消</button>
                  <button onClick={handleAddRole} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">确认添加</button>
               </div>
            </div>
         </div>
      )}

      {/* User Effective Permissions Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-[400px] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 ${showUserPermDrawer ? 'translate-x-0' : 'translate-x-full'}`}
      >
         <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
            <div>
               <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  <Key className="text-amber-500" size={20} />
                  用户权限详情
               </h3>
               {permDrawerUser && (
                  <p className="text-xs text-slate-500 mt-1">账号: {permDrawerUser.username} ({roles.find(r => r.id === permDrawerUser.roleId)?.name})</p>
               )}
            </div>
            <button onClick={() => setShowUserPermDrawer(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
               <X size={20} />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-5">
            <div className="space-y-4">
               <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <UserCog size={16} className="shrink-0 mt-0.5" />
                  <span>此处展示该用户拥有的所有有效权限（已勾选）。</span>
               </div>

               <div className="space-y-2">
                  {PERMISSIONS_LIST.map((perm) => {
                     const isChecked = permDrawerUser ? getUserPermissions(permDrawerUser).includes(perm.id) : false;
                     return (
                        <div key={perm.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                           isChecked 
                              ? 'bg-white dark:bg-slate-900 border-green-500/50 shadow-sm' 
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60'
                        }`}>
                           <div className="flex items-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${isChecked ? 'bg-green-500 text-white' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                 {isChecked && <Check size={12} />}
                              </div>
                              <div>
                                 <span className={`text-sm font-medium ${isChecked ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500'}`}>{perm.label}</span>
                              </div>
                           </div>
                           <span className="text-xs text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{perm.category}</span>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default BackendManagement;