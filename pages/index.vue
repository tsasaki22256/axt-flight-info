<template>
  <div>
    <section class="hero is-dark">
      <div class="hero-body custom-hero-body has-text-centered">
        <h1 class="title">
          秋田空港運行情報{{ date2 ? '【' + date2 + '更新】' : '' }}
        </h1>
      </div>
    </section>

    <section class="section section-thin">
      <div class="control-area">
        <button
          class="button is-small is-primary is-outlined" :class="{ 'is-loading': updating }"
          :disabled="!isUpdateButtonEnabled" @click="updateFlightData()" title="データ更新間隔は最短1分、自動更新間隔は3分に制限されています.">
          <font-awesome-icon icon="sync"/>&nbsp;データ更新{{ isUpdateButtonEnabled ? '' : ` (${60 - elapsedSec}s)` }}
        </button>
        <button class="button is-small is-white is-outlined is-hidden-touch-custom" @click="simple = !simple">
          <font-awesome-icon icon="table"/>&nbsp;{{ simple ? '詳細表示' : 'シンプル表示' }}
        </button>
        <button class="button is-small is-white is-outlined" @click="hideCancelled = !hideCancelled">
          {{ hideCancelled ? '欠航便表示' : '欠航便非表示' }}
        </button>
      </div>
    </section>

    <section class="section section-thin">
      <div class="columns is-widescreen is-size-7-touch">
        <div class="column custom-column">
          <table class="table is-fullwidth is-bordered table-arrivals">
            <tbody>
              <tr>
                <td class="table-head" colspan="10"><font-awesome-icon icon="plane-arrival"/> 到着便 - Arrivals</td>
              </tr>
              <tr>
                <th class="fi-number">便名</th>
                <th class="fi-aircraft-type is-hidden-touch-custom" v-if="!simple">機体</th>
                <th class="fi-airport">出発地</th>
                <th class="fi-time is-hidden-touch-custom" colspan="2" v-if="!simple">出発時間</th>
                <th class="fi-time" colspan="2">到着時間</th>
                <th class="fi-status">状況</th>
                <th class="fi-summary is-hidden-touch-custom" v-if="!simple">備考</th>
              </tr>
              <tr :class="rowStyle(a, index)" v-for="(a, index) in arr" :key="'arr-' + index">
                <td class="fi-number">
                  <span class="logo" :class="{ logoana: a.airline == 'ANA', logojal: a.airline == 'JAL' }">{{ a.airline }}</span>
                  <span class="num">{{ a.number }}</span>
                </td>
                <td class="fi-aircraft-type is-hidden-touch-custom" v-if="!simple">{{ a.aircraftType }}</td>
                <td class="fi-airport">{{ a.origin }}</td>
                <td class="fi-time is-hidden-touch-custom" v-if="!simple">{{ a.scheduledDepartureTime }}</td>
                <td class="fi-time fi-actual-dep-time is-hidden-touch-custom" v-if="!simple">{{ a.actualDepartureTime }}</td>
                <td class="fi-time">{{ a.scheduledArrivalTime }}</td>
                <td class="fi-time fi-actual-arr-time">{{ a.actualArrivalTime }}<span class="delay-time is-hidden-mobile">{{ a.delayTime ? ' (' + a.delayTime + ')' : '' }}</span></td>
                <td class="fi-status">
                  <span v-if="a.cancelled">
                    <font-awesome-icon icon="times" size="lg"/>
                  </span>
                  {{ a.status }}
                </td>
                <td class="fi-text is-hidden-touch-custom" v-if="!simple">
                  {{ a.infoSummary }}<span v-if="a.infoSummary && a.infoText"> - </span>{{ a.infoText }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="column custom-column">
          <table class="table is-fullwidth is-bordered table-departures">
            <tbody>
              <tr>
                <td class="table-head" colspan="10"><font-awesome-icon icon="plane-departure"/> 出発便 - Departures</td>
              </tr>
              <tr>
                <th class="fi-number">便名</th>
                <th class="fi-aircraft-type is-hidden-touch-custom" v-if="!simple">機体</th>
                <th class="fi-airport">行先</th>
                <th class="fi-time" colspan="2">出発時間</th>
                <th class="fi-time is-hidden-touch-custom" colspan="2" v-if="!simple">到着時間</th>
                <th class="fi-status">状況</th>
                <th class="fi-summary is-hidden-touch-custom" v-if="!simple">備考</th>
              </tr>
              <tr :class="rowStyle(a, index)" v-for="(a, index) in dep" :key="'dep-' + index">
                <td class="fi-number">
                  <span class="logo" :class="{ logoana: a.airline == 'ANA', logojal: a.airline == 'JAL' }">{{ a.airline }}</span>
                  <span class="num">{{ a.number }}</span>
                </td>
                <td class="fi-aircraft-type is-hidden-touch-custom" v-if="!simple">{{ a.aircraftType }}</td>
                <td class="fi-airport">{{ a.destination }}</td>
                <td class="fi-time">{{ a.scheduledDepartureTime }}</td>
                <td class="fi-time fi-actual-dep-time">{{ a.actualDepartureTime }}<span class="delay-time is-hidden-mobile">{{ a.delayTime ? ' (' + a.delayTime + ')' : '' }}</span></td>
                <td class="fi-time is-hidden-touch-custom" v-if="!simple">{{ a.scheduledArrivalTime }}</td>
                <td class="fi-time fi-actual-arr-time is-hidden-touch-custom" v-if="!simple">{{ a.actualArrivalTime }}</td>
                <td class="fi-status">
                  <span v-if="a.cancelled">
                    <font-awesome-icon icon="times" size="lg"/>
                  </span>
                  {{ a.status }}
                </td>
                <td class="fi-text is-hidden-touch-custom" v-if="!simple">
                  {{ a.infoSummary }}<span v-if="a.infoSummary && a.infoText"> - </span>{{ a.infoText }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <footer class="footer custom-footer">
      <div class="content">
        <p>
          本サイトの航空機発着情報は、<a href="https://www.odpt.org/">公共交通オープンデータセンター</a>により提供されるデータを取得・加工し表示しているものです．<br>
          公共交通事業者により提供されたデータを元にしていますが、必ずしも正確・完全なものとは限りません．<br>
          本サイトの表示内容について、公共交通事業者への直接の問合せは行わないでください．
        </p>
        <div>
          <div class="mb-2">Powered by :</div>
          <a class="footer-icon-link" href="https://fontawesome.com/"><font-awesome-icon class="footer-icon" :icon="['fab', 'font-awesome']" size="2x"/></a>
          <a class="footer-icon-link" href="https://git-scm.com/"><font-awesome-icon class="footer-icon" :icon="['fab', 'git-alt']" size="2x"/></a>
          <a class="footer-icon-link" href="https://github.com/"><font-awesome-icon class="footer-icon" :icon="['fab', 'github']" size="2x"/></a>
          <a class="footer-icon-link" href="https://nodejs.org/"><font-awesome-icon class="footer-icon" :icon="['fab', 'node']" size="2x"/></a>
          <a class="footer-icon-link" href="https://jp.vuejs.org/"><font-awesome-icon class="footer-icon" :icon="['fab', 'vuejs']" size="2x"/></a>
          <a class="footer-icon-link" href="https://nuxtjs.org/"><font-awesome-icon class="footer-icon" :icon="['fas', 'external-link-alt']" size="2x"/></a>
          <a class="footer-icon-link" href="https://bulma.io/"><font-awesome-icon class="footer-icon" :icon="['fas', 'external-link-alt']" size="2x"/></a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      arr: [],
      dep: [],
      date: '',
      date2: '',
      dateFetch: new Date(),
      elapsed: 99999,
      simple: false,
      hideCancelled: false,
      updating: false,
    }
  },

  mounted() {
    this.updateFlightData();

    // 3分毎にデータ更新
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.updateFlightData();
      }
    }, 1000 * 60 * 3);

    // 1秒毎に前回データ更新からの経過時間を更新（更新ボタン有効／無効切替用）
    setInterval(() => {
      this.elapsed = new Date() - this.dateFetch;
    }, 1000 * 1);
  },

  computed: {
    isUpdateButtonEnabled() {
      return this.elapsed / 1000 > 60;
    },

    elapsedSec() {
      return Math.floor((this.elapsed) / 1000);
    }
  },

  methods: {
    async updateFlightData() {
      if (!this.isUpdateButtonEnabled) return;
      if (!this.$config || !this.$config.ODPT_CONSUMERKEY) return;
      if (this.updating) return;

      this.updating = true;

      const params = {
        axios: this.$axios,
        arr: [],
        dep: [],
        date: '',
        consumerkey: this.$config.ODPT_CONSUMERKEY,
      };

      await this.$updateFlightData(params);

      this.arr = params.arr;
      this.dep = params.dep;
      this.date = params.date;

      // ページ上部タイトル横に表示するデータ更新時間
      const m = this.date.match(/([0-9]+:[0-9]+):[0-9]+/);
      if (m) {
        this.date2 = m[1];
      }
      
      this.updating = false;

      // データ更新からの経過時間を更新（更新ボタン有効／無効切替用）
      this.dateFetch = new Date();
      this.elapsed = new Date() - this.dateFetch;
    },

    // 運行情報テーブルの行(<TR>)のスタイル
    rowStyle(info, index) {
      return {
        even: index % 2 == 0,
        cancelled: info.cancelled,
        delayed: info.delayTime >= 30,
        'est-arr': info.isEstimatedArrivalTime,
        'est-dep': info.isEstimatedDepartureTime,
        'is-hidden': info.cancelled && this.hideCancelled,
      };
    },

    isTimeChanged(status) {
      return this.$isTimeChanged(status);
    }
  }
}
</script>

