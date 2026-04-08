<template>
  <div class="markdown-editor-page">
    <a-page-header 
      title="Markdown 编辑器" 
      subtitle="将 Markdown 转换为微信公众号文章"
      @back="handleBack"
    >
      <template #extra>
        <a-space>
          <!-- 主题选择 -->
          <a-select 
            v-model="selectedTheme" 
            style="width: 120px"
            placeholder="选择主题"
          >
            <template #prefix>
              <icon-palette />
            </template>
            <a-option 
              v-for="theme in themeOptions" 
              :key="theme.value" 
              :value="theme.value"
            >
              {{ theme.label }}
            </a-option>
          </a-select>

          <!-- 字体大小选择 -->
          <a-select 
            v-model="selectedFontSize" 
            style="width: 80px"
            placeholder="字号"
          >
            <a-option 
              v-for="size in fontSizeOptions" 
              :key="size.value" 
              :value="size.value"
            >
              {{ size.label }}
            </a-option>
          </a-select>

          <!-- 刷新按钮 -->
          <a-button @click="handleConvert" :loading="converting">
            <template #icon><icon-refresh /></template>
            转换
          </a-button>

          <!-- 设置按钮 -->
          <a-button @click="showConfigModal = true">
            <template #icon><icon-settings /></template>
            设置
          </a-button>

          <!-- 创建草稿按钮 -->
          <a-button 
            type="primary" 
            @click="showDraftModal = true"
            :disabled="!convertedHtml"
          >
            <template #icon><icon-send /></template>
            创建草稿
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <!-- 编辑器容器 -->
    <div class="editor-container">
      <!-- 左侧：Markdown 编辑器 -->
      <div class="editor-panel">
        <div class="panel-header">
          <icon-edit />
          <span>Markdown 编辑</span>
        </div>
        <MarkdownEditor 
          ref="markdownEditorRef"
          v-model="markdownContent"
          height="calc(100vh - 200px)"
          placeholder="在此输入 Markdown 内容..."
          @change="handleMarkdownChange"
        />
      </div>

      <!-- 右侧：微信预览 -->
      <div class="preview-panel">
        <div class="panel-header">
          <icon-eye />
          <span>微信预览</span>
        </div>
        <WechatPreview 
          ref="wechatPreviewRef"
          :html="convertedHtml"
          :loading="converting"
          @refresh="handleConvert"
        />
      </div>
    </div>

    <!-- 配置设置模态框 -->
    <a-modal 
      v-model:visible="showConfigModal" 
      title="API 配置"
      @ok="saveConfig"
      @cancel="resetConfig"
    >
      <a-form :model="configForm" layout="vertical">
        <a-form-item label="md2wechat API Key" required>
          <a-input 
            v-model="configForm.apiKey" 
            placeholder="请输入 md2wechat API Key"
            type="password"
          />
          <template #extra>
            <a-link href="https://www.md2wechat.com/docs" target="_blank">
              <icon-link />
              获取 API Key
            </a-link>
          </template>
        </a-form-item>

        <a-form-item label="微信 App ID" required>
          <a-input 
            v-model="configForm.wechatAppid" 
            placeholder="请输入微信 App ID"
          />
        </a-form-item>

        <a-form-item label="微信 App Secret" required>
          <a-input 
            v-model="configForm.wechatAppSecret" 
            placeholder="请输入微信 App Secret"
            type="password"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 创建草稿模态框 -->
    <a-modal 
      v-model:visible="showDraftModal" 
      title="创建微信草稿"
      @ok="handleCreateDraft"
    >
      <a-form :model="draftForm" layout="vertical">
        <a-form-item label="文章标题" required>
          <a-input 
            v-model="draftForm.title" 
            placeholder="请输入文章标题"
          />
        </a-form-item>

        <a-form-item label="作者">
          <a-input 
            v-model="draftForm.author" 
            placeholder="请输入作者名称"
          />
        </a-form-item>

        <a-form-item label="摘要">
          <a-textarea 
            v-model="draftForm.digest" 
            placeholder="请输入文章摘要"
            :max-length="120"
            show-word-limit
            :auto-size="{ minRows: 2, maxRows: 4 }"
          />
        </a-form-item>

        <a-form-item label="封面媒体 ID">
          <a-input 
            v-model="draftForm.thumbMediaId" 
            placeholder="请输入封面图片的媒体 ID"
          />
          <template #extra>
            <a-link @click="showBatchUploadModal = true">
              <icon-upload />
              上传图片获取媒体 ID
            </a-link>
          </template>
        </a-form-item>

        <a-form-item label="打开评论">
          <a-switch v-model="draftForm.needOpenComment" />
        </a-form-item>

        <a-form-item label="仅粉丝可评论">
          <a-switch v-model="draftForm.onlyFansCanComment" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量上传图片模态框 -->
    <a-modal 
      v-model:visible="showBatchUploadModal" 
      title="批量上传图片"
      @ok="handleBatchUpload"
    >
      <a-form :model="batchUploadForm" layout="vertical">
        <a-form-item label="图片 URL 列表" required>
          <a-textarea 
            v-model="batchUploadForm.urls" 
            placeholder="请输入图片 URL，每行一个"
            :auto-size="{ minRows: 5, maxRows: 10 }"
          />
          <template #extra>
            <span>每行输入一个图片 URL，支持 http:// 和 https://</span>
          </template>
        </a-form-item>
      </a-form>

      <div v-if="uploadResults.length > 0" class="upload-results">
        <a-divider>上传结果</a-divider>
        <a-list :data="uploadResults" size="small">
          <template #item="{ item }">
            <a-list-item>
              <a-list-item-meta :title="item.url">
                <template #description>
                  <a-tag :color="item.success ? 'green' : 'red'">
                    {{ item.success ? '成功' : '失败' }}
                  </a-tag>
                  <span v-if="item.success">媒体 ID: {{ item.mediaId }}</span>
                  <span v-else>{{ item.message }}</span>
                </template>
              </a-list-item-meta>
              <template #actions>
                <a-button 
                  v-if="item.success" 
                  size="mini" 
                  @click="copyMediaId(item.mediaId)"
                >
                  <template #icon><icon-copy /></template>
                  复制 ID
                </a-button>
              </template>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { 
  IconEdit, 
  IconEye, 
  IconRefresh, 
  IconSettings, 
  IconSend,
  IconPalette,
  IconLink,
  IconUpload,
  IconCopy,
  IconInfoCircle
} from '@arco-design/web-vue/es/icon'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import WechatPreview from '@/components/WechatPreview.vue'
import { 
  convertMarkdown, 
  createArticleDraft, 
  batchUploadImages,
  saveApiConfig,
  getApiConfig,
  themeOptions,
  fontSizeOptions,
  type ConvertRequest,
  type ArticleDraftRequest,
  type BatchUploadRequest
} from '@/api/md2wechat'

