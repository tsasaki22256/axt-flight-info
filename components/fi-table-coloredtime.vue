<template>
  <span class="time" :class="{ actual: isActual }">
    {{ time }}<span class="is-hidden-mobile" :class="{ 'delay-time': delay >= 30 }">{{ delay ? ' (' + delay + ')' : '' }}</span>
  </span>
</template>

<script>
export default {
  props: ['time', 'delay', 'isActual']
}
</script>

<style lang="scss" scoped>
/* purgecss start ignore */
.time {
  color: lime;
}

.actual {
  color: red;
}

.delay-time {
  color: gold;
}
/* purgecss end ignore */
</style>
