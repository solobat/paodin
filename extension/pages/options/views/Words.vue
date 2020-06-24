<template>
  <div class="view-container words-container">
    <div class="word-filter filter-panel">
      <div class="filter-item">
        <div class="field-label">{{$i18n("options_words_search")}}</div>
        <el-input placeholder="Search" icon="search" v-model="filter.wordSearchText"></el-input>
      </div>
      <div class="filter-item">
        <div class="field-label">
          <span class="label-text">{{$i18n("options_words_vocabulary")}}</span>
          <el-button type="primary" size="mini" @click="filter.langPair = ''">{{$i18n("options_words_reset")}}</el-button>
        </div>
        <div class="filter-tags">
          <el-select v-model="filter.langPair" :placeholder="$i18n('options_base_choose')">
            <el-option v-for="(item, index) in langPairs" :key="index" :label="item" :value="item"></el-option>
          </el-select>
        </div>
      </div>
      <div class="filter-item">
        <div class="field-label">
          <span class="label-text">{{$i18n("options_words_level")}}</span>
          <el-button type="primary" size="mini" @click="filter.levels = []">{{$i18n("options_words_reset")}}</el-button>
        </div>
        <div class="filter-tags">
          <el-tag
            style="margin-right: 10px;"
            v-for="level in [0, 1, 2, 3, 4, 5]"
            :type="filter.levels.indexOf(level) !== -1 ? 'danger' : 'grey'"
            :key="level"
            @click.native="handleLevelFilterClick(level)"
          >{{level}}</el-tag>
        </div>
      </div>
      <div class="filter-item filter-item-tags">
        <div class="field-label">
          <span class="label-text">{{$i18n("options_words_tag")}}</span>
          <el-button type="primary" size="mini" @click="filter.tags = []">{{$i18n("options_words_reset")}}</el-button>
        </div>
        <div class="filter-tags">
          <el-tag
            style="margin-right: 10px;margin-bottom: 5px;"
            v-for="(tag, index) in tags"
            :key="index"
            :type="filter.tags.indexOf(tag) !== -1 ? 'danger' : 'grey'"
            @click.native="handleTagFilterClick(tag)"
          >{{tag}}</el-tag>
        </div>
      </div>
      <div class="other-info">
        <div class="word-nums">{{ i18n.words.count(filteredWords.length, words.length) }}</div>
        <div class="batch-delete-btn" @click="handleBatchDeleteClick">{{$i18n("options_words_batchdelete")}}</div>
      </div>
    </div>
    <div class="word-list-container">
      <div class="word-list">
        <div
          class="word-item"
          v-for="(word, index) in filteredWords"
          :key="index"
          @click="handleWordClick(word)"
        >
          <div class="word-name">{{word.name}}</div>
          <div class="word-trans">{{ (word.trans || []).join(',') }}</div>
          <div class="word-tags">
            <el-tag
              style="margin-right: 5px;"
              type="success"
              v-for="(tag, index) in word.tags"
              :key="index"
            >{{tag}}</el-tag>
          </div>
          <div class="word-icons">
            <el-tooltip
              v-if="i18n.lang === 'zh-CN'"
              effect="dark"
              content="查看单词的词根词缀"
              placement="top-start"
            >
              <i class="word-icon icon-root" @click.stop="handleRootClick(word)"></i>
            </el-tooltip>
            <el-tooltip
              effect="dark"
              content="View the source location of the word"
              placement="top-start"
            >
              <i
                class="word-icon icon-link"
                @click.stop="handleWordLinkClick(word.link)"
                v-if="word.link"
              ></i>
            </el-tooltip>
            <el-tooltip
              v-if="i18n.lang === 'zh-CN'"
              effect="dark"
              content="已同步，点击重置"
              placement="top-start"
            >
              <i
                class="word-icon icon-synced"
                @click.stop="handleSyncedClick(word)"
                v-if="word.synced"
              ></i>
            </el-tooltip>
          </div>
        </div>
      </div>
      <el-collapse-transition>
        <div class="word-editor" v-show="wordEditorVisible" @keyup.esc="handleEditorCancelClick">
          <el-row>
            <el-col :span="20">
              <el-form
                ref="wordForm"
                :rules="wordRules"
                :model="wordForm"
                label-width="80px"
                @submit.prevent="onWordFormSubmit"
              >
                <el-form-item :label="$i18n('options_item_word') + ':'" prop="name">
                  <el-input type="text" v-model="wordForm.name"></el-input>
                </el-form-item>
                <el-form-item :label="$i18n('options_item_translate') + ':'" prop="trans">
                  <el-input type="text" v-model="wordForm.trans"></el-input>
                </el-form-item>
                <el-form-item :label="$i18n('options_item_tag') + ':'">
                  <el-tag
                    style="margin-right: 5px;"
                    :key="tag"
                    v-for="tag in wordForm.tags"
                    :closable="true"
                    :close-transition="false"
                    @close="handleTagClose(tag)"
                  >{{tag}}</el-tag>
                  <el-autocomplete
                    class="inline-input"
                    v-if="tagInputVisible"
                    v-model="tagInputValue"
                    :fetch-suggestions="tagsQuerySearch"
                    ref="saveTagInput"
                    :trigger-on-focus="false"
                    @select="handleTagSelect"
                    @keyup.enter.native="handleTagInputConfirm"
                    @blur="handleTagInputConfirm"
                  ></el-autocomplete>
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showTagInput"
                  >+ New Tag</el-button>
                </el-form-item>
                <el-form-item :label="$i18n('options_item_sentence') + ':'">
                  <el-input type="textarea" :rows="3" v-model="wordForm.sentence"></el-input>
                </el-form-item>
                <div class="form-btns">
                  <el-button size="small" @click="handleEditorCancelClick">{{$i18n("options_base_cancel")}}</el-button>
                  <el-button size="small" @click="handleEditorDeleteClick">{{$i18n("options_base_delete")}}</el-button>
                </div>
              </el-form>
            </el-col>
            <el-col :span="4">
              <div class="form-aside">
                <div class="form-aside-fields">
                  <div class="el-form-item__label">{{$i18n("options_words_level")}} :</div>
                  <el-select v-model="wordForm.level" :placeholder="$i18n('options_base_choose')" size="small">
                    <el-option
                      v-for="item in levels"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </div>
                <div class="form-aside-btns">
                  <el-button
                    type="primary"
                    size="small"
                    @click.native.prevent="handleEditorSubmit"
                  >{{$i18n("options_base_save")}}</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script>