<style lang="scss" scoped>
/* purgecss start ignore */

/* モバイル用ブレークポイント */
@mixin touch {
  @media screen and (max-width: 1216px) { /* 1023 => 1216 */
    @content;
  }
}

.is-hidden-touch-custom {
  @include touch {
    display: none !important;
  }
}

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

.section-thin {
  padding: 0.75rem 1.5rem;

  @include touch {
    padding: 0.75rem 0.75rem;
  }
}

.control-area {
  text-align: right;
}

.custom-column {
  padding-top: 0;
}

th, td {
  color: hsl(0, 0%, 98%);
  padding: 0.4rem 0.5rem;
  background-color: hsl(0, 0%, 21%);
  line-height: 1.1;
  vertical-align: middle;
}

.even > td {
  background-color: hsl(0, 0%, 29%);
}

th {
  background-color: hsl(0, 0%, 14%);
  text-align: center !important;
  word-break: keep-all;
}

.table.is-bordered td, .table.is-bordered th {
  border-width: 1px;
  border-style: solid;
  border-color: hsl(0, 0%, 10%) hsl(0, 0%, 10%) hsl(0, 0%, 10%) hsl(0, 0%, 10%);
}

.table-head {
  background-color: hsl(0, 0%, 7%);
  font-weight: bold;
  font-size: 1.5rem;
  padding: 0 1rem 0.8rem 1rem;
  border-width: 0 !important;
}
.table-arrivals .table-head {
  color: hsl(48, 85%, 60%);
}
.table-departures .table-head {
  color: hsl(141, 80%, 60%);
}

