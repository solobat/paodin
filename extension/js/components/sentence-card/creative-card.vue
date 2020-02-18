<template>
  <div class="card">
    <div class="card-main">
      <div class="sentence-text">{{item.trans}}</div>
      <el-tabs class="sentence-trans" tab-position="left" type="card">
        <el-tab-pane :label="i18n.sentences.translate">
          <el-input type="textarea" v-model="userTrans" />
        </el-tab-pane>
        <el-tab-pane :label="i18n.sentences.answer">{{ item.text }}</el-tab-pane>
      </el-tabs>
    </div>
    <div class="button-strip">
      <div class="buttons-main">
        <el-button size="small" icon="delete" @click="handleDeleteClick">{{i18n.base.delete}}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import SentenceMixin from '@/js/mixins/sentence.mixin'

export default {
  props: ['i18n'],

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

<style lang="scss">
.sentence-trans {
  .el-tabs__nav {
    border-color: #444!important;
    border-radius: 0!important;
  }
  .el-tabs__item {
    border-radius: 0!important;
    background: #292a2d;
    border-color: #444!important;
    color: #999;
    padding: 0 10px;

    &.is-active {
      color: #ddd;
    }
  }

  &.el-tabs--card > .el-tabs__header {
    border-bottom: 0;
  }

  .el-textarea__inner {
    border-color: #444!important;
    background: #292a2d;
    color: #999;
  }
}
</style>
<style lang="scss" >
.card {
  background: #292a2d;
  border-radius: 4px;
  height: 260px;
}

.card-main {
  height: 212px;
  padding: 16px 20px;
}

.sentence-text {
  height: 90px;
  font-size: 14px;
  color: #e8eaed;
  overflow: auto;
}

.sentence-trans {
  height: 90px;
  font-size: 12px;
  color: #9aa0a6;
  overflow: auto;
}

.button-strip {
  display: flex;
  padding: 8px 20px 8px 10px;
}

.buttons-main {
  flex: 1;
  display: flex;

  .el-button {
    background-color: #292a2d;
    border-color: #5f6368;
    color: #569ef8;
  }
}
</style>