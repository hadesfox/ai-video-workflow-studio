import React, { useState, useEffect, useMemo } from 'react';
import { Asset, AssetState } from '../types';
import { Database, ArrowRight, Trash2, Search, CloudUpload, X, Edit2, Save, MoreHorizontal, Image as ImageIcon, Wand2, CheckCircle2, AlertCircle, Sidebar, PanelLeftClose, PanelLeftOpen, FileDiff, RefreshCw, AlertTriangle, ArrowUp, ArrowDown, ArrowRightLeft, Link as LinkIcon, Unlink, Info } from 'lucide-react';

interface StageMasterLibProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  onNext: () => void;
}

// 定义主体库条目的独立接口
interface MasterItem {
  uid: string; // 唯一ID (assetId-stateId)
  originalAssetId: string;
  originalStateId: string;
  name: string; // 资产名 - 状态名
  style: string; // 视觉风格 (e.g. 3D, 2D, 真人)
  description: string;
  imageUrl: string;
  createdAt: number;
}

const StageMasterLib: React.FC<StageMasterLibProps> = ({ assets, setAssets, onNext }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // 本地维护主体库列表，模拟独立存储
  const [masterLibrary, setMasterLibrary] = useState<MasterItem[]>([]);

  // 弹窗相关状态
  const [selectedItem, setSelectedItem] = useState<MasterItem | null>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', style: '', description: '' });

  // 排序状态: 'SYNCED_FIRST' (向上箭头) | 'UNSYNCED_FIRST' (向下箭头)
  const [sortOrder, setSortOrder] = useState<'SYNCED_FIRST' | 'UNSYNCED_FIRST'>('UNSYNCED_FIRST');

  // 模拟 AI 识别图片风格的函数
  const mockAIStyleDetection = (type: string) => {
    const styles = [
      '真人写实', '3D 渲染', '赛博朋克插画', '二次元', '油画风格', '电影质感', '概念设计'
    ];
    if (type === 'CHARACTER') return Math.random() > 0.5 ? '真人写实' : '赛博朋克插画';
    if (type === 'SCENE') return '电影质感';
    if (type === 'PROP') return '3D 渲染';
    return styles[Math.floor(Math.random() * styles.length)];
  };

  // 初始化：为了演示，如果主体库为空，我们假设 assets 中标记为 inMasterLib 的资产的第一个状态已入库
  useEffect(() => {
    if (masterLibrary.length === 0 && assets.length > 0) {
      const initialItems: MasterItem[] = [];
      assets.filter(a => a.inMasterLib).forEach(asset => {
        if (asset.states.length > 0) {
          const state = asset.states[0];
          // 只有有图片的才模拟初始化
          if (state.mainImageUrl) {
            initialItems.push({
                uid: `${asset.id}-${state.id}`,
                originalAssetId: asset.id,
                originalStateId: state.id,
                name: `${asset.name} - ${state.name}`,
                style: mockAIStyleDetection(asset.type),
                description: state.description,
                imageUrl: state.mainImageUrl,
                createdAt: Date.now()
            });
          }
        }
      });
      setMasterLibrary(initialItems);
    }
  }, []);

  // 1. 获取所有可能的“资产-状态”组合（左侧列表源）
  const allLocalCandidates = useMemo(() => {
    const candidates: { asset: Asset; state: AssetState; uid: string }[] = [];
    assets.forEach(asset => {
      asset.states.forEach(state => {
        candidates.push({
          asset,
          state,
          uid: `${asset.id}-${state.id}`
        });
      });
    });
    return candidates;
  }, [assets]);

  // 2. 过滤出未同步的条目 (本地有，主体库无)
  const unsyncedItems = useMemo(() => {
    const syncedIds = new Set(masterLibrary.map(item => item.uid));
    return allLocalCandidates.filter(c => !syncedIds.has(c.uid));
  }, [allLocalCandidates, masterLibrary]);

  // 3. 计算可批量同步的条目（必须有图片）
  const readyToSyncItems = useMemo(() => {
    return unsyncedItems.filter(item => !!item.state.mainImageUrl);
  }, [unsyncedItems]);

  // 4. 构建比对行数据 (Diff Logic)
  const comparisonRows = useMemo(() => {
    const rows = new Map<string, {
      uid: string;
      local?: { asset: Asset; state: AssetState };
      master?: MasterItem;
      status: 'SYNCED' | 'LOCAL_ONLY' | 'MASTER_ONLY';
    }>();

    // 填入本地
    allLocalCandidates.forEach(item => {
      rows.set(item.uid, { uid: item.uid, local: item, status: 'LOCAL_ONLY' });
    });

    // 填入主体库并更新状态
    masterLibrary.forEach(item => {
      if (rows.has(item.uid)) {
        const row = rows.get(item.uid)!;
        row.master = item;
        row.status = 'SYNCED';
      } else {
        rows.set(item.uid, { uid: item.uid, master: item, status: 'MASTER_ONLY' });
      }
    });

    const result = Array.from(rows.values());

    // 排序逻辑
    return result.sort((a, b) => {
      // 权重计算
      const getWeight = (status: string) => {
        if (sortOrder === 'UNSYNCED_FIRST') {
          if (status === 'LOCAL_ONLY') return 2;
          if (status === 'MASTER_ONLY') return 2;
          return 0; // SYNCED
        } else {
          if (status === 'SYNCED') return 2;
          return 0; // OTHERS
        }
      };

      return getWeight(b.status) - getWeight(a.status);
    });

  }, [allLocalCandidates, masterLibrary, sortOrder]);
  
  // 5. 统计数据
  const diffStats = useMemo(() => ({
    localTotal: allLocalCandidates.length,
    masterTotal: masterLibrary.length,
    pendingSync: unsyncedItems.length,
    orphans: comparisonRows.filter(r => r.status === 'MASTER_ONLY').length
  }), [allLocalCandidates.length, masterLibrary.length, unsyncedItems.length, comparisonRows]);


  // --- Actions ---

  const handleSync = (candidate: { asset: Asset; state: AssetState; uid: string }) => {
    if (!candidate.state.mainImageUrl) return; // 双重检查

    // 模拟上传过程中的 AI 分析
    const detectedStyle = mockAIStyleDetection(candidate.asset.type);

    const newItem: MasterItem = {
      uid: candidate.uid,
      originalAssetId: candidate.asset.id,
      originalStateId: candidate.state.id,
      name: `${candidate.asset.name} - ${candidate.state.name}`,
      style: detectedStyle,
      description: candidate.state.description,
      imageUrl: candidate.state.mainImageUrl,
      createdAt: Date.now()
    };
    setMasterLibrary(prev => [newItem, ...prev]);
  };

  // 批量同步功能
  const handleBatchSync = () => {
    if (readyToSyncItems.length === 0) return;

    const newItems: MasterItem[] = readyToSyncItems.map(candidate => ({
      uid: candidate.uid,
      originalAssetId: candidate.asset.id,
      originalStateId: candidate.state.id,
      name: `${candidate.asset.name} - ${candidate.state.name}`,
      style: mockAIStyleDetection(candidate.asset.type),
      description: candidate.state.description,
      imageUrl: candidate.state.mainImageUrl!, // 确信有值
      createdAt: Date.now()
    }));

    setMasterLibrary(prev => [...newItems, ...prev]);
  };

  const handleDelete = (uid: string) => {
    if (confirm('确定要从主体库中移除此资产吗？（本地资产不会被删除）')) {
      setMasterLibrary(prev => prev.filter(item => item.uid !== uid));
      setSelectedItem(null);
    }
  };

  const openDetail = (item: MasterItem) => {
    setSelectedItem(item);
    setIsEditing(false);
    setEditForm({
      name: item.name,
      style: item.style,
      description: item.description
    });
  };

  const handleSaveEdit = () => {
    if (!selectedItem) return;
    setMasterLibrary(prev => prev.map(item => 
      item.uid === selectedItem.uid 
        ? { ...item, ...editForm }
        : item
    ));
    setSelectedItem(prev => prev ? { ...prev, ...editForm } : null);
    setIsEditing(false);
  };

  // --- Render ---

  return (
    <div className="h-full flex overflow-hidden bg-slate-950 animate-fade-in relative">
      
      {/* Sidebar Toggle Button (When collapsed) */}
      {!isSidebarOpen && (
         <div className="absolute top-4 left-4 z-20">
            <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 shadow-lg"
               title="展开侧边栏"
            >
               <PanelLeftOpen size={20} />
            </button>
         </div>
      )}

      {/* Left Drawer: Unsynced Local Assets */}
      <div 
        className={`bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-10 transition-all duration-300 ease-in-out relative ${
           isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full opacity-0 overflow-hidden'
        }`}
      >
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
               <CloudUpload size={16} className="text-slate-500"/>
               待同步资产
            </h3>
            <div className="flex items-center gap-2">
               <span className="bg-slate-800 text-xs px-2 py-0.5 rounded-full text-slate-400 border border-slate-700">
                  {unsyncedItems.length}
               </span>
               <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white"
                  title="收起侧边栏"
               >
                  <PanelLeftClose size={16} />
               </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* 比对资产按钮 */}
            <button 
              onClick={() => setShowDiffModal(true)}
              className="w-full py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
               <FileDiff size={14} />
               <span>比对资产清单</span>
            </button>

            {/* 一键同步按钮 */}
            <button 
              onClick={handleBatchSync}
              disabled={readyToSyncItems.length === 0}
              className={`w-full py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                readyToSyncItems.length > 0 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
               <CheckCircle2 size={14} />
               <span>一键同步 ({readyToSyncItems.length} 个可用)</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {unsyncedItems.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-40 text-slate-600 text-xs">
                <CheckCircle2 size={24} className="mb-2 opacity-20" />
                <p>所有状态已同步完成</p>
             </div>
          ) : (
             unsyncedItems.map(({ asset, state, uid }) => {
               const hasImage = !!state.mainImageUrl;
               
               return (
                <div key={uid} className={`flex items-center p-2.5 border rounded-lg transition-all ${
                  hasImage 
                    ? 'bg-slate-950/50 border-slate-800 group hover:border-blue-500/50 hover:bg-slate-900' 
                    : 'bg-slate-900/30 border-slate-800/50 opacity-60'
                }`}>
                    {/* Thumbnail */}
                    <div className="w-12 h-12 bg-black rounded overflow-hidden shrink-0 border border-slate-800 relative">
                      {hasImage ? (
                        <img src={state.mainImageUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-slate-700 bg-slate-950">
                          <AlertCircle size={16} className="text-amber-700"/>
                        </div>
                      )}
                      {/* State Badge */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white text-center py-0.5 truncate">
                        {state.name}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate" title={`${asset.name} - ${state.name}`}>
                        {asset.name}
                      </p>
                      {hasImage ? (
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {state.description || "暂无描述"}
                        </p>
                      ) : (
                        <p className="text-[10px] text-amber-600 truncate mt-0.5 flex items-center">
                          需生成图片后同步
                        </p>
                      )}
                    </div>

                    {/* Action */}
                    <button 
                      onClick={() => handleSync({ asset, state, uid })}
                      disabled={!hasImage}
                      className={`p-2 rounded-lg transition-colors ${
                        hasImage 
                          ? 'text-blue-500 hover:bg-blue-500/20 cursor-pointer' 
                          : 'text-slate-600 cursor-not-allowed'
                      }`}
                      title={hasImage ? "上传至主体库" : "请先在资产管理生成图片"}
                    >
                      <ArrowRight size={18} />
                    </button>
                </div>
               );
             })
          )}
        </div>
      </div>

      {/* Right Content: Master Library Grid */}
      <div className={`flex-1 flex flex-col bg-slate-950 relative transition-all duration-300 ${!isSidebarOpen ? 'pl-0' : ''}`}>
         
         {/* Search Bar (Functional Header) */}
         <div className="h-14 border-b border-slate-800 flex items-center px-6 bg-slate-900/50 backdrop-blur justify-between pl-14 md:pl-6">
            <div className="flex items-center text-slate-300 gap-2">
               <Database size={18} className="text-emerald-500" />
               <span className="font-semibold">Vidu 主体库</span>
            </div>
            
            <div className="relative w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
               <input 
                  type="text" 
                  placeholder="搜索库中主体..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
               />
            </div>
         </div>

         {/* Grid Content */}
         <div className="flex-1 overflow-y-auto p-6 bg-grid-pattern">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
               {masterLibrary
                 .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                 .map(item => (
                   <div 
                     key={item.uid} 
                     onClick={() => openDetail(item)}
                     className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-900/20 transition-all flex flex-col"
                   >
                      <div className="aspect-[4/3] bg-black relative overflow-hidden">
                         {item.imageUrl ? (
                           <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                         ) : (
                           <div className="flex items-center justify-center w-full h-full text-slate-700">
                             <ImageIcon size={32} />
                           </div>
                         )}
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                         
                         {/* Style Tag Overlay */}
                         <div className="absolute top-2 right-2">
                            <span className="text-[10px] bg-black/60 backdrop-blur-md text-slate-200 px-1.5 py-0.5 rounded border border-white/10">
                               {item.style}
                            </span>
                         </div>
                      </div>
                      <div className="p-3">
                         <h4 className="text-sm font-medium text-slate-200 truncate mb-1">{item.name}</h4>
                      </div>
                   </div>
                 ))
               }
            </div>
            
            {masterLibrary.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 pb-20">
                  <Database size={48} className="opacity-20 mb-4" />
                  <p>主体库为空，请从左侧同步资产</p>
               </div>
            )}
         </div>
      </div>

      {/* Comparison Modal (UPDATED) */}
      {showDiffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-6">
           <div className="bg-slate-900 w-full max-w-5xl rounded-xl border border-slate-700 shadow-2xl flex flex-col animate-scale-in max-h-[90vh]">
              
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-xl shrink-0">
                 <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ArrowRightLeft className="text-blue-500" size={24} />
                        资产一致性比对
                    </h3>
                    <div className="h-6 w-px bg-slate-700 mx-2"></div>
                    
                    {/* Sort Toggle Button */}
                    <button 
                       onClick={() => setSortOrder(prev => prev === 'SYNCED_FIRST' ? 'UNSYNCED_FIRST' : 'SYNCED_FIRST')}
                       className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors"
                       title={sortOrder === 'SYNCED_FIRST' ? "优先显示已同步" : "优先显示待处理"}
                    >
                       {sortOrder === 'SYNCED_FIRST' ? <ArrowUp size={14} className="text-emerald-500" /> : <ArrowDown size={14} className="text-amber-500" />}
                       <span>{sortOrder === 'SYNCED_FIRST' ? '已同步优先' : '待处理优先'}</span>
                    </button>
                 </div>
                 
                 <button onClick={() => setShowDiffModal(false)} className="p-2 text-slate-400 hover:text-white rounded-full transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              {/* Body: Split View with Stats */}
              <div className="flex-1 overflow-hidden flex flex-col bg-slate-950">
                 
                 {/* 1. Summary Stats Panel */}
                 <div className="p-5 grid grid-cols-4 gap-4 border-b border-slate-800 bg-slate-900/50 shrink-0">
                     <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                         <div className="text-slate-400 text-xs mb-1">本地资产总数</div>
                         <div className="text-xl font-bold text-white">{diffStats.localTotal}</div>
                     </div>
                     <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                         <div className="text-slate-400 text-xs mb-1">主体库资产总数</div>
                         <div className="text-xl font-bold text-emerald-400">{diffStats.masterTotal}</div>
                     </div>
                     <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                         <div className="text-slate-400 text-xs mb-1">待同步 (新增)</div>
                         <div className="text-xl font-bold text-blue-400">{diffStats.pendingSync}</div>
                     </div>
                     <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                         <div className="text-slate-400 text-xs mb-1">库冗余 (已删)</div>
                         <div className="text-xl font-bold text-red-400">{diffStats.orphans}</div>
                     </div>
                 </div>

                 {/* 2. Legend / Hints */}
                 <div className="px-6 py-3 bg-slate-900/30 border-b border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span>蓝色背景 (待同步)：本地有，库中无</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span>红色背景 (冗余)：库中有，本地已删</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 italic opacity-80">
                        <Info size={12} />
                        <span>提示: 左侧红色缺失表示本地已删除，右侧虚线框表示未入库</span>
                    </div>
                 </div>

                 {/* 3. Table Header */}
                 <div className="grid grid-cols-12 gap-0 border-b border-slate-800 bg-slate-900/50 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    <div className="col-span-5 p-3 pl-6 border-r border-slate-800 flex items-center gap-2">
                       <CloudUpload size={14} /> 本地资产清单
                    </div>
                    <div className="col-span-2 p-3 text-center border-r border-slate-800">
                       状态 / 操作
                    </div>
                    <div className="col-span-5 p-3 pl-6 flex items-center gap-2">
                       <Database size={14} /> 主体库资产清单
                    </div>
                 </div>

                 {/* 4. Rows Area */}
                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {comparisonRows.map((row) => (
                       <div key={row.uid} className={`grid grid-cols-12 gap-0 border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors group min-h-[72px] ${
                           row.status === 'LOCAL_ONLY' ? 'bg-blue-900/5' : 
                           row.status === 'MASTER_ONLY' ? 'bg-red-900/5' : ''
                       }`}>
                          
                          {/* Left: Local Asset */}
                          <div className="col-span-5 p-3 pl-6 border-r border-slate-800/50 flex items-center">
                             {row.local ? (
                                <div className="flex items-center gap-3 w-full">
                                   <div className="w-10 h-10 bg-black rounded shrink-0 overflow-hidden border border-slate-700">
                                      {row.local.state.mainImageUrl ? (
                                        <img src={row.local.state.mainImageUrl} className="w-full h-full object-cover" alt=""/>
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600"><AlertCircle size={14}/></div>
                                      )}
                                   </div>
                                   <div className="min-w-0">
                                      <div className="text-sm text-slate-200 font-medium truncate">{row.local.asset.name}</div>
                                      <div className="text-xs text-slate-500 truncate">{row.local.state.name}</div>
                                   </div>
                                </div>
                             ) : (
                                <div className="w-full h-full border-2 border-dashed border-red-900/30 bg-red-900/10 rounded-lg flex items-center justify-center text-red-500/70 text-xs italic">
                                   <Trash2 size={12} className="mr-1"/> 本地已删除
                                </div>
                             )}
                          </div>

                          {/* Center: Action / Status */}
                          <div className="col-span-2 p-3 border-r border-slate-800/50 flex items-center justify-center">
                             {row.status === 'SYNCED' && (
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20" title="已同步">
                                   <LinkIcon size={16} />
                                </div>
                             )}
                             
                             {row.status === 'LOCAL_ONLY' && (
                                <button 
                                   onClick={() => row.local && handleSync({ ...row.local, uid: row.uid })}
                                   disabled={!row.local?.state.mainImageUrl}
                                   className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                                      row.local?.state.mainImageUrl 
                                      ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-900/30' 
                                      : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                                   }`}
                                   title={row.local?.state.mainImageUrl ? "同步到主体库" : "请先生成图片"}
                                >
                                   <ArrowRight size={16} />
                                </button>
                             )}

                             {row.status === 'MASTER_ONLY' && (
                                <button 
                                   onClick={() => handleDelete(row.uid)}
                                   className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/20 transition-colors"
                                   title="删除冗余资产"
                                >
                                   <Unlink size={16} />
                                </button>
                             )}
                          </div>

                          {/* Right: Master Asset */}
                          <div className="col-span-5 p-3 pl-6 flex items-center">
                             {row.master ? (
                                <div className="flex items-center gap-3 w-full">
                                   <div className="w-10 h-10 bg-black rounded shrink-0 overflow-hidden border border-slate-700">
                                      {row.master.imageUrl ? (
                                        <img src={row.master.imageUrl} className="w-full h-full object-cover" alt=""/>
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600"><ImageIcon size={14}/></div>
                                      )}
                                   </div>
                                   <div className="min-w-0">
                                      <div className="text-sm text-slate-200 font-medium truncate">{row.master.name}</div>
                                      <div className="text-xs text-slate-500 truncate flex gap-2">
                                         <span>ID: {row.master.uid.slice(0,6)}...</span>
                                         <span className="text-slate-600">|</span>
                                         <span className="text-indigo-400">{row.master.style}</span>
                                      </div>
                                   </div>
                                </div>
                             ) : (
                                <div className="w-full h-full border-2 border-dashed border-slate-800 rounded-lg flex items-center justify-center text-slate-600 text-xs italic opacity-50">
                                   主体库未收录
                                </div>
                             )}
                          </div>

                       </div>
                    ))}
                 </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-900 rounded-b-xl flex justify-between items-center border-t border-slate-800 shrink-0">
                 <div className="text-xs text-slate-500">
                    共 {comparisonRows.length} 条记录 · 
                    <span className="text-blue-400 ml-1">{diffStats.pendingSync} 待同步</span> · 
                    <span className="text-red-400 ml-1">{diffStats.orphans} 冗余</span>
                 </div>
                 <button 
                    onClick={() => setShowDiffModal(false)}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium border border-slate-700"
                 >
                    完成比对
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Detail & Edit Modal */}
      {selectedItem && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-scale-in flex flex-col md:flex-row h-[600px] md:h-[450px]">
               
               {/* Modal Left: Image */}
               <div className="w-full md:w-5/12 bg-black relative border-b md:border-b-0 md:border-r border-slate-800">
                  {selectedItem.imageUrl ? (
                    <img src={selectedItem.imageUrl} className="w-full h-full object-contain bg-slate-950" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                       <ImageIcon size={48} />
                    </div>
                  )}
               </div>

               {/* Modal Right: Details */}
               <div className="flex-1 flex flex-col bg-slate-900">
                  
                  {/* Modal Header */}
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                     <h3 className="font-bold text-white">主体详情</h3>
                     <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                     </button>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 p-6 overflow-y-auto">
                     {isEditing ? (
                        <div className="space-y-4 animate-fade-in">
                           <div>
                              <label className="block text-xs text-slate-500 mb-1.5 font-medium uppercase">主体名 (资产-状态)</label>
                              <input 
                                 type="text" 
                                 value={editForm.name}
                                 onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                 className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                              />
                           </div>
                           <div>
                              <label className="block text-xs text-slate-500 mb-1.5 font-medium uppercase flex items-center gap-1">
                                <Wand2 size={12}/> 视觉风格 (AI识别)
                              </label>
                              <input 
                                 type="text" 
                                 value={editForm.style}
                                 onChange={(e) => setEditForm({...editForm, style: e.target.value})}
                                 className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                 placeholder="如：3D, 2D, 真人..."
                              />
                           </div>
                           <div>
                              <label className="block text-xs text-slate-500 mb-1.5 font-medium uppercase">描述</label>
                              <textarea 
                                 value={editForm.description}
                                 onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                 className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none resize-none"
                              />
                           </div>
                        </div>
                     ) : (
                        <div className="space-y-6">
                           <div>
                              <h2 className="text-xl font-bold text-white mb-2">{selectedItem.name}</h2>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-slate-500">视觉风格:</span>
                                <span className="inline-block px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium">
                                   {selectedItem.style}
                                </span>
                              </div>
                           </div>
                           
                           <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                              <label className="block text-xs text-slate-500 mb-2 font-medium uppercase flex items-center gap-1">
                                 <MoreHorizontal size={12}/> 描述
                              </label>
                              <p className="text-sm text-slate-300 leading-relaxed">
                                 {selectedItem.description || "暂无描述"}
                              </p>
                           </div>

                           <div className="text-xs text-slate-600 font-mono pt-4 border-t border-slate-800/50">
                              ID: {selectedItem.uid}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex justify-between items-center">
                     {isEditing ? (
                        <>
                           <button 
                              onClick={() => handleDelete(selectedItem.uid)}
                              className="text-red-500 hover:text-red-400 text-sm flex items-center gap-2 px-3 py-2 rounded hover:bg-red-500/10"
                           >
                              <Trash2 size={16} /> 删除主体
                           </button>
                           <div className="flex gap-3">
                              <button 
                                 onClick={() => setIsEditing(false)}
                                 className="text-slate-400 hover:text-white text-sm px-3 py-2"
                              >
                                 取消
                              </button>
                              <button 
                                 onClick={handleSaveEdit}
                                 className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
                              >
                                 <Save size={16} /> 保存
                              </button>
                           </div>
                        </>
                     ) : (
                        <>
                           <button 
                              onClick={() => handleDelete(selectedItem.uid)}
                              className="text-red-500 hover:text-red-400 text-sm flex items-center gap-2 px-3 py-2 rounded hover:bg-red-500/10"
                           >
                              <Trash2 size={16} /> 删除
                           </button>
                           <button 
                              onClick={() => setIsEditing(true)}
                              className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 font-medium border border-slate-600"
                           >
                              <Edit2 size={16} /> 编辑信息
                           </button>
                        </>
                     )}
                  </div>

               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default StageMasterLib;