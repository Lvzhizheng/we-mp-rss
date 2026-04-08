import http from './http'
import { Message } from '@arco-design/web-vue'

// md2wechat API 配置
const MD2WECHAT_API_BASE = 'https://md2wechat.com/api/v1'

// 从环境变量获取 API Key
const getApiKey = () => {
  // 优先尝试从环境变量获取，然后从 localStorage 获取
  return import.meta.env.VITE_MD2WECHAT_API_KEY || localStorage.getItem('md2wechat_api_key') || ''
}

// 从环境变量获取微信 App ID 和 Secret
const getWechatCredentials = () => {
  return {
    appid: import.meta.env.VITE_WECHAT_APPID || localStorage.getItem('wechat_appid') || '',
    appSecret: import.meta.env.VITE_WECHAT_APP_SECRET || localStorage.getItem('wechat_app_secret') || ''
  }
}

// 主题选项
export interface ThemeOption {
  value: string
  label: string
  description: string
}

// 支持的主题
export const themeOptions: ThemeOption[] = [
  { value: 'default', label: '默认主题', description: '简洁大方的默认样式' },
  { value: 'tech', label: '科技主题', description: '适合技术文章，代码高亮更清晰' },
  { value: 'business', label: '商务主题', description: '正式商务风格，适合企业文章' },
  { value: 'fresh', label: '清新主题', description: '清新自然风格，适合生活方式类内容' },
  { value: 'elegant', label: '优雅主题', description: '优雅精致风格，适合文艺类内容' },
  { value: 'autumn', label: '秋日主题', description: '温暖秋日色调，适合情感类内容' },
  { value: 'spring', label: '春日主题', description: '清新春日色调，适合积极向上内容' },
  { value: 'ocean', label: '海洋主题', description: '沉稳海洋色调，适合专业内容' }
]

// 字体大小选项
export interface FontSizeOption {
  value: string
  label: string
}

export const fontSizeOptions: FontSizeOption[] = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' }
]

// 转换请求参数
export interface ConvertRequest {
  markdown: string
  theme?: string
  fontSize?: string
  convertVersion?: string
}

// 转换响应
export interface ConvertResponse {
  html: string
  success: boolean
  message?: string
}

// 文章草稿请求
export interface ArticleDraftRequest {
  markdown: string
  title: string
  author?: string
  digest?: string
  thumbMediaId?: string
  needOpenComment?: number
  onlyFansCanComment?: number
  theme?: string
  fontSize?: string
}

// 文章草稿响应
export interface ArticleDraftResponse {
  mediaId: string
  success: boolean
  message?: string
}

// 批量上传请求
export interface BatchUploadRequest {
  urls: string[]
}

// 批量上传响应
export interface BatchUploadResponse {
  items: Array<{
    url: string
    mediaId: string
    success: boolean
    message?: string
  }>
  success: boolean
}

// 将 Markdown 转换为微信公众号 HTML
export const convertMarkdown = async (params: ConvertRequest): Promise<ConvertResponse> => {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('未配置 md2wechat API Key，请在设置中配置')
  }

  try {
    const response = await fetch(`${MD2WECHAT_API_BASE}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Md2wechat-API-Key': apiKey
      },
      body: JSON.stringify({
        markdown: params.markdown,
        theme: params.theme || 'default',
        fontSize: params.fontSize || 'medium',
        convertVersion: params.convertVersion || 'v1'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`转换失败: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return {
      html: data.html || data,
      success: true
    }
  } catch (error) {
    console.error('md2wechat 转换错误:', error)
    Message.error(error instanceof Error ? error.message : '转换失败')
    throw error
  }
}

// 创建文章草稿
export const createArticleDraft = async (params: ArticleDraftRequest): Promise<ArticleDraftResponse> => {
  const apiKey = getApiKey()
  const { appid, appSecret } = getWechatCredentials()

  if (!apiKey) {
    throw new Error('未配置 md2wechat API Key，请在设置中配置')
  }
  if (!appid || !appSecret) {
    throw new Error('未配置微信 App ID 和 Secret，请在设置中配置')
  }

  try {
    const response = await fetch(`${MD2WECHAT_API_BASE}/article-draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Md2wechat-API-Key': apiKey,
        'Wechat-Appid': appid,
        'Wechat-App-Secret': appSecret
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`创建草稿失败: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return {
      mediaId: data.media_id || data.mediaId,
      success: true
    }
  } catch (error) {
    console.error('创建文章草稿错误:', error)
    Message.error(error instanceof Error ? error.message : '创建草稿失败')
    throw error
  }
}

// 批量上传图片
export const batchUploadImages = async (params: BatchUploadRequest): Promise<BatchUploadResponse> => {
  const apiKey = getApiKey()
  const { appid, appSecret } = getWechatCredentials()

  if (!apiKey) {
    throw new Error('未配置 md2wechat API Key，请在设置中配置')
  }
  if (!appid || !appSecret) {
    throw new Error('未配置微信 App ID 和 Secret，请在设置中配置')
  }

  try {
    const response = await fetch(`${MD2WECHAT_API_BASE}/batch-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Md2wechat-API-Key': apiKey,
        'Wechat-Appid': appid,
        'Wechat-App-Secret': appSecret
      },
      body: JSON.stringify({
        urls: params.urls
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`批量上传失败: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return {
      items: data.items || [],
      success: true
    }
  } catch (error) {
    console.error('批量上传错误:', error)
    Message.error(error instanceof Error ? error.message : '批量上传失败')
    throw error
  }
}

// 保存 API 配置到 localStorage
export const saveApiConfig = (config: {
  apiKey: string
  wechatAppid: string
  wechatAppSecret: string
}) => {
  if (config.apiKey) {
    localStorage.setItem('md2wechat_api_key', config.apiKey)
  }
  if (config.wechatAppid) {
    localStorage.setItem('wechat_appid', config.wechatAppid)
  }
  if (config.wechatAppSecret) {
    localStorage.setItem('wechat_app_secret', config.wechatAppSecret)
  }
}

// 获取 API 配置
export const getApiConfig = () => {
  return {
    apiKey: getApiKey(),
    wechatAppid: getWechatCredentials().appid,
    wechatAppSecret: getWechatCredentials().appSecret
  }
}
