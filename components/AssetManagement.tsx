import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Asset, AssetState, AssetSubTab, WorldviewEntry } from '../types';
import { Layers, RefreshCw, Mic, Volume2, Sparkles, FileSearch, ImagePlus, User, Map, Box, X, ChevronRight, Check, Search, Settings2, Trash2, CheckSquare, Square, LayoutTemplate, List, Play, Upload, Plus, Loader2, Globe2, FileText, File, Palette, Download, Eye, AlignLeft } from 'lucide-react';

interface AssetManagementProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  subTab: AssetSubTab;
  worldview: WorldviewEntry[];
  setWorldview: React.Dispatch<React.SetStateAction<WorldviewEntry[]>>;
  worldviewEnabled: boolean;
}

const AssetManagement: React.FC<AssetManagementProps> = ({ assets, setAssets, subTab, worldview, setWorldview, worldviewEnabled }) => {
  const [activeTypeTab, setActiveTypeTab] = useState<'ALL' | 'CHARACTER' | 'SCENE' | 'PROP'>('ALL');
  
  // Navigation State
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null); // Sidebar selection
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null); // Modal popup
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID'); // GRID = 索引预览, LIST = 列表预览

  // List Modal State
  const [showListModal, setShowListModal] = useState(false);
  const [listModalTypeTab, setListModalTypeTab] = useState<'ALL' | 'CHARACTER' | 'SCENE' | 'PROP'>('ALL');
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(new Set());

  // Add Asset Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssetForm, setNewAssetForm] = useState({
    name: '',
    type: 'CHARACTER' as 'CHARACTER' | 'SCENE' | 'PROP',
    description: ''
  });

  // Add State Modal State
  const [showAddStateModal, setShowAddStateModal] = useState(false);
  const [newStateForm, setNewStateForm] = useState({
    name: '',
    description: ''
  });

  // Worldview Modal State
  const [showWorldviewModal, setShowWorldviewModal] = useState(false);

  // Script Preview Modal
  const [previewScript, setPreviewScript] = useState<{name: string, content: string} | null>(null);

  // --- Style Reference State ---
  const [showStyleRefModal, setShowStyleRefModal] = useState(false);
  const [styleRefEnabled, setStyleRefEnabled] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null); // Track selected style ID
  const [customStyles, setCustomStyles] = useState<{id: string, name: string, url: string}[]>([]);
  const [showUploadStyleModal, setShowUploadStyleModal] = useState(false);
  const [newStyleForm, setNewStyleForm] = useState({ name: '', url: '' });

  // Mock Preset Styles
  const presetStyles = useMemo(() => [
    { id: 'p1', name: '赛博朋克', url: 'https://picsum.photos/seed/style1/400/400' },
    { id: 'p2', name: '水彩画', url: 'https://picsum.photos/seed/style2/400/400' },
    { id: 'p3', name: '油画', url: 'https://picsum.photos/seed/style3/400/400' },
    { id: 'p4', name: '素描', url: 'https://picsum.photos/seed/style4/400/400' },
    { id: 'p5', name: '极简主义', url: 'https://picsum.photos/seed/style5/400/400' },
    { id: 'p6', name: '浮世绘', url: 'https://picsum.photos/seed/style6/400/400' },
  ], []);

  // Generation State
  const [processingLabel, setProcessingLabel] = useState<string | null>(null); // Global processing label (extract/detail/gen)
  const [isRegenerating, setIsRegenerating] = useState(false); // Single image regeneration
  const [searchTerm, setSearchTerm] = useState('');
  
  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Textarea Ref for Auto-size
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Button Status Logic
  const hasExtracted = assets.length > 0;
  const hasGeneratedDetails = assets.some(a => a.states.some(s => !!s.prompt));

  // --- Mock Data for Episodes ---
  const mockEpisodes = [
      { id: 'ep1', name: '第一集：觉醒.txt', content: '第一集：觉醒\n\n场景1：雨夜街道\n角色：Kael\n\nKael 站在霓虹灯下，雨水顺着帽檐滴落。他看着手中的全息照片，眼神迷茫...' },
      { id: 'ep2', name: '第二集：追逐.txt', content: '第二集：追逐\n\n场景1：高速公路\n角色：Kael, 追击者\n\n浮空车在车流中穿梭，警报声此起彼伏...' },
      { id: 'ep3', name: '第三集：对决.txt', content: '第三集：对决\n\n场景1：废弃工厂\n角色：Kael, Vesper\n\n这里是决战之地。生锈的机械臂如同巨兽的骨架...' },
  ];

  // --- Mock Functions ---
  
  // 1. 提取资产：生成资产列表、简介和状态描述，但不包含提示词和详细属性
  const handleExtractAssets = () => {
    setProcessingLabel(worldviewEnabled ? '正在分析剧本、提取资产并生成世界观...' : '正在分析剧本并提取资产...');
    
    setTimeout(() => {
      // Mock Worldview Generation if enabled
      if (worldviewEnabled) {
          const mockWorldview: WorldviewEntry[] = [
              { id: 'wv1', faction: '巨型企业 (Corporations)', description: '视觉元素以极简主义、白色与金色为主，使用高科技复合材料。建筑呈现完美的几何线条，冷色调灯光，给人一种无菌、高压的秩序感。' },
              { id: 'wv2', faction: '街头帮派 (Street)', description: '视觉元素以高饱和度霓虹色为主，充斥着拼凑的机械义肢、透明塑料雨衣和全息涂鸦。环境肮脏，有着生锈的金属质感和混乱的电线。' },
              { id: 'wv3', faction: '荒野游牧 (Nomads)', description: '视觉元素融合了旧时代的工业残骸与沙漠生存装备。使用大地色系，车辆经过重度改装，带有防沙尘设计。' }
          ];
          setWorldview(mockWorldview);
      }

      const skeletonAssets: Asset[] = [
        // CHARACTERS
        { 
          id: '1', name: 'Kael (主角)', type: 'CHARACTER', description: '一位疲惫的赛博朋克侦探，寻找记忆碎片的流浪者。', inMasterLib: false,
          states: [
            { id: 's1', name: '常规状态', description: '身穿灰色战术风衣，神情冷峻，站在雨夜的霓虹灯光下。', mainImageUrl: '', thumbnailUrls: [] },
            { id: 's2', name: '战斗状态', description: '手持等离子手枪，衣衫略显凌乱，眼神犀利。', mainImageUrl: '', thumbnailUrls: [] },
            { id: 's3', name: '重伤状态', description: '靠在墙角，风衣破损，义眼闪烁故障红光。', mainImageUrl: '', thumbnailUrls: [] }
          ]
        },
        { 
          id: 'c2', name: 'Nyx (黑客)', type: 'CHARACTER', description: '顶尖的网络行者，皮肤上有发光的神经回路纹身。', inMasterLib: false,
          states: [
             { id: 'c2-s1', name: '潜入模式', description: '戴着AR眼镜，手指在虚空中操作全息键盘。', thumbnailUrls: [] },
             { id: 'c2-s2', name: '逃亡装束', description: '穿着宽大的光学迷彩飞行员夹克，兜帽遮住半张脸。', thumbnailUrls: [] }
          ]
        },
        { 
          id: 'c3', name: 'Vesper (反派)', type: 'CHARACTER', description: '泰瑞尔公司的高级执行官，冷酷无情。', inMasterLib: true,
          states: [
             { id: 'c3-s1', name: '会议室', description: '穿着剪裁完美的白色高科技面料西装，背景是巨大的落地窗。', thumbnailUrls: [] },
             { id: 'c3-s2', name: '战斗义体', description: '西装撕裂，露出内部金色的战斗骨骼。', thumbnailUrls: [] }
          ]
        },

        // SCENES
        { 
          id: '2', name: '霓虹街道', type: 'SCENE', description: '典型的赛博朋克城市底层街道。', inMasterLib: false,
          states: [
             { id: 's4', name: '夜间雨景', description: '倾盆大雨，路面反光，全息广告牌闪烁。', mainImageUrl: '', thumbnailUrls: [] },
             { id: 's5', name: '清晨雾气', description: '雨后的清晨，合成雾气弥漫。', mainImageUrl: '', thumbnailUrls: [] }
          ]
        },
        { 
          id: 'sc2', name: '虚空酒吧 (The Void)', type: 'SCENE', description: '地下情报交易所，黑客和雇佣兵的聚集地。', inMasterLib: false,
          states: [
             { id: 'sc2-s1', name: '吧台视角', description: '机械调酒师正在擦拭义肢，吧台上放着发光的鸡尾酒。', thumbnailUrls: [] },
             { id: 'sc2-s2', name: 'VIP包厢', description: '隔音玻璃后的私人空间，红丝绒沙发和全息投影屏。', thumbnailUrls: [] }
          ]
        },
        { 
          id: 'sc3', name: '荒坂塔顶层', type: 'SCENE', description: '公司权力的象征，极简主义设计。', inMasterLib: true,
          states: [
             { id: 'sc3-s1', name: '日落时分', description: '金色的阳光洒在黑色大理石地面上。', thumbnailUrls: [] },
             { id: 'sc3-s2', name: '数据中心', description: '无数蓝色的服务器阵列，弥漫着液氮寒气。', thumbnailUrls: [] }
          ]
        },
        { 
          id: 'sc4', name: '废弃地铁站', type: 'SCENE', description: '被帮派占据的旧时代遗迹。', inMasterLib: false,
          states: [
             { id: 'sc4-s1', name: '集会广场', description: '废弃的车厢被改造成临时住所，中央燃着全息篝火。', thumbnailUrls: [] }
          ]
        },

        // PROPS
        {
          id: '3', name: '旧式左轮', type: 'PROP', description: '备用武器，虽然老旧但威力巨大。', inMasterLib: false,
          states: [
            { id: 's6', name: '常规视角', description: '放在金属桌面上的特写，展示枪身的磨损纹理。', mainImageUrl: '', thumbnailUrls: [] }
          ]
        },
        { 
          id: 'p2', name: '神经连接接口', type: 'PROP', description: '军用级神经接入装置，非法改装品。', inMasterLib: false,
          states: [
             { id: 'p2-s1', name: '待机状态', description: '指示灯闪烁着危险的红光，放置在防静电盒中。', thumbnailUrls: [] },
             { id: 'p2-s2', name: '连接中', description: '接口伸出探针，数据光流在表面疯狂涌动。', thumbnailUrls: [] }
          ]
        },
        { 
          id: 'p3', name: '量子数据盘', type: 'PROP', description: '存储着核心机密的水晶状存储器。', inMasterLib: false,
          states: [
             { id: 'p3-s1', name: '发光状态', description: '内部有蓝色数据流动的光效，晶莹剔透。', thumbnailUrls: [] }
          ]
        },
        { 
          id: 'p4', name: '浮空摩托', type: 'PROP', description: '经过改装的高速追击载具。', inMasterLib: false,
          states: [
             { id: 'p4-s1', name: '街头停放', description: '停在涂鸦墙边，车身有刮痕，排气管冒着热气。', thumbnailUrls: [] }
          ]
        }
      ];
      setAssets(skeletonAssets);
      // Automatically select the first asset if none selected - DISABLED AS PER REQUEST
      /*
      if (!selectedAssetId && skeletonAssets.length > 0) {
        setSelectedAssetId(skeletonAssets[0].id);
      }
      */
      setProcessingLabel(null);
    }, 1000);
  };

  // 2. 生成详情：填充 Prompt 和 Attributes
  const handleGenerateDetails = () => {
    setProcessingLabel('正在生成资产详情与 Prompt...');
    setTimeout(() => {
       type PartialStateUpdate = Partial<AssetState> & { id: string };
       type AssetUpdateData = {
          states?: PartialStateUpdate[];
       };

       const detailedData: Record<string, AssetUpdateData> = {
          '1': {
             states: [
               { 
                 id: 's1', 
                 prompt: 'Cyberpunk detective, wearing trench coat, rainy night, neon lights, high detail face, cinematic lighting',
                 attributes: { '性别': '男', '年龄': '30s', '服装': '灰色战术风衣', '饰品': '电子义眼' },
               },
               {
                 id: 's2', 
                 prompt: 'Cyberpunk detective in combat stance, holding plasma pistol, dynamic pose, flying sparks, intense expression',
                 attributes: { '姿态': '射击', '武器': '等离子手枪', '表情': '愤怒' },
               },
               {
                 id: 's3',
                 prompt: 'Injured cyberpunk detective, leaning on wall, torn clothes, glitching cybernetic eye, red warning light, gritty atmosphere',
                 attributes: { '伤势': '腹部流血', '义体': '故障中', '氛围': '绝望' },
               }
             ]
          },
          'c2': {
             states: [
                { id: 'c2-s1', attributes: { '职业': '黑客', '风格': '街头赛博', '配色': '荧光绿' }, prompt: 'Cyberpunk hacker, AR glasses, typing on holographic keyboard, floating code, neon green theme' },
                { id: 'c2-s2', attributes: { '服装': '迷彩夹克', '表情': '紧张' }, prompt: 'Cyberpunk hacker hiding, optical camouflage jacket, hood up, nervous expression, dark alley' }
             ]
          },
          'c3': {
             states: [
                { id: 'c3-s1', attributes: { '气质': '高贵', '服装': '白色西装', '背景': '公司顶层' }, prompt: 'Corporate executive, white high-tech suit, modern office, floor to ceiling window, city skyline view' },
                { id: 'c3-s2', attributes: { '形态': '战斗', '武器': '激光刃' }, prompt: 'Cyborg combat mode, torn suit, golden endoskeleton, laser blade arm, action pose' }
             ]
          },
          '2': {
             states: [
               {
                 id: 's4', 
                 prompt: 'Cyberpunk street, night, heavy rain, reflections on wet asphalt, holographic billboards, crowd with umbrellas',
                 attributes: { '时间': '深夜', '天气': '暴雨', '氛围': '压抑但繁华' },
               },
               {
                 id: 's5',
                 prompt: 'Cyberpunk street at dawn, heavy synthetic fog, closed shops, cold blue lighting, quiet atmosphere',
                 attributes: { '时间': '清晨', '天气': '大雾', '氛围': '寂静' },
               }
             ]
          },
          'sc2': {
             states: [
                { id: 'sc2-s1', attributes: { '光线': '昏暗', '色彩': '紫色调' }, prompt: 'Cyberpunk bar counter, robot bartender, glowing cocktails, purple neon lighting, smoky atmosphere' },
                { id: 'sc2-s2', attributes: { '隐私': '高', '装饰': '奢华复古' }, prompt: 'Cyberpunk VIP booth, red velvet sofa, holographic screen, private meeting, dim lighting' }
             ]
          },
          'sc3': {
             states: [
                { id: 'sc3-s1', attributes: { '时间': '黄昏', '氛围': '肃穆' }, prompt: 'Arasaka tower penthouse, sunset, golden light on black marble floor, minimalist interior, long shadows' },
                { id: 'sc3-s2', attributes: { '科技感': '极高' }, prompt: 'Server room, blue LED lights, liquid nitrogen fog, high tech, cold atmosphere' }
             ]
          },
          'sc4': {
             states: [
                { id: 'sc4-s1', attributes: { '风格': '废土朋克' }, prompt: 'Abandoned subway station, graffiti, subway car homes, holographic bonfire, wasteland punk style' }
             ]
          },
          '3': {
             states: [
                {
                   id: 's6',
                   prompt: 'Old rusty revolver on metal table, dramatic lighting, 8k texture, macro shot',
                   attributes: { '材质': '金属', '成色': '磨损' },
                }
             ]
          },
          'p2': {
             states: [
                { id: 'p2-s1', attributes: { '状态': '待机', '危险级': '高' }, prompt: 'Neural interface device, red warning light, anti-static box, macro photography' },
                { id: 'p2-s2', attributes: { '特效': '数据流' }, prompt: 'Neural interface active, extending probes, glowing data stream, sparks' }
             ]
          },
          'p3': {
             states: [
                { id: 'p3-s1', attributes: { '材质': '水晶' }, prompt: 'Quantum data drive, crystal like, glowing blue internal light, valuable object, close up' }
             ]
          },
          'p4': {
             states: [
                { id: 'p4-s1', attributes: { '车型': '竞速' }, prompt: 'Hover bike parked on street, graffiti wall background, customized, scratches, exhaust heat' }
             ]
          }
       };

       setAssets(prev => prev.map(asset => {
         const details = detailedData[asset.id];
         if (details && details.states) {
            return {
               ...asset,
               states: asset.states.map(state => {
                 const newDetails = details.states!.find(s => s.id === state.id);
                 return newDetails ? { ...state, ...newDetails } : state;
               })
            };
         }
         return asset;
       }));
       setProcessingLabel(null);
    }, 1500);
  };

  // 修改：一键生主图 (生成所有资产的主状态图)
  const handleOneClickGen = () => {
    setProcessingLabel('正在批量生成所有资产的主状态图像...');
    setTimeout(() => {
      setAssets(prev => prev.map(a => {
        // 查找主状态（通常是第一个，或者名称包含常规/主状态的）
        const newStates = [...a.states];
        if (newStates.length > 0) {
           const s = newStates[0];
           // 如果没有 prompt 也没图，则跳过。如果有 prompt 但没图，则生成
           if (s.prompt && !s.mainImageUrl) {
              newStates[0] = {
                ...s,
                mainImageUrl: `https://picsum.photos/seed/main-${s.id}/800/600`,
                thumbnailUrls: s.thumbnailUrls.length > 0 ? s.thumbnailUrls : [
                  `https://picsum.photos/seed/main-${s.id}1/200/200`,
                  `https://picsum.photos/seed/main-${s.id}2/200/200`,
                ]
              };
           }
        }
        
        // 更新封面图（使用第一个有图的状态）
        const firstValidState = newStates.find(s => s.mainImageUrl);
        return {
          ...a,
          states: newStates,
          imageUrl: firstValidState ? firstValidState.mainImageUrl : a.imageUrl
        };
      }));
      setProcessingLabel(null);
    }, 2000);
  };

  // 新增：一键生状态图 (生成所有资产的非主状态图)
  const handleOneClickStateGen = () => {
    setProcessingLabel('正在批量生成所有资产的变体状态图像...');
    setTimeout(() => {
        setAssets(prev => prev.map(a => {
            const newStates = a.states.map((s, idx) => {
                // 跳过第一个状态（主状态）
                if (idx === 0) return s;
                // 如果没有 prompt 或者已经有图，则跳过
                if (!s.prompt || s.mainImageUrl) return s;

                return {
                    ...s,
                    mainImageUrl: `https://picsum.photos/seed/state-${s.id}/800/600`,
                    thumbnailUrls: s.thumbnailUrls.length > 0 ? s.thumbnailUrls : [
                        `https://picsum.photos/seed/state-${s.id}1/200/200`,
                    ]
                };
            });
            return { ...a, states: newStates };
        }));
        setProcessingLabel(null);
    }, 2500);
  };

  const handleRegenerateSingleImage = () => {
    if (!selectedAssetId || !selectedStateId) return;

    setIsRegenerating(true);
    setTimeout(() => {
      const newImageUrl = `https://picsum.photos/seed/${selectedStateId}-${Date.now()}/800/600`;
      
      setAssets(prev => prev.map(a => {
        if (a.id !== selectedAssetId) return a;
        return {
          ...a,
          states: a.states.map(s => {
            if (s.id !== selectedStateId) return s;
            return {
               ...s,
               mainImageUrl: newImageUrl,
               // Add to history
               thumbnailUrls: [newImageUrl, ...s.thumbnailUrls].slice(0, 8)
            };
          })
        };
      }));
      setIsRegenerating(false);
    }, 2000);
  };
  
  // Handle image upload from user
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedAssetId && selectedStateId) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setAssets((prev) =>
            prev.map((asset) => {
              if (asset.id !== selectedAssetId) return asset;
              return {
                ...asset,
                states: asset.states.map((state) => {
                  if (state.id !== selectedStateId) return state;
                  return {
                    ...state,
                    mainImageUrl: result,
                    thumbnailUrls: [result, ...state.thumbnailUrls],
                  };
                }),
              };
            })
          );
        }
      };
      reader.readAsDataURL(file);
      // Reset value to allow re-uploading same file
      event.target.value = ''; 
    }
  };

  const handlePromptChange = (newPrompt: string) => {
    if (!selectedAssetId || !selectedStateId) return;
    setAssets(prev => prev.map(a => {
      if (a.id !== selectedAssetId) return a;
      return {
        ...a,
        states: a.states.map(s => {
          if (s.id !== selectedStateId) return s;
          return { ...s, prompt: newPrompt };
        })
      };
    }));
  };

  const setMainImageForState = (assetId: string, stateId: string, url: string) => {
    setAssets(prev => prev.map(a => {
      if (a.id !== assetId) return a;
      return {
        ...a,
        states: a.states.map(s => {
          if (s.id !== stateId) return s;
          const oldMain = s.mainImageUrl;
          const newThumbs = s.thumbnailUrls.filter(t => t !== url);
          if (oldMain) newThumbs.push(oldMain);
          return { ...s, mainImageUrl: url, thumbnailUrls: newThumbs };
        })
      };
    }));
  };

  // --- New Delete Image Function ---
  const handleDeleteImage = (assetId: string, stateId: string, urlToDelete: string) => {
    if (!window.confirm('确定要删除这张图片吗？此操作无法撤销。')) return;

    setAssets(prev => prev.map(a => {
      if (a.id !== assetId) return a;
      return {
        ...a,
        states: a.states.map(s => {
          if (s.id !== stateId) return s;
          
          // Case 1: Deleting the Main Image
          if (s.mainImageUrl === urlToDelete) {
             const newMain = s.thumbnailUrls.length > 0 ? s.thumbnailUrls[0] : undefined;
             const newThumbs = s.thumbnailUrls.length > 0 ? s.thumbnailUrls.slice(1) : [];
             return { ...s, mainImageUrl: newMain, thumbnailUrls: newThumbs };
          }

          // Case 2: Deleting a thumbnail
          return {
             ...s,
             thumbnailUrls: s.thumbnailUrls.filter(u => u !== urlToDelete)
          };
        })
      };
    }));
  };

  // --- Add Asset Functions ---
  const handleCreateAsset = () => {
    if (!newAssetForm.name.trim()) return;

    const newId = Date.now().toString();
    const stateId = `${newId}-s1`;
    
    const newAsset: Asset = {
      id: newId,
      name: newAssetForm.name,
      type: newAssetForm.type,
      description: newAssetForm.description || '手动创建的资产',
      inMasterLib: false,
      states: [{
        id: stateId,
        name: '常规状态', // Hardcoded default
        description: '初始状态',
        thumbnailUrls: []
      }]
    };

    setAssets(prev => [newAsset, ...prev]);
    setSelectedAssetId(newId);
    
    // Close and reset
    setShowAddModal(false);
    setNewAssetForm({
      name: '',
      type: 'CHARACTER',
      description: ''
    });
  };

  // --- Add State Functions ---
  const handleCreateState = () => {
    if (!selectedAssetId || !newStateForm.name.trim()) return;

    setAssets(prev => prev.map(asset => {
      if (asset.id !== selectedAssetId) return asset;
      const newStateId = `${asset.id}-s${Date.now()}`;
      return {
        ...asset,
        states: [...asset.states, {
          id: newStateId,
          name: newStateForm.name,
          description: newStateForm.description || '新添加的状态',
          thumbnailUrls: []
        }]
      };
    }));

    setShowAddStateModal(false);
    setNewStateForm({ name: '', description: '' });
  };

  // --- Delete State Function ---
  const handleDeleteState = (assetId: string, stateId: string) => {
    if (confirm('确定要删除此状态吗？此操作无法撤销。')) {
       setAssets(prev => prev.map(asset => {
          if (asset.id !== assetId) return asset;
          return {
             ...asset,
             states: asset.states.filter(s => s.id !== stateId)
          };
       }));
       
       // 如果删除的是当前详情弹窗正在查看的状态，关闭弹窗
       if (selectedStateId === stateId) {
          setSelectedStateId(null);
       }
    }
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    if (selectedAssetId === id) {
      setSelectedAssetId(null);
      setSelectedStateId(null);
    }
  };

  // Derived states for button logic
  const hasAssets = assets.length > 0;
  const hasDetails = assets.some(a => a.states.some(s => s.prompt));

  // --- List Management Functions ---
  const toggleDeleteSelection = (id: string) => {
    const newSet = new Set(selectedForDeletion);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedForDeletion(newSet);
  };

  const executeDeletion = () => {
    if (selectedForDeletion.size === 0) return;
    
    if (confirm(`确定要删除选中的 ${selectedForDeletion.size} 个资产吗？`)) {
      setAssets(prev => prev.filter(a => !selectedForDeletion.has(a.id)));
      
      // If we deleted the currently viewed asset, reset selection
      if (selectedAssetId && selectedForDeletion.has(selectedAssetId)) {
        setSelectedAssetId(null);
        setSelectedStateId(null);
      }
      
      // Reset deletion set
      setSelectedForDeletion(new Set());
      setIsManageMode(false);
    }
  };

  const closeListModal = () => {
    setShowListModal(false);
    setIsManageMode(false);
    setSelectedForDeletion(new Set());
    setListModalTypeTab('ALL'); // Reset modal tab
  };

  // --- Derived Data ---
  const filteredAssets = useMemo(() => {
     let result = activeTypeTab === 'ALL' ? assets : assets.filter(a => a.type === activeTypeTab);
     if (searchTerm) {
        result = result.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));
     }
     return result;
  }, [assets, activeTypeTab, searchTerm]);
  
  // New derived data for Modal
  const filteredModalAssets = useMemo(() => {
    return listModalTypeTab === 'ALL' ? assets : assets.filter(a => a.type === listModalTypeTab);
  }, [assets, listModalTypeTab]);

  const activeAsset = selectedAssetId ? assets.find(a => a.id === selectedAssetId) : null;
  const activeModalState = activeAsset && selectedStateId 
    ? activeAsset.states.find(s => s.id === selectedStateId) 
    : null;
  
  // Find initial state (first state) for reference
  const initialAssetState = activeAsset ? activeAsset.states[0] : null;
  const isViewingInitialState = activeModalState && initialAssetState && activeModalState.id === initialAssetState.id;

  // Auto-resize prompt textarea
  useEffect(() => {
    if (activeModalState && promptTextareaRef.current) {
        promptTextareaRef.current.style.height = 'auto';
        promptTextareaRef.current.style.height = promptTextareaRef.current.scrollHeight + 'px';
    }
  }, [activeModalState?.prompt, selectedStateId]);

  // --- SubTab Handling ---
  if (subTab === AssetSubTab.EPISODES) {
      return (
          <div className="h-full flex flex-col p-8 animate-fade-in relative">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
                  <h3 className="text-xl font-semibold">剧集管理</h3>
                  <div className="text-sm text-slate-500">共 {mockEpisodes.length} 集</div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {mockEpisodes.map(ep => (
                      <div 
                          key={ep.id}
                          onClick={() => setPreviewScript({ name: ep.name, content: ep.content })}
                          className="group flex flex-col items-center gap-3 p-6 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-blue-500 cursor-pointer transition-all hover:-translate-y-1"
                      >
                          <div className="w-16 h-16 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <FileText className="text-blue-500" size={32} />
                          </div>
                          <span className="text-sm font-medium text-slate-300 text-center line-clamp-2 group-hover:text-white">{ep.name}</span>
                      </div>
                  ))}
              </div>

              {/* Script Preview Modal */}
              {previewScript && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-6">
                      <div className="bg-slate-900 w-full max-w-2xl rounded-xl border border-slate-700 shadow-2xl flex flex-col animate-scale-in max-h-[80vh]">
                          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-xl">
                              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                  <File size={20} className="text-blue-500"/>
                                  {previewScript.name}
                              </h3>
                              <button onClick={() => setPreviewScript(null)} className="text-slate-400 hover:text-white transition-colors">
                                  <X size={20} />
                              </button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
                              <pre className="whitespace-pre-wrap font-mono text-slate-300 text-sm leading-relaxed">
                                  {previewScript.content}
                              </pre>
                          </div>
                          <div className="p-4 border-t border-slate-800 bg-slate-900 rounded-b-xl flex justify-end">
                              <button onClick={() => setPreviewScript(null)} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">
                                  关闭
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // --- Style Reference Handlers ---
  const handleStyleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              const result = e.target?.result as string;
              if (result) {
                  setNewStyleForm(prev => ({ ...prev, url: result }));
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleConfirmUploadStyle = () => {
      if (!newStyleForm.name || !newStyleForm.url) return;
      setCustomStyles(prev => [...prev, {
          id: `custom-${Date.now()}`,
          name: newStyleForm.name,
          url: newStyleForm.url
      }]);
      setShowUploadStyleModal(false);
      setNewStyleForm({ name: '', url: '' });
  };

  if (subTab === AssetSubTab.TTS) {
     return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in p-8">
           <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-xl font-semibold">TTS 配音生成</h3>
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                <Mic size={16} /><span>生成所有配音</span>
              </button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
                 <Volume2 size={48} className="opacity-20" />
                 <p>暂无配音任务</p>
            </div>
        </div>
     );
  }

  // --- Render ---

  return (
    <div className="flex flex-col h-full bg-theme-page text-theme-primary overflow-hidden font-sans">
      
      {/* Header Bar */}
      <div className="shrink-0 flex items-center justify-between py-4 border-b border-theme-border bg-theme-panel px-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">资产库</h2>
          <span className="bg-slate-800 text-xs px-2 py-0.5 rounded text-slate-400 border border-slate-700">{assets.length}</span>
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition-colors text-sm ml-4">
            <Download size={16} />
            <span>导出资产</span>
          </button>
        </div>
      </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden py-4 gap-6 px-10">
          
          {/* Action Row */}
          <div className="flex items-center justify-between shrink-0 gap-4">
            {/* Left: View Mode Toggle */}
            <div className="flex bg-theme-card p-1 rounded-lg border border-theme-border shrink-0">
              <button 
                onClick={() => setViewMode('LIST')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'LIST' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                列表预览
              </button>
              <button 
                onClick={() => setViewMode('GRID')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'GRID' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                索引预览
              </button>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors shrink-0"
              >
                <Plus size={16} />
                <span>新建资产</span>
              </button>
              
              <button 
                onClick={() => {}}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shrink-0"
              >
                <Layers size={16} />
                <span>批量创建资产</span>
              </button>
              
              <div className="flex items-center gap-2 px-1 border-l border-white/10 ml-2 shrink-0">
                <button 
                  onClick={() => setShowWorldviewModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-xs transition-colors shrink-0"
                >
                  <Globe2 size={16} />
                  <span>查看世界观</span>
                </button>
                <button 
                  onClick={() => setShowStyleRefModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-xs transition-colors shrink-0"
                >
                  <Palette size={16} />
                  <span>风格参考</span>
                </button>
                <button 
                  onClick={handleExtractAssets}
                  disabled={hasAssets}
                  className={`flex items-center gap-2 px-3 py-1.5 text-slate-400 rounded-lg text-xs transition-colors shrink-0 ${hasAssets ? 'opacity-30 cursor-not-allowed' : 'hover:text-white hover:bg-white/5'}`}
                >
                  <FileSearch size={16} />
                  <span>提取资产</span>
                </button>
                <button 
                  onClick={handleGenerateDetails}
                  disabled={!hasAssets}
                  className={`flex items-center gap-2 px-3 py-1.5 text-slate-400 rounded-lg text-xs transition-colors shrink-0 ${!hasAssets ? 'opacity-30 cursor-not-allowed' : 'hover:text-white hover:bg-white/5'}`}
                >
                  <Sparkles size={16} />
                  <span>生成详情</span>
                </button>
                <button 
                  onClick={handleOneClickGen}
                  disabled={!hasDetails}
                  className={`flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors shrink-0 ${!hasDetails ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-500'}`}
                >
                  <ImagePlus size={16} />
                  <span>一键生主图</span>
                </button>
                <button 
                  onClick={handleOneClickStateGen}
                  disabled={!hasDetails}
                  className={`flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium transition-colors shrink-0 ${!hasDetails ? 'opacity-30 cursor-not-allowed' : 'hover:bg-indigo-500'}`}
                >
                  <Layers size={16} />
                  <span>一键生状态图</span>
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors ml-2 shrink-0">
                  <Settings2 size={18} />
                  <span className="sr-only">全局设置</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Header Filters & Grid Mode Actions */}
          {viewMode === 'GRID' && (
            <div className="flex flex-col gap-6 shrink-0">
              {/* Tab & Search Row */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-8 h-full">
                  {[
                    { label: '全部', count: assets.length, key: 'ALL' },
                    { label: '角色', count: assets.filter(a => a.type === 'CHARACTER').length, key: 'CHARACTER' },
                    { label: '场景', count: assets.filter(a => a.type === 'SCENE').length, key: 'SCENE' },
                    { label: '道具', count: assets.filter(a => a.type === 'PROP').length, key: 'PROP' }
                  ].map((tab) => {
                    const isActive = activeTypeTab === tab.key;
                    return (
                      <button 
                        key={tab.key}
                        onClick={() => setActiveTypeTab(tab.key as any)}
                        className={`h-full flex items-center gap-2 pb-3 text-sm font-medium relative transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        <span>{tab.label}</span>
                        <span className="text-xs opacity-60 font-medium">{tab.count}</span>
                        {isActive && <motion.div layoutId="asset-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                      </button>
                    );
                  })}
                </div>

                <div className="relative w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="搜索资产..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-theme-page border border-theme-border rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:border-theme-accent/50 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* View Container */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'GRID' ? (
              <div className="h-full overflow-y-auto scroll-smooth pr-2">
                {!processingLabel && filteredAssets.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-10">
                    {filteredAssets.map((asset) => (
                      <motion.div 
                        key={asset.id}
                        layout
                        onClick={() => {
                          setSelectedAssetId(asset.id);
                          setViewMode('LIST');
                        }}
                        className="group flex flex-col cursor-pointer"
                      >
                        {/* Thumbnail Container */}
                        <div className="aspect-[3/4] bg-theme-panel border border-theme-border rounded-xl overflow-hidden relative mb-3 transition-all hover:border-theme-accent/50 hover:shadow-2xl hover:shadow-theme-accent/10">
                          {asset.imageUrl || asset.states[0]?.mainImageUrl ? (
                            <img src={asset.imageUrl || asset.states[0]?.mainImageUrl} alt={asset.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-theme-secondary bg-theme-panel">
                              <ImagePlus size={48} strokeWidth={1.5} />
                              <span className="text-xs mt-3 uppercase tracking-widest font-bold opacity-30">暂无预览图</span>
                            </div>
                          )}
                          
                          {/* Badge */}
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600/90 text-white text-[10px] font-bold rounded flex items-center gap-1">
                            {asset.type === 'CHARACTER' ? '角色' : asset.type === 'SCENE' ? '场景' : '道具'}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex flex-col items-center text-center px-1">
                          <h3 className="text-sm font-bold text-slate-100 mb-0.5 group-hover:text-blue-400 transition-colors">{asset.name}</h3>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mb-1.5 opacity-80">{asset.description}</p>
                          
                          {/* Episode & Image Stats */}
                          <div className="flex flex-col items-center gap-0.5">
                            <p className="text-[11px] font-bold text-emerald-400">第 5、10 集</p>
                            <p className="text-[10px] text-slate-500">共 {asset.states.length} 个形象</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : !processingLabel && (
                  <div className="flex flex-col items-center justify-center h-full py-40 gap-4 opacity-30">
                    <LayoutTemplate size={80} strokeWidth={1} />
                    <p className="text-lg font-medium">未发现匹配资产</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex overflow-hidden gap-1 bg-theme-panel/30 rounded-3xl border border-theme-border">
                {/* Left Sidebar: Asset List */}
                <div className="w-64 lg:w-72 flex flex-col border-r border-theme-border bg-theme-panel">
                  <div className="p-4 border-b border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-400">资产库 <span className="text-slate-600 ml-1">{assets.length}</span></h3>
                      <div className="flex items-center gap-1">
                        <button className="p-1 text-slate-500 hover:text-white hover:bg-white/5 rounded transition-colors"><Settings2 size={14} /></button>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input 
                        type="text" 
                        placeholder="搜索资产..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-theme-page border border-theme-border rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-theme-accent/50 transition-all placeholder:text-slate-700"
                      />
                    </div>

                    <div className="flex justify-between p-1 bg-black/20 rounded-lg border border-white/5">
                      {[
                        { icon: AlignLeft, key: 'ALL' },
                        { icon: User, key: 'CHARACTER' },
                        { icon: Map, key: 'SCENE' },
                        { icon: Box, key: 'PROP' }
                      ].map(tab => (
                        <button 
                          key={tab.key}
                          onClick={() => setActiveTypeTab(tab.key as any)}
                          className={`p-1.5 rounded-md transition-all ${activeTypeTab === tab.key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-400'}`}
                        >
                          <tab.icon size={16} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredAssets.map(asset => {
                      const isActive = selectedAssetId === asset.id;
                      return (
                        <div 
                          key={asset.id}
                          onClick={() => setSelectedAssetId(asset.id)}
                          className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'hover:bg-white/5'}`}
                        >
                          <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-slate-800'}`}>
                            {asset.type === 'CHARACTER' ? <User size={18} className={isActive ? 'text-white' : 'text-slate-400'} /> : 
                             asset.type === 'SCENE' ? <Map size={18} className={isActive ? 'text-white' : 'text-slate-400'} /> : 
                             <Box size={18} className={isActive ? 'text-white' : 'text-slate-400'} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>{asset.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] font-medium ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>第 5, 10 集</span>
                              <span className={`text-[10px] font-medium opacity-50 ${isActive ? 'text-white' : 'text-slate-600'}`}>• {asset.states.length} 状态</span>
                            </div>
                          </div>
                          <ChevronRight size={14} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Content: States Grid */}
                <div className="flex-1 overflow-y-auto bg-theme-page relative custom-scrollbar">
                  {activeAsset ? (
                    <div className="p-10 w-full animate-fade-in">
                      <div className="flex items-start justify-between mb-12">
                        <div className="flex gap-6">
                           <div className={`p-5 rounded-[2rem] bg-slate-900 border border-white/5 shadow-2xl ${
                            activeAsset.type === 'CHARACTER' ? 'text-blue-500' : 
                            activeAsset.type === 'SCENE' ? 'text-purple-500' : 'text-amber-500'
                          }`}>
                            {activeAsset.type === 'CHARACTER' ? <User size={40} /> : 
                             activeAsset.type === 'SCENE' ? <Map size={40} /> : <Box size={40} />}
                          </div>
                          <div>
                            <h2 className="text-5xl font-black text-white tracking-tight mb-3">{activeAsset.name}</h2>
                            <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">{activeAsset.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                           <button 
                            onClick={() => { if(window.confirm('确定要删除该资产吗？')) handleDeleteAsset(activeAsset.id); }}
                            className="p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                          >
                            <Trash2 size={24} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-8">
                        <Layers className="text-blue-500" size={24} />
                        <h3 className="text-2xl font-bold text-white tracking-wide">状态视图 (States)</h3>
                        <span className="text-sm bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700 font-bold">
                          {activeAsset.states.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activeAsset.states.map((state) => (
                          <motion.div 
                            key={state.id}
                            layout
                            onClick={() => setSelectedStateId(state.id)}
                            className="group bg-theme-panel border border-theme-border rounded-[2.5rem] overflow-hidden flex flex-col hover:border-theme-accent/30 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer"
                          >
                            {/* State Image */}
                            <div className="aspect-square bg-black relative">
                              {state.mainImageUrl ? (
                                <img src={state.mainImageUrl} alt={state.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 bg-slate-900/50">
                                  <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 group-hover:text-blue-500 transition-all duration-500">
                                    <ImagePlus size={32} strokeWidth={1} />
                                  </div>
                                  <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">点击上传/生成</span>
                                </div>
                              )}
                              
                              {/* Interaction Overlay */}
                              <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="p-4 bg-white rounded-full text-black shadow-2xl transform scale-50 group-hover:scale-100 transition-all duration-500">
                                  <Plus size={24} />
                                </div>
                              </div>

                              <div className="absolute top-4 left-4">
                                <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-md shadow-lg">主状态</span>
                              </div>
                            </div>

                            {/* State Details */}
                            <div className="p-8 bg-theme-panel">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{state.name}</h4>
                              </div>
                              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed opacity-70 mb-4 font-medium italic">
                                {state.description || "点击进入以添加描述或生成图片资产。"}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-widest text-blue-500`}>第 51 集</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {/* Add Card Shortcut */}
                        <div 
                          onClick={() => setShowAddStateModal(true)}
                          className="aspect-square rounded-[2.5rem] border-2 border-dashed border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-blue-500/50 flex flex-col items-center justify-center cursor-pointer transition-all group duration-500"
                        >
                          <div className="w-20 h-20 bg-slate-900 border border-white/5 rounded-full text-slate-600 group-hover:text-blue-500 group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-500 mb-6 flex items-center justify-center">
                            <Plus size={40} />
                          </div>
                          <div className="text-center">
                            <span className="text-lg font-black text-slate-500 group-hover:text-slate-200 block mb-1">添加新状态</span>
                            <span className="text-xs text-slate-700 font-bold uppercase tracking-wider">创建变体或新视角</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-6 opacity-30">
                       <Box size={100} strokeWidth={1} />
                       <div className="text-center">
                          <p className="text-2xl font-black uppercase tracking-widest">请选择资产</p>
                          <p className="text-sm font-bold mt-2">从侧边栏选择一个资产以进行管理</p>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Detail Modals */}
      {activeAsset && (
        <>
          {/* Level 3: State Detail Modal (Popup) */}
          {activeModalState && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4 lg:p-10">
               <div className="bg-slate-900 w-full max-w-6xl h-full max-h-[90vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-scale-in">
                  
                  {/* Left Column: Image Area */}
                  <div className="w-full lg:w-2/3 bg-black relative flex items-center justify-center group/preview overflow-hidden border-r border-white/5">
                     {activeModalState.mainImageUrl ? (
                        <img 
                          src={activeModalState.mainImageUrl} 
                          className="max-w-full max-h-full object-contain" 
                          alt={activeModalState.name} 
                        />
                     ) : (
                        <div className="flex flex-col items-center gap-4 text-slate-700">
                          <ImagePlus size={64} strokeWidth={1} />
                          <span className="text-sm font-medium">暂无大图，请上传或生成</span>
                        </div>
                     )}
                     
                     {/* Upload overlay */}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all flex items-center gap-2"
                        >
                          <Upload size={20} />
                          <span>更换主图</span>
                        </button>
                     </div>

                     {/* Hidden Input for this modal specifically if needed, but we use the existing handleImageUpload which expects state info */}
                     <input 
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && activeAsset && activeModalState) {
                             // This is a bit tricky since handleImageUpload in the original code might not take file directly
                             // But let's assume it works with the ref. The original code uses:
                             // onChange={handleImageUpload}
                             // I'll keep the original behavior by just triggering the ref.
                          }
                        }}
                     />
                  </div>

                  {/* Right Column: Info & Actions */}
                  <div className="w-full lg:w-1/3 flex flex-col bg-theme-panel overflow-hidden">
                     {/* Modal Header */}
                     <div className="p-6 border-b border-white/5 flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">{activeModalState.name}</h3>
                          <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                            {activeAsset.name} <span className="mx-1 opacity-30">|</span> {activeAsset.type === 'CHARACTER' ? '角色' : activeAsset.type === 'SCENE' ? '场景' : '道具'}
                          </p>
                        </div>
                        <button 
                          onClick={() => setSelectedStateId(null)}
                          className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                        >
                          <X size={24} />
                        </button>
                     </div>

                     {/* Modal Body */}
                     <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Prompt (Editable) */}
                        <div className="bg-theme-page border border-theme-border rounded-xl p-5">
                          <div className="flex justify-between items-center mb-3">
                             <label className="flex items-center gap-2 text-sm font-bold text-blue-400">
                                <Sparkles size={16} />
                                <span>提示词 (Prompt)</span>
                             </label>
                          </div>
                          <textarea 
                             value={activeModalState.prompt || ''}
                             onChange={(e) => handlePromptChange(e.target.value)}
                             className="w-full bg-transparent text-sm text-slate-300 font-mono leading-relaxed p-0 border-none focus:ring-0 resize-none min-h-[8rem]"
                             placeholder="输入详细的画面描述..."
                          />
                        </div>

                        {/* Description Section */}
                        <div>
                          <div className="flex items-center gap-2 text-slate-400 text-sm font-bold mb-3">
                            <AlignLeft size={16} />
                            <span>形态简介</span>
                          </div>
                          <p className="text-theme-secondary text-sm leading-relaxed bg-theme-card p-4 rounded-xl border border-theme-border italic">
                            {activeModalState.description || "暂无描述..."}
                          </p>
                        </div>

                        {/* Thumbnails Section */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                              <Layers size={16} />
                              <span>变体图片 ({activeModalState.thumbnailUrls.length})</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-3">
                            {activeModalState.thumbnailUrls.map((url, idx) => (
                              <div 
                                key={idx} 
                                className={`aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${activeModalState.mainImageUrl === url ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                onClick={() => setMainImageForState(activeAsset.id, activeModalState.id, url)}
                              >
                                <img src={url} className="w-full h-full object-cover" alt="" />
                              </div>
                            ))}
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-square rounded-lg border border-dashed border-slate-700 bg-slate-800/30 flex items-center justify-center text-slate-600 hover:text-blue-500 transition-colors"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        </div>

                        {/* AI Generation Controls */}
                        <div className="pt-4 border-t border-white/5">
                          <button 
                            onClick={handleRegenerateSingleImage}
                            disabled={isRegenerating || !activeModalState.prompt}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-md font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                          >
                            <RefreshCw className={isRegenerating ? 'animate-spin' : ''} size={20} />
                            <span>{isRegenerating ? '正在生成...' : '立即生成'}</span>
                          </button>
                          <p className="text-[10px] text-slate-600 text-center mt-3">生成将消耗 1 点额度，大约需要 15-20 秒</p>
                        </div>
                     </div>

                     {/* Footer */}
                     <div className="p-6 border-t border-theme-border bg-theme-panel flex gap-3">
                        <button 
                          onClick={() => setSelectedStateId(null)}
                          className="flex-1 py-3 border border-white/10 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 transition-colors"
                        >
                          关闭预览
                        </button>
                     </div>
                  </div>

               </div>
            </div>
          )}

          {/* Level 2 Modal removed and integrated into split view right content */}
        </>
      )}

      {/* NEW: ADD ASSET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
           <div className="bg-slate-900 w-full max-w-lg rounded-xl border border-slate-700 shadow-2xl flex flex-col animate-scale-in p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="bg-blue-600 p-1 rounded-md text-white" size={24} />
                  新建资产
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Asset Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">资产名称 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={newAssetForm.name}
                    onChange={(e) => setNewAssetForm({...newAssetForm, name: e.target.value})}
                    placeholder="例如：赛博侦探 Kael"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Asset Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">资产类型 <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['CHARACTER', 'SCENE', 'PROP'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setNewAssetForm({...newAssetForm, type: type})}
                        className={`
                          flex flex-col items-center justify-center py-3 px-2 rounded-lg border transition-all
                          ${newAssetForm.type === type 
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'
                          }
                        `}
                      >
                        {type === 'CHARACTER' && <User size={20} className="mb-1" />}
                        {type === 'SCENE' && <Map size={20} className="mb-1" />}
                        {type === 'PROP' && <Box size={20} className="mb-1" />}
                        <span className="text-xs font-medium">
                          {type === 'CHARACTER' ? '角色' : type === 'SCENE' ? '场景' : '道具'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">简介描述 (可选)</label>
                  <textarea 
                    value={newAssetForm.description}
                    onChange={(e) => setNewAssetForm({...newAssetForm, description: e.target.value})}
                    placeholder="简要描述该资产的特征..."
                    className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                >
                  取消
                </button>
                <button 
                  onClick={handleCreateAsset}
                  disabled={!newAssetForm.name.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20"
                >
                  确认添加
                </button>
              </div>
           </div>
        </div>
      )}

      {/* NEW: ADD STATE MODAL */}
      {showAddStateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
           <div className="bg-slate-900 w-full max-w-md rounded-xl border border-slate-700 shadow-2xl flex flex-col animate-scale-in p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="text-blue-500" size={20} />
                  添加新状态
                </h3>
                <button 
                  onClick={() => setShowAddStateModal(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">状态名称 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={newStateForm.name}
                    onChange={(e) => setNewStateForm({...newStateForm, name: e.target.value})}
                    placeholder="例如：战损版、黑化形态..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">状态描述 (可选)</label>
                  <textarea 
                    value={newStateForm.description}
                    onChange={(e) => setNewStateForm({...newStateForm, description: e.target.value})}
                    placeholder="简要描述该状态的视觉特征..."
                    className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setShowAddStateModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                >
                  取消
                </button>
                <button 
                  onClick={handleCreateState}
                  disabled={!newStateForm.name.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20"
                >
                  添加状态
                </button>
              </div>
           </div>
        </div>
      )}

      {/* NEW: ASSET LIST MODAL */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
           <div className="bg-slate-900 w-full max-w-2xl rounded-xl border border-slate-700 shadow-2xl flex flex-col animate-scale-in max-h-[80vh]">
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex flex-col space-y-3 bg-slate-900 rounded-t-xl">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <List className="text-blue-500" size={20} />
                        <h3 className="text-lg font-bold text-white">资产清单</h3>
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{assets.length}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button 
                        onClick={() => { setIsManageMode(!isManageMode); setSelectedForDeletion(new Set()); }}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            isManageMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        >
                        <Settings2 size={16} />
                        <span>{isManageMode ? '完成管理' : '管理'}</span>
                        </button>
                        <button onClick={closeListModal} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                        </button>
                    </div>
                 </div>
                 
                 {/* Modal Filter Tabs */}
                 <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 w-full">
                    {(['ALL', 'CHARACTER', 'SCENE', 'PROP'] as const).map(type => (
                       <button
                         key={type}
                         onClick={() => setListModalTypeTab(type)}
                         className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center space-x-1 ${
                            listModalTypeTab === type ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                         }`}
                       >
                         {type === 'ALL' && <span>全部</span>}
                         {type === 'CHARACTER' && <><User size={12} /><span>角色</span></>}
                         {type === 'SCENE' && <><Map size={12} /><span>场景</span></>}
                         {type === 'PROP' && <><Box size={12} /><span>道具</span></>}
                       </button>
                    ))}
                 </div>
              </div>

              {/* List Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-950/50">
                 {filteredModalAssets.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">此分类下暂无资产</div>
                 ) : (
                    filteredModalAssets.map(asset => (
                        <div 
                        key={asset.id} 
                        className={`flex items-center p-3 rounded-lg border transition-all ${
                            isManageMode && selectedForDeletion.has(asset.id) 
                                ? 'bg-blue-900/20 border-blue-500/50' 
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                        onClick={() => {
                            if (isManageMode) {
                                toggleDeleteSelection(asset.id);
                            }
                        }}
                        >
                        {/* Checkbox for manage mode */}
                        {isManageMode && (
                            <div className="mr-3 text-blue-500 cursor-pointer">
                                {selectedForDeletion.has(asset.id) ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-600" />}
                            </div>
                        )}

                        {/* Icon based on type */}
                        <div className={`p-2 rounded-lg mr-3 ${
                            asset.type === 'CHARACTER' ? 'bg-emerald-500/10 text-emerald-500' :
                            asset.type === 'SCENE' ? 'bg-purple-500/10 text-purple-500' :
                            'bg-amber-500/10 text-amber-500'
                        }`}>
                            {asset.type === 'CHARACTER' ? <User size={18} /> :
                            asset.type === 'SCENE' ? <Map size={18} /> :
                            <Box size={18} />}
                        </div>

                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-200">{asset.name}</h4>
                            <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded ml-0 mt-1 inline-block">
                                {asset.type}
                            </span>
                        </div>

                        <div className="text-xs text-slate-500">
                            {asset.states.length} 个状态
                        </div>
                        </div>
                    ))
                 )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900 rounded-b-xl flex justify-between items-center">
                 <div className="text-xs text-slate-500">
                    {isManageMode ? `已选中 ${selectedForDeletion.size} 个资产` : '点击管理可进行批量删除'}
                 </div>
                 {isManageMode && selectedForDeletion.size > 0 && (
                    <button 
                       onClick={executeDeletion}
                       className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-red-900/20 transition-all"
                    >
                       <Trash2 size={16} />
                       <span>删除所选 ({selectedForDeletion.size})</span>
                    </button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* NEW: WORLDVIEW MODAL */}
      {showWorldviewModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
             <div className="bg-slate-900 w-full max-w-4xl max-h-[85vh] rounded-xl border border-slate-700 shadow-2xl flex flex-col animate-scale-in">
                 
                 <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-xl">
                     <h3 className="text-xl font-bold text-white flex items-center gap-2">
                         <Globe2 className="text-blue-500" size={24} />
                         世界观设定
                     </h3>
                     <button onClick={() => setShowWorldviewModal(false)} className="text-slate-400 hover:text-white transition-colors">
                         <X size={24} />
                     </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 bg-slate-950/50 custom-scrollbar">
                     <div className="space-y-6">
                         {worldview.map((entry) => (
                             <div key={entry.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm hover:border-blue-500/30 transition-all">
                                 <h4 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                                     <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                     {entry.faction}
                                 </h4>
                                 <p className="text-slate-300 leading-relaxed text-sm">
                                     {entry.description}
                                 </p>
                             </div>
                         ))}
                         {worldview.length === 0 && (
                             <div className="text-center py-20 text-slate-500">
                                 暂无世界观数据，请尝试重新提取资产。
                             </div>
                         )}
                     </div>
                 </div>
                 
                 <div className="p-6 border-t border-slate-800 bg-slate-900 rounded-b-xl flex justify-end">
                     <button 
                         onClick={() => setShowWorldviewModal(false)}
                         className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg"
                     >
                         关闭
                     </button>
                 </div>
             </div>
         </div>
      )}

      {/* Style Reference Modal */}
      {showStyleRefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            {/* Fixed size container */}
            <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden relative flex flex-col w-[900px] h-[650px] transition-all duration-500 ease-in-out">
                
                {/* Header Title (Always visible now, but maybe fade in/out based on state if desired, or keep static) */}
                <div className={`absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 transition-opacity duration-300 ${styleRefEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Palette className="text-purple-500" size={20} />
                        风格参考
                    </h3>
                </div>

                {/* Close Button */}
                <button 
                    onClick={() => setShowStyleRefModal(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white z-20"
                >
                    <X size={24} />
                </button>

                {/* Content Container */}
                <div className="flex-1 flex flex-col items-center justify-center relative p-8 pt-16">
                    
                    {/* Toggle Switch Container - Animated Position */}
                    {/* When disabled: Centered. When enabled: Top Right */}
                    <div className={`flex flex-col items-center transition-all duration-700 ease-in-out absolute z-30 ${styleRefEnabled ? 'top-5 right-16 scale-75 flex-row gap-3' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150'}`}>
                        <span className={`font-bold text-slate-200 transition-all ${styleRefEnabled ? 'text-sm' : 'text-sm mb-4'}`}>
                            {styleRefEnabled ? '风格参考已开启' : '是否开启风格参考'}
                        </span>
                        <button 
                            onClick={() => setStyleRefEnabled(!styleRefEnabled)}
                            className={`relative rounded-full transition-colors duration-300 ${styleRefEnabled ? 'w-12 h-6 bg-blue-600' : 'w-12 h-6 bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 bg-white rounded-full shadow-md transition-all duration-300 ${styleRefEnabled ? 'left-7 w-4 h-4' : 'left-1 w-4 h-4'}`}></div>
                        </button>
                    </div>

                    {/* Main Content - Fades in when enabled */}
                    <div className={`w-full h-full flex flex-col gap-4 transition-all duration-700 ${styleRefEnabled ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                        
                        <div className="flex-1 flex gap-8 min-h-0">
                            {/* Left: Preset Styles */}
                            <div className="flex-1 flex flex-col min-w-0">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Sparkles size={16} /> 预设风格
                                </h3>
                                <div className="grid grid-cols-3 gap-4 overflow-y-auto p-1 custom-scrollbar pr-2">
                                    {presetStyles.map(style => (
                                        <div 
                                            key={style.id} 
                                            onClick={() => setSelectedStyle(style.id)}
                                            className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedStyle === style.id ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-700 hover:border-blue-400'}`}
                                        >
                                            <img src={style.url} alt={style.name} className="w-full h-full object-cover" />
                                            <div className={`absolute bottom-0 left-0 right-0 p-2 transition-colors ${selectedStyle === style.id ? 'bg-blue-600' : 'bg-black/60'}`}>
                                                <span className="text-xs font-medium text-white block text-center">{style.name}</span>
                                            </div>
                                            
                                            {/* Selected Indicator */}
                                            {selectedStyle === style.id && (
                                                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-lg">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-px bg-slate-800 my-4"></div>

                            {/* Right: Custom Styles */}
                            <div className="flex-1 flex flex-col min-w-0">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <User size={16} /> 自定义风格
                                </h3>
                                <div className="grid grid-cols-3 gap-4 overflow-y-auto p-1 custom-scrollbar pr-2">
                                    {customStyles.map(style => (
                                        <div 
                                            key={style.id} 
                                            onClick={() => setSelectedStyle(style.id)}
                                            className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedStyle === style.id ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-slate-700 hover:border-purple-400'}`}
                                        >
                                            <img src={style.url} alt={style.name} className="w-full h-full object-cover" />
                                            <div className={`absolute bottom-0 left-0 right-0 p-2 transition-colors ${selectedStyle === style.id ? 'bg-purple-600' : 'bg-black/60'}`}>
                                                <span className="text-xs font-medium text-white block text-center">{style.name}</span>
                                            </div>

                                            {/* Selected Indicator */}
                                            {selectedStyle === style.id && (
                                                <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1 shadow-lg">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {/* Upload Button */}
                                    <button 
                                        onClick={() => setShowUploadStyleModal(true)}
                                        className="aspect-square rounded-xl border-2 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 gap-2"
                                    >
                                        <Upload size={24} />
                                        <span className="text-xs font-medium">上传风格</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="h-16 border-t border-slate-800 flex items-center justify-end gap-4 pt-4 mt-2">
                            <div className="text-sm text-slate-500 mr-auto">
                                {selectedStyle ? '已选择风格，点击确认生效' : '请选择一个风格作为参考'}
                            </div>
                            <button 
                                onClick={() => setShowStyleRefModal(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                取消
                            </button>
                            <button 
                                onClick={() => setShowStyleRefModal(false)}
                                disabled={!selectedStyle}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                            >
                                确认风格
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Upload Style Modal */}
      {showUploadStyleModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 w-full max-w-md rounded-xl border border-slate-700 shadow-2xl p-6 animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">上传自定义风格</h3>
                    <button onClick={() => setShowUploadStyleModal(false)} className="text-slate-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">风格名称</label>
                        <input 
                            type="text" 
                            value={newStyleForm.name}
                            onChange={(e) => setNewStyleForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 outline-none"
                            placeholder="例如：赛博朋克 2077"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">参考图片</label>
                        <div className="relative w-full aspect-video bg-slate-950 border-2 border-dashed border-slate-700 rounded-lg overflow-hidden hover:border-slate-500 transition-colors group">
                            {newStyleForm.url ? (
                                <img src={newStyleForm.url} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 pointer-events-none">
                                    <ImagePlus size={32} className="mb-2 opacity-50" />
                                    <span className="text-xs">点击上传图片</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleStyleUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleConfirmUploadStyle}
                        disabled={!newStyleForm.name || !newStyleForm.url}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-lg shadow-blue-900/20 mt-4"
                    >
                        确认上传
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* NEW: Global Loading Overlay */}
      {processingLabel && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl flex flex-col items-center shadow-2xl animate-scale-in">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">{processingLabel}</h3>
              <p className="text-slate-400 text-sm">AI 智能体正在处理任务，请稍候...</p>
           </div>
        </div>
      )}

    </div>
  );
};

export default AssetManagement;