const router = useRouter()

// 编辑器引用
const markdownEditorRef = ref()
const wechatPreviewRef = ref()

// Markdown 内容
const markdownContent = ref('')

// 转换后的 HTML
const convertedHtml = ref('')

// 转换状态
const converting = ref(false)

// 主题和字体大小
const selectedTheme = ref('default')
const selectedFontSize = ref('medium')

// 配置模态框
const showConfigModal = ref(false)
const configForm = ref({
  apiKey: '',
  wechatAppid: '',
  wechatAppSecret: ''
})

// 草稿模态框
const showDraftModal = ref(false)
const draftForm = ref({
  title: '',
  author: '',
  digest: '',
  thumbMediaId: '',
  needOpenComment: false,
  onlyFansCanComment: false
})

// 批量上传模态框
const showBatchUploadModal = ref(false)
const batchUploadForm = ref({
  urls: ''
})
const uploadResults = ref<Array<{
  url: string
  mediaId: string
  success: boolean
  message?: string
}>>([])

// 返回
const handleBack = () => {
  router.back()
}

// Markdown 内容变化
const handleMarkdownChange = (content: string) => {
  markdownContent.value = content
  // 自动转换（防抖）
  if (autoConvertTimeout) {
    clearTimeout(autoConvertTimeout)
  }
  autoConvertTimeout = setTimeout(() => {
    handleConvert()
  }, 1000)
}

let autoConvertTimeout: number | null = null

// 转换 Markdown
const handleConvert = async () => {
  if (!markdownContent.value.trim()) {
    convertedHtml.value = ''
    return
  }

  converting.value = true
  try {
    const params: ConvertRequest = {
      markdown: markdownContent.value,
      theme: selectedTheme.value,
      fontSize: selectedFontSize.value,
      convertVersion: 'v1'
    }

    const result = await convertMarkdown(params)
    convertedHtml.value = result.html
    Message.success('转换成功')
  } catch (error) {
    console.error('转换失败:', error)
    // 不显示错误消息，因为 API 函数中已经显示了
  } finally {
    converting.value = false
  }
}

