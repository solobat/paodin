<template>
  <div id="app" class="wordcard">
    <topbar />
    <div class="page-container">
      <router-view :config="config" :i18n="i18n" />
    </div>
  </div>
</template>

<script>
import * as i18n from "@/js/i18n/options";
import Topbar from './components/Topbar.vue'

const bg = chrome.extension.getBackgroundPage();
let final = [];

const levels = [0, 1, 2, 3, 4, 5].map(level => {
  return {
    label: level,
    value: level
  };
});
const filterKeyMap = {
  list: "filter",
  recite: "reciteFilter"
};
const reciteStages = ["name", "sentence", "trans"];

export default {
  props: ["config", "userInfo"],

  components: {
    Topbar
  },

  data: function() {
    return {
      activeIndex: this.$route.path,
      i18n
    };
  },
  mounted: function() {}
};
</script>

<style lang="scss">
body,
p,
div,
ul,
li {
  margin: 0;
  padding: 0;
}

img {
  vertical-align: top;
}

a {
  text-decoration: none;
}

html {
  box-sizing: border-box;
  background: #f7f7f7;

  * {
    box-sizing: inherit;
  }
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f7f7f7;
}

.page-container {
  height: calc(100vh - 61px);
  margin: 0 auto;
  width: 960px;

  .view-container {
    height: 100%;
  }
}

.bg-black {
  background: #303030;
}

.changelog {
  padding: 5px 12px;
  height: 400px;
  border: 1px solid #ededed;
  overflow: scroll;
}

.text-panel {
  width: 960px;
  margin: 20px auto 0;
  background: #fff;
  color: rgba(51, 51, 51, 0.87);
  font-size: 16px;
  line-height: 1.6;
  border: 1px solid #ededed;
  padding: 15px 30px 25px;
}

.text-panel a {
  border-bottom: 1px solid #20a0ff;
  color: #20a0ff;
}

.text-panel .notice,
.text-panel em {
  color: #ff3f80;
  font-style: normal;
}

.text-panel .qrcode {
  box-shadow: 0 0 10px #555;
  border-radius: 6px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 200px;
}

.text-panel .qrcodes {
  display: flex;
  justify-content: space-between;
}

.filter-panel {
  width: 350px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  padding: 20px;
  background: #303030;
  color: #fff;

  .filter-item {
    margin-bottom: 30px;
  }

  .filter-item-tags {
    flex: 1;
  }

  .other-info {
    display: flex;
    justify-content: space-between;
    color: #999;

    a {
      color: #4698fb;
    }
  }

  .batch-delete-btn {
    color: #ff4949;
    cursor: pointer;
  }
}

.filter-item {
  .field-label {
    display: flex;
    font-size: 14px;
    line-height: 1.8;

    .label-text {
      flex: 1;
    }
  }

  .el-tag {
    cursor: pointer;
    user-select: none;
  }
}

.word-list-container {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.word-list {
  flex: 1;
  overflow-y: scroll;
}

.word-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
  border-bottom: 1px solid #ededed;
  padding-bottom: 5px;

  .word-name,
  .word-trans {
    font-size: 14px;
    line-height: 1.8;
  }
}

.word-editor {
  background: #f7f7f7;
  border-top: 1px solid #ededed;
  padding: 0 20px;
  width: 100%;
  height: 240px;
  box-sizing: border-box;

  .el-form-item {
    margin-bottom: 0;
    border-bottom: 1px solid #dfdfdf;
  }

  .el-form {
    .el-input__inner,
    .el-textarea__inner {
      border: 0;
      background: inherit;
    }
  }

  .form-btns {
    margin-top: 20px;
  }

  .form-aside {
    display: flex;
    flex-direction: column;
    padding: 0 15px;
    height: 233px;

    .form-aside-fields {
      flex: 1;
    }
  }
}

.eg-img {
  margin: 10px 0;
  width: 100%;
  height: auto;
}
/* scrollbar styles */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-button:start,
::-webkit-scrollbar-button:end {
  display: none;
}

