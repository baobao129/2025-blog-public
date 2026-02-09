<template>
  <div class="overflow-hidden whitespace-nowrap bg-[#CCFF00] text-black py-2 border-y border-black">
    <div class="inline-block animate-marquee">
      <span v-for="i in 10" :key="i" class="mx-8 font-bold font-['Space_Mono'] uppercase tracking-wider">
        {{ text }} <span class="text-transparent stroke-black text-stroke">///</span>
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: String
})
</script>

<style scoped>
.animate-marquee {
  animation: marquee 20s linear infinite;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.text-stroke {
  -webkit-text-stroke: 1px black;
}
</style>