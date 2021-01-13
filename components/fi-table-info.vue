<template>
  <div class="info">
    <span>{{ infoSummary }}<span v-if="infoSummary && infoText"> - </span>{{ infoText }}</span>
  </div>
</template>

<script>
export default {
  props: ['infoSummary', 'infoText']
}
</script>

<style lang="scss" scoped>
/* purgecss start ignore */
.info {
  font-size: 0.7rem;
  font-weight: normal;
  color: hsl(0, 0%, 98%);
}
/* purgecss end ignore */
</style>
