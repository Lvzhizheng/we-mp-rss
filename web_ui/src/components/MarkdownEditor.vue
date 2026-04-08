<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import * as monaco from 'monaco-editor'

// Configure MonacoEnvironment to load Web Workers
self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === 'json') {
      return './json.worker.bundle.js';
    }
    if (label === 'css') {
      return './css.worker.bundle.js';
    }
    if (label === 'html') {
      return './html.worker.bundle.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.bundle.js';
    }
    return './editor.worker.bundle.js';
  }
};

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '在此输入 Markdown 内容...'
  },
  height: {
    type: String,
    default: '500px'
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const editorRef = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// Markdown 示例模板
const markdownTemplates = [
  {
    name: '空白文档',
    content: ''
  },
  {
    name: '基础文章',
    content: `# 文章标题

## 小标题

这是一段普通的文字。

### 列表
- 列表项 1
- 列表项 2
- 列表项 3

### 代码块
\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

### 引用
> 这是一段引用文字

### 链接
[这是一个链接](https://example.com)

### 图片
![图片描述](https://via.placeholder.com/400x300)
`
  },
  {
    name: '技术文章',
    content: `# 技术文章标题

## 简介
这里写文章的简介内容。

## 正文内容

### 1. 背景介绍
描述技术背景和问题。

### 2. 解决方案

#### 2.1 核心思路
\`\`\`javascript
// 核心代码示例
const solution = {
  method: 'best-practice',
  performance: 'optimized'
};
\`\`\`

#### 2.2 实现细节
详细描述实现过程。

### 3. 总结
总结本文的核心观点。
`
  },
  {
    name: '产品介绍',
    content: `# 产品名称

## 产品简介
简短而有力的产品介绍。

## 核心特性

### 🚀 特性一
描述第一个核心特性。

### 💡 特性二
描述第二个核心特性。

### 🎯 特性三
描述第三个核心特性。

## 使用场景

1. 场景一
2. 场景二
3. 场景三

## 开始使用
\`\`\`
npm install your-product
\`\`\`

## 联系我们
如有问题，请联系我们。
`
  }
]

const initEditor = () => {
  if (!editorRef.value) return

  editor = monaco.editor.create(editorRef.value, {
    value: props.modelValue,
    language: 'markdown',
    theme: 'vs',
    minimap: { enabled: true },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: true,
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto'
    },
    wordWrap: 'on',
    placeholder: props.placeholder,
    readOnly: props.readonly,
    folding: true,
    lineDecorationsWidth: 10,
    renderWhitespace: 'selection',
    bracketPairColorization: {
      enabled: true
    },
    smoothScrolling: true
  })

  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || ''
    emit('update:modelValue', value)
    emit('change', value)
  })
}

const insertTemplate = (template: string) => {
  if (editor) {
    const position = editor.getPosition()
    if (position) {
      editor.executeEdits('insert-template', [
        {
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: template
        }
      ])
    } else {
      editor.setValue(template)
    }
    editor.focus()
  }
}

const insertText = (text: string) => {
  if (editor) {
    editor.trigger('keyboard', 'type', { text })
  }
}

const insertHeading = (level: number) => {
  const prefix = '#'.repeat(level) + ' '
  insertText(prefix)
}

const insertBold = () => {
  const selection = editor?.getSelection()
  if (selection && editor) {
    const selectedText = editor.getModel()?.getValueInRange(selection) || ''
    const newText = selectedText ? `**${selectedText}**` : '****'
    editor.executeEdits('insert-bold', [
      {
        range: selection,
        text: newText
      }
    ])
  } else {
    insertText('****')
  }
}

const insertItalic = () => {
  const selection = editor?.getSelection()
  if (selection && editor) {
    const selectedText = editor.getModel()?.getValueInRange(selection) || ''
    const newText = selectedText ? `*${selectedText}*` : '**'
    editor.executeEdits('insert-italic', [
      {
        range: selection,
        text: newText
      }
    ])
  } else {
    insertText('**')
  }
}

const insertCode = () => {
  const selection = editor?.getSelection()
  if (selection && editor) {
    const selectedText = editor.getModel()?.getValueInRange(selection) || ''
    const newText = selectedText ? `\`${selectedText}\`` : '``'
    editor.executeEdits('insert-code', [
      {
        range: selection,
        text: newText
      }
    ])
  } else {
    insertText('``')
  }
}

const insertCodeBlock = () => {
  insertText('```\n\n```')
}

