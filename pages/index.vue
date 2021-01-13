<template>
  <div v-show="mounted">
    <PageTitleArea :updateTime="time" />

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
          <div class="table-head-line table-head-line-arrivals">
            <font-awesome-icon icon="plane-arrival"/> 到着便 - Arrivals
          </div>
          <table class="table is-fullwidth is-bordered table-fi">
            <tbody>
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
                  <AirlineLogo :airline="a.airline" />
                  <span class="num">{{ a.number }}</span>
                </td>
                <td class="fi-aircraft-type is-hidden-touch-custom" v-if="!simple">{{ a.aircraftType }}</td>
                <td class="fi-airport">{{ a.origin }}</td>
                <td class="fi-time is-hidden-touch-custom" v-if="!simple">{{ a.scheduledDepartureTime }}</td>
                <td class="fi-time is-hidden-touch-custom" v-if="!simple">
                  <FiTableColoredtime :time="a.actualDepartureTime" :isActual="!a.isEstimatedDepartureTime" />
                </td>
                <td class="fi-time">{{ a.scheduledArrivalTime }}</td>
                <td class="fi-time">
                  <FiTableColoredtime :time="a.actualArrivalTime" :delay="a.delayTime" :isActual="!a.isEstimatedArrivalTime" />
                </td>
                <td class="fi-status">
                  <FiTableStatus :status="a.status" :cancelled="a.cancelled" />
                </td>
                <td class="fi-text is-hidden-touch-custom" v-if="!simple">
                  <FiTableInfo :infoSummary="a.infoSummary" :infoText="a.infoText" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="column custom-column">
          <div class="table-head-line table-head-line-departures">
            <font-awesome-icon icon="plane-departure"/> 出発便 - Departures
          </div>
          <table class="table is-fullwidth is-bordered table-fi">
            <tbody>
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
                  <AirlineLogo :airline="a.airline" />
                  <span class="num">{{ a.number }}</span>
                </td>
                <td class="fi-aircraft-type is-hidden-touch-custom" v-if="!simple">{{ a.aircraftType }}</td>
                <td class="fi-airport">{{ a.destination }}</td>
                <td class="fi-time">{{ a.scheduledDepartureTime }}</td>
                <td class="fi-time">
                  <FiTableColoredtime :time="a.actualDepartureTime" :delay="a.delayTime" :isActual="!a.isEstimatedDepartureTime" />
                </td>
                <td class="fi-time is-hidden-touch-custom" v-if="!simple">{{ a.scheduledArrivalTime }}</td>
                <td class="fi-time is-hidden-touch-custom" v-if="!simple">
                  <FiTableColoredtime :time="a.actualArrivalTime" :isActual="!a.isEstimatedArrivalTime" />
                </td>
                <td class="fi-status">
                  <FiTableStatus :status="a.status" :cancelled="a.cancelled" />
                </td>
                <td class="fi-text is-hidden-touch-custom" v-if="!simple">
                  <FiTableInfo :infoSummary="a.infoSummary" :infoText="a.infoText" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <PageFooterArea />
  </div>
</template>

<script>
export default {
  data() {
    return {
      arr: [],
      dep: [],
      date: '',
      time: '',
      dateFetch: new Date(),
      elapsed: 99999,
      simple: false,
      hideCancelled: false,
      updating: false,
      mounted: false,
    }
  },

  mounted() {
    this.updateFlightData();
    this.mounted = true;

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
        time: '',
        consumerkey: this.$config.ODPT_CONSUMERKEY,
      };

      await this.$updateFlightData(params);

      this.arr = params.arr;
      this.dep = params.dep;
      this.date = params.date;
      this.time = params.time;

      this.updating = false;

      // データ更新からの経過時間を更新（更新ボタン有効／無効切替用）
      this.dateFetch = new Date();
      this.elapsed = new Date() - this.dateFetch;
    },

    // 運行情報テーブルの行(<TR>)のスタイル
    rowStyle(info, index) {
      return {
        even: (this.hideCancelled ? info.index2 : index) % 2 == 0,
        cancelled: info.cancelled,
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
.control-area {
  text-align: right;
}

.custom-column {
  padding-top: 0;
  padding-bottom: 1.5rem;
}

.table-fi {
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
}

.table-fi.is-bordered td, .table-fi.is-bordered th {
  border-width: 1px;
  border-style: solid;
  border-color: hsl(0, 0%, 10%);
}

.table-head-line {
  font-weight: bold;
  font-size: 1.5rem;
  padding: 0 0.5rem 0.2rem 0.5rem;
}
.table-head-line.table-head-line-arrivals {
  color: hsl(48, 85%, 60%);
}
.table-head-line.table-head-line-departures {
  color: hsl(141, 80%, 60%);
}

.fi-number {
  word-break: keep-all;
  white-space: nowrap;

  .num {
    font-weight: bold;
    font-size: 1.2rem;

    @include touch {
      font-size: 1rem;
    }
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

.fi-status {
  word-break: keep-all;
  white-space: nowrap;
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
