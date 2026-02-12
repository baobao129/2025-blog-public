<template>
  <div ref="container" class="w-full h-full"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'
import { emmetHTML, emmetCSS, emmetJSX } from 'emmet-monaco-es'

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

// 定义常用的代码片段
const registerSnippets = () => {
  // JavaScript Snippets
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: (model, position) => {
      const suggestions = [
        {
          label: 'clg',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'console.log($1)',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Console Log'
        },
        {
          label: 'func',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'const ${1:name} = (${2:args}) => {\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Arrow Function'
        },
        {
          label: 'imp',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'import ${1:module} from \'${2:path}\'',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Import Statement'
        }
      ]
      return { suggestions }
    }
  })

  // Vue Snippets (映射到 html 语言模式下，或者当语言为 javascript 时)
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: (model, position) => {
      const suggestions = [
        {
          label: 'vue3-setup',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'const { createApp, ref, onMounted } = Vue',
            '',
            'createApp({',
            '\tsetup() {',
            '\t\tconst ${1:state} = ref(${2:initialValue})',
            '',
            '\t\treturn {',
            '\t\t\t$1',
            '\t\t}',
            '\t}',
            '}).mount(\'#app\')'
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Vue 3 Setup Template'
        }
      ]
      return { suggestions }
    }
  })
}

// 初始化编辑器
const initMonaco = () => {
  if (!container.value) return

  try {
    // 全局一次性初始化 (Snippets 和 Emmet)
    // 使用 window 上的全局标记，避免 HMR 问题且不修改 monaco 模块对象
    if (!window.__MONACO_PROVIDERS_INITIALIZED__) {
      try {
        // 注册 Snippets
        registerSnippets()

        // 启用 Emmet (确保只初始化一次，并支持 Markdown)
        emmetHTML(monaco, ['html', 'markdown'])
        emmetCSS(monaco, ['css', 'less', 'scss'])
        emmetJSX(monaco, ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'])
        
        window.__MONACO_PROVIDERS_INITIALIZED__ = true
      } catch (err) {
        console.warn('Failed to initialize Monaco providers:', err)
      }
    }

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
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      suggest: {
        showWords: true,
        snippetsPreventQuickSuggestions: false
      },
      tabCompletion: 'on', // 启用 Tab 补全
      snippetSuggestions: 'top', // 将 Snippet 建议置顶
    })

    // 监听内容变化
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue()
      if (value !== props.modelValue) {
        emit('update:modelValue', value)
      }
    })
  } catch (err) {
    console.error('Failed to create Monaco Editor instance:', err)
  }
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
