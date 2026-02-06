<template>
  <div ref="container" class="w-full h-full"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'markdown'
  }
})

const emit = defineEmits(['update:modelValue'])
const container = ref(null)
let editor = null

// 初始化编辑器
const initMonaco = () => {
  if (!container.value) return

  editor = monaco.editor.create(container.value, {
    value: props.modelValue,
    language: props.language,
    theme: 'vs-dark', // 恢复默认深色主题
    automaticLayout: true, // 自动布局
    fontSize: 14,
    fontFamily: '"JetBrains Mono", "Menlo", "Monaco", "Courier New", monospace',
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on', // 自动换行
    minimap: { enabled: false }, // 隐藏缩略图
    lineNumbers: 'on',
    renderLineHighlight: 'all', // 高亮当前行
    scrollBeyondLastLine: false,
    autoClosingBrackets: 'always', // 自动闭合括号
    autoClosingQuotes: 'always',
    quickSuggestions: true,
    suggest: {
      showWords: true
    }
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    const value = editor.getValue()
    if (value !== props.modelValue) {
      emit('update:modelValue', value)
    }
  })
}

// 监听外部 modelValue 变化（例如加载草稿时）
watch(() => props.modelValue, (newValue) => {
  if (editor && newValue !== editor.getValue()) {
    editor.setValue(newValue)
  }
})

// 监听语言变化
watch(() => props.language, (newLang) => {
  if (editor) {
    monaco.editor.setModelLanguage(editor.getModel(), newLang)
  }
})

onMounted(() => {
  initMonaco()
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})

// 暴露 insertText 方法给父组件调用（用于语法助手）
const insertText = (text) => {
  if (!editor) return
  
  const selection = editor.getSelection()
  const id = { major: 1, minor: 1 }
  const op = { range: selection, text: text, forceMoveMarkers: true }
  
  editor.executeEdits('my-source', [op])
  editor.focus()
}

defineExpose({
  insertText
})
</script>

<style scoped>
/* 自定义滚动条样式 */
:deep(.monaco-editor .scrollbar .slider) {
  background: rgba(0, 0, 0, 0.1) !important;
  border-radius: 4px !important;
}
:deep(.monaco-editor .scrollbar .slider:hover) {
  background: rgba(0, 0, 0, 0.2) !important;
}
</style>
