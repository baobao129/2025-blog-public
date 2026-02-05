<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- 背景遮罩 -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close"></div>
      
      <!-- 弹窗主体 -->
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative transform transition-all">
        <!-- 头部 -->
        <div 
          class="p-4 flex items-center gap-3 border-b border-gray-100"
          :class="type === 'success' ? 'bg-green-50' : 'bg-red-50'"
        >
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            :class="type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
          >
            <CheckCircle v-if="type === 'success'" class="w-6 h-6" />
            <AlertCircle v-else class="w-6 h-6" />
          </div>
          <h3 
            class="text-lg font-bold"
            :class="type === 'success' ? 'text-green-800' : 'text-red-800'"
          >
            {{ title }}
          </h3>
          <button @click="close" class="ml-auto text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- 内容 -->
        <div class="p-6">
          <p class="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{{ message }}</p>
        </div>
        
        <!-- 底部按钮 -->
        <div class="p-4 border-t border-gray-50 flex justify-end">
          <button 
            @click="close"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="type === 'success' 
              ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' 
              : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { CheckCircle, AlertCircle, X } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  type: {
    type: String,
    default: 'success', // 'success' | 'error'
  },
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .transform,
.modal-leave-active .transform {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .transform,
.modal-leave-to .transform {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
