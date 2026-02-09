<template>
  <div class="relative overflow-hidden group">
    <div class="glitch-wrapper relative">
      <img 
        :src="src" 
        :alt="alt"
        class="relative z-10 block w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
      />
      <div 
        class="glitch-layer absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 mix-blend-hard-light"
        :style="{ backgroundImage: `url(${src})` }"
      ></div>
      <div 
        class="glitch-layer-2 absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 mix-blend-exclusion"
        :style="{ backgroundImage: `url(${src})` }"
      ></div>
    </div>
    
    <!-- 扫描线 -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
  </div>
</template>

<script setup>
defineProps({
  src: String,
  alt: String
})
</script>

<style scoped>
.group:hover .glitch-layer {
  animation: glitch-anim-1 0.4s infinite linear alternate-reverse;
}
.group:hover .glitch-layer-2 {
  animation: glitch-anim-2 0.4s infinite linear alternate-reverse;
}

@keyframes glitch-anim-1 {
  0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
  20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
  40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
  60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
  80% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 1px); }
  100% { clip-path: inset(30% 0 20% 0); transform: translate(1px, -1px); }
}

@keyframes glitch-anim-2 {
  0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); }
  20% { clip-path: inset(30% 0 20% 0); transform: translate(-2px, 1px); }
  40% { clip-path: inset(70% 0 10% 0); transform: translate(2px, 2px); }
  60% { clip-path: inset(20% 0 50% 0); transform: translate(-2px, -2px); }
  80% { clip-path: inset(50% 0 30% 0); transform: translate(1px, 1px); }
  100% { clip-path: inset(0% 0 80% 0); transform: translate(-1px, -1px); }
}
</style>