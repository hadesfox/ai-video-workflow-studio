export enum MainTab {
  PROJECTS = 'PROJECTS',
  ASSETS = 'ASSETS',
  MASTER_LIB = 'MASTER_LIB',
  VIDEO = 'VIDEO',
  REVIEW = 'REVIEW',
  PARTNER = 'PARTNER',
  GENERATOR = 'GENERATOR'
}

export enum WorkflowStage {
  SCRIPT = 'SCRIPT',
  ASSETS = 'ASSETS',
  MASTER_LIB = 'MASTER_LIB',
  VIDEO = 'VIDEO',
  EXPORT = 'EXPORT'
}

export enum AssetSubTab {
  EPISODES = 'EPISODES',
  IMAGES = 'IMAGES',
  TTS = 'TTS'
}

export enum VideoSubTab {
  VIDU = 'VIDU',
  SEEDANCE = 'SEEDANCE'
}

export enum ReviewSubTab {
  ONLINE_REVIEW = 'ONLINE_REVIEW',
  FINAL_DELIVERY = 'FINAL_DELIVERY'
}

export enum MasterLibSubTab {
  SEEDANCE = 'SEEDANCE',
  SPARK = 'SPARK'
}

export interface ProjectGroup {
  id: string;
  name: string;
}

export interface UserAccount {
  id: string;
  username: string;
  realName: string;
  email: string;
  roleId: string;
  groupId?: string;
  permissions: string[];
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Project {
  id: string;
  name: string;
  groupId?: string;
  scriptType: 'NARRATIVE' | 'PLOT' | 'COMMENTARY';
  scriptContent: string;
  createdAt: Date;
  lastModified: Date;
}

export interface AssetState {
  id: string;
  name: string; // e.g. "常规状态", "战损状态"
  description: string;
  mainImageUrl?: string;
  thumbnailUrls: string[]; // Other angles
  prompt?: string;
  attributes?: Record<string, string>; // e.g. { "Hair": "Black", "Mood": "Angry" }
}

export interface Asset {
  id: string;
  name: string;
  type: 'CHARACTER' | 'SCENE' | 'PROP' | 'WORLD';
  description: string;
  inMasterLib: boolean;
  // Compatibility field, usually points to activeState's mainImage
  imageUrl?: string;
  states: AssetState[];
}

export interface Shot {
  id: string;
  description: string;
  duration: number;
  videoUrl?: string;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'ERROR'; // Added ERROR status
}

// 扩展 Shot 接口以在本地支持多版本视频
export interface ExtendedShot extends Shot {
  videoVersions?: string[]; // 存储历史版本
}

// 分集接口
export interface Episode {
  id: string;
  name: string;
  scriptContent: string; // Added script content
  shots: ExtendedShot[];
}

export interface VideoSettings {
  ratio: string;
  resolution: string;
  duration: string;
}

export interface TimelineClip {
  id: string;
  shotId: string;
  videoUrl: string;
  duration: number;
  thumbnail?: string;
}

export interface WorldviewEntry {
  id: string;
  faction: string; // 阵营/类别
  description: string; // 外观共通元素设定
}

// New Error Interface
export interface GenerationError {
  id: string;
  shotId?: string; // Fix: Added optional shotId to track error source
  episodeName: string;
  shotIndex: number;
  message: string;
  detail: string;
  timestamp: Date;
}

export type ConfigKeys = 
  | 'script' 
  | 'indexProps' | 'indexScenes' | 'indexChars' 
  | 'worldview' 
  | 'detailProps' | 'detailScenes' | 'detailChars'
  | 'special3' | 'special2' | 'special1'
  | 'imgPromptProps' | 'imgPromptScenes' | 'imgPromptChars'
  | 'storyboard';

export interface AgentSettings {
  model: string;
  prompt: string;
  enabled?: boolean; // 开关状态
}

export interface ReviewItem {
  id: string;
  name: string;
  type: 'FILE' | 'FOLDER';
  fileType?: 'VIDEO' | 'AUDIO' | 'IMAGE' | 'OTHER';
  size?: number;
  duration?: string;
  version?: string;
  versions?: string[];
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string; // For folder structure
}

export interface AppState {
  currentTab: MainTab;
  assetSubTab: AssetSubTab;
  project: Project | null;
  assets: Asset[];
  shots: Shot[];
}

// ==================== 外发协作模块 ====================

export enum PartnerSubTab {
  TASK_LIST = 'TASK_LIST',
  NEW_TASK = 'NEW_TASK',
  TASK_DETAIL = 'TASK_DETAIL'
}

export enum PartnerExternalSubTab {
  MY_TASKS = 'MY_TASKS',
  DOWNLOAD = 'DOWNLOAD',
  DELIVER = 'DELIVER',
  FEEDBACK = 'FEEDBACK'
}

export type PartnerTaskStatus =
  | 'draft'        // 草稿（从视频管理创建，待填写详情）
  | 'pending'      // 待发布
  | 'published'    // 已下发
  | 'delivered'    // 已交付
  | 'reviewing'    // 审片中
  | 'approved'     // 已通过
  | 'rejected';    // 已打回

export interface PartnerAssetItem {
  id: string;
  name: string;
  size: string;
  resolution: string;
  duration: string;
  thumbnail?: string;
}

export interface PartnerDeliveryVersion {
  version: number;
  videoName: string;
  fileSize: string;
  uploadTime: string;
  notes: string;
  status: 'pending_review' | 'approved' | 'rejected';
  reviewComments?: ReviewComment[];
}

export interface ReviewComment {
  id: string;
  timestamp: string;   // 时间码
  author: string;
  content: string;
  type: 'approve' | 'reject' | 'comment';
}

export interface PartnerTask {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  brief: string;
  deadline: string;
  status: PartnerTaskStatus;
  externalUserId: string;
  externalCompanyName: string;
  externalContactName: string;
  assets: PartnerAssetItem[];
  deliveries: PartnerDeliveryVersion[];
  createdAt: string;
  publishedAt?: string;
  completedAt?: string;
}

export interface ExternalUser {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  status: 'active' | 'disabled';
  taskCount: number;
}