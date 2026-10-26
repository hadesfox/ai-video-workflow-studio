// 真实分镜案例（第一个分镜）：用于后续布局改动时的长文本/多行提示词验证
// 数据来源为用户当前分镜原文，请勿改动正文内容
import type { ExtendedShot } from '../types';

export interface ShotPromptCase {
  /** 固定前缀提示词 */
  frontPrompt: string;
  /** 分镜正文（可编辑部分） */
  shotPrompt: string;
  /** 固定后缀提示词 */
  backPrompt: string;
  /** 分镜内引用的音频名称（用于渲染参考素材中的音频行） */
  referenceAudioNames?: string[];
  /** 分镜内引用的图片素材名称（用于渲染参考素材缩略图） */
  referenceImageNames?: string[];
}

export const SHOT_PROMPT_CASE: ShotPromptCase = {
  frontPrompt: `全程无字幕无背景音乐，所有台词、画外音等人声都为英文，禁止出现中文人声。所有镜头都禁止人物看镜头
全局光线：角色1身体上和皮肤上的光影完全贴合场景光影，光线追踪 全局画风：整段视频采用成人向动漫化风格3D动画渲染，所有画面都是明显的计算机三维动画，不是真人拍摄，也不是真人数字替身。角色具有一眼可辨的动画面部设计：明显放大的细长杏仁形眼睛、适度放大的虹膜、清晰的动画式眼神光、概括的眼睑与睫毛、简化但立体的鼻子和嘴唇。保持成熟眉骨、颧骨、鼻梁和利落下颌，不使用幼儿脸。 皮肤使用干净、无毛孔的风格化3D材质，肤色均匀，明暗概括，具有柔和的动画式半透明感和人工设计的高光形状；不呈现真人皮肤纹理、毛孔、汗毛、皱纹或摄影级瑕疵。头发由雕塑化大型发束组成，带少量装饰性发丝和清楚的动画高光，不是真人发丝模拟。服装采用简化而可信的风格化三维材质，褶皱清晰但不过度写实。以下所有镜头动作流畅，没有抽帧效果。3D动画效果，动作流畅，无任何2D画质`,

  shotPrompt: `【@贾斯珀·米勒_虚荣阔少常态】使用 【@音频1】, 【@塞蕾娜_假名媛常态】使用 【@音频2】, 
人物初始站位：夜晚时刻。【@贾斯珀·米勒_虚荣阔少常态】和【@塞蕾娜_假名媛常态】站在场景图【@别墅-后花园喷泉池旁_主状态】中的喷泉池的正前方，塞蕾娜搂着贾斯珀的脖子，贾斯珀微微俯身抱着塞蕾娜的腰，两人面对面，贾斯珀在左，塞蕾娜在右。

2秒
微侧面近景
塞蕾娜搂着贾斯珀的脖子，贾斯珀微微弯腰双手搂着她的腰，一边抚摸，两人激情拥吻。
音效：亲嘴音效、塞蕾娜娇喘

4秒
侧面特写，镜头跟随晃动
【画面内容】贾斯珀正亲得深情，塞蕾娜松开搂着贾斯珀脖子的右手，手指抵在贾斯珀唇边，阻止了他的吻，指尖轻轻点在贾斯珀唇上，嘴角挂着娇嗲的笑。贾斯珀在画面左侧，低头看着她，眼中带着笑意。
【音频同步】台词/塞蕾娜（撒娇、娇嗲、甜美、尖细）：“Jasper, you haven't kissed that fat cow too, have you?”（贾斯珀，你不会也吻过那个胖女人吧？）；音效：手指抵住唇的细微肌肤摩擦声、喷泉持续的水声。

3秒
微侧面近景，镜头跟随动作晃动
【画面内容】贾斯珀嘴角勾起一抹轻蔑的弧度，表情满是嘲笑与不屑，他把脸凑到塞蕾娜脸边摩挲，还想继续亲吻，语气傲慢，姿态动作轻浮。贾斯珀单人镜头
【音频同步】台词/贾斯珀（轻蔑、不屑、耻笑、傲慢、气泡音）：“Darling, please!One look at her and I'll throw up.”（亲爱的，怎么可能？她那副样子，我看一眼都倒胃口。）；音效：贾斯珀轻蔑的低笑声、喷泉持续的水声。

3秒：
微侧面近景，镜头推进
【画面内容】塞蕾娜表情娇俏，把贾斯珀轻轻推开，最后一秒把手伸到背后。塞蕾娜单人镜头
【音频同步】台词/塞蕾娜（撒娇、娇嗲、甜美、尖细）：“Darling~~I've got a surprise for your birthday.”

2秒
侧面中景，镜头缓慢小幅度下移
塞蕾娜故作神秘地从背后掏出一只【@雅克大师腕表_礼盒】，递到贾斯珀面前，塞蕾娜语调轻柔。贾斯珀在画面左边，表情好奇，逐渐变得惊喜。
【音频同步】台词/塞蕾娜（撒娇、娇嗲、甜美、尖细）：“A watch by Master Jacques...”

3秒
俯拍跟随特写人物手部动作
贾斯珀接过表盒
【音频同步】台词/塞蕾娜（撒娇、娇嗲、甜美、尖细）：“...the only one in the world. Open it!”（亲爱的，这是我为你准备的生日惊喜。雅克大师设计的腕表，全球仅有一个，打开看看。）；

3秒
微侧面近景，镜头跟随动作微微晃动
【画面内容】贾斯珀在眼中满是狂喜，他的目光死死锁在表盒上。贾斯珀单人镜头
【音频同步】台词/贾斯珀（狂喜、虚荣、激动、尾音上扬）：“Serena, this is far too valuable!

3秒
镜头先侧面特写表盒打开，然后缓慢上移至贾斯珀侧面特写
【画面内容】贾斯珀激动打开表盒，表盒朝向贾斯珀自己打开。他的嘴角咧开，露出贪婪的笑容。
【音频同步】台词/贾斯珀（狂喜、虚荣、激动、尾音上扬）：“You're really giving it to me?!”；

3秒：
跟随特写手部动作
【画面内容】贾斯珀把快速把表盒合上塞进西装，
【音频同步】画外音/贾斯珀（霸道、低沉气泡音）：“I knew it — you're the real heiress! ”`,

  backPrompt: `【镜头空间约束】 1. 人物固定方位：全程相对位置绝不互换。 2. 轴线规则：所有摄像机机位必须保持在轴线的同一侧，严禁跨越人物连线切换到轴线对面拍摄，禁止颠倒人物画面左右位置。 【镜头允许机位范围】 ✅ 允许：轴线同侧的全景、中景、过肩镜头、单人正反打近景、特写；所有机位不穿过两人连线。 ❌ 禁止：越过人物连线的机位、反转人物视线朝向的镜头。 【动态要求】 人物可以做肢体动作、转头、表情情绪变化，但人物在画面内的左右归属、视线大方向不可改变；镜头可以推拉摇移，但移动过程中严禁跨过180°轴线。`,

  referenceAudioNames: ['音频1', '音频2'],

  referenceImageNames: ['贾斯珀·米勒', '塞蕾娜', '别墅-后花园喷泉池旁', '雅克大师腕表'],
};

