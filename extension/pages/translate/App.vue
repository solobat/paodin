<template>
  <div class="page-translate" id="main" v-cloak>
    <div class="lookup-word" v-if="isWord">
      <div class="top-row">
        <a-select class="lang-from" v-model="meta.from" filterable :dropdownMatchSelectWidth="false">
          <a-select-option v-for="(item, index) in codeList" :key="index" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
        <a-icon type="swap-right" class="lang-split" />
        <a-select class="lang-to" v-model="meta.to" filterable :dropdownMatchSelectWidth="false">
          <a-select-option v-for="(item, index) in codeList" :key="index" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
        <div class="word-save" @click="handleSaveClick">
          <a-icon v-if="assit.saved" type="star" theme="filled" style="font-size: 16px;" />
          <a-icon v-else type="star" style="font-size: 16px;" />
        </div>
        <a-icon type="close" class="close" />
      </div>
      <div class="word-content">
        <div class="scroll-area" id="lookup-area">
          <div id="lookup-area-inner">
            <div class="word-head">
              <a-input
                type="text"
                v-model="meta.word"
                id="lookup-root"
                @blur="updateWord"
                @dblclick="enbaleWordInput"
                class="word-name"
                :readonly="!assit.wordEditable"
              />
              <template v-for="(item, index) in assit.translate.phonetic">
                <span
                  class="voice-item"
                  v-if="assit.translate.phonetic && assit.translate.phonetic.length"
                  :key="index"
                >
                  <span>[{{item.name}}]</span>
                  <a-icon @mouseenter="playAudio(meta.word)" type="sound" />
                </span>
              </template>
              <span class="add-txt"></span>
            </div>
            <div class="defitems-wrap">
              <a-tag
                class="defitem active"
                color="#2db7f5"
                v-for="(item, index) in assit.translate.trans"
                :key="index"
                @click="handleDefDelete(index)"
                :defindex="index"
              >{{ item }}</a-tag>
              <a-input
                v-model="assit.newWordDef"
                type="text"
                style="width: 150px;"
                @keyup.delete="handleDefDelete"
                @keyup.enter="handleDefAdd"
                placeholder="Add your own">
                <a-icon type="plus" @click="handleDefAdd" slot="addonAfter" />
              </a-input>
            </div>
            <div class="word-tags">
              <a-tag
                style="margin-right: 5px;"
                :key="tag"
                v-for="tag in assit.wordTags"
                :closable="true"
                :close-transition="false"
                color="green"
                @close="handleTagClose(tag)"
              >{{tag}}</a-tag>
              <a-auto-complete
                class="inline-input"
                v-if="assit.tagInputVisible"
                v-model="assit.tagInputValue"
                placeholder="Please input"
                ref="saveTagInput"
                @select="handleTagSelect"
                @search="tagsQuerySearch"
                @blur="handleTagInputConfirm"
                @keydown.enter.native="handleTagInputConfirm"
              ></a-auto-complete>
              <a-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showTagInput"
              >+ New Tag</a-button>
            </div>
            <ul class="word-explains">
              <li
                v-for="(explain, index) in assit.translate.explains"
                :key="index"
              >{{ explain }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="word-sentence">
        <div class="text-hold">
          <div class="sentence-wrap scroll-area" id="surroundings">
            <p
              v-show="!assit.sentenceEditable"
              class="translated-container"
              @dblclick="toggleEdit"
              language="zhs"
            >{{ meta.surroundings }}</p>
            <a-textarea
              v-show="assit.sentenceEditable"
              v-model="meta.surroundings"
              class="sent-translated"
              cols="30"
              rows="3"
            ></a-textarea>
          </div>
          <div class="actions">
            <a-icon type="edit" v-show="!assit.sentenceEditable" class="edit-btn" @click="toggleEdit"/>
            <a-icon type="check" v-show="assit.sentenceEditable" class="confirm-btn" @click="saveSentence"/>
            <a-icon type="close" v-show="assit.sentenceEditable" class="reject-btn" @click="toggleEdit"/>
          </div>
        </div>
      </div>
      <div class="word-footer">
        <span class="by">Translation by {{ meta.engine }}</span>
      </div>
    </div>
    <Sentence ref="sentence" v-else :meta="meta"></Sentence>
  </div>
</template>

<script>
import * as PageConfig from "./translate.config.js";
import * as i18n from "@/js/i18n/translate";
import { codeList } from "@/js/constant/code";
import { updateUserLang } from "@/js/helper/lang";
import $ from "jquery";
import _ from "underscore";
import Translate from "@/js/translate";
import { AVHelper } from "@/services/cocoa.service";
import { TEXT_TYPE } from "@/js/constant/options";
import { getTextType } from "@/js/helper/text";
import Sentence from "@/js/components/sentence/index.vue";
import { mapGetters } from 'vuex'
import { wordService, isExisted } from '@/services/word.service'

export default {
  props: ["meta"],

  components: {
    Sentence
  },

  data: function() {
    return {
      codeList,
      textType: TEXT_TYPE.WORD,
      assit: PageConfig.getDefaultAssit()
    };
  },

  computed: {
    ...mapGetters('account', ['loggedIn']),
    isWord() {
      return this.textType === TEXT_TYPE.WORD;
    }
  },

  mounted() {
    this.lookup();
  },

  watch: {
    meta() {
      this.rerender();
    },
    "meta.from": function() {
      this.updateLang();
    },
    "meta.to": function() {
      this.updateLang();
    }
  },

  methods: {
    updateLang() {
      const { host, from, to } = this.meta;

      updateUserLang(host, from, to);
      this.rerender();
    },

    rerender(meta) {
      if (meta) {
        this.meta = meta;
      }
      this.assit = PageConfig.getDefaultAssit();
      this.$nextTick(() => {
        this.lookup();
      });
    },

    lookupWord() {
      this.loadWord();
    },

    lookup() {
      const type = getTextType(this.meta.word, this.meta.from);

      if (type === TEXT_TYPE.WORD) {
        this.textType = type;
        this.lookupWord();
      } else {
        // NOTE: article type is no supported
        this.textType = TEXT_TYPE.SENTENCE;
      }
    },

    queryWordIndex() {
      AVHelper.getTag(this.meta.word).then(tag => {
        if (tag) {
          this.assit.wordTags.push(tag);
        }
      });
    },

    loadWord() {
      chrome.runtime.sendMessage(
        {
          action: "find",
          word: this.meta.word
        },
        () => {
          this.getTranslate().then(() => {
            if (!this.assit.orgWord && this.meta.from === "en") {
              this.queryWordIndex();
            }
          });
        }
      );
    },
    getTranslate() {
      return Translate.translate(
        this.meta.word,
        this.meta.engine,
        this.meta.from,
        this.meta.to
      ).then(results => {
        // FIXME: orgWord may only have id attr
        if (this.assit.orgWord) {
          let { trans = [], tags = [] } = this.assit.orgWord;

          results.trans = trans;
          this.assit.wordTags = tags;
        }

        this.assit.translate = results;
      });
    },

    playAudio(url) {
      Translate.playAudio(url, this.meta.from);
    },

    enbaleWordInput() {
      this.assit.wordEditable = true;
    },

    handleDefDelete(index) {
      if (typeof index === "number") {
        this.assit.translate.trans.splice(index, 1);
      } else {
        if (!this.assit.newWordDef) {
          if (this.assit.deleteTimes > 0) {
            this.assit.translate.trans.pop();
            this.assit.deleteTimes = 0;
          } else {
            this.assit.deleteTimes = this.assit.deleteTimes + 1;
          }
        }
      }
    },

    handleDefAdd() {
      if (this.assit.newWordDef) {
        this.assit.translate.trans.push(this.assit.newWordDef);
        this.assit.newWordDef = "";
      }
    },

    handleTagClose(tag) {
      this.assit.wordTags.splice(this.assit.wordTags.indexOf(tag), 1);
    },

    createFilter(queryString) {
      return item => {
        return item.value.indexOf(queryString.toLowerCase()) === 0;
      };
    },

    tagsQuerySearch(queryString, cb) {
      let allTags = this.assit.allTags;
      let results = queryString
        ? allTags.filter(this.createFilter(queryString))
        : allTags;

      return results
    },

    handleTagSelect() {
      this.handleTagInputConfirm();
    },

    handleTagInputConfirm() {
      let tagInputValue = this.assit.tagInputValue;
      if (tagInputValue && this.assit.wordTags.indexOf(tagInputValue) === -1) {
        this.assit.wordTags.push(tagInputValue);
      }
      this.assit.tagInputVisible = false;
      this.assit.tagInputValue = "";
    },

    showTagInput() {
      this.assit.tagInputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.focus();
      });
    },

    toggleEdit() {
      this.assit.sentenceEditable = !this.assit.sentenceEditable;
    },

    saveSentence() {
      var sentence = this.meta.surroundings;

      this.assit.sentenceEditable = false;
    },

    updateWord() {
      if (this.assit.wordEditable) {
        this.assit.wordEditable = false;
        this.loadWord();
      }
    },

    handleDeleteClick() {
      var self = this;

      chrome.extension.sendRequest(
        {
          action: "remove",
          data: {
            id: self.wordId
          }
        },
        function(resp) {
          self.close();
        }
      );
    },

    save() {
      let vm = this;
      let attrs = {
        text: this.meta.word,
        sentence: this.meta.surroundings,
        trans: (this.assit.translate.trans || []).join(','),
        tags: this.assit.wordTags,
        source: this.meta.source,
        from_lang: this.meta.from,
        to_lang: this.meta.to,
        platform: 'Chrome'
      };

      wordService.create(attrs).then(() => {
        this.$message.success(this.$i18n('add_ok'))
        this.assit.saved = true
      }).catch(() => {
        this.$message.error(this.$i18n('add_failed'))
      })
    },

    saveIfNeeded() {
      wordService.isExisted(this.meta.word).then(isExisted => {
        if (isExisted) {
          this.$confirm({
            title: this.$i18n('word_saved'),
            content: this.$i18n('confirmto_overwrite'),
            onOk() {
              this.save()
            },
          })
        } else {
          this.save()
        }
      })
    },

    handleSaveClick() {
      if (this.loggedIn) {
        this.saveIfNeeded()
      } else {
        this.$message.warning(this.$i18n('login_first'))
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import url('../../styles/css/normalize.css');
@import "../../styles/scss/theme.scss";
@import "../../scss/mixins.scss";

body {
  color: $color;
  background: $background-color;
}

.page-translate {
  overflow: hidden;
  border-radius: 4px;
  background: $background-color;
}

.lookup-word {
  background: $background-color;
  padding: 12px;
}

.top-row {
  position: relative;
  display: flex;
  align-items: center;

  .close {
    position: absolute;
    right: 0;
    top: 0;
  }
}

.lang-from,
.lang-to {
  width: 110px;
}

.lang-split {
  font-size: 16px;
}

.lang-from {
  margin-right: 20px;
}

.lang-to {
  margin-left: 20px;
  margin-right: 10px;
}

.word-content {
  margin-top: 15px;
  background: #fff;
  border: 1px solid $border-color;
  border-radius: 4px;
  padding: 8px 60px 5px;
  height: 170px;
  overflow: auto;
}

.word-head {
}

.word-name {
  width: 300px;
  font-size: 30px;
  border: 0;
  padding-left: 0;
  line-height: 40px;
}

.voice-item {
  margin-right: 5px;
}

.defitems-wrap {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;

  .ant-tag {
    line-height: 30px;
  }
}

.word-tags {
  margin-top: 12px;
}

ul, li {
  margin: 0;
  padding: 0;
}

.word-explains {
  margin-top: 12px;
}

.word-sentence {
  margin-top: 12px;
}

.text-hold {
  display: flex;

  &:hover {
    .sentence-wrap {
      border-color: #d9d9d9;
    }

    .actions {
      border-color: #d9d9d9;
    }
  }
}

.sentence-wrap {
  flex: 1;
  height: 93px;
  overflow: auto;
  padding: 2px;
  border: 1px solid transparent;
  border-collapse: all;
}

.actions {
  width: 23px;
  height: 93px;
  text-align: center;
  border: 1px solid transparent;
  border-left: 0;

  .anticon {
    &:hover {
      color: #59b5ef;
    }
  }
}

.translated-container {
  line-height: 1.3;
}

.word-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .by {
    font-size: 13px;
    color: $color-light;
    position: relative;
    top: 5px;
  }
}


/* scrollbar styles */
::-webkit-scrollbar {
    width: 4px;
    height: 8px;
}

::-webkit-scrollbar-button:start,
::-webkit-scrollbar-button:end {
    display: none;
}

::-webkit-scrollbar-track-piece {
    -webkit-border-radius: 0;
    background-color: rgba(0, 0, 0, 0);
}

::-webkit-scrollbar-thumb {
    width: 50px;

    -webkit-border-radius: 8px;
    outline: 1px solid #ccc;
    background-color: rgba(0, 0, 0, 0.3);
}

::-webkit-scrollbar-thumb:hover {
    background-color: #999999;
}
</style>