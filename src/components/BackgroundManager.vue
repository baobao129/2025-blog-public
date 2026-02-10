<template>
  <div class="fixed inset-0 w-full h-full -z-50 overflow-hidden transition-colors duration-700 bg-gray-50 dark:bg-gray-900">
    <!-- 动态渐变背景 -->
    <div v-if="bgType === 'gradient'" class="absolute inset-0 w-full h-full">
      <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 opacity-60"></div>
      <div class="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-300/30 dark:bg-purple-600/20 rounded-full blur-[100px] animate-blob"></div>
      <div class="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-300/30 dark:bg-blue-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-pink-300/30 dark:bg-pink-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
    </div>

    <!-- 图片/视频背景 -->
    <div v-else class="absolute inset-0 w-full h-full">
      <img 
        v-if="bgType === 'image' && bgSource" 
        :src="bgSource" 
        class="w-full h-full object-cover transition-opacity duration-700" 
        alt="Background"
      />
      <video 
        v-if="bgType === 'video' && bgSource" 
        :src="bgSource" 
        class="w-full h-full object-cover transition-opacity duration-700" 
        autoplay loop muted playsinline
      ></video>
    </div>

    <!-- 遮罩层 -->
    <div 
      class="absolute inset-0 bg-white/30 dark:bg-black/40 transition-opacity duration-300"
      :style="{ opacity: overlayOpacity }"
    ></div>

    <!-- 控制面板 (仅在管理模式或特定触发下显示，这里简化为一直存在但可折叠) -->
    <Transition name="slide-up">
      <div v-if="showSettings" class="fixed bottom-6 right-6 z-[100]">
        <GlassCard variant="heavy" class="p-4 w-72">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Palette class="w-4 h-4" />
              背景设置
            </h3>
            <button @click="showSettings = false" class="text-gray-500 hover:text-gray-800 dark:hover:text-white">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- 类型选择 -->
          <div class="grid grid-cols-3 gap-2 mb-4">
            <button 
              v-for="type in ['gradient', 'image', 'video']" 
              :key="type"
              @click="setBgType(type)"
              class="px-2 py-1.5 text-xs rounded-md transition-all border"
              :class="bgType === type 
                ? 'bg-primary text-white border-primary' 
                : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary/50'"
            >
              {{ typeLabels[type] }}
            </button>
          </div>

          <!-- 遮罩调节 -->
          <div class="mb-4">
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">遮罩浓度 ({{ Math.round(overlayOpacity * 100) }}%)</label>
            <input 
              type="range" 
              min="0" 
              max="0.9" 
              step="0.05" 
              v-model.number="overlayOpacity"
              class="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            >
          </div>

          <!-- 上传 -->
          <div v-if="bgType !== 'gradient'" class="mt-2">
            <label class="block w-full p-2 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
              <span class="text-xs text-gray-500 group-hover:text-primary flex items-center justify-center gap-2">
                <Upload class="w-3 h-3" />
                上传{{ bgType === 'image' ? '图片' : '视频' }}
              </span>
              <input type="file" class="hidden" :accept="bgType === 'image' ? 'image/*' : 'video/*'" @change="handleUpload">
            </label>
          </div>
        </GlassCard>
      </div>
    </Transition>

    <!-- 设置开关 -->
    <button 
      v-if="!showSettings"
      @click="showSettings = true"
      class="fixed bottom-6 right-6 z-[9999] p-3 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/20 shadow-lg text-gray-700 dark:text-gray-200 hover:bg-primary hover:text-white transition-all hover:scale-110 group cursor-pointer pointer-events-auto"
      title="背景设置"
    >
      <Settings2 class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Palette, Upload, X, Settings2 } from 'lucide-vue-next'
import { useStorage } from '@vueuse/core'
import GlassCard from './GlassCard.vue'

const showSettings = ref(false)

// 状态持久化
const bgType = useStorage('blog-bg-type', 'gradient')
const bgSource = useStorage('blog-bg-source', '')
const overlayOpacity = useStorage('blog-bg-overlay', 0.3)

const typeLabels = {
  gradient: '动态渐变',
  image: '静态图片',
  video: '动态视频'
}

const setBgType = (type) => {
  bgType.value = type
  if (type === 'gradient') {
    bgSource.value = ''
  }
}

const handleUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    bgSource.value = e.target.result
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>