// 占位素材尺寸：按画幅比例生成，便于验证横屏/竖屏布局
export const getPlaceholderSize = (ratio?: string) => {
  switch (ratio) {
    case '9:16': return '450/800';
    case '3:4': return '480/640';
    case '1:1': return '600/600';
    case '21:9': return '960/411';
    case '4:3': return '640/480';
    default: return '800/450';
  }
};

// 生成 10 个布局样例分镜：第 1 个为完整案例，其余为案例片段，混排不同画幅
// completed=false 时只生成分镜、不预置视频，保留逐步点击生成的流程
export const createSampleShots = (episodeId: string, completed = true): ExtendedShot[] => {
  const { frontPrompt, backPrompt, shotPrompt } = SHOT_PROMPT_CASE;
  const segments = shotPrompt.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  const ratios = ['9:16', '16:9', '16:9', '9:16', '1:1', '21:9', '4:3', '3:4', '16:9', '9:16'];
  const now = Date.now();

  return Array.from({ length: 10 }).map((_, idx): ExtendedShot => {
    const id = `shot-${episodeId}-${now}-${idx}`;
    const body = idx === 0 ? shotPrompt : (segments[idx] || shotPrompt);
    const ratio = ratios[idx];
    const durationMatch = body.match(/^(\d+)秒/);
    const duration = idx === 0 ? 30 : (durationMatch ? Number(durationMatch[1]) : 3);
    const videoUrl = `https://picsum.photos/seed/${id}-sample/${getPlaceholderSize(ratio)}`;
    return {
      id,
      description: `${frontPrompt}\n${body}\n${backPrompt}`,
      duration,
      status: completed ? 'COMPLETED' : 'PENDING',
      videoUrl: completed ? videoUrl : undefined,
      videoVersions: completed ? [videoUrl] : [],
      genConfig: {
        model: '2.5',
        ratio,
        resolution: '480p',
        duration: idx === 0 ? '30s' : '自动',
        fontSize: 'md',
      },
      referenceMedia: [
        ...(SHOT_PROMPT_CASE.referenceImageNames || []).map((name, i) => ({
          id: `ref-${id}-image-${i}`,
          type: 'IMAGE' as const,
          name,
          url: `https://picsum.photos/seed/${id}-${i}/200/300`,
        })),
        ...(SHOT_PROMPT_CASE.referenceAudioNames || []).map((name, i) => ({
          id: `ref-${id}-audio-${i}`,
          type: 'AUDIO' as const,
          name,
          url: '',
        })),
      ],
    };
  });
};
