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
  }
})

const emit = defineEmits(['update:modelValue'])
const container = ref(null)
let editor = null

// 初始化编辑器
const initMonaco = () => {
  if (!container.value) return

  // 定义 Atom One Dark 主题
  monaco.editor.defineTheme('one-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'c678dd' },
      { token: 'string', foreground: '98c379' },
      { token: 'number', foreground: 'd19a66' },
      { token: 'regexp', foreground: '56b6c2' },
      { token: 'type', foreground: 'e5c07b' },
      { token: 'class', foreground: 'e5c07b' },
      { token: 'function', foreground: '61afef' },
      { token: 'variable', foreground: 'e06c75' },
      { token: 'operator', foreground: '56b6c2' },
      { token: 'delimiter', foreground: 'abb2bf' },
      { token: 'tag', foreground: 'e06c75' },
      { token: 'attribute.name', foreground: 'd19a66' },
      { token: 'attribute.value', foreground: '98c379' },
      // Markdown 特有高亮
      { token: 'strong', foreground: 'e06c75', fontStyle: 'bold' },
      { token: 'emphasis', foreground: 'c678dd', fontStyle: 'italic' },
      { token: 'string.link', foreground: '61afef' },
      { token: 'link', foreground: '61afef', fontStyle: 'underline' },
      { token: 'heading', foreground: 'e06c75', fontStyle: 'bold' },
      { token: 'list', foreground: 'e5c07b' },
      { token: 'quote', foreground: '5c6370', fontStyle: 'italic' }
    ],
    colors: {
      'editor.background': '#282c34',
      'editor.foreground': '#abb2bf',
      'editorCursor.foreground': '#528bff',
      'editor.lineHighlightBackground': '#2c313c',
      'editorLineNumber.foreground': '#4b5263',
      'editor.selectionBackground': '#3e4451',
      'editor.inactiveSelectionBackground': '#3e445180'
    }
  })

  editor = monaco.editor.create(container.value, {
    value: props.modelValue,
    language: 'markdown',
    theme: 'one-dark', // 使用自定义主题
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
