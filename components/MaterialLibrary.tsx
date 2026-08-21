import React, { useState, useMemo, useRef } from 'react';
import { Material, MaterialType } from '../types';
import { Mic, Music, Volume2, Image as ImageIcon, Upload, Trash2, X, Plus, Film, RotateCcw, Search } from 'lucide-react';
import { TAG_TAXONOMY, TagTaxonomy, SfxCategory } from './tagTaxonomy';

export { TAG_TAXONOMY, FLAT_TAXONOMY, SFX_TAXONOMY } from './tagTaxonomy';
export type { TagTaxonomy, FlatGroup, SfxCategory, SfxGroup, SfxDimension } from './tagTaxonomy';

interface MaterialLibraryProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
}

const TYPE_META: Record<MaterialType, { label: string; icon: React.FC<{ size?: number; className?: string }>; color: string }> = {
  [MaterialType.VOICE]: { label: '配音', icon: Mic, color: 'text-blue-400' },
  [MaterialType.MUSIC]: { label: '音乐', icon: Music, color: 'text-purple-400' },
  [MaterialType.SFX]: { label: '音效', icon: Volume2, color: 'text-pink-400' },
  [MaterialType.IMAGE]: { label: '图片', icon: ImageIcon, color: 'text-amber-400' },
};

export type DurationFilter = 'ALL' | 'SHORT' | 'MEDIUM' | 'LONG';
export type SortBy = 'NEWEST' | 'OLDEST';

export const DURATION_FILTERS: { key: DurationFilter; label: string }[] = [
  { key: 'ALL', label: '全部长度' },
  { key: 'SHORT', label: '10秒内' },
  { key: 'MEDIUM', label: '10-60秒' },
  { key: 'LONG', label: '60秒以上' },
];

export const HAS_DURATION: Record<MaterialType, boolean> = {
  [MaterialType.VOICE]: true,
  [MaterialType.MUSIC]: true,
  [MaterialType.SFX]: true,
  [MaterialType.IMAGE]: false,
};

// 标签 + 时长 + 排序 的通用筛选逻辑（素材库与配音绑定弹窗共用）
export const applyMaterialFilters = (
  list: Material[],
  tags: string[],
  durationFilter: DurationFilter,
  sortBy: SortBy
): Material[] => {
  let result = list;
  if (tags.length > 0) {
    result = result.filter(m => tags.every(t => (m.tags || []).includes(t)));
  }
  if (durationFilter !== 'ALL') {
    result = result.filter(m => {
      if (m.duration === undefined) return false;
      if (durationFilter === 'SHORT') return m.duration < 10;
      if (durationFilter === 'MEDIUM') return m.duration >= 10 && m.duration <= 60;
      return m.duration > 60;
    });
  }
  return [...result].sort((a, b) => sortBy === 'NEWEST' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);
};

const formatSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDuration = (seconds?: number) => {
  if (seconds === undefined || isNaN(seconds)) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// 扁平标签筛选面板（音乐/配音/图片共用）
export const TagFilterPanel: React.FC<{
  taxonomy: { label: string; tags: string[] }[];
  selected: string[];
  onToggle: (tag: string) => void;
}> = ({ taxonomy, selected, onToggle }) => (
  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
    {taxonomy.map(group => (
      <div key={group.label} className="flex items-start gap-3">
        <span className="text-xs font-bold text-blue-400 w-20 shrink-0 pt-1">{group.label}</span>
        <div className="flex flex-wrap gap-1.5">
          {group.tags.map(tag => {
            const active = selected.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onToggle(tag)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

// 音效三级标签筛选面板：左侧一级分类导航 + 右侧分组/维度/标签
export const SfxTagFilterPanel: React.FC<{
  categories: SfxCategory[];
  selected: string[];
  onToggle: (tag: string) => void;
}> = ({ categories, selected, onToggle }) => {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.label || '');
  const category = categories.find(c => c.label === activeCategory) || categories[0];

  return (
    <div className="flex gap-4">
      {/* 左侧分类导航 */}
      <div className="w-28 shrink-0 space-y-1 border-r border-white/5 pr-3">
        {categories.map(c => (
          <button
            key={c.label}
            onClick={() => setActiveCategory(c.label)}
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
              activeCategory === c.label
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 右侧分组/维度/标签 */}
      <div className="flex-1 space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-1">
        {category?.groups.map(group => (
          <div key={group.label} className="space-y-2">
            <div className="text-xs font-bold text-slate-300">{group.label}</div>
            {group.dimensions.map(dim => (
              <div key={dim.label || group.label} className="flex items-start gap-3">
                {dim.label && <span className="text-xs font-bold text-blue-400 w-12 shrink-0 pt-1">{dim.label}</span>}
                <div className="flex flex-wrap gap-1.5">
                  {dim.tags.map(tag => {
                    const active = selected.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => onToggle(tag)}
                        className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                          active
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// 根据分类体系类型分发渲染（tree 用音效面板，flat 用普通面板）
const TaxonomyPicker: React.FC<{
  taxonomy: TagTaxonomy;
  selected: string[];
  onToggle: (tag: string) => void;
}> = ({ taxonomy, selected, onToggle }) => (
  taxonomy.type === 'tree'
    ? <SfxTagFilterPanel categories={taxonomy.categories} selected={selected} onToggle={onToggle} />
    : <TagFilterPanel taxonomy={taxonomy.groups} selected={selected} onToggle={onToggle} />
);

const MaterialLibrary: React.FC<MaterialLibraryProps> = ({ materials, setMaterials }) => {
  // 默认不选中任何类型，进入为空；选中类型标签后才加载对应素材
  const [typeFilter, setTypeFilter] = useState<MaterialType | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('NEWEST');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload form state
  const [uploadType, setUploadType] = useState<MaterialType>(MaterialType.VOICE);
  const [uploadName, setUploadName] = useState('');
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadDuration, setUploadDuration] = useState<number | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const switchTypeFilter = (t: MaterialType) => {
    setTypeFilter(t);
    setSelectedTags([]);
    setDurationFilter('ALL');
    setSearchQuery('');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(x => x !== tag) : [...prev, tag]);
  };

  const hasActiveFilters = selectedTags.length > 0 || durationFilter !== 'ALL' || searchQuery.trim().length > 0;

  const filteredMaterials = useMemo(() => {
    if (!typeFilter) return [];
    let list = materials.filter(m => m.type === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m.fileName || '').toLowerCase().includes(q)
      );
    }
    return applyMaterialFilters(list, selectedTags, durationFilter, sortBy);
  }, [materials, typeFilter, selectedTags, durationFilter, sortBy, searchQuery]);

  const resetUploadForm = () => {
    setUploadType(MaterialType.VOICE);
    setUploadName('');
    setUploadTags([]);
    setUploadFile(null);
    setUploadUrl('');
    setUploadDuration(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    if (!uploadName) setUploadName(file.name.replace(/\.[^.]+$/, ''));

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadUrl(dataUrl);
      // 读取音/视频时长
      if (HAS_DURATION[uploadType]) {
        const audio = new Audio(dataUrl);
        audio.onloadedmetadata = () => setUploadDuration(audio.duration);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmUpload = () => {
    if (!uploadName.trim() || !uploadUrl) return;
    const newMaterial: Material = {
      id: `mat-${Date.now()}`,
      name: uploadName.trim(),
      type: uploadType,
      url: uploadUrl,
      fileName: uploadFile?.name,
      duration: uploadDuration,
      size: uploadFile?.size,
      tags: uploadTags,
      createdAt: Date.now(),
    };
    setMaterials(prev => [newMaterial, ...prev]);
    setShowUploadModal(false);
    resetUploadForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除该素材吗？')) {
      setMaterials(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col bg-theme-page animate-fade-in overflow-hidden">
      {/* Type Filter Tabs + Search + Upload */}
      <div className="shrink-0 px-8 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 w-fit">
            {([
              { key: MaterialType.VOICE, label: '配音' },
              { key: MaterialType.MUSIC, label: '音乐' },
              { key: MaterialType.SFX, label: '音效' },
              { key: MaterialType.IMAGE, label: '图片' },
            ] as { key: MaterialType; label: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => switchTypeFilter(tab.key)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  typeFilter === tab.key ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500">{filteredMaterials.length} / {materials.length} 个素材</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索本类型素材"
              className="w-56 bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-900/20"
          >
            <Upload size={16} />
            上传素材
          </button>
        </div>
      </div>

      {/* Tag Classification & Filter Panel (per type) */}
      {typeFilter && (
        <div className="shrink-0 mx-8 mt-4 p-4 bg-theme-card/60 border border-theme-border rounded-xl space-y-3">
          <TaxonomyPicker taxonomy={TAG_TAXONOMY[typeFilter]} selected={selectedTags} onToggle={toggleTag} />

          {/* Filter Params Row */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/5">
            <span className="text-xs font-bold text-slate-500">筛选参数</span>
            {HAS_DURATION[typeFilter] && (
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value as DurationFilter)}
                className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-300 focus:border-blue-500 outline-none transition-colors"
              >
                {DURATION_FILTERS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-300 focus:border-blue-500 outline-none transition-colors"
            >
              <option value="NEWEST">最新上传</option>
              <option value="OLDEST">最早上传</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={() => { setSelectedTags([]); setDurationFilter('ALL'); }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                <RotateCcw size={12} />
                清除筛选
              </button>
            )}
            {selectedTags.length > 0 && (
              <span className="ml-auto text-[10px] text-slate-500">
                已选标签：{selectedTags.join(' / ')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Material Grid */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {filteredMaterials.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
            <Film size={48} strokeWidth={1} />
            <span className="text-sm">
              {!typeFilter
                ? '请选择素材类型，加载对应素材'
                : hasActiveFilters
                  ? '没有符合筛选条件的素材'
                  : '该类型下暂无素材，点击右上角上传'}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMaterials.map(m => {
              const meta = TYPE_META[m.type];
              const TypeIcon = meta.icon;
              return (
                <div
                  key={m.id}
                  className="group relative bg-theme-card border border-theme-border rounded-xl overflow-hidden hover:border-blue-500/50 transition-all"
                >
                  {/* Preview Area */}
                  <div className="aspect-video bg-black/40 flex items-center justify-center relative overflow-hidden">
                    {m.type === MaterialType.IMAGE ? (
                      <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 w-full px-3">
                        <TypeIcon size={28} className={meta.color} />
                        <audio src={m.url} controls className="w-full h-8" preload="metadata" />
                      </div>
                    )}
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-slate-300 hover:text-white rounded-md opacity-0 group-hover:opacity-100 transition-all"
                      title="删除素材"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TypeIcon size={13} className={meta.color} />
                      <span className="text-sm font-bold text-slate-200 truncate">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded">{meta.label}</span>
                      {m.duration !== undefined && <span>{formatDuration(m.duration)}</span>}
                      {m.size !== undefined && <span>{formatSize(m.size)}</span>}
                    </div>
                    {(m.tags && m.tags.length > 0) && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {m.tags.slice(0, 3).map(tag => (
                          <button
                            key={tag}
                            onClick={() => { if (typeFilter === m.type) toggleTag(tag); }}
                            className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                              selectedTags.includes(tag)
                                ? 'bg-blue-600/30 text-blue-300'
                                : 'bg-slate-800/80 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                        {m.tags.length > 3 && <span className="text-[10px] text-slate-600">+{m.tags.length - 3}</span>}
                      </div>
                    )}
                    {m.fileName && (
                      <p className="text-[10px] text-slate-600 truncate mt-1">{m.fileName}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 w-full max-w-lg max-h-[85vh] rounded-xl border border-slate-700 shadow-2xl flex flex-col animate-scale-in p-6 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="bg-blue-600 p-1 rounded-md text-white" size={24} />
                上传素材
              </h3>
              <button
                onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">素材类型</label>
                <select
                  value={uploadType}
                  onChange={(e) => {
                    setUploadType(e.target.value as MaterialType);
                    setUploadTags([]);
                    // 切换类型时清空已选文件，避免类型与文件内容不匹配
                    setUploadFile(null);
                    setUploadUrl('');
                    setUploadDuration(undefined);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value={MaterialType.VOICE}>配音</option>
                  <option value={MaterialType.MUSIC}>音乐</option>
                  <option value={MaterialType.SFX}>音效</option>
                  <option value={MaterialType.IMAGE}>图片</option>
                </select>
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">素材名称</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="请输入素材名称"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Tag Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">标签分类（可多选）</label>
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                  <TaxonomyPicker
                    taxonomy={TAG_TAXONOMY[uploadType]}
                    selected={uploadTags}
                    onToggle={(tag) => setUploadTags(prev => prev.includes(tag) ? prev.filter(x => x !== tag) : [...prev, tag])}
                  />
                </div>
              </div>

              {/* File Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">选择文件</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={uploadType === MaterialType.IMAGE ? 'image/*' : 'audio/*'}
                  onChange={handleFileSelect}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600/20 file:text-blue-400 file:text-xs file:font-bold file:cursor-pointer hover:file:bg-blue-600/30 file:transition-colors"
                />
                <p className="text-[10px] text-slate-600">演示环境建议上传小文件</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
                className="flex-1 py-2.5 border border-slate-700 rounded-lg text-sm font-bold text-slate-400 hover:bg-slate-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmUpload}
                disabled={!uploadName.trim() || !uploadUrl}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold text-white transition-colors"
              >
                确认上传
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialLibrary;