.empty-line {
  height: 480px;
}
.empty-line td {
  text-align: center;
}

.fi-number {
  word-break: keep-all;
  white-space: nowrap;
}
.fi-number > .logo {
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
.fi-number > .logoana {
  background-color: rgb(33,61,149);
  color: white;
}
.fi-number > .logojal {
  background-color: crimson;
  color: white;
}
.fi-number > .num {
  font-weight: bold;
  font-size: 1.2rem;

  @include touch {
    font-size: 1rem;
  }
}

.fi-airport {
  word-break: keep-all;
  white-space: nowrap;
}

.fi-time {
  min-width: 2rem;
  word-break: keep-all;
  white-space: nowrap;
}

.fi-actual-arr-time, .fi-actual-dep-time {
  color: red;
}

.est-arr .fi-actual-arr-time, .est-dep .fi-actual-dep-time {
  color: lime;
}

.delayed .delay-time {
  color: gold;
}

.fi-status {
  word-break: keep-all;
  white-space: nowrap;
}
.cancelled > .fi-status {
  color: red;
}

.fi-text {
  font-size: 0.7rem;
  font-weight: normal;
  color: hsl(0, 0%, 98%);
}

.custom-footer .content {
  font-size: 0.8rem;
  padding-left: 3rem;
  padding-right: 3rem;
  padding-top: 2rem;
  line-height: 1.4rem;
  border-top: solid 1px gray;

  @include touch {
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

/* アニメーション */

@keyframes icon-flicker {
  0% {
    opacity: 0.05;
  }

  100% {
    opacity: 1.0;
  }
}

.icon-flicker {
  animation: 0.75s ease-out 0s infinite alternate icon-flicker;
}
/* purgecss end ignore */
</style>
