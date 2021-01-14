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
  font-size: 0.9rem;
  font-style: italic;
  font-weight: bold;
  font-family: verdana, arial, Helvetica, sans-serif;
  display: inline-block;
  padding: 0.1rem 0.3rem;
  margin-right: 0.2rem;
  min-width: 3.0rem;
  text-align: center;

  @include touch {
    padding: 0.1rem 0.1rem;
    margin-right: 0.1rem;
    min-width: 2.8rem;
  }
}
.logoana {
  background-color: rgb(41, 69, 163);
  color: white;
  border: solid 1px hsl(0, 0%, 80%);
}
.logojal {
  background-color: white;
  color: black;
  border: solid 1px gray;
}
/* purgecss end ignore */
</style>
