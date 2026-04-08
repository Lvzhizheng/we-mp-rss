<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { IconCopy, IconRefresh, IconDownload } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  html: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh'])

const previewRef = ref<HTMLElement | null>(null)

// 计算预览内容
const previewContent = computed(() => {
  if (props.loading) {
    return `
      <div style="display: flex; justify-content: center; align-items: center; height: 400px; color: #999;">
        <div style="text-align: center;">
          <div style="margin-bottom: 12px;">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" stroke-linecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
          <div>正在转换...</div>
        </div>
      </div>
    `
  }
  
  if (!props.html) {
    return `
      <div style="display: flex; justify-content: center; align-items: center; height: 400px; color: #999;">
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">📝</div>
          <div>在左侧编辑器中输入 Markdown 内容，此处将显示预览</div>
        </div>
      </div>
    `
  }
  
  return props.html
})

// 复制 HTML 内容
const copyHtml = async () => {
  if (!props.html) {
    return
  }
  
  try {
    await navigator.clipboard.writeText(props.html)
    // 使用 Arco Design 的 Message
    const { Message } = await import('@arco-design/web-vue')
    Message.success('HTML 已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    const { Message } = await import('@arco-design/web-vue')
    Message.error('复制失败')
  }
}

// 下载 HTML 文件
const downloadHtml = () => {
  if (!props.html) {
    return
  }
  
  const blob = new Blob([props.html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wechat-article-${Date.now()}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 刷新预览
const refreshPreview = () => {
  emit('refresh')
}

// 暴露方法
defineExpose({
  copyHtml,
  downloadHtml,
  refreshPreview
})
</script>

<template>
  <div class="wechat-preview-container">
    <!-- 预览工具栏 -->
    <div class="preview-toolbar">
      <a-space>
        <span class="toolbar-title">
          <icon-eye />
          微信预览
        </span>
        <a-button size="small" @click="copyHtml" :disabled="!html || loading">
          <template #icon><icon-copy /></template>
          复制 HTML
        </a-button>
        <a-button size="small" @click="downloadHtml" :disabled="!html || loading">
          <template #icon><icon-download /></template>
          下载 HTML
        </a-button>
        <a-button size="small" @click="refreshPreview" :loading="loading">
          <template #icon><icon-refresh /></template>
          刷新
        </a-button>
      </a-space>
      <div class="toolbar-hint">
        <icon-info-circle />
        <span>复制后可直接粘贴到微信公众号编辑器</span>
      </div>
    </div>

    <!-- 预览内容区域 -->
    <div class="preview-content">
      <div 
        ref="previewRef" 
        class="wechat-preview" 
        v-html="previewContent"
      />
    </div>
  </div>
</template>

<style scoped>
.wechat-preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--color-fill-1);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: var(--color-text-1);
}

.toolbar-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-3);
}

.preview-content {
  flex: 1;
  overflow: auto;
  background: #f5f5f5;
  padding: 20px;
}

.wechat-preview {
  width: 100%;
  max-width: 677px;
  margin: 0 auto;
  background: #fff;
  min-height: 400px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

/* 微信公众号样式重置和增强 */
.wechat-preview :deep(*) {
  max-width: 100% !important;
  box-sizing: border-box !important;
}

.wechat-preview :deep(img) {
  max-width: 100% !important;
  height: auto !important;
  display: block;
  margin: 16px auto;
  border-radius: 4px;
}

.wechat-preview :deep(p) {
  margin: 16px 0;
  line-height: 1.8;
  font-size: 16px;
  color: #333;
}

.wechat-preview :deep(h1) {
  font-size: 24px;
  font-weight: bold;
  margin: 24px 0 16px;
  color: #000;
  line-height: 1.4;
}

.wechat-preview :deep(h2) {
  font-size: 20px;
  font-weight: bold;
  margin: 20px 0 12px;
  color: #333;
  line-height: 1.4;
}

.wechat-preview :deep(h3) {
  font-size: 18px;
  font-weight: bold;
  margin: 16px 0 10px;
  color: #444;
  line-height: 1.4;
}

.wechat-preview :deep(h4) {
  font-size: 16px;
  font-weight: bold;
  margin: 14px 0 8px;
  color: #555;
  line-height: 1.4;
}

.wechat-preview :deep(ul),
.wechat-preview :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.wechat-preview :deep(li) {
  margin: 8px 0;
  line-height: 1.6;
}

.wechat-preview :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 16px;
  background: #f7f7f7;
  border-left: 4px solid #07c160;
  color: #666;
  line-height: 1.6;
}

.wechat-preview :deep(code) {
  padding: 2px 6px;
  background: #f5f5f5;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #e74c3c;
}

.wechat-preview :deep(pre) {
  margin: 16px 0;
  padding: 16px;
  background: #f7f7f7;
  border-radius: 4px;
  overflow-x: auto;
}

.wechat-preview :deep(pre code) {
  padding: 0;
  background: transparent;
  font-size: 14px;
  color: #333;
}

.wechat-preview :deep(table) {
  width: 100%;
  margin: 16px 0;
  border-collapse: collapse;
}

.wechat-preview :deep(th),
.wechat-preview :deep(td) {
  padding: 12px;
  border: 1px solid #e0e0e0;
  text-align: left;
}

.wechat-preview :deep(th) {
  background: #f5f5f5;
  font-weight: bold;
}

.wechat-preview :deep(a) {
  color: #576b95;
  text-decoration: none;
}

.wechat-preview :deep(a:hover) {
  text-decoration: underline;
}

.wechat-preview :deep(hr) {
  margin: 24px 0;
  border: none;
  border-top: 1px solid #e0e0e0;
}
</style>
