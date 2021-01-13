<template>
  <span :class="{ cancelled: cancelled }">
    <span v-if="cancelled">
      <font-awesome-icon icon="times" size="lg"/>
    </span>
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
