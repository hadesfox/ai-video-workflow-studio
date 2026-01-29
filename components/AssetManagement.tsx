import React, { useState, useMemo, useRef } from 'react';
import { Asset, AssetState, AssetSubTab, WorldviewEntry } from '../types';
import { Layers, Wand2, RefreshCw, Mic, Volume2, Sparkles, FileSearch, ImagePlus, User, Map, Box, X, ChevronRight, Check, Search, Settings2, Trash2, CheckSquare, Square, LayoutTemplate, List, AlertCircle, Play, Upload, Plus, Loader2, Globe2 } from 'lucide-react';

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

  // Generation State
  const [processingLabel, setProcessingLabel] = useState<string | null>(null); // Global processing label (extract/detail/gen)
  const [isRegenerating, setIsRegenerating] = useState(false); // Single image regeneration
  const [searchTerm, setSearchTerm] = useState('');
  
  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Automatically select the first asset if none selected
      if (!selectedAssetId && skeletonAssets.length > 0) {
        setSelectedAssetId(skeletonAssets[0].id);
      }
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

  // 修改：一键生图 (只针对有 prompt 的状态)
  const handleOneClickGen = () => {
    setProcessingLabel('正在批量生成资产图像...');
    setTimeout(() => {
      setAssets(prev => prev.map(a => {
        const newStates = a.states.map(s => {
          // 如果没有 prompt，则跳过生成
          if (!s.prompt) return s;

          return {
            ...s,
            mainImageUrl: s.mainImageUrl || `https://picsum.photos/seed/${s.id}/800/600`, // Don't overwrite if exists
            thumbnailUrls: s.thumbnailUrls.length > 0 ? s.thumbnailUrls : [
              `https://picsum.photos/seed/${s.id}1/200/200`,
              `https://picsum.photos/seed/${s.id}2/200/200`,
              `https://picsum.photos/seed/${s.id}3/200/200`,
              `https://picsum.photos/seed/${s.id}4/200/200`,
            ]
          };
        });
        
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

  // --- SubTab Handling ---
  if (subTab === AssetSubTab.TTS) {
     return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in p-8">
           <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-xl font-semibold text-white">TTS 配音生成</h3>
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

  // --- Layout: Master-Detail ---
  return (
    <div className="flex flex-col h-full animate-fade-in overflow-hidden relative">
      
      {/* 1. Global Actions Toolbar (Fixed Top) */}
      <div className="h-16 shrink-0 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between px-6 z-20">
         <div className="flex items-center space-x-3">
            <span className="font-bold text-lg text-slate-100">资产库</span>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">{assets.length}</span>
         </div>
         <div className="flex space-x-3">
           {/* Add New Asset Button */}
           <button 
             onClick={() => setShowAddModal(true)}
             disabled={!!processingLabel}
             className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg border border-emerald-600 transition-colors text-sm shadow-md shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Plus size={16} />
             <span>新建资产</span>
           </button>

           <div className="h-6 w-px bg-slate-700 mx-2"></div>

           {/* Worldview Button */}
           {worldview.length > 0 && (
               <button 
                 onClick={() => setShowWorldviewModal(true)}
                 className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg border border-slate-700 transition-colors text-sm"
               >
                 <Globe2 size={14} />
                 <span>查看世界观</span>
               </button>
           )}

           <button 
             onClick={handleExtractAssets}
             disabled={!!processingLabel}
             className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <FileSearch size={14} />
             <span>提取资产</span>
           </button>
           <button 
             onClick={handleGenerateDetails}
             disabled={!!processingLabel || assets.length === 0}
             className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-900/50 hover:bg-indigo-900 text-indigo-200 rounded-lg border border-indigo-800 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Sparkles size={14} />
             <span>生成详情</span>
           </button>
           <button 
             onClick={handleOneClickGen}
             disabled={!!processingLabel || assets.length === 0}
             className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/30 transition-transform active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
             title="仅对已生成详情（包含Prompt）的资产状态生效"
           >
             <ImagePlus size={14} />
             <span>一键生图</span>
           </button>
         </div>
      </div>

      {/* 2. Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
         
         {/* LEFT SIDEBAR: Asset List */}
         <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-10">
            
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-800 space-y-3">
               {/* Search */}
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                     type="text" 
                     placeholder="搜索资产..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none placeholder:text-slate-600"
                  />
               </div>
               
               {/* Controls Row */}
               <div className="flex justify-between items-center">
                  <div className="flex space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    {(['ALL', 'CHARACTER', 'SCENE', 'PROP'] as const).map(type => (
                       <button
                         key={type}
                         onClick={() => setActiveTypeTab(type)}
                         title={type}
                         className={`p-1.5 rounded transition-colors ${activeTypeTab === type ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                       >
                         {type === 'ALL' && <LayoutTemplate size={14} />}
                         {type === 'CHARACTER' && <User size={14} />}
                         {type === 'SCENE' && <Map size={14} />}
                         {type === 'PROP' && <Box size={14} />}
                       </button>
                    ))}
                  </div>
                  <button 
                     onClick={() => setShowListModal(true)}
                     disabled={assets.length === 0}
                     className={`p-1.5 rounded-lg transition-colors border ${assets.length > 0 ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-transparent text-slate-600 cursor-not-allowed'}`}
                     title="资产清单与管理"
                  >
                     <List size={16} />
                  </button>
               </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
               {assets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-600 text-xs text-center px-4">
                     <Layers size={24} className="mb-2 opacity-30" />
                     <p>暂无资产，请点击右上角"新建资产"或"提取资产"</p>
                  </div>
               ) : filteredAssets.length === 0 ? (
                  <div className="text-center text-slate-600 text-xs mt-4">未找到匹配项</div>
               ) : (
                  filteredAssets.map(asset => (
                     <div 
                        key={asset.id} 
                        onClick={() => setSelectedAssetId(asset.id)}
                        className={`
                           group flex items-center p-2 rounded-lg cursor-pointer transition-all border
                           ${selectedAssetId === asset.id
                              ? 'bg-blue-600 border-blue-500 shadow-md shadow-blue-900/20' 
                              : 'bg-transparent border-transparent hover:bg-slate-800 hover:border-slate-700'
                           }
                        `}
                     >
                        {/* Icon */}
                        <div className={`
                           p-1.5 rounded-md mr-3 shrink-0 transition-colors
                           ${selectedAssetId === asset.id 
                              ? 'bg-white/20 text-white' 
                              : asset.type === 'CHARACTER' ? 'bg-emerald-500/10 text-emerald-500' 
                              : asset.type === 'SCENE' ? 'bg-purple-500/10 text-purple-500' 
                              : 'bg-amber-500/10 text-amber-500'
                           }
                        `}>
                           {asset.type === 'CHARACTER' ? <User size={16} /> :
                            asset.type === 'SCENE' ? <Map size={16} /> :
                            <Box size={16} />}
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 min-w-0">
                           <div className={`text-sm font-medium truncate ${selectedAssetId === asset.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                              {asset.name}
                           </div>
                           <div className={`text-[10px] truncate ${selectedAssetId === asset.id ? 'text-blue-200' : 'text-slate-500'}`}>
                              {asset.states.length} 个状态 · {asset.type}
                           </div>
                        </div>

                        {/* Arrow */}
                        {selectedAssetId === asset.id && (
                           <ChevronRight size={14} className="text-white ml-2 shrink-0" />
                        )}
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* RIGHT CONTENT: Details */}
         <div className="flex-1 overflow-y-auto bg-slate-950/50 p-8 relative scroll-smooth">
            {activeAsset ? (
               <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                  
                  {/* Header Info */}
                  <div className="flex flex-col space-y-4 border-b border-slate-800 pb-6">
                     <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                            activeAsset.type === 'CHARACTER' ? 'bg-emerald-500/10 text-emerald-500' :
                            activeAsset.type === 'SCENE' ? 'bg-purple-500/10 text-purple-500' :
                            'bg-amber-500/10 text-amber-500'
                        }`}>
                           {activeAsset.type === 'CHARACTER' ? <User size={24} /> :
                            activeAsset.type === 'SCENE' ? <Map size={24} /> :
                            <Box size={24} />}
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{activeAsset.name}</h1>
                     </div>
                     <p className="text-slate-400 text-lg leading-relaxed max-w-4xl min-h-[1.75rem]">
                        {activeAsset.description}
                     </p>
                  </div>

                  {/* States Grid */}
                  <div>
                     <div className="flex items-center space-x-2 mb-6">
                        <Layers className="text-blue-500" size={20} />
                        <h2 className="text-xl font-semibold text-white">状态视图 (States)</h2>
                        <span className="text-sm text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">{activeAsset.states.length}</span>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {activeAsset.states.map((state) => (
                           <div key={state.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-blue-500/30 transition-all hover:shadow-xl group relative">
                              
                              {/* Image Area */}
                              <div className="aspect-[4/3] bg-black relative">
                                 {state.mainImageUrl ? (
                                    <img src={state.mainImageUrl} alt={state.name} className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-950">
                                       <ImagePlus size={32} />
                                       <span className="text-xs mt-2">点击上传/生成</span>
                                    </div>
                                 )}
                                 
                                 {/* Hover Action */}
                                 <div 
                                    onClick={() => setSelectedStateId(state.id)}
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center backdrop-blur-[1px]"
                                 >
                                    <button className="bg-white text-slate-900 font-semibold px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                       <FileSearch size={16} />
                                       <span>查看详情</span>
                                    </button>
                                 </div>
                              </div>

                              {/* Thumbnail Strip */}
                              {state.thumbnailUrls.length > 0 && (
                                 <div className="flex space-x-1.5 p-2 bg-slate-950 border-y border-slate-800 overflow-x-auto scrollbar-hide">
                                    {state.thumbnailUrls.map((url, idx) => (
                                       <button 
                                          key={idx}
                                          onClick={(e) => { e.stopPropagation(); setMainImageForState(activeAsset.id, state.id, url); }}
                                          className="w-10 h-10 shrink-0 rounded border border-slate-800 hover:border-blue-500 overflow-hidden transition-colors"
                                       >
                                          <img src={url} className="w-full h-full object-cover" alt="" />
                                       </button>
                                    ))}
                                 </div>
                              )}

                              {/* Info */}
                              <div className="p-4 flex-1 relative">
                                 <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-slate-200">{state.name}</h3>
                                    {state.mainImageUrl && <Check size={14} className="text-emerald-500" />}
                                 </div>
                                 <div className="text-xs text-slate-500 line-clamp-3 leading-relaxed min-h-[3em]">
                                    {state.description || <span className="italic opacity-50">暂无描述...</span>}
                                 </div>

                                 {/* Delete State Button (Bottom Right) */}
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteState(activeAsset.id, state.id); }}
                                    className="absolute bottom-2 right-2 p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                    title="删除此状态"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                        ))}

                        {/* Add New State Card */}
                        <div 
                          onClick={() => setShowAddStateModal(true)}
                          className="bg-slate-900/50 border-2 border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[280px]"
                        >
                           <div className="bg-slate-800 group-hover:bg-blue-600/20 group-hover:text-blue-400 text-slate-600 p-4 rounded-full transition-colors mb-3">
                              <Plus size={32} />
                           </div>
                           <h3 className="text-sm font-bold text-slate-400 group-hover:text-blue-400 transition-colors">添加新状态</h3>
                           <p className="text-xs text-slate-600 mt-1">创建变体或新视角</p>
                        </div>
                     </div>
                  </div>
               </div>
            ) : (
               // Empty State / Welcome
               <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                     <LayoutTemplate size={32} className="opacity-50" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-300 mb-2">选择资产以查看详情</h3>
                  <p className="max-w-md text-center text-sm">
                     请从左侧列表中选择一个资产，或者点击顶部的 "提取资产" / "新建资产" 来开始工作流程。
                  </p>
               </div>
            )}
         </div>

      </div>

      {/* 3. Detail Modal (Level 3 - Popup) */}
      {activeAsset && activeModalState && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-scale-in">
              
               {/* Modal Header */}
               <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                  <div className="flex items-center space-x-4">
                     <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                           <span className="text-slate-400">{activeAsset.name}</span>
                           <ChevronRight size={18} className="text-slate-600"/>
                           <span className="text-blue-400">{activeModalState.name}</span>
                        </h2>
                     </div>
                  </div>
                  <button onClick={() => setSelectedStateId(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                    <X size={24} />
                  </button>
               </div>

               {/* Modal Body */}
               <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-900">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                     
                     {/* Left Column: Visuals */}
                     <div className="lg:col-span-5 space-y-4">
                        <div className="aspect-square bg-black rounded-xl overflow-hidden border border-slate-700 shadow-lg relative group">
                           {activeModalState.mainImageUrl ? (
                             <img src={activeModalState.mainImageUrl} className={`w-full h-full object-cover transition-opacity ${isRegenerating ? 'opacity-50' : 'opacity-100'}`} alt="" />
                           ) : (
                             <div className="flex flex-col items-center justify-center h-full text-slate-600 bg-slate-950">
                               <ImagePlus size={48} className="mb-2"/>
                               <span>暂无预览图</span>
                             </div>
                           )}

                           {/* Loading Overlay */}
                           {isRegenerating && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                                <RefreshCw className="animate-spin text-white mb-2" size={32} />
                                <span className="text-white text-sm font-medium">生成中...</span>
                              </div>
                           )}
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                           {/* Main Image in Grid */}
                           {activeModalState.mainImageUrl && (
                              <div className="aspect-square rounded-lg border-2 border-blue-500 ring-2 ring-blue-500/20 overflow-hidden relative group">
                                <img src={activeModalState.mainImageUrl} className="w-full h-full object-cover" alt="" />
                                <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold shadow-sm z-10">主图</span>
                                <button 
                                  onClick={(e) => { 
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    handleDeleteImage(activeAsset.id, activeModalState.id, activeModalState.mainImageUrl!); 
                                  }}
                                  className="absolute bottom-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-20 shadow-sm"
                                  title="删除此图片"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                           )}

                           {/* Thumbnails */}
                           {activeModalState.thumbnailUrls.map((url, idx) => (
                             <div 
                               key={idx} 
                               onClick={() => setMainImageForState(activeAsset.id, activeModalState.id, url)}
                               className="aspect-square rounded-lg border border-slate-700 overflow-hidden cursor-pointer hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20 transition-all relative group"
                             >
                               <img src={url} className="w-full h-full object-cover" alt="" />
                               <button 
                                  onClick={(e) => { 
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    handleDeleteImage(activeAsset.id, activeModalState.id, url); 
                                  }}
                                  className="absolute bottom-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-20 shadow-sm"
                                  title="删除此图片"
                                >
                                  <Trash2 size={14} />
                                </button>
                             </div>
                           ))}

                           {/* Upload Button */}
                           <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-square rounded-lg border border-dashed border-slate-700 hover:border-blue-500 hover:bg-slate-800 transition-all flex flex-col items-center justify-center text-slate-500 hover:text-blue-400 group"
                              title="上传参考图/替换图"
                           >
                              <Upload size={24} className="mb-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                              <span className="text-[10px]">上传图片</span>
                           </button>
                        </div>
                        
                        {/* Hidden Input */}
                        <input 
                           type="file"
                           ref={fileInputRef}
                           className="hidden"
                           accept="image/*"
                           onChange={handleImageUpload}
                        />
                     </div>

                     {/* Right Column: Information */}
                     <div className="lg:col-span-7 space-y-6">
                        
                        {/* Prompt (Editable) */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-inner">
                           <div className="flex justify-between items-center mb-3">
                              <label className="flex items-center space-x-2 text-sm font-bold text-blue-400">
                                  <Sparkles size={16} />
                                  <span>生图提示词 (Prompt)</span>
                              </label>
                              <div className="flex space-x-2">
                                <button className="text-xs text-slate-500 hover:text-blue-300 flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors">
                                    <RefreshCw size={12}/> <span>优化词条</span>
                                </button>
                              </div>
                           </div>
                           
                           {/* Show reference image from Initial State if we are NOT viewing the initial state */}
                           {!isViewingInitialState && initialAssetState && initialAssetState.mainImageUrl && (
                              <div className="mb-4 bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center gap-3">
                                 <div className="w-16 h-16 rounded bg-black overflow-hidden shrink-0 border border-slate-700">
                                    <img src={initialAssetState.mainImageUrl} alt="Reference" className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">参考图 (Reference)</div>
                                    <div className="text-xs text-slate-500">
                                       来自: <span className="text-blue-400">{initialAssetState.name}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-600 mt-1">
                                       基于此常规状态进行图生图变体生成。
                                    </div>
                                 </div>
                              </div>
                           )}

                           <div className="relative">
                              <textarea 
                                value={activeModalState.prompt || ''}
                                onChange={(e) => handlePromptChange(e.target.value)}
                                className="w-full h-40 bg-black/30 text-sm text-slate-300 font-mono leading-relaxed p-3 rounded border border-slate-800/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none resize-none custom-scrollbar transition-all placeholder:text-slate-600"
                                placeholder="输入详细的画面描述..."
                              />
                           </div>

                           {/* Regenerate Action */}
                           <div className="mt-4 flex justify-end border-t border-slate-800 pt-3">
                              <button 
                                onClick={handleRegenerateSingleImage}
                                disabled={isRegenerating || !activeModalState.prompt}
                                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20 transition-all transform active:scale-95"
                              >
                                 <Play size={14} className="fill-white" />
                                 <span>{isRegenerating ? "生成中..." : "立即生成"}</span>
                              </button>
                           </div>
                        </div>

                        {/* Description */}
                        <div>
                           <label className="block text-sm font-bold text-slate-400 mb-2 pl-1">状态简介</label>
                           <p className="text-base text-slate-200 bg-slate-800/50 p-4 rounded-xl border border-slate-800 leading-relaxed min-h-[4rem]">
                             {activeModalState.description || <span className="text-slate-600 italic">暂无描述...</span>}
                           </p>
                        </div>

                        {/* Attributes */}
                        <div>
                           <label className="block text-sm font-bold text-slate-400 mb-3 pl-1">详细特征 (Attributes)</label>
                           {activeModalState.attributes ? (
                             <div className="grid grid-cols-2 gap-3">
                                {Object.entries(activeModalState.attributes).map(([key, value]) => (
                                  <div key={key} className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/50 flex flex-col group hover:border-slate-600 transition-colors">
                                     <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 group-hover:text-slate-400">{key}</span>
                                     <span className="text-sm text-white font-medium">{value}</span>
                                  </div>
                                ))}
                             </div>
                           ) : (
                             <div className="text-sm text-slate-500 italic p-4 border border-dashed border-slate-800 rounded-lg text-center">
                               暂无详细特征数据，可点击上方"生成详情"或手动完善
                             </div>
                           )}
                        </div>

                     </div>
                  </div>
               </div>

               {/* Modal Footer */}
               <div className="p-4 border-t border-slate-700 bg-slate-800 flex justify-end space-x-3 shrink-0">
                  <button onClick={() => setSelectedStateId(null)} className="px-5 py-2.5 text-sm text-slate-400 hover:text-white rounded-lg transition-colors">
                    关闭
                  </button>
               </div>
            </div>
         </div>
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