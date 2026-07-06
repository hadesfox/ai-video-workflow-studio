import React, { useState, useMemo } from 'react';
import {
  PartnerSubTab, PartnerExternalSubTab, PartnerTaskStatus,
  PartnerTask, PartnerAssetItem, PartnerDeliveryVersion, ReviewComment, ExternalUser,
  Project,
} from '../types';
import {
  ArrowLeft, Plus, Search, Download, Upload, Check, X, Clock, FileVideo,
  Package, Send, Edit3, Eye, AlertCircle, ChevronRight, Calendar,
  Building2, User, Phone, MoreVertical, Filter, ArrowUpDown,
  CheckCircle2, XCircle, MessageSquare, Video, FileArchive, RefreshCw,
  Briefcase, ClipboardList, FolderOpen, Inbox, Layers,
} from 'lucide-react';

// ==================== Mock Data ====================

const mockExternalUsers: ExternalUser[] = [
  { id: 'eu1', companyName: '武汉光影传媒', contactName: '张磊', phone: '138****6677', email: 'zhanglei@gyfilm.com', status: 'active', taskCount: 3 },
  { id: 'eu2', companyName: '深圳像素工坊', contactName: '李娜', phone: '139****8899', email: 'lina@pxstudio.com', status: 'active', taskCount: 1 },
  { id: 'eu3', companyName: '北京极光剪辑团队', contactName: '王浩', phone: '137****2233', email: 'wanghao@jgedit.com', status: 'active', taskCount: 2 },
];

const mockAssets: PartnerAssetItem[] = [
  { id: 'a1', name: '第1集_分镜01_开场空镜.mp4', size: '248 MB', resolution: '1920x1080', duration: '00:05:32' },
  { id: 'a2', name: '第1集_分镜02_角色登场.mp4', size: '312 MB', resolution: '1920x1080', duration: '00:07:15' },
  { id: 'a3', name: '第1集_分镜03_对话场景.mp4', size: '198 MB', resolution: '1920x1080', duration: '00:04:28' },
  { id: 'a4', name: '第1集_分镜04_战斗序列.mp4', size: '456 MB', resolution: '1920x1080', duration: '00:09:42' },
  { id: 'a5', name: '第1集_分镜05_结尾收束.mp4', size: '167 MB', resolution: '1920x1080', duration: '00:03:55' },
];

const mockComments: ReviewComment[] = [
  { id: 'c1', timestamp: '00:01:23', author: 'Admin', content: '开场节奏太慢，建议前3秒剪掉', type: 'reject' },
  { id: 'c2', timestamp: '00:03:45', author: 'Admin', content: '这里的转场太生硬，加个溶解', type: 'comment' },
  { id: 'c3', timestamp: '00:06:12', author: 'Admin', content: 'BGM音量太大，人声被盖住了', type: 'reject' },
];

const mockTasks: PartnerTask[] = [
  {
    id: 'pt1',
    name: '2D宠-第1集-v1',
    projectId: '1',
    projectName: '星际流浪：寻找阿尔法',
    brief: '需要将5个分镜剪辑成完整的一集，节奏偏紧凑，参考《爱死机》的剪辑风格。片头需要加字幕卡，片尾留5秒黑场。',
    deadline: '2026-07-10',
    status: 'published',
    externalUserId: 'eu1',
    externalCompanyName: '武汉光影传媒',
    externalContactName: '张磊',
    assets: mockAssets,
    deliveries: [],
    createdAt: '2026-07-01',
    publishedAt: '2026-07-02',
  },
  {
    id: 'pt2',
    name: '2D宠-第2集-v1',
    projectId: '1',
    projectName: '星际流浪：寻找阿尔法',
    brief: '第2集剪辑，重点是中段情绪推进，结尾要有悬念感。',
    deadline: '2026-07-15',
    status: 'delivered',
    externalUserId: 'eu3',
    externalCompanyName: '北京极光剪辑团队',
    externalContactName: '王浩',
    assets: mockAssets.slice(0, 3),
    deliveries: [
      {
        version: 1, videoName: '2D宠-第2集-v1_delivery.mp4', fileSize: '1.2 GB',
        uploadTime: '2026-07-03 14:30', notes: '初版交付，BGM用的暂定曲目', status: 'pending_review',
      },
    ],
    createdAt: '2026-06-28', publishedAt: '2026-06-29',
  },
  {
    id: 'pt3',
    name: '2D宠-第3集-v1',
    projectId: '1',
    projectName: '星际流浪：寻找阿尔法',
    brief: '第3集，战斗戏份较重，需要配合音效卡点。',
    deadline: '2026-07-08',
    status: 'reviewing',
    externalUserId: 'eu1',
    externalCompanyName: '武汉光影传媒',
    externalContactName: '张磊',
    assets: mockAssets.slice(2),
    deliveries: [
      {
        version: 2, videoName: '2D宠-第3集-v2_delivery.mp4', fileSize: '1.5 GB',
        uploadTime: '2026-07-03 10:15', notes: '根据上轮意见调整了节奏和转场', status: 'pending_review',
      },
      {
        version: 1, videoName: '2D宠-第3集-v1_delivery.mp4', fileSize: '1.3 GB',
        uploadTime: '2026-07-01 16:00', notes: '初版', status: 'rejected',
        reviewComments: mockComments,
      },
    ],
    createdAt: '2026-06-25', publishedAt: '2026-06-26',
  },
  {
    id: 'pt4',
    name: '2D宠-第4集-v1',
    projectId: '1',
    projectName: '星际流浪：寻找阿尔法',
    brief: '第4集，日常向，节奏轻松。',
    deadline: '2026-07-20',
    status: 'approved',
    externalUserId: 'eu2',
    externalCompanyName: '深圳像素工坊',
    externalContactName: '李娜',
    assets: mockAssets,
    deliveries: [
      {
        version: 1, videoName: '2D宠-第4集-v1_final.mp4', fileSize: '1.1 GB',
        uploadTime: '2026-07-02 11:00', notes: '终版交付', status: 'approved',
      },
    ],
    createdAt: '2026-06-20', publishedAt: '2026-06-21', completedAt: '2026-07-02',
  },
  {
    id: 'pt5',
    name: '2D宠-第5集-v1',
    projectId: '1',
    projectName: '星际流浪：寻找阿尔法',
    brief: '',
    deadline: '',
    status: 'draft',
    externalUserId: '',
    externalCompanyName: '',
    externalContactName: '',
    assets: mockAssets.slice(0, 2),
    deliveries: [],
    createdAt: '2026-07-03',
  },
];

