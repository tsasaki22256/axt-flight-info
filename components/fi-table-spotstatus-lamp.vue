<template>
  <div class="spotstat" :class="{ flicker: status === 'in' || status === 'out' }">
    <font-awesome-icon icon="circle" v-if="status !== ''" />
  </div>
</template>

<script>
export default {
  props: ['status'], // '' | 'on' | 'in' | 'out'
}
</script>

<style lang="scss" scoped>
/* purgecss start ignore */
.spotstat {
  color: yellow;
  padding: 0 0.1rem;
  text-align: center;
}

@keyframes key-flicker {
  0% {
    opacity: 0.05;
  }

  100% {
    opacity: 1.0;
  }
}

.flicker {
  animation: 0.5s ease-out 0s infinite alternate key-flicker;
}
/* purgecss end ignore */
</style>
