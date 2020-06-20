<template>
  <div class="page-general">
    <a-form-model ref="config" :model="config"
      layout="horizontal" :labelCol="{span: 12}" :wrapperCol="{span: 12}">
      <a-row>
        <a-col :span="8">
          <a-form-model-item :label="$i18n('options_general_engine')">
            <a-select v-model="config.engine" :placeholder="$i18n('options_base_choose')">
              <a-select-option
                v-for="(item, index) in TRANSLATE_ENGINS"
                :key="index"
                :value="item.value">{{ item.label }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="8" v-if="config.engine === 'youdao'">
          <a-form-model-item :label="$i18n('options_youdao_key')">
            <a-input v-model="config.ydAppKey"/>
          </a-form-model-item>
        </a-col>
        <a-col :span="8" v-if="config.engine === 'youdao'">
          <a-form-model-item :label="$i18n('options_youdao_secret')">
            <a-input v-model="config.ydAppSecret"/>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="8">
          <a-form-model-item :label="$i18n('options_general_source')">
            <a-select
              :disabled="config.autoSetFrom"
              v-model="config.from"
              filterable
              :placeholder="$i18n('options_base_choose')"
            >
              <a-select-option v-for="(item, index) in codeList" :key="index" :value="item">{{ item }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item :label="$i18n('options_general_target')">
            <a-select v-model="config.to" filterable :placeholder="$i18n('options_base_choose')">
              <a-select-option v-for="(item, index) in codeList" :key="index" :value="item">{{ item }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="8">
          <a-form-model-item :label="$i18n('options_general_auto_source')">
            <a-switch v-model="config.autoSetFrom" on-color="#20a0ff"></a-switch>
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item :label="$i18n('options_general_dblclick_trigger')">
            <a-switch v-model="config.dblclick2trigger" on-color="#20a0ff"></a-switch>
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item :label="$i18n('options_general_hold_ctrl')">
            <a-tooltip effect="dark" :content="$i18n('options_general_hold_ctrl_tips')" placement="topLeft">
              <a-switch v-model="config.withCtrlOrCmd" on-color="#20a0ff"></a-switch>
            </a-tooltip>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="8">
          <a-form-model-item :label="$i18n('options_general_autocut_sentence')">
            <a-tooltip
              class="item"
              effect="dark"
              :content="$i18n('options_general_autocut_sentence_tips')"
              placement="topLeft"
            >
              <a-switch v-model="config.autocut" on-color="#20a0ff"></a-switch>
            </a-tooltip>
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item :label="$i18n('options_general_card_fontsize')">
            <a-select v-model="config.cardFontSize" :placeholder="$i18n('options_base_choose')">
              <a-select-option
                v-for="item in CARD_FONTSIZE_OPTIONS"
                :key="item.value"
                :value="item.value"
              >{{ item.label }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item :label="$i18n('options_general_precision_first')">
            <a-tooltip
              class="item"
              effect="dark"
              :content="$i18n('options_general_precision_first_tips')"
              placement="topLeft"
            >
              <a-switch v-model="config.precisionFirst" on-color="#20a0ff"></a-switch>
            </a-tooltip>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="8">
          <a-form-model-item :label="$i18n('options_general_omnibox_enter_show_sentence')">
            <a-switch v-model="config.alertOnOmniboxInputEntered" on-color="#20a0ff"></a-switch>
          </a-form-model-item>
        </a-col>
      </a-row>
    </a-form-model>
    <div class="btns-wrap">
      <a-button type="primary" @click="handleConfigSubmit">{{$i18n("options_base_save")}}</a-button>
    </div>
  </div>
</template>

<script>
import browser from "webextension-polyfill";
import { WORD_LEVEL, CARD_FONTSIZE_OPTIONS } from "@/js/constant/options";
import { TRANSLATE_ENGINS } from "@/js/constant/options";
import { codeList } from "@/js/constant/code";

export default {
  props: ['config'],

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
            this.$message.success(this.$i18n('options_msg_saveok'));
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