# Markdown 编辑器集成说明

## 功能概述

本项目已集成 md2wechat Markdown 编辑器，用于将 Markdown 内容转换为微信公众号文章格式。

## 主要功能

1. **Markdown 编辑**
   - 基于 Monaco Editor 的全功能 Markdown 编辑器
   - 支持语法高亮、代码补全、多主题
   - 提供常用 Markdown 语法快捷按钮
   - 支持多种文档模板

2. **实时预览**
   - 实时将 Markdown 转换为微信公众号兼容的 HTML
   - 模拟微信文章显示效果
   - 支持一键复制 HTML 到剪贴板
   - 支持下载 HTML 文件

3. **主题定制**
   - 多种预设主题（默认、科技、商务、清新、优雅等）
   - 可调节字体大小
   - 主题设置自动保存

4. **微信集成**
   - 支持创建微信公众号草稿
   - 支持批量上传图片到微信素材
   - 自动获取媒体 ID

## 使用方法

### 1. 配置 API

首次使用需要配置 md2wechat API：

1. 访问 [md2wechat 官网](https://www.md2wechat.com) 获取 API Key
2. 在编辑器中点击"设置"按钮
3. 填入以下信息：
   - md2wechat API Key
   - 微信 App ID
   - 微信 App Secret
4. 点击"确定"保存配置

### 2. 编辑文章

1. 在左侧编辑器中输入 Markdown 内容
2. 可以使用工具栏快捷按钮插入各种 Markdown 元素
3. 可以使用预设模板快速开始

### 3. 转换预览

1. 输入内容后会自动转换，或点击"转换"按钮手动转换
2. 右侧预览区域会显示转换后的效果
3. 可以调整主题和字体大小查看不同效果

### 4. 发布到微信

有两种方式发布到微信公众号：

#### 方式一：复制 HTML
1. 点击预览区域的"复制 HTML"按钮
2. 打开微信公众号文章编辑器
3. 粘贴 HTML 内容

#### 方式二：创建草稿
1. 点击"创建草稿"按钮
2. 填写文章标题、作者、摘要等信息
3. 如需封面图，先使用"批量上传图片"功能获取媒体 ID
4. 点击"确定"创建草稿
5. 登录微信公众号后台，在草稿箱中查看

### 5. 上传图片

1. 点击"创建草稿"中的"上传图片获取媒体 ID"链接
2. 在文本框中输入图片 URL，每行一个
3. 点击"确定"开始上传
4. 上传完成后可以复制媒体 ID 用于封面图

## 技术实现

### 文件结构

```
web_ui/src/
├── api/
│   └── md2wechat.ts          # md2wechat API 封装
├── components/
│   ├── MarkdownEditor.vue    # Markdown 编辑器组件
│   └── WechatPreview.vue      # 微信预览组件
├── views/
│   └── MarkdownEditor.vue     # 主编辑器页面
└── router/
    └── index.ts               # 路由配置（已添加）
```

### API 端点

- `POST /api/v1/convert` - 转换 Markdown 为 HTML
- `POST /api/v1/article-draft` - 创建文章草稿
- `POST /api/v1/batch-upload` - 批量上传图片

### 环境变量

在 `.env.development` 和 `.env.production` 中配置：

```env
VITE_MD2WECHAT_API_KEY=your_api_key
VITE_WECHAT_APPID=your_wechat_appid
VITE_WECHAT_APP_SECRET=your_wechat_app_secret
```

## 注意事项

1. **API Key 安全**
   - 不要在前端代码中硬编码 API Key
   - 建议通过环境变量或用户配置设置
   - 生产环境建议通过后端代理调用 API

2. **微信权限**
   - 创建草稿需要微信公众号的开发者权限
   - 需要配置正确的 App ID 和 App Secret

3. **图片处理**
   - 外部图片链接会被自动上传到微信素材库
   - 建议使用稳定的图片 CDN 服务
   - 大图片可能会影响转换速度

4. **Markdown 语法**
   - 支持标准 Markdown 语法
   - 支持代码块、表格、引用等扩展语法
   - 微信不支持某些 HTML 标签，会被自动过滤

## 扩展开发

### 添加新主题

在 `src/api/md2wechat.ts` 中的 `themeOptions` 数组添加新主题：

```typescript
export const themeOptions: ThemeOption[] = [
  // ... 现有主题
  { 
    value: 'custom', 
    label: '自定义主题', 
    description: '自定义主题描述' 
  }
]
```

### 添加新模板

在 `src/components/MarkdownEditor.vue` 中的 `markdownTemplates` 数组添加新模板。

## 故障排除

### 转换失败
- 检查 API Key 是否正确
- 检查网络连接
- 查看浏览器控制台错误信息

### 创建草稿失败
- 检查微信 App ID 和 Secret 是否正确
- 确认微信公众号权限
- 检查文章内容是否符合微信要求

### 图片上传失败
- 检查图片 URL 是否可访问
- 确认图片格式微信支持
- 检查图片大小是否超限

## 更新日志

### v1.0.0 (2024-01-XX)
- 初始版本发布
- 集成 md2wechat API
- 实现基础编辑和预览功能
- 支持创建微信草稿
- 支持批量上传图片

## 支持

如有问题或建议，请联系项目维护者或提交 Issue。