import * as Validator from "@/js/common/validatorHelper";
import { syncMixin } from "@/js/helper/syncData";
import WordsMixin from "@/js/mixins/words.mixin";

const levels = [0, 1, 2, 3, 4, 5].map(level => {
  return {
    label: level,
    value: level
  };
});

export default {
  props: ["i18n", "config"],

  mixins: [syncMixin, WordsMixin],

  data() {
    return {
      filter: {
        wordSearchText: "",
        levels: [],
        tags: [],
        langPair: ""
      },
      tagInputVisible: false,
      tagInputValue: "",
      levels,
      wordEditorVisible: false,
      wordForm: {
        name: "",
        trans: "",
        sentence: "",
        tags: [],
        level: 0
      },
      wordRules: {
        name: Validator.text(this.$i18n('options_item_word')),
        trans: Validator.text(this.$i18n('options_item_translate'))
      }
    };
  },

  computed: {
    filteredWords() {
      let filter = this.filter;

      return this.filterWords(filter, "list");
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
            this.$message(this.$i18n('options_msg_saveok'));
          }
        });
    },

    resetFilter() {
      this.filter = {
        wordSearchText: "",
        levels: [],
        tags: []
      };
    },

    batchDelete() {
      const ids = this.filteredWords.map(word => word.id);

      chrome.runtime.sendMessage(
        {
          action: "batchDelete",
          data: { ids }
        },
        () => {
          this.$message(this.i18n.msg.batchDeleteOk);
          this.resetFilter();
          this.loadWords();
        }
      );
    },

    handleBatchDeleteClick() {
      const words = this.filteredWords;

      if (words.length) {
        this.$confirm(this.$i18n('options_msg_deletewords_confirm'), this.$i18n('options_item_tips'))
          .then(() => {
            this.batchDelete();
          })
          .catch(() => {
            console.log("cancel");
          });
      } else {
        this.$message.warning(this.$i18n('options_msg_nowords_todelete'));
      }
    },

    handleWordClick(word) {
      this.wordEditorVisible = true;
      this.wordForm = {
        id: word.id,
        name: word.name,
        trans: (word.trans || []).join(","),
        sentence: word.sentence,
        tags: word.tags,
        level: word.level
      };
    },

    handleRootClick(word) {
      chrome.tabs.create({
        url: `http://www.cgdict.com/index.php?app=cigen&ac=word&w=${word.name}`
      });
    },

    handleWordLinkClick(link) {
      chrome.tabs.create({
        url: link
      });
    },

    handleSyncedClick(word) {
      word.synced = false;
      this.saveWord(word);
    },

    handleEditorCancelClick() {
      this.wordEditorVisible = false;
    },

    handleEditorDeleteClick() {
      chrome.runtime.sendMessage(
        {
          action: "remove",
          data: { id: this.wordForm.id }
        },
        () => {
          this.$message(this.$i18n('options_msg_delete_ok'));
          this.resetWordEditor();
        }
      );
    },

    onWordFormSubmit() {},

    handleTagClose(tag) {
      this.wordForm.tags.splice(this.wordForm.tags.indexOf(tag), 1);
    },

    createFilter(queryString) {
      return item => {
        return (
          item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },

    tagsQuerySearch(queryString, cb) {
      let allTags = this.allTags;
      let results = queryString
        ? allTags.filter(this.createFilter(queryString))
        : allTags;

      cb(results);
    },

    handleTagSelect() {
      this.handleTagInputConfirm();
    },

    handleTagInputConfirm() {
      let tagInputValue = this.tagInputValue;
      if (tagInputValue && this.wordForm.tags.indexOf(tagInputValue) === -1) {
        this.wordForm.tags.push(tagInputValue);
      }
      this.tagInputVisible = false;
      this.tagInputValue = "";
    },

    showTagInput() {
      this.tagInputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.$refs.input.focus();
      });
    },

    handleEditorSubmit() {
      this.$refs.wordForm.validate(valid => {
        if (!valid) {
          this.$message.error(this.$i18n('options_msg_form_error'));
          return;
        }

        let { id, name, trans, sentence, tags, level } = this.wordForm;

        let word = {
          id,
          name,
          trans: trans.split(","),
          sentence,
          tags,
          level
        };

        this.saveWord(word).then(resp => {
          this.resetWordEditor();
        });
      });
    },

    saveWord(word) {
      if (word && word.name) {
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            {
              action: "update",
              data: JSON.parse(JSON.stringify(word))
            },
            resp => {
              resolve(resp);
            }
          );
        });
      } else {
        return Promise.reject(null);
      }
    },

    resetWordForm() {
      this.wordForm = {
        name: "",
        trans: "",
        sentence: "",
        tags: [],
        level: 0
      };
    },

    resetWordEditor() {
      this.loadWords();
      this.wordEditorVisible = false;
      this.resetWordForm();
    }
  }
};
</script>

<style lang="scss">
.words-container {
  display: flex;
}
</style>