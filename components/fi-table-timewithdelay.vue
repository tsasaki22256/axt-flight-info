<template>
  <span>
    {{ time }}<span class="is-hidden-mobile" :class="{ 'delay-time': delay >= 30 }">{{ delay ? ' (' + delay + ')' : '' }}</span>
  </span>
</template>

<script>
export default {
  props: ['time', 'delay', 'delayed']
}
</script>

<style lang="scss" scoped>
/* purgecss start ignore */
.delay-time {
  color: gold;
}
/* purgecss end ignore */
</style>
