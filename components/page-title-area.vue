<template>
  <section class="hero is-dark">
    <div class="hero-body custom-hero-body has-text-centered">
      <h1 class="title">
        秋田空港運行情報{{ updateTime ? '【' + updateTime + '更新】' : '' }}
      </h1>
    </div>
  </section>
</template>

<script>
export default {
  props: ['updateTime']
}
</script>

<style lang="scss" scoped>
/* purgecss start ignore */
.custom-hero-body {
  padding: 0.6rem 0rem 0.6rem 0rem;
}

.custom-hero-body h1 {
  font-size: 1.5rem;
  letter-spacing: 0.1rem;
  transform: scale(0.9, 1);

  @include touch {
    letter-spacing: 0.08rem;
    font-size: 1.25rem;
  }
}
/* purgecss end ignore */
</style>
