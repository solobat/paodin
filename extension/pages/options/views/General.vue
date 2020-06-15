<template>
  <div class="page-general">
    <a-form-model ref="config" :model="config"
      layout="horizontal" :labelCol="{span: 12}" :wrapperCol="{span: 12}">
      <a-row>
        <a-col :span="8">
          <a-form-model-item :label="i18n.general.engine">
            <a-select v-model="config.engine" :placeholder="i18n.base.choose">
              <a-select-option
                v-for="(item, index) in TRANSLATE_ENGINS"
                :key="index"
                :value="item.value">{{ item.label }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item :label="i18n.general.source">
            <a-select
              :disabled="config.autoSetFrom"
              v-model="config.from"
              filterable
              :placeholder="i18n.base.choose"
            >
              <a-select-option v-for="(item, index) in codeList" :key="index" :value="item">{{ item }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item :label="i18n.general.target">
            <a-select v-model="config.to" filterable :placeholder="i18n.base.choose">
              <a-select-option v-for="(item, index) in codeList" :key="index" :value="item">{{ item }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="8">
          <a-form-model-item :label="i18n.general.autoSource">
            <a-switch v-model="config.autoSetFrom" on-color="#20a0ff"></a-switch>
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item :label="i18n.general.dblclickTrigger">
            <a-switch v-model="config.dblclick2trigger" on-color="#20a0ff"></a-switch>
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item :label="i18n.general.holdCtrl">
            <a-tooltip effect="dark" :content="i18n.general.holdCtrlTips" placement="topLeft">
              <a-switch v-model="config.withCtrlOrCmd" on-color="#20a0ff"></a-switch>
            </a-tooltip>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="8">
          <a-form-model-item :label="i18n.general.autocutSentence">
            <a-tooltip
              class="item"
              effect="dark"
              :content="i18n.general.autocutSentenceTips"
              placement="topLeft"
            >
              <a-switch v-model="config.autocut" on-color="#20a0ff"></a-switch>
            </a-tooltip>
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item :label="i18n.general.cardFontSize">
            <a-select v-model="config.cardFontSize" :placeholder="i18n.base.choose">
              <a-select-option
                v-for="item in CARD_FONTSIZE_OPTIONS"
                :key="item.value"
                :value="item.value"
              >{{ item.label }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item :label="i18n.general.precisionFirst">
            <a-tooltip
              class="item"
              effect="dark"
              :content="i18n.general.precisionFirstTips"
              placement="topLeft"
            >
              <a-switch v-model="config.precisionFirst" on-color="#20a0ff"></a-switch>
            </a-tooltip>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="8">
          <a-form-model-item :label="i18n.general.ominboxEnterShowSentence">
            <a-switch v-model="config.alertOnOmniboxInputEntered" on-color="#20a0ff"></a-switch>
          </a-form-model-item>
        </a-col>
      </a-row>
    </a-form-model>
    <div class="btns-wrap">
      <a-button type="primary" @click="handleConfigSubmit">{{ i18n.base.save }}</a-button>
    </div>
  </div>
</template>

<script>
import browser from "webextension-polyfill";
import { WORD_LEVEL, CARD_FONTSIZE_OPTIONS } from "@/js/constant/options";
import { TRANSLATE_ENGINS } from "@/js/constant/options";
import { codeList } from "@/js/constant/code";

export default {
  props: ['i18n', 'config'],

  data() {
    return {
      CARD_FONTSIZE_OPTIONS,
      TRANSLATE_ENGINS,
      codeList
    }
  },

  methods: {
    handleConfigSubmit() {
      this.saveConfig();
    },

    saveConfig: function(silent) {
      let self = this;
      let newConfig = JSON.parse(JSON.stringify(this.config));

      browser.storage.sync
        .set({
          config: newConfig
        })
        .then(resp => {
          if (!silent) {
            this.$message.success(this.i18n.msg.saveok);
          }
        });
    },
  }
};
</script>

<style lang="scss" scoped>
.page-general {
  margin-top: 20px;
  background: #fff;
  padding: 20px;
}

.btns-wrap {
  display: flex;
  justify-content: flex-end;
}
</style>