# AI 视频创作工作流 Studio

> 面向影视/短视频团队的一站式 AI 视频创作工作流工具

[![Deploy Status](https://img.shields.io/badge/GitHub%20Pages-Live-success?style=flat-square)](https://hadesfox.github.io/ai-video-workflow-studio/)
[![Version](https://img.shields.io/badge/version-1.2.0-blue?style=flat-square)]()
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)]()

🔗 **[在线体验](https://hadesfox.github.io/ai-video-workflow-studio/)** · 演示账号 `admin / 123456`

---

## 这是什么

AI视频制作全流程工具，覆盖公司内部100+人团队及外部数十人团队，将制作效率提升3倍。从剧本导入到最终视频合成，打通资产提取、分镜生成、素材管理、配音绑定全链路。

## 功能模块

| 模块 | 能力 |
|------|------|
| 📋 **项目管理** | 导入剧本创建项目，按工作流阶段推进创作 |
| 🎭 **资产管理** | AI提取角色/场景/道具，生成多形态状态资产与细节设定 |
| 🎵 **素材库** | 配音/音乐/音效/视频/图片五类素材分页管理，带标签分类与筛选 |
| 🔊 **配音绑定** | 角色绑定配音素材，分镜提示词自动追加配音标签 |
| 🎬 **视频管理** | 分镜生成、提示词编辑、关联资产校验与视频合成 |
| ⚙️ **后台管理** | 模型调用配置、用户与权限管理 |

## 技术架构

```
React 19 + TypeScript + Vite 6
├── UI: Tailwind CSS 4 + Semi Design + Framer Motion + Lucide Icons
├── AI: Google Gemini API (资产提取/分镜生成)
├── Deploy: GitHub Pages + GitHub Actions
└── Auth: 内置鉴权系统
```

## 本地运行

```bash
npm install
npm run dev          # 启动开发服务器
# （可选）在 .env.local 中配置 GEMINI_API_KEY
# 未配置时以演示模式运行
```

```bash
npm run build        # 构建
npm run deploy       # 部署到 GitHub Pages
```

## 项目文档

- [素材库与配音绑定需求文档](docs/素材库与配音绑定需求文档.md)

## 项目背景

该工具在日常工作中持续迭代，以2日小版本/1周大版本的频率发布数十个版本，不断根据团队反馈优化工作流体验。

---

*如果这个项目对你有启发，欢迎 ⭐ Star*