const insertLink = () => {
  insertText('[链接文字](https://)')
}

const insertImage = () => {
  insertText('![图片描述](https://)')
}

const insertQuote = () => {
  insertText('> ')
}

const insertList = () => {
  insertText('- ')
}

const insertOrderedList = () => {
  insertText('1. ')
}

const insertHorizontalRule = () => {
  insertText('---')
}

const clearContent = () => {
  if (editor) {
    editor.setValue('')
    editor.focus()
  }
}

const getContent = () => {
  return editor?.getValue() || ''
}

// 暴露方法给父组件
defineExpose({
  insertTemplate,
  insertText,
  insertHeading,
  insertBold,
  insertItalic,
  insertCode,
  insertCodeBlock,
  insertLink,
  insertImage,
  insertQuote,
  insertList,
  insertOrderedList,
  insertHorizontalRule,
  clearContent,
  getContent
})

watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue)
  }
})

watch(() => props.readonly, (newValue) => {
  if (editor) {
    editor.updateOptions({ readOnly: newValue })
  }
})

onMounted(() => {
  initEditor()
})
</script>

<template>
  <div class="markdown-editor-container">
    <!-- 工具栏 -->
    <div class="toolbar" v-if="!readonly">
      <a-space :size="4">
        <!-- 模板选择 -->
        <a-dropdown trigger="click">
          <a-button size="small">
            <template #icon><icon-file /></template>
            模板
            <icon-down />
          </a-button>
          <template #content>
            <a-doption 
              v-for="template in markdownTemplates" 
              :key="template.name"
              @click="insertTemplate(template.content)"
            >
              {{ template.name }}
            </a-doption>
          </template>
        </a-dropdown>

        <a-divider direction="vertical" :margin="4" />

        <!-- 标题工具 -->
        <a-dropdown trigger="click">
          <a-button size="small">
            <template #icon><icon-font /></template>
            标题
            <icon-down />
          </a-button>
          <template #content>
            <a-doption @click="insertHeading(1)">一级标题</a-doption>
            <a-doption @click="insertHeading(2)">二级标题</a-doption>
            <a-doption @click="insertHeading(3)">三级标题</a-doption>
            <a-doption @click="insertHeading(4)">四级标题</a-doption>
          </template>
        </a-dropdown>

        <!-- 文本格式 -->
        <a-button size="small" @click="insertBold">
          <template #icon><icon-bold /></template>
        </a-button>
        <a-button size="small" @click="insertItalic">
          <template #icon><icon-italic /></template>
        </a-button>
        <a-button size="small" @click="insertCode">
          <template #icon><icon-code /></template>
        </a-button>

        <a-divider direction="vertical" :margin="4" />

        <!-- 插入元素 -->
        <a-button size="small" @click="insertCodeBlock">
          <template #icon><icon-code-square /></template>
        </a-button>
        <a-button size="small" @click="insertLink">
          <template #icon><icon-link /></template>
        </a-button>
        <a-button size="small" @click="insertImage">
          <template #icon><icon-image /></template>
        </a-button>
        <a-button size="small" @click="insertQuote">
          <template #icon><icon-message /></template>
        </a-button>
        <a-button size="small" @click="insertList">
          <template #icon><icon-unordered-list /></template>
        </a-button>
        <a-button size="small" @click="insertOrderedList">
          <template #icon><icon-ordered-list /></template>
        </a-button>
        <a-button size="small" @click="insertHorizontalRule">
          <template #icon><icon-minus /></template>
        </a-button>

        <a-divider direction="vertical" :margin="4" />

        <!-- 清空 -->
        <a-button size="small" status="danger" @click="clearContent">
          <template #icon><icon-delete /></template>
        </a-button>
      </a-space>
    </div>

    <!-- 编辑器 -->
    <div 
      ref="editorRef" 
      class="monaco-editor" 
      :style="{ height: props.height }"
    />
  </div>
</template>

<style scoped>
.markdown-editor-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 8px;
  background: var(--color-fill-1);
  border: 1px solid var(--color-border);
  border-radius: 4px 4px 0 0;
  flex-wrap: wrap;
  gap: 8px;
}

.monaco-editor {
  width: 100%;
  min-width: 500px;
  border: 1px solid var(--color-border);
  border-radius: 0 0 4px 4px;
}

.monaco-editor :deep(.margin) {
  background: var(--color-fill-1);
}
</style>