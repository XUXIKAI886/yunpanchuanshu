# 呈尚策划 关键词描述文件上传下载系统

基于 Next.js 和 Cloudflare R2 的轻量级云盘系统，提供简单直接的临时文件共享服务。文件自动24小时过期，专为临时文件传输设计。

## 功能特性

- ✨ 零门槛访问：通过链接即可访问独立文件空间，无需注册登录
- 📁 文件管理：支持上传、下载、删除文件
- ⏰ 自动过期：文件24小时后自动删除，确保存储安全
- 🔍 文件搜索：支持文件名搜索和多种排序方式
- 📱 响应式设计：支持桌面端、平板、手机端访问
- 🚀 拖拽上传：支持拖拽和多文件同时上传
- 📊 空间统计：显示文件数量、存储用量和过期倒计时
- 🎨 现代 UI：基于 shadcn/ui 的简洁界面
- 🔄 自动清理：定期清理过期文件，保持存储空间整洁
- 🖥️ 跨平台：支持 Web 浏览器和 Tauri 桌面应用集成
- 🔒 安全可靠：文件类型白名单验证，大小限制保护

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui
- **图标**: Lucide React
- **文件存储**: Cloudflare R2 (AWS S3 兼容)
- **部署平台**: Vercel / 支持 Tauri 桌面应用

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

配置 Cloudflare R2 存储：
1. 在 Cloudflare Dashboard 中创建 R2 存储桶
2. 获取 API 令牌和访问密钥
3. 在 `.env.local` 中配置以下环境变量：

```env
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_DOMAIN=your_custom_domain_optional
```

### 3. 开发运行

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 4. 部署

#### 部署到 Vercel

```bash
# 使用 Vercel CLI
npm i -g vercel
vercel

# 或者推送到 GitHub 并在 Vercel Dashboard 中导入
```

#### Tauri 桌面应用集成

本项目已集成 Tauri 支持，可以作为桌面应用运行：

```bash
# 安装 Tauri CLI
npm install -g @tauri-apps/cli

# 构建桌面应用
npm run tauri build
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
│   │   ├── download/
│   │   │   └── route.ts    # 文件下载 API（服务端代理）
│   │   ├── delete/
│   │   │   └── route.ts    # 文件删除 API
│   │   └── cleanup/
│   │       └── route.ts    # 过期文件清理 API
│   ├── layout.tsx          # 根布局
│   ├── page.tsx           # 首页（重定向）
│   └── globals.css        # 全局样式
├── components/
│   ├── ui/                # shadcn/ui 基础组件
│   ├── FileUploader.tsx   # 文件上传组件
│   ├── FileList.tsx       # 文件列表组件
│   ├── FileItem.tsx       # 文件项组件
│   ├── SpaceInfo.tsx      # 空间信息组件
│   └── CountdownTimer.tsx # 倒计时组件
├── lib/
│   ├── r2.ts             # Cloudflare R2 存储操作
│   ├── blob.ts           # 向后兼容包装器
│   ├── utils.ts          # 工具函数
│   └── types.ts          # TypeScript 类型定义
├── hooks/
│   ├── useFileUpload.ts  # 文件上传状态管理
│   ├── useFileList.ts    # 文件列表状态管理
│   └── useFileDownload.ts # 跨平台文件下载
└── types/
    └── tauri.d.ts        # Tauri 类型定义
```

## API 接口

### 上传文件
```
POST /api/upload
Content-Type: multipart/form-data
超时: 60秒

参数：
- file: 文件对象（最大10MB）
- spaceId: 空间ID

返回：
- success: 操作状态
- file: 文件信息（含过期时间）
```

### 获取文件列表
```
GET /api/files?spaceId={spaceId}&cleanup={true|false}
超时: 45秒

参数：
- spaceId: 空间ID
- cleanup: 可选，是否同时清理过期文件

返回：
- files: 文件列表（含过期状态）
- spaceStats: 空间统计信息
- cleanupResult: 清理结果（如果启用）
```

### 下载文件
```
GET /api/download?fileId={fileId}
超时: 30秒

参数：
- fileId: 文件ID

返回：文件流（服务端代理下载，解决CORS问题）
```

### 删除文件
```
DELETE /api/delete
Content-Type: application/json
超时: 30秒

参数：
- fileId: 文件ID

或者清空整个空间：
POST /api/delete
Content-Type: application/json

参数：
- spaceId: 空间ID
```

