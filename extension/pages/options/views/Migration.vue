<template>
  <div class="page-migration">
    <div class="container">
      <h3>{{$i18n("data_to_migrate")}}</h3>
      <div>{{$i18n("word_count")}}: {{words.length}}</div>
      <div>{{$i18n("sentence_count")}}: {{sentences.length}}</div>
      <a-button type="primary" @click="onMigrateClick"
        style="margin-top: 10px;"
        :loading="migrating" :disabled="!valid">{{$i18n("begin_migrate")}}</a-button>
    </div>
  </div>
</template>

<script>
import { migrationHelper } from '@/js/helper/migration.helper'

export default {
  name: 'Migration',
  data() {
    return {
      words: [],
      sentences: [],
      valid: false,
      migrating: false
    }
  },

  methods: {
    init() {
      migrationHelper.shouldMigrate().then((valid) => {
        this.valid = valid;

        if (valid) {
          this.loadData();
        }
      })
    },
    loadData() {
      migrationHelper.getOldData().then(store => {
        this.words = store.words;
        this.sentences = store.sentences;
      })
    },

    onMigrateClick() {
      this.migrating = true;
      migrationHelper.migrate().then((result) => {
        this.migrating = false;

        if (result) {
          this.valid = false
          this.words = []
          this.sentences = []
          migrationHelper.setMigrated(true)
          this.$message.success(this.$i18n('migrate_ok'))
        } else {
          this.$message.warning(this.$i18n('migrate_error'))
        }
      })
    }
  },

  mounted() {
    this.init();
  }
}
</script>

<style lang="scss" scoped>
@import "../../../styles/scss/theme.scss";

.container {
  width: 960px;
  margin: 40px auto;
  padding: 40px;
  background: #fff;
  border: 1px solid #ededed;
}
</style>