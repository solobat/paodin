<template>
  <div class="text-panel">
    <h2>{{ appName }} v{{config.version}}</h2>
    <section class="changelog">
      <template v-for="(update, index) in changelog">
        <div :key="index" v-if="!update.ext || update.ext === appName">
          <h3 v-html="update.version"></h3>
          <p v-html="update.detail"></p>
        </div>
      </template>
    </section>
    <div>
      <a
        :href="'http://owsjc7iz3.bkt.clouddn.com/' + appName + '-' + config.version + '.crx'"
      >download crx</a>
    </div>
  </div>
</template>

<script>
import changelog from "@/js/info/changelog";
import browser from "webextension-polyfill";

export default {
  props: ["i18n", "config"],

  data() {
    return {
      changelog
    };
  },

  methods: {
    saveConfig: function(silent) {
      let self = this;
      let newConfig = JSON.parse(JSON.stringify(this.config));

      browser.storage.sync
        .set({
          config: newConfig
        })
        .then(resp => {
          if (!silent) {
            this.$message(this.i18n.msg.saveok);
          }
        });
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.saveConfig(true);
    });
  }
};
</script>

<style>
</style>