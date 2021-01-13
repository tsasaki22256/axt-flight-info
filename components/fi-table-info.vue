<template>
  <span class="info">
    {{ infoSummary }}<span v-if="infoSummary && infoText"> - </span>{{ infoText }}
  </span>
</template>

<script>
export default {
  props: ['infoSummary', 'infoText']
}
</script>

<style lang="scss" scoped>
/* purgecss start ignore */
.info {
  
}
/* purgecss end ignore */
</style>
