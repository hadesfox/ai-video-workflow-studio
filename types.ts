export enum MainTab {
  PROJECTS = 'PROJECTS',
  ASSETS = 'ASSETS',
  MASTER_LIB = 'MASTER_LIB',
  VIDEO = 'VIDEO',
  EDITOR = 'EDITOR'
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

export interface Project {
  id: string;
  name: string;
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

export interface AppState {
  currentTab: MainTab;
  assetSubTab: AssetSubTab;
  project: Project | null;
  assets: Asset[];
  shots: Shot[];
}