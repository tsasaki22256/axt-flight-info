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

    <section class="section section-thin is-size-7-touch-custom is-hidden-mobile">
      <table class="table is-fullwidth is-bordered table-fi">
        <tbody>
          <tr>
            <th class="fi-spotstat"></th>
            <th class="fi-number"><font-awesome-icon icon="plane-arrival" class="table-head-line-arrivals" /> 到着便名</th>
            <th class="fi-airport">出発地</th>
            <th class="fi-time is-hidden-touch-custom" colspan="2" v-if="!simple">出発時間</th>
            <th class="fi-time" colspan="2">到着時間</th>
            <th class="fi-status">状況</th>
            <th class="fi-summary is-hidden-wide" v-if="!simple">備考</th>

            <th class="fi-aircraft-type"><span class="is-hidden-touch-custom">機体</span></th>

            <th class="fi-number"><font-awesome-icon icon="plane-departure" class="table-head-line-departures" /> 出発便名</th>
            <th class="fi-airport">行先</th>
            <th class="fi-time" colspan="2">出発時間</th>
            <th class="fi-time is-hidden-touch-custom" colspan="2" v-if="!simple">到着時間</th>
            <th class="fi-status">状況</th>
            <th class="fi-summary is-hidden-wide" v-if="!simple">備考</th>
          </tr>
          <tr :class="combinedRowStyle(a, index)" v-for="(a, index) in comb" :key="index">
            <td class="fi-spotstat">
              <FiTableSpotstat :status="a.spotstat" />
            </td>
            <td class="fi-number">
              <AirlineLogo :airline="a.arr.airline || a.dep.airline" v-if="a.arr.number" />
              <FiTableNumber :number="a.arr.number" :airline="a.arr.airline" :datestr="datestr" />
            </td>
            <td class="fi-airport">{{ a.arr.origin }}</td>
            <td class="fi-time is-hidden-touch-custom" v-if="!simple">{{ a.arr.scheduledDepartureTime }}</td>
            <td class="fi-time is-hidden-touch-custom" v-if="!simple">
              <FiTableColoredtime :time="a.arr.actualDepartureTime" :isActual="!a.arr.isEstimatedDepartureTime" />
            </td>
            <td class="fi-time">{{ a.arr.scheduledArrivalTime }}</td>
            <td class="fi-time">
              <FiTableColoredtime :time="a.arr.actualArrivalTime" :delay="a.arr.delayTime" :isActual="!a.arr.isEstimatedArrivalTime" />
            </td>
            <td class="fi-status">
              <FiTableStatus :status="a.arr.status" :cancelled="a.arr.cancelled" />
            </td>
            <td class="fi-text is-hidden-wide" v-if="!simple">
              <FiTableInfo :infoSummary="a.arr.infoSummary" :infoText="a.arr.infoText" />
            </td>

            <td class="fi-aircraft-type-center"><span class="is-hidden-touch-custom">{{ a.arr.aircraftType || a.dep.aircraftType }}</span></td>

            <td class="fi-number">
              <AirlineLogo :airline="a.arr.airline || a.dep.airline" v-if="a.dep.number" />
              <FiTableNumber :number="a.dep.number" :airline="a.dep.airline" :datestr="datestr" />
            </td>
            <td class="fi-airport">{{ a.dep.destination }}</td>
            <td class="fi-time">{{ a.dep.scheduledDepartureTime }}</td>
            <td class="fi-time">
              <FiTableColoredtime :time="a.dep.actualDepartureTime" :delay="a.dep.delayTime" :isActual="!a.dep.isEstimatedDepartureTime" />
            </td>
            <td class="fi-time is-hidden-touch-custom" v-if="!simple">{{ a.dep.scheduledArrivalTime }}</td>
            <td class="fi-time is-hidden-touch-custom" v-if="!simple">
              <FiTableColoredtime :time="a.dep.actualArrivalTime" :isActual="!a.dep.isEstimatedArrivalTime" />
            </td>
            <td class="fi-status">
              <FiTableStatus :status="a.dep.status" :cancelled="a.dep.cancelled" />
            </td>
            <td class="fi-text is-hidden-wide" v-if="!simple">
              <FiTableInfo :infoSummary="a.dep.infoSummary" :infoText="a.dep.infoText" />
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="section section-thin is-hidden-tablet">
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
                  <FiTableNumber :number="a.number" :airline="a.airline" :datestr="datestr" />
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
                  <FiTableNumber :number="a.number" :airline="a.airline" :datestr="datestr" />
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
      // 秋田空港到着便
      arr: [],

      // 秋田空港出発便
      dep: [],

      // 到着便と出発便を連結したデータ
      comb: [],

      // データ更新日時
      date: '',
      time: '',

      // 現在の日付文字列 ("yyyymmdd")
      datestr: '',

      // 更新ボタン有効／無効切替用
      dateFetch: new Date(),
      elapsed: 99999,

      // シンプル／詳細表示切替用
      simple: false,

      // 欠航便表示／非表示切替用
      hideCancelled: false,

      // ローディング関係
      updating: false,
      mounted: false,
    }
  },

  mounted() {
    this.datestr = this.getDateString();

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
        comb: [],
        date: '',
        time: '',
        consumerkey: this.$config.ODPT_CONSUMERKEY,
      };

      await this.$updateFlightData(params);

      this.arr = params.arr;
      this.dep = params.dep;
      this.comb = params.comb;
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
        'is-hidden': info.cancelled && this.hideCancelled,
      };
    },

    // 運行情報テーブルの行(<TR>)のスタイル（連結データ用）
    combinedRowStyle(info, index) {
      const cancelled =
        (info.arr.cancelled && info.dep.cancelled) ||
        (info.arr.number === '' && info.dep.cancelled) ||
        (info.arr.cancelled && info.dep.number === '');

      return {
        even: (this.hideCancelled ? info.index3 : index) % 2 == 0,
        'is-hidden': cancelled && this.hideCancelled,
      };
    },

    getDateString() {
      const d = new Date();
      return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
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
    background-color: hsl(0, 0%, 21%);
    line-height: 1.1;
    vertical-align: middle;
  }

  th {
    background-color: hsl(0, 0%, 14%);
    text-align: center !important;
    word-break: keep-all;
    padding: 0.45rem 0.5rem;
  }

  td {
    padding: 0.35rem 0.5rem;
  }

  .even > td {
    background-color: hsl(0, 0%, 29%);
  }
}

.table-fi.is-bordered td, .table-fi.is-bordered th {
  border-width: 1px;
  border-style: solid;
  border-color: hsl(0, 0%, 10%);
}

.table-head-line {
  font-weight: bold;
  font-size: 1.3rem;
  padding: 0 0.5rem 0.2rem 0.5rem;
}
.table-head-line-arrivals {
  color: hsl(48, 85%, 60%) !important;
}
.table-head-line-departures {
  color: hsl(141, 80%, 60%) !important;
}

.fi-spotstat {
  min-width: 1rem;
  padding: 0 !important;
}

.fi-number {
  word-break: keep-all;
  white-space: nowrap;
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

.fi-aircraft-type {
  min-width: 0.2rem;
}

.fi-aircraft-type-center {
  background-color: hsl(0, 0%, 16%) !important;
  min-width: 0.2rem;
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