// ==================== Helper ====================

const statusConfig: Record<PartnerTaskStatus, { label: string; color: string; bg: string }> = {
  draft:     { label: '草稿',   color: 'text-slate-400',  bg: 'bg-slate-500/15' },
  pending:   { label: '待发布', color: 'text-amber-400',  bg: 'bg-amber-500/15' },
  published: { label: '已下发', color: 'text-blue-400',   bg: 'bg-blue-500/15' },
  delivered: { label: '已交付', color: 'text-cyan-400',   bg: 'bg-cyan-500/15' },
  reviewing: { label: '审片中', color: 'text-purple-400', bg: 'bg-purple-500/15' },
  approved:  { label: '已通过', color: 'text-green-400',  bg: 'bg-green-500/15' },
  rejected:  { label: '已打回', color: 'text-red-400',    bg: 'bg-red-500/15' },
};

const statusSteps = ['draft', 'pending', 'published', 'delivered', 'reviewing', 'approved'];

function getDaysLeft(deadline: string): number {
  if (!deadline) return 0;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ==================== Main Component ====================

interface PartnerCollaborationProps {
  project: Project | null;
  isExternal: boolean;
  onToggleExternal: () => void;
}

const PartnerCollaboration: React.FC<PartnerCollaborationProps> = ({ project, isExternal, onToggleExternal }) => {
  const [tasks, setTasks] = useState<PartnerTask[]>(mockTasks);
  const [externalUsers] = useState<ExternalUser[]>(mockExternalUsers);
  const [internalSubTab, setInternalSubTab] = useState<PartnerSubTab>(PartnerSubTab.TASK_LIST);
  const [externalSubTab, setExternalSubTab] = useState<PartnerExternalSubTab>(PartnerExternalSubTab.MY_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PartnerTaskStatus | 'all'>('all');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  // For new task creation
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskBrief, setNewTaskBrief] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskExternalId, setNewTaskExternalId] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // For deliver upload simulation
  const [deliverNotes, setDeliverNotes] = useState('');
  const [showDeliverSuccess, setShowDeliverSuccess] = useState(false);

  const selectedTask = useMemo(() => tasks.find(t => t.id === selectedTaskId) || null, [tasks, selectedTaskId]);

  // Filter tasks by project for internal view
  const projectTasks = useMemo(() => {
    if (!project) return tasks;
    return tasks.filter(t => t.projectId === project.id);
  }, [tasks, project]);

  // Filter tasks for external view (all projects, assigned to this "external user")
  const externalTasks = useMemo(() => {
    return tasks.filter(t => t.status !== 'draft');
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = isExternal ? externalTasks : projectTasks;
    if (searchQuery) {
      result = result.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }
    return result;
  }, [isExternal, externalTasks, projectTasks, searchQuery, statusFilter]);

  // ==================== Actions ====================

  const handleCreateDraft = () => {
    setShowNewTaskForm(true);
    setInternalSubTab(PartnerSubTab.NEW_TASK);
  };

  const handlePublishTask = (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: 'published' as PartnerTaskStatus, publishedAt: new Date().toISOString().split('T')[0] } : t
    ));
  };

  const handleApprove = (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: 'approved' as PartnerTaskStatus, completedAt: new Date().toISOString().split('T')[0] } : t
    ));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
      setInternalSubTab(PartnerSubTab.TASK_LIST);
    }
  };

  const handleReject = (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: 'rejected' as PartnerTaskStatus } : t
    ));
  };

  const handleDeliver = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newVersion = task.deliveries.length + 1;
    const newDelivery: PartnerDeliveryVersion = {
      version: newVersion,
      videoName: `${task.name}_v${newVersion}_delivery.mp4`,
      fileSize: '1.2 GB',
      uploadTime: new Date().toLocaleString('zh-CN'),
      notes: deliverNotes || '交付新版本',
      status: 'pending_review',
    };
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, status: 'delivered' as PartnerTaskStatus, deliveries: [...t.deliveries, newDelivery] }
        : t
    ));
    setDeliverNotes('');
    setShowDeliverSuccess(true);
    setTimeout(() => setShowDeliverSuccess(false), 2000);
    setExternalSubTab(PartnerExternalSubTab.MY_TASKS);
  };

  const handleSubmitNewTask = () => {
    if (!newTaskName || !newTaskExternalId || !project) return;
    const extUser = externalUsers.find(u => u.id === newTaskExternalId);
    const newTask: PartnerTask = {
      id: 'pt' + Date.now(),
      name: newTaskName,
      projectId: project.id,
      projectName: project.name,
      brief: newTaskBrief,
      deadline: newTaskDeadline,
      status: 'pending' as PartnerTaskStatus,
      externalUserId: newTaskExternalId,
      externalCompanyName: extUser?.companyName || '',
      externalContactName: extUser?.contactName || '',
      assets: mockAssets.filter(a => selectedAssetIds.includes(a.id)),
      deliveries: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks(prev => [...prev, newTask]);
    // Reset form
    setNewTaskName(''); setNewTaskBrief(''); setNewTaskDeadline('');
    setNewTaskExternalId(''); setSelectedAssetIds([]);
    setShowNewTaskForm(false);
    setInternalSubTab(PartnerSubTab.TASK_LIST);
  };

  // ==================== Internal View ====================

  const renderInternalView = () => {
    if (internalSubTab === PartnerSubTab.TASK_DETAIL && selectedTask) {
      return <InternalTaskDetail task={selectedTask} onBack={() => { setInternalSubTab(PartnerSubTab.TASK_LIST); setSelectedTaskId(null); }} onApprove={handleApprove} onReject={handleReject} />;
    }
    if (internalSubTab === PartnerSubTab.NEW_TASK || showNewTaskForm) {
      return (
        <InternalNewTask
          project={project}
          externalUsers={externalUsers}
          newTaskName={newTaskName} setNewTaskName={setNewTaskName}
          newTaskBrief={newTaskBrief} setNewTaskBrief={setNewTaskBrief}
          newTaskDeadline={newTaskDeadline} setNewTaskDeadline={setNewTaskDeadline}
          newTaskExternalId={newTaskExternalId} setNewTaskExternalId={setNewTaskExternalId}
          selectedAssetIds={selectedAssetIds} setSelectedAssetIds={setSelectedAssetIds}
          availableAssets={mockAssets}
          onSubmit={handleSubmitNewTask}
          onCancel={() => { setShowNewTaskForm(false); setInternalSubTab(PartnerSubTab.TASK_LIST); }}
        />
      );
    }
    return (
      <InternalTaskList
        tasks={filteredTasks}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        onCreateDraft={handleCreateDraft}
        onTaskClick={(id) => { setSelectedTaskId(id); setInternalSubTab(PartnerSubTab.TASK_DETAIL); }}
        onPublish={handlePublishTask}
      />
    );
  };

  // ==================== External View ====================

  const renderExternalView = () => {
    switch (externalSubTab) {
      case PartnerExternalSubTab.DOWNLOAD:
        return <ExternalDownload tasks={externalTasks} selectedTaskId={selectedTaskId} setSelectedTaskId={setSelectedTaskId} />;
      case PartnerExternalSubTab.DELIVER:
        return (
          <ExternalDeliver
            tasks={externalTasks}
            selectedTaskId={selectedTaskId}
            setSelectedTaskId={setSelectedTaskId}
            deliverNotes={deliverNotes}
            setDeliverNotes={setDeliverNotes}
            onDeliver={handleDeliver}
            showSuccess={showDeliverSuccess}
          />
        );
      case PartnerExternalSubTab.FEEDBACK:
        return <ExternalFeedback tasks={externalTasks} selectedTaskId={selectedTaskId} setSelectedTaskId={setSelectedTaskId} onResubmit={() => setExternalSubTab(PartnerExternalSubTab.DELIVER)} />;
      default:
        return (
          <ExternalMyTasks
            tasks={externalTasks}
            onTaskClick={(id) => { setSelectedTaskId(id); }}
            onDownload={() => setExternalSubTab(PartnerExternalSubTab.DOWNLOAD)}
            onDeliver={() => setExternalSubTab(PartnerExternalSubTab.DELIVER)}
          />
        );
    }
  };

  // ==================== Sub-navigation ====================

  const internalSubTabs = [
    { id: PartnerSubTab.TASK_LIST, label: '任务列表', icon: ClipboardList },
    { id: PartnerSubTab.NEW_TASK, label: '新建任务', icon: Plus },
  ];

  const externalSubTabs = [
    { id: PartnerExternalSubTab.MY_TASKS, label: '我的任务', icon: Briefcase },
    { id: PartnerExternalSubTab.DOWNLOAD, label: '素材下载', icon: Download },
    { id: PartnerExternalSubTab.DELIVER, label: '提交交付', icon: Upload },
    { id: PartnerExternalSubTab.FEEDBACK, label: '审片反馈', icon: MessageSquare },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Sub-navigation bar */}
      <div className="shrink-0 border-b border-theme-border bg-theme-panel/50 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {!isExternal && internalSubTabs.map(tab => {
            const active = internalSubTab === tab.id || (tab.id === PartnerSubTab.NEW_TASK && showNewTaskForm);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === PartnerSubTab.NEW_TASK) {
                    setShowNewTaskForm(true);
                    setInternalSubTab(PartnerSubTab.NEW_TASK);
                  } else {
                    setShowNewTaskForm(false);
                    setInternalSubTab(tab.id);
                    setSelectedTaskId(null);
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active ? 'bg-theme-accent/15 text-theme-accent' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            );
          })}
          {isExternal && externalSubTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setExternalSubTab(tab.id); setSelectedTaskId(null); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                externalSubTab === tab.id ? 'bg-theme-accent/15 text-theme-accent' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* External/Internal Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600 font-mono">视角切换</span>
          <button
            onClick={onToggleExternal}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
              isExternal
                ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
            }`}
          >
            {isExternal ? <><Building2 size={13} /> 外包方视角</> : <><User size={13} /> 制作方视角</>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isExternal ? renderExternalView() : renderInternalView()}
      </div>
    </div>
  );
};

// ==================== Internal: Task List ====================

const InternalTaskList: React.FC<{
  tasks: PartnerTask[];
  searchQuery: string; setSearchQuery: (v: string) => void;
  statusFilter: PartnerTaskStatus | 'all'; setStatusFilter: (v: PartnerTaskStatus | 'all') => void;
  onCreateDraft: () => void;
  onTaskClick: (id: string) => void;
  onPublish: (id: string) => void;
}> = ({ tasks, searchQuery, setSearchQuery, statusFilter, setStatusFilter, onCreateDraft, onTaskClick, onPublish }) => {
  const statusOptions: { value: PartnerTaskStatus | 'all'; label: string }[] = [
    { value: 'all', label: '全部状态' },
    { value: 'draft', label: '草稿' },
    { value: 'pending', label: '待发布' },
    { value: 'published', label: '已下发' },
    { value: 'delivered', label: '已交付' },
    { value: 'reviewing', label: '审片中' },
    { value: 'approved', label: '已通过' },
    { value: 'rejected', label: '已打回' },
  ];

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索任务名称..."
              className="bg-theme-card border border-theme-border rounded-lg pl-9 pr-4 py-2 text-sm text-theme-primary placeholder:text-slate-600 focus:border-theme-accent/50 outline-none w-64"
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as PartnerTaskStatus | 'all')}
              className="bg-theme-card border border-theme-border rounded-lg pl-9 pr-8 py-2 text-sm text-theme-primary focus:border-theme-accent/50 outline-none appearance-none cursor-pointer"
            >
              {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={onCreateDraft}
          className="flex items-center gap-2 bg-theme-accent hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg"
        >
          <Plus size={16} /> 创建外发任务
        </button>
      </div>

      {/* Table */}
      <div className="bg-theme-card/30 border border-theme-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-theme-border text-slate-500 text-xs uppercase">
              <th className="text-left px-4 py-3 font-medium">任务名称</th>
              <th className="text-left px-4 py-3 font-medium">外包方</th>
              <th className="text-left px-4 py-3 font-medium">状态</th>
              <th className="text-left px-4 py-3 font-medium">交付截止</th>
              <th className="text-left px-4 py-3 font-medium">素材数</th>
              <th className="text-left px-4 py-3 font-medium">交付版本</th>
              <th className="text-right px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-slate-600">
                <Inbox size={32} className="mx-auto mb-2 opacity-50" />
                暂无任务
              </td></tr>
            ) : tasks.map(task => {
              const sc = statusConfig[task.status];
              const daysLeft = getDaysLeft(task.deadline);
              return (
                <tr key={task.id} className="border-b border-theme-border/50 hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-3">
                    <button onClick={() => onTaskClick(task.id)} className="text-theme-primary font-medium hover:text-theme-accent transition-colors text-left">
                      {task.name}
                    </button>
                    <div className="text-xs text-slate-600 mt-0.5">{task.projectName}</div>
                  </td>
                  <td className="px-4 py-3">
                    {task.externalCompanyName ? (
                      <div>
                        <div className="text-theme-secondary text-xs">{task.externalCompanyName}</div>
                        <div className="text-slate-600 text-[11px]">{task.externalContactName}</div>
                      </div>
                    ) : <span className="text-slate-600 text-xs">未指定</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    {task.deadline ? (
                      <div>
                        <div className="text-theme-secondary text-xs">{task.deadline}</div>
                        {daysLeft < 3 && daysLeft >= 0 && <div className="text-red-400 text-[11px]">还剩 {daysLeft} 天</div>}
                        {daysLeft < 0 && <div className="text-red-500 text-[11px]">已逾期</div>}
                      </div>
                    ) : <span className="text-slate-600 text-xs">-</span>}
                  </td>
                  <td className="px-4 py-3 text-theme-secondary text-xs">{task.assets.length} 个文件</td>
                  <td className="px-4 py-3 text-theme-secondary text-xs">
                    {task.deliveries.length > 0 ? `v1~v${task.deliveries.length}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {task.status === 'pending' && (
                        <button onClick={() => onPublish(task.id)} className="px-2.5 py-1 bg-theme-accent/15 text-theme-accent rounded text-xs font-medium hover:bg-theme-accent/25 transition-colors flex items-center gap-1">
                          <Send size={12} /> 发布
                        </button>
                      )}
                      <button onClick={() => onTaskClick(task.id)} className="px-2.5 py-1 text-slate-400 hover:text-theme-accent rounded text-xs transition-colors flex items-center gap-1">
                        <Eye size={12} /> 详情
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==================== Internal: New Task ====================

