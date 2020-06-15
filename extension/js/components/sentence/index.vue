<template>
  <div class="lookup-sentence">
    <div class="top-row">
      <a-select class="lang-from" v-model="meta.from" filterable :dropdownMatchSelectWidth="false">
        <a-select-option v-for="(item, index) in codeList" :key="index" :value="item">{{ item }}</a-select-option>
      </a-select>
      <a-icon type="swap-right" class="lang-split" />
      <a-select class="lang-to" v-model="meta.to" filterable :dropdownMatchSelectWidth="false">
        <a-select-option v-for="(item, index) in codeList" :key="index" :value="item">{{ item }}</a-select-option>
      </a-select>
      <div class="sentence-save" @click="handleSaveClick">
        <a-icon v-if="assit.saved" type="star" theme="filled" style="font-size: 16px;" />
        <a-icon v-else type="star" style="font-size: 16px;" />
      </div>
      <a-icon type="close" class="close" />
    </div>
    <div class="sentence-text">
      <div>{{text}}</div>
    </div>
    <div class="sentence-trans">
      <div class="text-hold">
        <div class="trans-wrap scroll-area" id="surroundings">
          <p
            v-show="!assit.transEditable"
            class="translated-container"
            @dblclick="toggleEdit"
            language="zhs"
          >{{ trans }}</p>
          <a-textarea
            v-show="assit.transEditable"
            v-model="trans"
            class="sent-translated"
            cols="30"
            rows="3"
          ></a-textarea>
        </div>
        <div class="actions">
          <a-icon type="edit" v-show="!assit.transEditable" class="edit-btn" @click="toggleEdit"/>
          <a-icon v-show="!assit.transEditable" type="read" class="tran-btn" @click="translate" />
          <a-icon type="check" v-show="assit.transEditable" class="confirm-btn" @click="saveSentenceTrans"/>
          <a-icon type="close" v-show="assit.transEditable" class="reject-btn" @click="toggleEdit"/>
        </div>
      </div>
    </div>
    <div class="sentence-footer">
      <span class="by">Translation by {{ meta.engine }}</span>
    </div>
  </div>
</template>

<script>
import { codeList } from "@/js/constant/code";
import { getSentenceDefaultAssit } from "./sentence.config";
import Translate from "@/js/translate";
import * as sentenceController from "@/server/controller/sentenceController";
import { sentenceService } from '@/services/sentence.service'
import { mapGetters } from 'vuex'

export default {
  name: "sentence",

  props: ["meta", "i18n"],

  data() {
    const { word: text, from, to, engine, source } = this.meta;

    return {
      id: 0,
      codeList,
      assit: getSentenceDefaultAssit(),
      text,
      from,
      engine,
      source,
      to,
      trans: ""
    };
  },

  computed: {
    ...mapGetters('account', ['loggedIn']),
  },

  watch: {
    meta() {
      const { word: text, from, to, engine, source } = this.meta;
      this.text = text;
      this.from = from;
      this.to = to;
      this.engine = engine;
      this.source = source;
    },
    text() {
      this.reset();
    }
  },

  methods: {
    reset() {
      this.id = 0;
      this.trans = "";
      this.assit = getSentenceDefaultAssit();
    },
    toggleEdit() {
      this.assit.transEditable = !this.assit.transEditable;
    },

    saveSentenceTrans() {
      this.assit.transEditable = false;
    },

    translate() {
      this.assit.translating = true;
      this.getTranslate().then(results => {
        this.assit.translating = false;
        this.assit.translate = results;
        this.trans = (results.trans || []).join("");
      });
    },

    getTranslate() {
      return Translate.translate(this.text, this.engine, this.from, this.to);
    },

    getAttrs() {
      return {
        tags: [],
        trans: this.trans,
        text: this.text,
        from_lang: this.from,
        to_lang: this.to,
        platform: 'Chrome',
        source: this.source
      }
    },

    save() {
      const attrs = this.getAttrs()

      sentenceService.create(attrs).then(() => {
        this.$message.success(this.$i18n('add_ok'))
        this.assit.saved = true;
        this.assit.saving = false;
      }).catch(() => {
        this.$message.error(this.$i18n('add_failed'))
        this.assit.saving = false;
      })
    },

    update(sentence) {
      const attrs = this.getAttrs()

      sentenceService.upateExisted(sentence, attrs).then(() => {
        this.$message.success(this.$i18n('save_ok'))
        this.assit.saved = true;
        this.assit.saving = false;
      }).catch(() => {
        this.$message.error(this.$i18n('save_failed'))
        this.assit.saving = false;
      })
    },

    saveIfNeeded() {
      const vm = this;

      this.assit.saving = true;
      sentenceService.isExisted(this.text).then(resp => {
        if (resp.isExisted) {
          this.$confirm({
            title: this.$i18n('sentence_saved'),
            content: this.$i18n('confirmto_overwrite'),
            onOk() {
              vm.update(resp.item)
            },
            onCancel() {
              vm.assit.saving = false;
            }
          })
        } else {
          this.save()
        }
      })
    },

    handleSaveClick() {
      if (this.loggedIn) {
        if (!this.assit.saving) {
          this.saveIfNeeded();
        }
      } else {
        this.$message.warning(this.$i18n('login_first'))
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../../styles/scss/theme.scss";
@import "../../../scss/mixins.scss";

.lookup-sentence {
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

.sentence-save {
  cursor: pointer;
}

ul,
li {
  margin: 0;
  padding: 0;
}

.sentence-text {
  margin-top: 12px;
  font-size: 15px;
  height: 170px;
  overflow: auto;
}

.sentence-trans {
  margin-top: 12px;
}

.text-hold {
  display: flex;
}

.trans-wrap {
  flex: 1;
  height: 93px;
  overflow: auto;
  padding: 2px;
  border: 1px solid #d9d9d9;
  border-collapse: all;
}

.actions {
  width: 23px;
  height: 93px;
  text-align: center;
  border: 1px solid #d9d9d9;
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

.sentence-footer {
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