# CLAUDE.md

这个文件为 Claude Code (claude.ai/code) 在此代码库中工作提供指导。

## 项目概述

基于 Next.js 14 和 Vercel Blob 的轻量级云盘系统，提供文件上传、下载、管理功能。核心特性包括24小时自动过期删除机制和空间隔离。

## 开发命令

```bash
# 开发环境
npm run dev

# 构建项目
npm run build  

# 生产环境运行
npm run start

# 代码检查
npm run lint

# 类型检查
npm run typecheck
```

## 核心架构

### 技术栈
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **文件存储**: Vercel Blob
- **部署**: Vercel

### 关键目录结构
```
src/
├── app/
│   ├── space/[spaceId]/page.tsx    # 文件空间主页面
│   └── api/                        # API 路由
│       ├── upload/route.ts         # 文件上传 (60s timeout)  
│       ├── files/route.ts          # 文件列表 (45s timeout)
│       ├── delete/route.ts         # 文件删除 (30s timeout)
│       └── cleanup/route.ts        # 过期文件清理 (60s timeout)
├── components/                     # UI 组件
├── hooks/                         # 自定义 hooks
└── lib/
    ├── blob.ts                    # Vercel Blob 服务封装
    ├── types.ts                   # TypeScript 类型定义
    └── utils.ts                   # 工具函数
```

### 数据流模式

1. **文件管理**: 通过 `BlobService` 类统一管理 Vercel Blob 操作
2. **空间隔离**: 使用 `spaces/{spaceId}` 前缀隔离不同空间的文件
3. **过期机制**: 所有文件上传后24小时自动过期，通过 `cleanup` API 清理
4. **状态管理**: 使用自定义 hooks (`useFileUpload`, `useFileList`) 管理组件状态

### 核心服务类

**BlobService** (`src/lib/blob.ts`):
- `uploadFile()`: 文件上传到指定空间
- `listFiles()`: 获取空间内文件列表  
- `deleteFile()`: 删除单个文件
- `cleanExpiredFiles()`: 清理过期文件
- `getSpaceStats()`: 获取空间统计信息

### API 设计

- **GET** `/api/files?spaceId={id}` - 获取文件列表和空间统计
- **POST** `/api/upload` - 上传文件 (FormData: file, spaceId)
- **DELETE** `/api/delete` - 删除文件 (JSON: fileId)
- **POST/GET** `/api/cleanup` - 清理过期文件

### 重要配置

**环境变量**:
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob 访问令牌
- `CLEANUP_AUTH_TOKEN`: 定时清理API认证令牌 (可选)

**Vercel 配置** (`vercel.json`):
- API 路由设置了不同的超时时间
- 上传接口: 60秒超时
- 文件列表: 45秒超时  
- 删除和清理: 30-60秒超时

### 文件过期机制

- 所有文件上传后自动设置24小时过期时间
- 通过 `/api/cleanup` 接口清理过期文件
- 支持按空间清理或全局清理
- 可配置为定时任务(Vercel Cron Jobs)

### Tauri 集成支持

项目已支持集成到 Tauri 2.x 桌面应用中：

**环境检测**:
- `isTauriEnv()`: 检测是否在 Tauri 环境中运行
- 自动切换下载方式（浏览器 vs Tauri 原生对话框）

**下载功能**:
- 浏览器环境：传统的 `<a>` 标签下载
- Tauri 环境：使用原生文件保存对话框 + 文件写入 API
- 优雅降级：Tauri API 不可用时自动回退到浏览器下载

**相关文件**:
- `src/lib/utils.ts`: `downloadFile()`, `isTauriEnv()` 函数
- `src/hooks/useFileDownload.ts`: 下载状态管理 Hook
- `src/types/tauri.d.ts`: Tauri 插件类型声明

### 开发注意事项

1. **文件路径规范**: 所有文件存储使用 `spaces/{spaceId}/{fileName}` 格式
2. **错误处理**: 所有API都有统一的错误处理和中文提示
3. **类型安全**: 严格使用 TypeScript，所有接口都有类型定义
4. **响应式设计**: 组件支持桌面端、平板、手机端访问
5. **安全考虑**: 文件上传有类型和大小限制，空间完全隔离
6. **Tauri 兼容**: 下载功能自动适配浏览器和桌面环境

### 测试和部署

- 使用 `npm run typecheck` 确保类型正确性
- 使用 `npm run lint` 检查代码规范  
- 生产部署前确保 `BLOB_READ_WRITE_TOKEN` 环境变量已配置
- Vercel 部署时会自动应用 `vercel.json` 中的函数配置