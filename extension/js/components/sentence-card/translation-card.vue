<template>
  <div class="card">
    <div class="card-main">
      <div class="sentence-text">{{item.text}}</div>
      <el-tabs class="sentence-trans" tab-position="left" type="card">
        <el-tab-pane :label="$i18n('options_item_translate')">
          <el-input type="textarea" v-model="userTrans" />
        </el-tab-pane>
        <el-tab-pane :label="$i18n('options_sentences_answer')">{{ item.trans }}</el-tab-pane>
      </el-tabs>
    </div>
    <div class="button-strip">
      <div class="buttons-main">
        <el-button size="small" icon="delete" @click="handleDeleteClick">{{$i18n("options_base_delete")}}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import SentenceMixin from '@/js/mixins/sentence.mixin'

export default {
  mixins: [SentenceMixin],

  data() {
    return {
      userTrans: ""
    };
  },

  methods: {

  }
};
</script>