const InternalNewTask: React.FC<{
  project: Project | null;
  externalUsers: ExternalUser[];
  newTaskName: string; setNewTaskName: (v: string) => void;
  newTaskBrief: string; setNewTaskBrief: (v: string) => void;
  newTaskDeadline: string; setNewTaskDeadline: (v: string) => void;
  newTaskExternalId: string; setNewTaskExternalId: (v: string) => void;
  selectedAssetIds: string[]; setSelectedAssetIds: (v: string[]) => void;
  availableAssets: PartnerAssetItem[];
  onSubmit: () => void;
  onCancel: () => void;
}> = ({ project, externalUsers, newTaskName, setNewTaskName, newTaskBrief, setNewTaskBrief, newTaskDeadline, setNewTaskDeadline, newTaskExternalId, setNewTaskExternalId, selectedAssetIds, setSelectedAssetIds, availableAssets, onSubmit, onCancel }) => {
  const toggleAsset = (id: string) => {
    setSelectedAssetIds(selectedAssetIds.includes(id) ? selectedAssetIds.filter(a => a !== id) : [...selectedAssetIds, id]);
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-theme-primary">新建外发任务</h2>
        {project && <span className="text-xs text-slate-500 bg-theme-card/50 px-2 py-1 rounded">项目: {project.name}</span>}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="col-span-2 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">任务名称 *</label>
            <input
              value={newTaskName}
              onChange={e => setNewTaskName(e.target.value)}
              placeholder="如：2D宠-第1集-v1"
              className="w-full bg-theme-card border border-theme-border rounded-lg px-4 py-2.5 text-sm text-theme-primary placeholder:text-slate-600 focus:border-theme-accent/50 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">剪辑需求 (Brief)</label>
            <textarea
              value={newTaskBrief}
              onChange={e => setNewTaskBrief(e.target.value)}
              placeholder="描述剪辑需求、风格参考、交付规格等..."
              rows={5}
              className="w-full bg-theme-card border border-theme-border rounded-lg px-4 py-2.5 text-sm text-theme-primary placeholder:text-slate-600 focus:border-theme-accent/50 outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">交付截止时间</label>
              <input
                type="date"
                value={newTaskDeadline}
                onChange={e => setNewTaskDeadline(e.target.value)}
                className="w-full bg-theme-card border border-theme-border rounded-lg px-4 py-2.5 text-sm text-theme-primary focus:border-theme-accent/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">指定外包方 *</label>
              <select
                value={newTaskExternalId}
                onChange={e => setNewTaskExternalId(e.target.value)}
                className="w-full bg-theme-card border border-theme-border rounded-lg px-4 py-2.5 text-sm text-theme-primary focus:border-theme-accent/50 outline-none"
              >
                <option value="">请选择...</option>
                {externalUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.companyName} ({u.contactName})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right: Asset selection */}
        <div className="col-span-1">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">素材包选择</label>
          <div className="bg-theme-card/30 border border-theme-border rounded-xl p-3 max-h-96 overflow-auto space-y-1.5">
            {availableAssets.map(asset => {
              const checked = selectedAssetIds.includes(asset.id);
              return (
                <button
                  key={asset.id}
                  onClick={() => toggleAsset(asset.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                    checked ? 'bg-theme-accent/10 border border-theme-accent/30' : 'border border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${checked ? 'bg-theme-accent border-theme-accent' : 'border-slate-600'}`}>
                    {checked && <Check size={11} className="text-white" />}
                  </div>
                  <FileVideo size={14} className="text-slate-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-theme-primary truncate">{asset.name}</div>
                    <div className="text-[10px] text-slate-600">{asset.size} · {asset.duration}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-slate-500">已选 {selectedAssetIds.length} / {availableAssets.length} 个素材</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-theme-border">
        <button onClick={onCancel} className="px-5 py-2 text-slate-400 hover:text-slate-200 text-sm transition-colors">取消</button>
        <button
          onClick={onSubmit}
          disabled={!newTaskName || !newTaskExternalId}
          className="flex items-center gap-2 bg-theme-accent hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-bold transition-all"
        >
          <Send size={15} /> 创建并发布
        </button>
      </div>
    </div>
  );
};

// ==================== Internal: Task Detail ====================

const InternalTaskDetail: React.FC<{
  task: PartnerTask;
  onBack: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}> = ({ task, onBack, onApprove, onReject }) => {
  const sc = statusConfig[task.status];
  const currentStepIndex = statusSteps.indexOf(task.status);
  if (task.status === 'rejected') {
    // find the last non-rejected status
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-theme-primary">{task.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
            <span className="text-xs text-slate-500">{task.projectName}</span>
            <span className="text-xs text-slate-600">创建于 {task.createdAt}</span>
          </div>
        </div>
      </div>

      {/* Status Steps */}
      <div className="flex items-center gap-1 mb-6 bg-theme-card/30 border border-theme-border rounded-xl p-4">
        {['创建', '待发布', '已下发', '已交付', '审片中', '已通过'].map((step, i) => {
          const active = i <= (task.status === 'rejected' ? 4 : currentStepIndex);
          const isCurrent = (task.status === 'rejected' && i === 4) || (i === currentStepIndex && task.status !== 'rejected');
          return (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  active ? 'bg-theme-accent text-white' : 'bg-slate-700/50 text-slate-500'
                } ${isCurrent ? 'ring-2 ring-theme-accent/40' : ''}`}>
                  {i + 1}
                </div>
                <span className={`text-xs ${active ? 'text-theme-primary' : 'text-slate-600'}`}>{step}</span>
              </div>
              {i < 5 && <div className={`flex-1 h-px mx-2 ${i < currentStepIndex ? 'bg-theme-accent/40' : 'bg-theme-border'}`} />}
            </React.Fragment>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Left: Assets */}
        <div className="col-span-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-bold text-theme-primary">
            <Package size={16} /> 素材包
            <span className="text-xs text-slate-500 font-normal">({task.assets.length} 个文件)</span>
          </div>
          <div className="bg-theme-card/30 border border-theme-border rounded-xl p-3 space-y-1.5 max-h-80 overflow-auto">
            {task.assets.map(a => (
              <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5">
                <FileVideo size={14} className="text-slate-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-theme-primary truncate">{a.name}</div>
                  <div className="text-[10px] text-slate-600">{a.size} · {a.resolution} · {a.duration}</div>
                </div>
                <Download size={13} className="text-slate-500 hover:text-theme-accent cursor-pointer shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Deliveries */}
        <div className="col-span-5">
          <div className="flex items-center gap-2 mb-3 text-sm font-bold text-theme-primary">
            <Layers size={16} /> 交付版本记录
          </div>
          {task.deliveries.length === 0 ? (
            <div className="bg-theme-card/30 border border-theme-border rounded-xl p-8 text-center">
              <Inbox size={28} className="mx-auto mb-2 text-slate-600" />
              <p className="text-sm text-slate-500">暂无交付记录</p>
              <p className="text-xs text-slate-600 mt-1">等待外包方提交成片</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-auto">
              {[...task.deliveries].reverse().map(delivery => (
                <div key={delivery.version} className={`bg-theme-card/30 border rounded-xl p-4 ${
                  delivery.status === 'approved' ? 'border-green-500/30' :
                  delivery.status === 'rejected' ? 'border-red-500/30' : 'border-theme-border'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-theme-accent/15 text-theme-accent text-xs font-bold px-2 py-0.5 rounded">v{delivery.version}</span>
                      <span className="text-sm text-theme-primary font-medium">{delivery.videoName}</span>
                    </div>
                    {delivery.status === 'approved' && <CheckCircle2 size={16} className="text-green-400" />}
                    {delivery.status === 'rejected' && <XCircle size={16} className="text-red-400" />}
                  </div>
                  <div className="text-xs text-slate-500 mb-2">
                    {delivery.uploadTime} · {delivery.fileSize}
                  </div>
                  {delivery.notes && <div className="text-xs text-slate-400 bg-white/5 rounded p-2 mb-2">{delivery.notes}</div>}

                  {/* Review comments for rejected versions */}
                  {delivery.reviewComments && delivery.reviewComments.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">审片意见</div>
                      {delivery.reviewComments.map(c => (
                        <div key={c.id} className="flex items-start gap-2 text-xs">
                          <span className="text-theme-accent font-mono shrink-0">{c.timestamp}</span>
                          <span className={`shrink-0 ${c.type === 'reject' ? 'text-red-400' : c.type === 'approve' ? 'text-green-400' : 'text-slate-400'}`}>
                            {c.type === 'reject' ? '[打回]' : c.type === 'approve' ? '[通过]' : '[意见]'}
                          </span>
                          <span className="text-slate-400">{c.content}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent/10 text-theme-accent rounded-lg text-xs font-medium hover:bg-theme-accent/20 transition-colors">
                      <Video size={13} /> 进入审片
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-theme-primary rounded-lg text-xs transition-colors">
                      <Download size={13} /> 下载文件
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="col-span-3">
          <div className="flex items-center gap-2 mb-3 text-sm font-bold text-theme-primary">
            <ClipboardList size={16} /> 任务信息
          </div>
          <div className="bg-theme-card/30 border border-theme-border rounded-xl p-4 space-y-3 text-sm">
            <div>
              <div className="text-[11px] text-slate-500 uppercase font-bold mb-1">外包方</div>
              <div className="text-theme-primary text-sm">{task.externalCompanyName}</div>
              <div className="text-slate-500 text-xs">{task.externalContactName}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase font-bold mb-1">交付截止</div>
              <div className="text-theme-primary text-sm">{task.deadline || '-'}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase font-bold mb-1">剪辑需求</div>
              <div className="text-slate-400 text-xs leading-relaxed">{task.brief || '暂无'}</div>
            </div>
          </div>

          {/* Action buttons */}
          {(task.status === 'delivered' || task.status === 'reviewing') && (
            <div className="mt-4 space-y-2">
              <button
                onClick={() => onApprove(task.id)}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-lg text-sm font-bold transition-all"
              >
                <CheckCircle2 size={16} /> 通过
              </button>
              <button
                onClick={() => onReject(task.id)}
                className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2.5 rounded-lg text-sm font-bold transition-all border border-red-500/30"
              >
                <XCircle size={16} /> 打回修改
              </button>
            </div>
          )}
          {task.status === 'rejected' && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
              <AlertCircle size={20} className="mx-auto mb-1 text-red-400" />
              <p className="text-xs text-red-400">已打回，等待外包方重新提交</p>
            </div>
          )}
          {task.status === 'approved' && (
            <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <CheckCircle2 size={20} className="mx-auto mb-1 text-green-400" />
              <p className="text-xs text-green-400">任务已完成</p>
              <p className="text-[10px] text-slate-500 mt-0.5">完成于 {task.completedAt}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== External: My Tasks ====================

const ExternalMyTasks: React.FC<{
  tasks: PartnerTask[];
  onTaskClick: (id: string) => void;
  onDownload: () => void;
  onDeliver: () => void;
}> = ({ tasks, onDownload, onDeliver }) => {
  const pending = tasks.filter(t => t.status === 'published').length;
  const inProgress = tasks.filter(t => t.status === 'delivered' || t.status === 'reviewing').length;
  const rejected = tasks.filter(t => t.status === 'rejected').length;
  const done = tasks.filter(t => t.status === 'approved').length;

  const statCards = [
    { label: '待处理', value: pending, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Clock },
    { label: '进行中', value: inProgress, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: RefreshCw },
    { label: '需修改', value: rejected, color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertCircle },
    { label: '已完成', value: done, color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle2 },
  ];

  return (
    <div className="p-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(s => (
          <div key={s.label} className={`rounded-xl border border-theme-border p-4 ${s.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <s.icon size={18} className={s.color} />
              <span className="text-2xl font-bold text-theme-primary">{s.value}</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-2 gap-4">
        {tasks.map(task => {
          const sc = statusConfig[task.status];
          const daysLeft = getDaysLeft(task.deadline);
          const latestDelivery = task.deliveries[task.deliveries.length - 1];
          return (
            <div key={task.id} className="bg-theme-card/30 border border-theme-border rounded-xl p-5 hover:border-theme-accent/30 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-theme-primary">{task.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{task.projectName}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.color} shrink-0`}>{sc.label}</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{task.brief || '暂无需求描述'}</p>

              <div className="flex items-center gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-500" />
                  <span className={daysLeft < 3 ? 'text-red-400 font-medium' : 'text-slate-500'}>
                    {task.deadline} {daysLeft >= 0 ? `(${daysLeft}天)` : '(已逾期)'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package size={13} className="text-slate-500" />
                  <span className="text-slate-500">{task.assets.length} 个素材</span>
                </div>
                {latestDelivery && (
                  <div className="flex items-center gap-1.5">
                    <Layers size={13} className="text-slate-500" />
                    <span className="text-slate-500">最新 v{latestDelivery.version}</span>
                  </div>
                )}
              </div>

              {/* Action buttons based on status */}
              <div className="flex items-center gap-2">
                {(task.status === 'published' || task.status === 'rejected') && (
                  <>
                    <button onClick={onDownload} className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent/10 text-theme-accent rounded-lg text-xs font-medium hover:bg-theme-accent/20 transition-colors">
                      <Download size={13} /> 下载素材
                    </button>
                    <button onClick={onDeliver} className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent hover:opacity-90 text-white rounded-lg text-xs font-medium transition-all">
                      <Upload size={13} /> 提交交付
                    </button>
                  </>
                )}
                {task.status === 'delivered' && (
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400">
                    <Clock size={13} /> 等待制作方审核中...
                  </div>
                )}
                {task.status === 'reviewing' && (
                  <div className="flex items-center gap-1.5 text-xs text-purple-400">
                    <Clock size={13} /> 审片中...
                  </div>
                )}
                {task.status === 'rejected' && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400">
                    <AlertCircle size={13} /> 有修改意见，请查看反馈
                  </div>
                )}
                {task.status === 'approved' && (
                  <div className="flex items-center gap-1.5 text-xs text-green-400">
                    <CheckCircle2 size={13} /> 任务已完成
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== External: Download ====================

const ExternalDownload: React.FC<{
  tasks: PartnerTask[];
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string) => void;
}> = ({ tasks, selectedTaskId, setSelectedTaskId }) => {
  const downloadableTasks = tasks.filter(t => t.status !== 'approved');
  const [activeTaskId, setActiveTaskId] = useState<string>(selectedTaskId || downloadableTasks[0]?.id || '');
  const activeTask = downloadableTasks.find(t => t.id === activeTaskId);

  return (
    <div className="p-6 flex gap-5 h-full">
      {/* Task list sidebar */}
      <div className="w-64 shrink-0">
        <div className="text-xs font-bold text-slate-500 uppercase mb-3">选择任务</div>
        <div className="space-y-1.5">
          {downloadableTasks.map(task => (
            <button
              key={task.id}
              onClick={() => { setActiveTaskId(task.id); setSelectedTaskId(task.id); }}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                activeTaskId === task.id ? 'bg-theme-accent/10 border border-theme-accent/30' : 'border border-transparent hover:bg-white/5'
              }`}
            >
              <div className="text-sm text-theme-primary font-medium truncate">{task.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{task.assets.length} 个文件 · {task.projectName}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Asset list */}
      <div className="flex-1 min-w-0">
        {activeTask ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-theme-primary">{activeTask.name} - 素材包</h3>
                <p className="text-xs text-slate-500 mt-0.5">共 {activeTask.assets.length} 个文件</p>
              </div>
              <button className="flex items-center gap-2 bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <FileArchive size={15} /> 打包下载全部
              </button>
            </div>
            <div className="bg-theme-card/30 border border-theme-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-theme-border text-slate-500 text-xs uppercase">
                    <th className="text-left px-4 py-3 font-medium">文件名</th>
                    <th className="text-left px-4 py-3 font-medium">大小</th>
                    <th className="text-left px-4 py-3 font-medium">分辨率</th>
                    <th className="text-left px-4 py-3 font-medium">时长</th>
                    <th className="text-right px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTask.assets.map(a => (
                    <tr key={a.id} className="border-b border-theme-border/50 hover:bg-white/5 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileVideo size={15} className="text-slate-500" />
                          <span className="text-theme-primary text-sm">{a.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{a.size}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{a.resolution}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{a.duration}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="px-3 py-1 text-theme-accent hover:bg-theme-accent/10 rounded text-xs transition-colors inline-flex items-center gap-1">
                          <Download size={12} /> 下载
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-600">
            <div className="text-center">
              <Inbox size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无可下载的素材</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== External: Deliver ====================

const ExternalDeliver: React.FC<{
  tasks: PartnerTask[];
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string) => void;
  deliverNotes: string;
  setDeliverNotes: (v: string) => void;
  onDeliver: (taskId: string) => void;
  showSuccess: boolean;
}> = ({ tasks, selectedTaskId, setSelectedTaskId, deliverNotes, setDeliverNotes, onDeliver, showSuccess }) => {
  const deliverableTasks = tasks.filter(t => t.status === 'published' || t.status === 'rejected');
  const [activeTaskId, setActiveTaskId] = useState<string>(selectedTaskId || deliverableTasks[0]?.id || '');
  const activeTask = deliverableTasks.find(t => t.id === activeTaskId);
  const nextVersion = activeTask ? activeTask.deliveries.length + 1 : 1;

  return (
    <div className="p-6 flex gap-5 h-full">
      {/* Task list sidebar */}
      <div className="w-64 shrink-0">
        <div className="text-xs font-bold text-slate-500 uppercase mb-3">选择任务</div>
        <div className="space-y-1.5">
          {deliverableTasks.map(task => {
            const sc = statusConfig[task.status];
            return (
              <button
                key={task.id}
                onClick={() => { setActiveTaskId(task.id); setSelectedTaskId(task.id); }}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  activeTaskId === task.id ? 'bg-theme-accent/10 border border-theme-accent/30' : 'border border-transparent hover:bg-white/5'
                }`}
              >
                <div className="text-sm text-theme-primary font-medium truncate">{task.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${sc.bg} ${sc.color}`}>{sc.label}</span>
                  {task.deliveries.length > 0 && <span className="text-[10px] text-slate-600">当前 v{task.deliveries.length}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload area */}
      <div className="flex-1 min-w-0">
        {activeTask ? (
          <div className="max-w-2xl">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-theme-primary">{activeTask.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">即将提交 v{nextVersion} 版本</p>
            </div>

            {/* Upload zone */}
            <div className="border-2 border-dashed border-theme-border rounded-xl p-8 text-center hover:border-theme-accent/40 transition-colors cursor-pointer mb-5">
              <Upload size={36} className="mx-auto mb-3 text-slate-600" />
              <p className="text-sm text-theme-primary font-medium">点击或拖拽上传成片</p>
              <p className="text-xs text-slate-500 mt-1">支持 mp4 / mov / mkv 格式，最大 5GB</p>
            </div>

            {/* Project file upload (optional) */}
            <div className="border-2 border-dashed border-theme-border/50 rounded-xl p-5 text-center hover:border-theme-accent/30 transition-colors cursor-pointer mb-5">
              <FileArchive size={24} className="mx-auto mb-2 text-slate-600" />
              <p className="text-xs text-slate-400">上传工程文件（可选）</p>
              <p className="text-[10px] text-slate-600 mt-1">prproj / aep / drp</p>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">剪辑说明</label>
              <textarea
                value={deliverNotes}
                onChange={e => setDeliverNotes(e.target.value)}
                placeholder="如：调整了第三段节奏，更换了BGM..."
                rows={3}
                className="w-full bg-theme-card border border-theme-border rounded-lg px-4 py-2.5 text-sm text-theme-primary placeholder:text-slate-600 focus:border-theme-accent/50 outline-none resize-none"
              />
            </div>

            {/* Submit */}
            <button
              onClick={() => onDeliver(activeTask.id)}
              className="w-full flex items-center justify-center gap-2 bg-theme-accent hover:opacity-90 text-white py-3 rounded-lg text-sm font-bold transition-all"
            >
              <Send size={16} /> 提交交付 (v{nextVersion})
            </button>

            {showSuccess && (
              <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={18} className="text-green-400" />
                <span className="text-sm text-green-400">交付成功！制作方将收到通知。</span>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-600">
            <div className="text-center">
              <Inbox size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无可交付的任务</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== External: Feedback ====================

const ExternalFeedback: React.FC<{
  tasks: PartnerTask[];
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string) => void;
  onResubmit: () => void;
}> = ({ tasks, onResubmit }) => {
  // Show tasks that have review comments (rejected versions)
  const tasksWithFeedback = tasks.filter(t => t.deliveries.some(d => d.reviewComments && d.reviewComments.length > 0));
  const tasksRejected = tasks.filter(t => t.status === 'rejected');
  const tasksApproved = tasks.filter(t => t.status === 'approved');

  return (
    <div className="p-6 max-w-4xl">
      {/* Rejected tasks (need action) */}
      {tasksRejected.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-red-400" />
            <h3 className="text-sm font-bold text-red-400">需要修改</h3>
          </div>
          <div className="space-y-3">
            {tasksRejected.map(task => {
              const rejectedDelivery = task.deliveries.find(d => d.status === 'rejected');
              return (
                <div key={task.id} className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-theme-primary">{task.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{task.projectName} · v{rejectedDelivery?.version} 被打回</p>
                    </div>
                    <button
                      onClick={onResubmit}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent hover:opacity-90 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      <RefreshCw size={13} /> 修改并重新提交
                    </button>
                  </div>
                  {rejectedDelivery?.reviewComments && (
                    <div className="space-y-1.5 mt-2 pt-2 border-t border-red-500/10">
                      {rejectedDelivery.reviewComments.map(c => (
                        <div key={c.id} className="flex items-start gap-2 text-xs">
                          <span className="text-theme-accent font-mono shrink-0">{c.timestamp}</span>
                          <span className={`shrink-0 font-bold ${c.type === 'reject' ? 'text-red-400' : 'text-slate-400'}`}>
                            {c.type === 'reject' ? '[打回]' : '[意见]'}
                          </span>
                          <span className="text-slate-400">{c.content}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Approved tasks */}
      {tasksApproved.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-green-400" />
            <h3 className="text-sm font-bold text-green-400">已通过</h3>
          </div>
          <div className="space-y-3">
            {tasksApproved.map(task => (
              <div key={task.id} className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-theme-primary">{task.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{task.projectName} · 完成于 {task.completedAt}</p>
                  </div>
                  <CheckCircle2 size={20} className="text-green-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History feedback */}
      {tasksWithFeedback.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-400">历史审片记录</h3>
          </div>
          <div className="space-y-3">
            {tasksWithFeedback.map(task => (
              <div key={task.id} className="bg-theme-card/30 border border-theme-border rounded-xl p-4">
                <h4 className="text-sm font-bold text-theme-primary mb-2">{task.name}</h4>
                {task.deliveries.filter(d => d.reviewComments && d.reviewComments.length > 0).map(delivery => (
                  <div key={delivery.version} className="space-y-1.5">
                    <div className="text-[11px] text-slate-500 font-bold">v{delivery.version}</div>
                    {delivery.reviewComments!.map(c => (
                      <div key={c.id} className="flex items-start gap-2 text-xs">
                        <span className="text-theme-accent font-mono shrink-0">{c.timestamp}</span>
                        <span className={`shrink-0 font-bold ${c.type === 'reject' ? 'text-red-400' : c.type === 'approve' ? 'text-green-400' : 'text-slate-400'}`}>
                          {c.type === 'reject' ? '[打回]' : c.type === 'approve' ? '[通过]' : '[意见]'}
                        </span>
                        <span className="text-slate-400">{c.content}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {tasksRejected.length === 0 && tasksApproved.length === 0 && tasksWithFeedback.length === 0 && (
        <div className="h-64 flex items-center justify-center text-slate-600">
          <div className="text-center">
            <Inbox size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无审片反馈</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerCollaboration;