// 保存配置
const saveConfig = () => {
  if (!configForm.value.apiKey) {
    Message.warning('请输入 md2wechat API Key')
    return
  }
  if (!configForm.value.wechatAppid) {
    Message.warning('请输入微信 App ID')
    return
  }
  if (!configForm.value.wechatAppSecret) {
    Message.warning('请输入微信 App Secret')
    return
  }

  saveApiConfig({
    apiKey: configForm.value.apiKey,
    wechatAppid: configForm.value.wechatAppid,
    wechatAppSecret: configForm.value.wechatAppSecret
  })

  showConfigModal.value = false
  Message.success('配置保存成功')
}

// 重置配置
const resetConfig = () => {
  const savedConfig = getApiConfig()
  configForm.value = {
    apiKey: savedConfig.apiKey,
    wechatAppid: savedConfig.wechatAppid,
    wechatAppSecret: savedConfig.wechatAppSecret
  }
}

// 创建草稿
const handleCreateDraft = async () => {
  if (!draftForm.value.title) {
    Message.warning('请输入文章标题')
    return
  }

  if (!convertedHtml.value) {
    Message.warning('请先转换 Markdown 内容')
    return
  }

  try {
    const params: ArticleDraftRequest = {
      markdown: markdownContent.value,
      title: draftForm.value.title,
      author: draftForm.value.author,
      digest: draftForm.value.digest,
      thumbMediaId: draftForm.value.thumbMediaId,
      needOpenComment: draftForm.value.needOpenComment ? 1 : 0,
      onlyFansCanComment: draftForm.value.onlyFansCanComment ? 1 : 0,
      theme: selectedTheme.value,
      fontSize: selectedFontSize.value
    }

    const result = await createArticleDraft(params)
    Message.success(`草稿创建成功，媒体 ID: ${result.mediaId}`)
    showDraftModal.value = false
  } catch (error) {
    console.error('创建草稿失败:', error)
  }
}

// 批量上传图片
const handleBatchUpload = async () => {
  if (!batchUploadForm.value.urls.trim()) {
    Message.warning('请输入图片 URL')
    return
  }

  const urls = batchUploadForm.value.urls
    .split('\n')
    .map(url => url.trim())
    .filter(url => url)

  if (urls.length === 0) {
    Message.warning('请输入有效的图片 URL')
    return
  }

  try {
    const params: BatchUploadRequest = { urls }
    const result = await batchUploadImages(params)
    uploadResults.value = result.items
    Message.success('图片上传完成')
  } catch (error) {
    console.error('批量上传失败:', error)
  }
}

// 复制媒体 ID
const copyMediaId = async (mediaId: string) => {
  try {
    await navigator.clipboard.writeText(mediaId)
    Message.success('媒体 ID 已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    Message.error('复制失败')
  }
}

// 初始化
onMounted(() => {
  // 加载保存的配置
  const savedConfig = getApiConfig()
  configForm.value = {
    apiKey: savedConfig.apiKey,
    wechatAppid: savedConfig.wechatAppid,
    wechatAppSecret: savedConfig.wechatAppSecret
  }

  // 加载保存的主题和字体大小
  const savedTheme = localStorage.getItem('md2wechat_theme')
  const savedFontSize = localStorage.getItem('md2wechat_fontSize')
  
  if (savedTheme) {
    selectedTheme.value = savedTheme
  }
  if (savedFontSize) {
    selectedFontSize.value = savedFontSize
  }
})

// 监听主题和字体大小变化
watch(selectedTheme, (newValue) => {
  localStorage.setItem('md2wechat_theme', newValue)
  if (markdownContent.value.trim()) {
    handleConvert()
  }
})

watch(selectedFontSize, (newValue) => {
  localStorage.setItem('md2wechat_fontSize', newValue)
  if (markdownContent.value.trim()) {
    handleConvert()
  }
})
</script>

<style scoped>
.markdown-editor-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-fill-2);
}

.editor-container {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

.editor-panel,
.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--color-fill-1);
  border-bottom: 1px solid var(--color-border);
  font-weight: 500;
  color: var(--color-text-1);
}

.upload-results {
  margin-top: 16px;
  max-height: 300px;
  overflow: auto;
}

.upload-results :deep(.arco-list-item) {
  padding: 8px 0;
}

@media (max-width: 1024px) {
  .editor-container {
    flex-direction: column;
  }
  
  .editor-panel,
  .preview-panel {
    height: 50%;
  }
}
</style>