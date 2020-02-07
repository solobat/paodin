<template>
  <div class="card">
    <div class="card-main">
      <div class="sentence-text">{{item.text}}</div>
      <el-tabs class="sentence-trans" tab-position="left" type="card">
        <el-tab-pane label="翻译">
          <el-input type="textarea" v-model="userTrans" />
        </el-tab-pane>
        <el-tab-pane label="答案">{{ item.trans }}</el-tab-pane>
      </el-tabs>
    </div>
    <div class="button-strip">
      <div class="buttons-main">
        <el-button size="small" icon="delete" @click="handleDeleteClick">删除</el-button>
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
