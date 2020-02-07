<template>
  <div class="card">
    <div class="card-main">
      <div class="sentence-text">{{item.text}}</div>
      <div class="sentence-trans" v-show="transVisible">
        <el-input type="textarea" v-model="item.trans" v-if="editable"></el-input>
        <template v-else>{{item.trans}}</template>
      </div>
    </div>
    <div class="button-strip">
      <div class="buttons-main">
        <el-button
          v-if="transVisible"
          size="small"
          :icon="editable ? 'check' : 'edit'"
          @click="toggleEdit"
        >{{editBtnText}}</el-button>
        <el-button
          v-if="editable"
          size="small"
          icon="close"
          @click="editable = false"
        >取消</el-button>
        <el-button v-if="!editable" size="small" icon="delete" @click="handleDeleteClick">删除</el-button>
      </div>
      <el-switch v-model="transVisible" on-text off-text></el-switch>
    </div>
  </div>
</template>

<script>
import SentenceMixin from '@/js/mixins/sentence.mixin'

export default {
  mixins: [SentenceMixin],

  data() {
    return {
      transVisible: false,
      editable: false
    };
  },

  computed: {
    editBtnText() {
      return this.editable ? "保存" : "编辑";
    }
  },

  methods: {
    toggleEdit() {
      if (this.editable) {
        this.save().then(() => {
          this.$message({
            type: "success",
            message: "保存成功!"
          });
        });
      }
      this.editable = !this.editable;
    },
  }
};
</script>

<style lang="scss">
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
  font-size: 13px;
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
}
</style>