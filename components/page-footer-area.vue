<template>
  <footer class="footer custom-footer">
    <div class="content">
      <p>
        本ページの航空機発着情報は、<a href="https://www.odpt.org/">公共交通オープンデータセンター</a>により提供されるデータを取得・加工し表示しているものです．<br>
        公共交通事業者により提供されたデータを元にしていますが、必ずしも正確・完全なものとは限りません．<br>
        本ページの表示内容について、公共交通事業者への直接の問合せは行わないでください．
      </p>
      <div>
        <a class="footer-icon-link" href="https://github.com/tsasaki22256/axt-flight-info"><font-awesome-icon class="footer-icon" :icon="['fab', 'github']" size="lg"/></a>
        axt-flight-info &nbsp;{{ver.version}}
      </div>
    </div>
  </footer>
</template>

<script>
import { versionInfo } from '~/assets/js/version.js';

export default {
  data() {
    return {
      ver: versionInfo
    }
  }
}
</script>

<style lang="scss" scoped>
/* purgecss start ignore */
.custom-footer .content {
  font-size: 0.8rem;
  padding-left: 3rem;
  padding-right: 3rem;
  padding-top: 2rem;
  line-height: 1.4rem;
  border-top: solid 1px gray;

  @include touch-custom {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

.custom-footer .content p {
  margin-bottom: 2rem;
}

.footer-icon-link {
  text-decoration: none;
  color: hsl(0, 0%, 98%);
}

.footer-icon {
  margin-right: 0.2rem;
}
/* purgecss end ignore */
</style>
