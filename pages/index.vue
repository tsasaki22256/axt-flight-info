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
            <th class="fi-spotstatus"></th>
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
          <tr :class="combinedRowStyle(a, index)" v-for="(a, index) in filteredCombined" :key="index">
            <td class="fi-spotstatus">
              <FiTableSpotstatusLamp :status="a.spotStatusLamp" />
            </td>
            <td class="fi-number">
              <AirlineLogo :airline="a.arrival.airline || a.departure.airline" v-if="a.arrival.number" />
              <FiTableNumber :number="a.arrival.number" :airline="a.arrival.airline" :datestr="datestr" />
            </td>
            <td class="fi-airport">{{ a.arrival.origin }}</td>
            <td class="fi-time is-hidden-touch-custom" v-if="!simple">{{ a.arrival.scheduledDepartureTime }}</td>
            <td class="fi-time is-hidden-touch-custom" v-if="!simple">
              <FiTableColoredtime :time="a.arrival.actualDepartureTime" :isActual="!a.arrival.isEstimatedDepartureTime" />
            </td>
            <td class="fi-time">{{ a.arrival.scheduledArrivalTime }}</td>
            <td class="fi-time">
              <FiTableColoredtime :time="a.arrival.actualArrivalTime" :delay="a.arrival.arrivalDelay" :isActual="!a.arrival.isEstimatedArrivalTime" />
            </td>
            <td class="fi-status">
              <FiTableStatus :status="a.arrival.status" :cancelled="a.arrival.cancelled" />
            </td>
            <td class="fi-text is-hidden-wide" v-if="!simple">
              <FiTableInfo :infoSummary="a.arrival.infoSummary" :infoText="a.arrival.infoText" />
            </td>

            <td class="fi-aircraft-type-center"><span class="is-hidden-touch-custom">{{ a.arrival.aircraftType || a.departure.aircraftType }}</span></td>

            <td class="fi-number">
              <AirlineLogo :airline="a.arrival.airline || a.departure.airline" v-if="a.departure.number" />
              <FiTableNumber :number="a.departure.number" :airline="a.departure.airline" :datestr="datestr" />
            </td>
            <td class="fi-airport">{{ a.departure.destination }}</td>
            <td class="fi-time">{{ a.departure.scheduledDepartureTime }}</td>
            <td class="fi-time">
              <FiTableColoredtime :time="a.departure.actualDepartureTime" :delay="a.departure.departureDelay" :isActual="!a.departure.isEstimatedDepartureTime" />
            </td>
            <td class="fi-time is-hidden-touch-custom" v-if="!simple">{{ a.departure.scheduledArrivalTime }}</td>
            <td class="fi-time is-hidden-touch-custom" v-if="!simple">
              <FiTableColoredtime :time="a.departure.actualArrivalTime" :isActual="!a.departure.isEstimatedArrivalTime" />
            </td>
            <td class="fi-status">
              <FiTableStatus :status="a.departure.status" :cancelled="a.departure.cancelled" />
            </td>
            <td class="fi-text is-hidden-wide" v-if="!simple">
              <FiTableInfo :infoSummary="a.departure.infoSummary" :infoText="a.departure.infoText" />
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
              <tr :class="rowStyle(a, index)" v-for="(a, index) in filteredArrivals" :key="'arr-' + index">
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
                  <FiTableColoredtime :time="a.actualArrivalTime" :delay="a.arrivalDelay" :isActual="!a.isEstimatedArrivalTime" />
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
              <tr :class="rowStyle(a, index)" v-for="(a, index) in filteredDepartures" :key="'dep-' + index">
                <td class="fi-number">
                  <AirlineLogo :airline="a.airline" />
                  <FiTableNumber :number="a.number" :airline="a.airline" :datestr="datestr" />
                </td>
                <td class="fi-aircraft-type is-hidden-touch-custom" v-if="!simple">{{ a.aircraftType }}</td>
                <td class="fi-airport">{{ a.destination }}</td>
                <td class="fi-time">{{ a.scheduledDepartureTime }}</td>
                <td class="fi-time">
                  <FiTableColoredtime :time="a.actualDepartureTime" :delay="a.departureDelay" :isActual="!a.isEstimatedDepartureTime" />
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
      arrivals: [],

      // 秋田空港出発便
      departures: [],

      // 到着便と出発便を連結したデータ
      combined: [],

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
    },

    filteredArrivals() {
      return this.arrivals.filter(data => {
        if (!this.hideCancelled) return true;
        return !data.cancelled;
      });
    },

    filteredDepartures() {
      return this.departures.filter(data => {
        if (!this.hideCancelled) return true;
        return !data.cancelled;
      });
    },

    filteredCombined() {
      return this.combined.filter(data => {
        if (!this.hideCancelled) return true;

        const cancelled =
          (data.arrival.cancelled && data.departure.cancelled) ||
          (data.arrival.number === '' && data.departure.cancelled) ||
          (data.arrival.cancelled && data.departure.number === '');
        return !cancelled;
      });
    }
  },

  methods: {
    async updateFlightData() {
      if (!this.isUpdateButtonEnabled) return;
      if (!this.$config || !this.$config.ODPT_CONSUMERKEY) return;
      if (this.updating) return;

      this.updating = true;

      const flightData = await this.$fetchFlightData(this.$axios, this.$config.ODPT_CONSUMERKEY);

      this.arrivals = flightData.arrivals;
      this.departures = flightData.departures;
      this.combined = flightData.combined;
      this.date = flightData.date;
      this.time = flightData.time;

      this.updating = false;

      // データ更新からの経過時間を更新（更新ボタン有効／無効切替用）
      this.dateFetch = new Date();
      this.elapsed = new Date() - this.dateFetch;
    },

    // 運行情報テーブルの行(<TR>)のスタイル
    rowStyle(data, index) {
      return {
        even: index % 2 == 0,
      };
    },

    // 運行情報テーブルの行(<TR>)のスタイル（連結データ用）
    combinedRowStyle(data, index) {
      const cancelled =
        (data.arrival.cancelled && data.departure.cancelled) ||
        (data.arrival.number === '' && data.departure.cancelled) ||
        (data.arrival.cancelled && data.departure.number === '');

      return {
        even: index % 2 == 0,
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

  @include touch-custom {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
}

.table-fi {
  th, td {
    color: hsl(0, 0%, 98%);
    background-color: hsl(0, 0%, 21%);
    line-height: 1.1;
    vertical-align: middle;
  }

  th {
    background-color: hsl(0, 0%, 16%);
    text-align: center !important;
    word-break: keep-all;
    padding: 0.45rem 0.5rem;
  }

  td {
    padding: 0.35rem 0.5rem;

    @include mobile-s {
      padding: 0.3rem 0.2rem;
    }
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

.table-fi.is-bordered th {
  border-bottom-width: 2px;
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

.fi-spotstatus {
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
  text-align: center;
}

.fi-text {
  min-width: 10rem;
  max-width: 20rem;
}
/* purgecss end ignore */
</style>
