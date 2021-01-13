<template>
  <span class="logo" :class="{ logoana: airline == 'ANA', logojal: airline == 'JAL' }">{{ airline }}</span>
</template>

<script>
export default {
  props: ['airline']
}
</script>

<style lang="scss" scoped>
/* purgecss start ignore */
.logo {
  font-style: italic;
  font-weight: bold;
  font-family: verdana, arial, Helvetica, sans-serif;
  display: inline-block;
  padding: 0.1rem 0.3rem;
  margin-right: 0.2rem;
  min-width: 3.2rem;
  text-align: center;
  border: solid 1px hsl(0, 0%, 80%);

  @include touch {
    padding: 0.1rem 0.1rem;
    margin-right: 0.1rem;
    min-width: 3.0rem;
  }
}
.logoana {
  background-color: rgb(33,61,149);
  color: white;
}
.logojal {
  background-color: crimson;
  color: white;
}
/* purgecss end ignore */
</style>
