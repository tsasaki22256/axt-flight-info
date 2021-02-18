<template>
  <div class="modal" :class="{ 'is-active': active }">
    <div class="modal-background" @click="closeDialog()"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">到着便／出発便のリンク設定</p>
        <button class="delete" aria-label="close" @click="closeDialog()"></button>
      </header>
      <section class="modal-card-body">
        <!-- ラベル -->
        <div class="field is-horizontal" style="margin-bottom:0.1rem">
          <div class="field-body">
            <div class="field">
              <p class="control">
                <input class="input is-small is-static" style="font-weight:bold" type="text" value="到着便" readonly />
              </p>
            </div>
            <div class="field">
              <p class="control">
                <input class="input is-small is-static" style="font-weight:bold" type="text" value="出発便" readonly />
              </p>
            </div>
          </div>
        </div>
        <!-- テキストボックス -->
        <div v-for="(pair, index) in pairs" :key="index">
          <div class="field is-horizontal" style="margin-bottom:0.5rem">
            <div class="field-body">
              <div class="field">
                <p class="control">
                  <input class="input is-small" type="text" v-model="pair[0]" />
                </p>
              </div>
              <div class="field">
                <p class="control">
                  <input class="input is-small" type="text" v-model="pair[1]" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success" @click="saveFlightNumberPairs()">保存</button>
        <button class="button" @click="closeDialog()">キャンセル</button>
        <button class="button" @click="restoreFlightNumberPairs()" style="margin-left:auto">初期設定に戻す</button>
      </footer>
    </div>
    <button class="modal-close is-large" aria-label="close" @click="closeDialog()"></button>
  </div>
</template>

<script>
export default {
  props: ['active'],
  data() {
    return {
      PAIRS_LENGTH_MAX: 32,
      pairs: [],
    }
  },
  mounted() {
    this.resetFlightNumberPairsInput();
  },
  methods: {
    // テキストボックスの内容を現在の設定値で埋める
    resetFlightNumberPairsInput() {
      if (window) {
        this.pairs = [];
        for (let i = 0; i < this.PAIRS_LENGTH_MAX; i++) {
          this.pairs.push(['', '']);
        }

        const pairs = this.$loadFlightNumberPairs();
        const length = Math.min(pairs.length, this.PAIRS_LENGTH_MAX);
        for (let i = 0; i < length; i++) {
          this.pairs[i][0] = pairs[i][0];
          this.pairs[i][1] = pairs[i][1];
        }
      }
    },

    // テキストボックスの内容をlocalStorageに保存し、新しい設定値とする
    // ダイアログを閉じる
    saveFlightNumberPairs() {
      const newPairs = [];
      for (let i = 0; i < this.pairs.length; i++) {
        const arr = this.pairs[i][0].trim();
        const dep = this.pairs[i][1].trim();
        if (arr !== '' || dep !== '') {
          newPairs.push([arr, dep]);
        }
      }

      this.$saveFlightNumberPairs(newPairs);

      this.closeDialog();
    },

    // localStorage及びテキストボックスの内容を初期設定に戻す
    restoreFlightNumberPairs() {
      this.$resetFlightNumberPairs();
      this.resetFlightNumberPairsInput();
    },

    closeDialog() {
      this.resetFlightNumberPairsInput();
      this.$emit('close-modal');
    }
  }
}
</script>

<style lang="scss" scoped>
/* purgecss start ignore */

/* purgecss end ignore */
</style>
