<template>
  <span :class="{ cancelled: cancelled }">
    {{ status }}
  </span>
</template>

<script>
export default {
  props: ['status', 'cancelled']
}
</script>

<style lang="scss" scoped>
/* purgecss start ignore */
.cancelled {
  color: red;
}
/* purgecss end ignore */
</style>