::-webkit-scrollbar-track-piece {
  -webkit-border-radius: 0;
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  width: 50px;

  -webkit-border-radius: 8px;
  outline: 1px solid #7f7f7f;
  background-color: #7f7f7f;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #333;
}

.scheme-filter,
.recite-results {
  width: 400px;
  margin: 40px auto 0;
  padding: 20px;
  box-sizing: border-box;

  h2 {
    text-align: center;
    border-bottom: 1px solid #666;
    line-height: 2;
  }

  .action-btns {
    border-top: 1px solid #666;
    padding-top: 12px;
    text-align: center;
  }
}

.scheme-filter {
  .filter-results {
    font-size: 16px;
    margin-bottom: 15px;
  }

  em {
    color: #ff3f80;
    font-style: normal;
  }

  .filter-items {
    padding: 0 20px;
  }

  .filter-item {
    margin-bottom: 12px;
  }
}

.wordrecite-ground {
  .word-card-wrap {
    display: flex;
    width: 700px;
    height: 312px;
    margin: 100px auto 0;
  }

  .word-card {
    width: 100%;
    height: 310px;
    text-align: center;
  }

  .word-fields {
    display: flex;
    flex-direction: column;
    height: 240px;
  }

  .word-card-name {
    font-size: 16px;
    line-height: 2;
    flex: 1;
  }

  .word-card-trans {
    line-height: 2;
    flex: 1;
  }

  .word-card-sentence {
    text-align: left;
    flex: 2;
    overflow: scroll;

    em {
      color: #d4237a;
      font-style: normal;
    }
  }

  ::-webkit-scrollbar {
    width: 3px;
  }

  .word-otherinfo {
    height: 30px;
  }

  .word-card-actions {
    width: 90px;

    img {
      display: block;
      margin: 0 auto 5px;
      width: 45px;
      height: 45px;
      cursor: pointer;

      &:first-child {
        margin-top: 156px;
      }
    }
  }

  .word-otherinfo {
    display: flex;
    justify-content: space-between;

    img {
      width: 30px;
      height: 30px;
    }

    .voice-btn {
      cursor: pointer;
    }
  }

  &.card-size-normal {
    .word-card-name {
      font-size: 16px;
    }

    .word-card-trans {
      font-size: 14px;
    }

    .word-card-sentence {
      font-size: 14px;
    }
  }

  &.card-size-big {
    .word-card-name {
      font-size: 18px;
    }

    .word-card-trans {
      font-size: 16px;
    }

    .word-card-sentence {
      font-size: 16px;
    }
  }

  &.card-size-large {
    .word-card-name {
      font-size: 20px;
    }

    .word-card-trans {
      font-size: 18px;
    }

    .word-card-sentence {
      font-size: 18px;
    }
  }
}

.share-icons {
  display: flex;
  margin-top: 24px;

  > span {
    margin: 10px;

    &:first-child {
      margin-left: 0;
    }
  }

  .fa {
    display: block;
    width: 30px;
    height: 30px;
    opacity: 0.3;
    background: no-repeat center center;
    background-size: 30px 30px;
    cursor: pointer;
    transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;

    &:hover {
      opacity: 1;
    }
  }

  .fa-weibo {
    background-image: url(/img/weibo.png);
  }

  .fa-google-plus {
    background-image: url(/img/gplus.png);
  }

  .fa-twitter {
    background-image: url(/img/twitter.png);
  }
}

.word-icons {
  position: absolute;
  right: 5px;
  top: 5px;
}

.word-icon {
  display: inline-block;
  margin-left: 10px;
  background: url() no-repeat center;
  background-size: 100% 100%;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.icon-synced {
  background-image: url(/img/synced.png);
}

.icon-link {
  background-image: url(/img/link.png);
}

.icon-root {
  background-image: url(/img/root.png);
}

.code-help {
  color: #3a6dd0;
  font-size: 18px;
  text-decoration: underline;
}
</style>