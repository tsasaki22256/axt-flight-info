<template>
  <span class="num">
    <a :href="anchorLink" target="_blank">{{ number }}</a>
    <span class="spotstat">
      <font-awesome-icon icon="angle-double-down" size="xs" v-if="spotStatus === 'in'" />
      <font-awesome-icon icon="angle-double-up" size="xs" v-if="spotStatus === 'out'" />
    </span>
  </span>
</template>

<script>
export default {
  props: ['number', 'airline', 'datestr', 'spotStatus'],
  computed: {
    anchorLink() {
      if (this.airline === 'ANA') return `https://www.ana.co.jp/fs/dom/jp/result.html?mode=0&requestDate=${this.datestr}&flightNumber=${this.number}`;
      if (this.airline === 'JAL') return `https://www.jal.co.jp/flight-status/dom/?fromScreen=true&airlineCode=JAL&flightSerNo=${this.number}&dateAttribute=&FsBtn=flightNum`;
      return ``;
    }
  }
}
</script>

<style lang="scss" scoped>
/* purgecss start ignore */
.spotstat {
  color: yellow;
  animation: 0.5s ease-out 0s infinite alternate key-flicker;
}

.num {
  font-weight: bold;
  font-size: 1.2rem;

  @include touch-custom {
    font-size: 1rem;
  }

  a {
    color: hsl(0, 0%, 98%);
    text-decoration: none;
  }
}

@keyframes key-flicker {
  0% {
    opacity: 0.05;
  }

  100% {
    opacity: 1.0;
  }
}
/* purgecss end ignore */
</style>
