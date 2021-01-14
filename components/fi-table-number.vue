<template>
  <span class="num">
    <a :href="anchorLink">{{ number }}</a>
  </span>
</template>

<script>
export default {
  props: ['number', 'airline', 'datestr'],
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
.num {
  font-weight: bold;
  font-size: 1.2rem;

  @include touch {
    font-size: 1rem;
  }

  a {
    color: hsl(0, 0%, 98%);
    text-decoration: none;
  }
}
/* purgecss end ignore */
</style>