### 清理过期文件
```
POST /api/cleanup
Content-Type: application/json
超时: 60秒

参数：
- spaceId: 可选，指定空间ID（不指定则清理所有空间）

返回：
- deletedCount: 删除文件数量
- deletedFiles: 删除的文件名列表
```

## 使用方式

1. **访问文件空间**: 通过 `https://your-domain.com/space/{spaceId}` 访问特定空间
2. **上传文件**: 拖拽文件到上传区域或点击选择文件
3. **管理文件**: 查看、搜索、排序、下载、删除文件
4. **空间隔离**: 每个 `spaceId` 对应独立的存储空间
5. **过期管理**: 查看文件剩余时间，文件24小时后自动删除

## 核心特性详解

### 自动过期机制
- 文件上传后24小时自动过期
- 实时倒计时显示剩余时间
- 每10分钟自动检查并清理过期文件
- 支持手动触发清理操作

### 下载功能
- 服务端代理下载，完美解决CORS问题
- 支持浏览器和Tauri桌面环境
- 自动设置正确的文件名和下载头

### 文件管理
- 支持拖拽上传和批量上传
- 实时上传进度显示
- 文件搜索、排序、过滤功能
- 自动处理重名文件

## 配置说明

### 文件限制
- 最大文件大小: 10MB
- 支持的文件类型: 图片、文档、压缩包、音视频等
- 详细类型列表在 `src/app/api/upload/route.ts` 中配置

### 环境变量
```env
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_DOMAIN=your_custom_domain_optional
```

### Vercel 配置 (`vercel.json`)
- 上传接口超时: 60秒
- 文件列表接口超时: 45秒  
- 下载接口超时: 30秒
- 删除接口超时: 30秒
- 清理接口超时: 60秒

## 安全特性

- 文件类型白名单验证
- 文件大小限制保护
- 空间完全隔离机制
- 文件名安全处理
- 自动去重命名
- 24小时自动过期删除
- 服务端代理下载避免直接暴露存储URL

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

# Tauri 开发（如果需要桌面应用）
npm run tauri dev

# 构建 Tauri 应用
npm run tauri build
```

## 技术亮点

### 存储架构
- **Cloudflare R2**: 低成本、高性能的对象存储
- **空间隔离**: 基于路径的多租户架构 `spaces/{spaceId}/`
- **自动清理**: 基于元数据的智能过期管理

### 前端架构  
- **Next.js 14**: 最新的 App Router 架构
- **React Hooks**: 自定义 hooks 管理复杂状态
- **TypeScript**: 全栈类型安全
- **Tailwind CSS**: 响应式设计

### 下载方案
- **服务端代理**: 彻底解决 CORS 限制
- **流式传输**: 支持大文件下载
- **跨平台兼容**: Web + Tauri 双环境支持

## 故障排除

### 常见问题

**Q: 文件上传失败？**
A: 检查文件大小是否超过10MB，文件类型是否在白名单中，网络连接是否正常

**Q: 文件下载失败？**  
A: 本项目使用服务端代理下载，确保R2配置正确，文件未过期

**Q: 环境变量配置错误？**
A: 确保R2的endpoint、密钥等配置正确，参考环境配置章节

**Q: Tauri集成问题？**
A: 确保安装了Tauri CLI，检查系统依赖是否完整

### 调试技巧

```bash
# 检查环境变量
npm run dev -- --debug

# 查看API日志
# 在浏览器开发者工具中查看Network面板

# 检查R2连接
# 在R2 Dashboard中验证存储桶访问权限
```

## 路线图

- [x] 基础文件上传下载
- [x] 24小时自动过期
- [x] 服务端代理下载  
- [x] Tauri桌面应用支持
- [ ] 批量操作优化
- [ ] 文件预览功能
- [ ] 下载进度显示
- [ ] 更多文件类型支持
- [ ] 自定义过期时间
- [ ] 文件分享链接

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)  
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- **项目维护**: 呈尚策划团队
- **用途**: 关键词描述文件上传下载系统
- **反馈**: 如有问题或建议，请创建 [Issue](../../issues)

---

> 💡 **提示**: 这是一个临时文件存储系统，文件会在24小时后自动删除。请及时下载重要文件！