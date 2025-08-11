# 轻量级云盘项目

基于 Next.js 和 Vercel Blob 的轻量级云盘系统，提供简单直接的文件共享服务。

## 功能特性

- ✨ 零门槛访问：通过链接即可访问独立文件空间
- 📁 文件管理：支持上传、下载、删除文件
- 🔍 文件搜索：支持文件名搜索和排序
- 📱 响应式设计：支持桌面端、平板、手机端访问
- 🚀 拖拽上传：支持拖拽和多文件同时上传
- 📊 空间统计：显示文件数量和存储用量
- 🎨 现代 UI：基于 shadcn/ui 的简洁界面

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui
- **图标**: Lucide React
- **文件存储**: Vercel Blob
- **部署平台**: Vercel

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制环境变量文件：

```bash
cp .env.example .env.local
```

在 Vercel Dashboard 中：
1. 创建项目并部署
2. 前往 Storage 标签页
3. 创建 Blob Store
4. 复制 `BLOB_READ_WRITE_TOKEN` 到 `.env.local`

### 3. 开发运行

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 4. 部署到 Vercel

```bash
# 使用 Vercel CLI
npm i -g vercel
vercel

# 或者推送到 GitHub 并在 Vercel Dashboard 中导入
```

## 项目结构

```
src/
├── app/
│   ├── space/[spaceId]/
│   │   └── page.tsx        # 文件空间页面
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts    # 文件上传 API
│   │   ├── files/
│   │   │   └── route.ts    # 文件列表 API
│   │   └── delete/
│   │       └── route.ts    # 文件删除 API
│   ├── layout.tsx          # 根布局
│   ├── page.tsx           # 首页（重定向）
│   └── globals.css        # 全局样式
├── components/
│   ├── ui/                # shadcn/ui 组件
│   ├── FileUploader.tsx   # 文件上传组件
│   ├── FileList.tsx       # 文件列表组件
│   ├── FileItem.tsx       # 文件项组件
│   └── SpaceInfo.tsx      # 空间信息组件
├── lib/
│   ├── blob.ts           # Vercel Blob 操作
│   ├── utils.ts          # 工具函数
│   └── types.ts          # 类型定义
└── hooks/
    ├── useFileUpload.ts  # 文件上传钩子
    └── useFileList.ts    # 文件列表钩子
```

## API 接口

### 上传文件
```
POST /api/upload
Content-Type: multipart/form-data

参数：
- file: 文件对象
- spaceId: 空间ID
```

### 获取文件列表
```
GET /api/files?spaceId={spaceId}

返回：
- files: 文件列表
- spaceStats: 空间统计信息
```

### 删除文件
```
DELETE /api/delete
Content-Type: application/json

参数：
- fileId: 文件ID
```

## 使用方式

1. **访问文件空间**: 通过 `https://your-domain.com/space/{spaceId}` 访问特定空间
2. **上传文件**: 拖拽文件到上传区域或点击选择文件
3. **管理文件**: 查看、搜索、排序、下载、删除文件
4. **空间隔离**: 每个 `spaceId` 对应独立的存储空间

## 配置说明

### 文件限制
- 最大文件大小: 10MB
- 支持的文件类型在 `src/app/api/upload/route.ts` 中配置

### 环境变量
```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

### Vercel 配置
- 上传接口超时时间: 60秒
- 其他 API 超时时间: 30秒

## 安全特性

- 文件类型白名单验证
- 文件大小限制
- 空间完全隔离
- 文件名安全处理
- 自动去重命名

## 开发命令

```bash
# 开发环境
npm run dev

# 构建
npm run build

# 生产环境运行
npm run start

# 代码检查
npm run lint

# 类型检查
npm run typecheck
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请创建 Issue 或联系项目维护者。