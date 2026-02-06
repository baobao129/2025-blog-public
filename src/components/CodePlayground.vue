<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
      
      <!-- 头部 -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary/10 rounded-lg text-primary">
            <Code2 class="w-5 h-5" />
          </div>
          <h2 class="font-bold text-lg text-gray-800">代码演练场</h2>
          <div class="h-6 w-px bg-gray-200"></div>
          <select 
            v-model="currentFramework" 
            class="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
          >
            <option value="vanilla">原生 (Vanilla)</option>
            <option value="vue">Vue 3</option>
            <option value="react">React</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <button 
            @click="downloadCode"
            class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-muted hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download class="w-4 h-4" />
            下载源码
          </button>
          <div class="h-4 w-px bg-gray-200"></div>
          <button 
            @click="$emit('close')"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- 主体区域 -->
      <div class="flex-1 flex overflow-hidden">
        <!-- 左侧：代码编辑区 -->
        <div class="w-1/2 flex flex-col border-r border-gray-200 bg-gray-50">
          <!-- 语言切换 Tab -->
          <div class="flex border-b border-gray-200 bg-white">
            <button 
              v-for="lang in ['HTML', 'CSS', 'JavaScript']" 
              :key="lang"
              @click="activeTab = lang"
              class="px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
              :class="activeTab === lang ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted hover:text-gray-800 hover:bg-gray-50'"
            >
              <span 
                class="w-2 h-2 rounded-full"
                :class="{
                  'bg-orange-500': lang === 'HTML',
                  'bg-blue-500': lang === 'CSS',
                  'bg-yellow-500': lang === 'JavaScript'
                }"
              ></span>
              {{ lang }}
            </button>
          </div>

          <!-- 编辑器 -->
          <div class="flex-1 relative">
            <MonacoEditor 
              v-show="activeTab === 'HTML'"
              v-model="htmlCode"
              language="html"
              class="absolute inset-0"
            />
            <MonacoEditor 
              v-show="activeTab === 'CSS'"
              v-model="cssCode"
              language="css"
              class="absolute inset-0"
            />
            <MonacoEditor 
              v-show="activeTab === 'JavaScript'"
              v-model="jsCode"
              language="javascript"
              class="absolute inset-0"
            />
          </div>
        </div>

        <!-- 右侧：预览区 -->
        <div class="w-1/2 flex flex-col bg-white">
          <div class="px-4 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <span class="text-xs font-bold text-text-muted uppercase tracking-wider">实时预览</span>
            <span class="text-xs text-text-light flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          <iframe 
            ref="previewFrame"
            class="flex-1 w-full h-full border-none bg-white"
            sandbox="allow-scripts"
            :srcdoc="previewContent"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Code2, X, Download } from 'lucide-vue-next'
import MonacoEditor from './MonacoEditor.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const activeTab = ref('HTML')
const currentFramework = ref('vanilla')

// 预设模板
const templates = {
  vanilla: {
    html: `<!-- 在这里编写 HTML -->
<div class="card">
  <h1>Hello World</h1>
  <p>编辑左侧代码，右侧实时更新。</p>
  <button id="btn">点击我</button>
</div>`,
    css: `/* 在这里编写 CSS */
body {
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #f0f2f5;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  text-align: center;
}

h1 {
  color: #2563eb;
  margin-top: 0;
}

button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #1d4ed8;
}`,
    js: `// 在这里编写 JavaScript
const btn = document.getElementById('btn');

btn.addEventListener('click', () => {
  const h1 = document.querySelector('h1');
  h1.textContent = '你好，世界！';
  h1.style.color = '#dc2626';
  btn.textContent = '已点击';
});`
  },
  vue: {
    html: `<div id="app">
  <div class="card">
    <h1>{{ message }}</h1>
    <p>编辑左侧代码，右侧实时更新。</p>
    <button @click="count++">点击次数: {{ count }}</button>
  </div>
</div>`,
    css: `/* Vue 样式 */
body {
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #f0f2f5;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  text-align: center;
}

h1 { color: #42b883; margin-top: 0; }
button {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
button:hover { background: #3aa876; }`,
    js: `const { createApp, ref } = Vue

createApp({
  setup() {
    const message = ref('Hello Vue 3!')
    const count = ref(0)
    return {
      message,
      count
    }
  }
}).mount('#app')`
  },
  react: {
    html: `<div id="root"></div>`,
    css: `/* React 样式 */
body {
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #f0f2f5;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  text-align: center;
}

h1 { color: #61dafb; margin-top: 0; text-shadow: 0 1px 2px rgba(0,0,0,0.1); }
button {
  background: #61dafb;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
button:hover { background: #4fa8d1; }`,
    js: `const { useState } = React;

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="card">
      <h1>Hello React!</h1>
      <p>编辑左侧代码，右侧实时更新。</p>
      <button onClick={() => setCount(count + 1)}>
        点击次数: {count}
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
  }
}

// 默认代码
const htmlCode = ref(templates.vanilla.html)
const cssCode = ref(templates.vanilla.css)
const jsCode = ref(templates.vanilla.js)

// 切换框架时更新代码
watch(currentFramework, (newFramework) => {
  const t = templates[newFramework]
  htmlCode.value = t.html
  cssCode.value = t.css
  jsCode.value = t.js
})

// 生成预览内容
const previewContent = computed(() => {
  const frameworkScripts = {
    vanilla: '',
    vue: '<script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>',
    react: `
      <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
    `
  }

  const userScript = currentFramework.value === 'react' 
    ? `<script type="text/babel">${jsCode.value}<\/script>`
    : `<script>${jsCode.value}<\/script>`

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>${cssCode.value}</style>
        ${frameworkScripts[currentFramework.value]}
      </head>
      <body>
        ${htmlCode.value}
        ${userScript}
      </body>
    </html>
  `
})

// 下载代码
const downloadCode = () => {
  const blob = new Blob([previewContent.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'playground-export.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>