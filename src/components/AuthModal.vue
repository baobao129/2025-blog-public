<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-scale-in">
        <!-- 关闭按钮 -->
        <button 
          @click="$emit('close')"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="p-8 text-center">
          <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
            <KeyRound class="w-8 h-8" />
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-2">身份验证已过期</h2>
          <p class="text-gray-500 mb-8 text-sm">
            您的会话已失效或缺少必要的私钥。请重新上传 GitHub App 私钥 (.pem) 以继续操作。
          </p>

          <div class="space-y-4">
            <label class="relative cursor-pointer group block">
              <div class="w-full px-6 py-3 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/20 group-hover:shadow-primary/30 group-hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <Upload class="w-4 h-4" />
                <span>上传私钥文件</span>
              </div>
              <input 
                type="file" 
                accept=".pem"
                @change="handleFileUpload"
                class="hidden"
              />
            </label>
            
            <p v-if="error" class="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg border border-red-100">
              {{ error }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { X, KeyRound, Upload } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { toast } from 'vue-sonner'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

const { setPrivateKey } = useAuth()
const error = ref('')

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 重置 input
  const input = event.target
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const content = e.target.result
      await setPrivateKey(content)
      toast.success('认证成功，请重试刚才的操作')
      emit('success')
      emit('close')
      error.value = ''
    } catch (err) {
      error.value = '无效的私钥文件: ' + err.message
    } finally {
      input.value = ''
    }
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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