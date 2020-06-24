<template>
  <div class="popup-lookup">
    <div class="top-row" v-loading="assit.saving">
      <el-row @dblclick.self="handleSaveClick">
        <el-col :span="4">
          <el-select v-model="from" filterable>
            <el-option v-for="(item, index) in codeList" :key="index" :label="item" :value="item"></el-option>
          </el-select>
        </el-col>
        <el-col :span="1">&nbsp;</el-col>
        <el-col :span="4">
          <el-select v-model="to" filterable>
            <el-option v-for="(item, index) in codeList" :key="index" :label="item" :value="item"></el-option>
          </el-select>
        </el-col>
        <el-col :span="2" :offset="1">
          <div style="margin-top: 7px;" class="saveCard" @click="handleSaveClick">
            <i v-if="saved" class="el-icon-star-on"></i>
            <i v-else class="el-icon-star-off"></i>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="sentence-wrap">
      <div>{{text}}</div>
    </div>
    <div class="two-cols" v-loading="assit.translating">
      <div class="col context right-col" language="zhs">
        <div class="text-hold">
          <div class="text scroll-area" id="surroundings">
            <p
              v-show="!assit.transEditable"
              class="translated-container"
              @dblclick="toggleEdit"
              language="zhs"
            >{{ trans }}</p>
            <textarea
              v-show="assit.transEditable"
              v-model="trans"
              class="sent-translated"
              cols="30"
              rows="3"
            ></textarea>
          </div>
          <div class="actions">
            <a v-show="!assit.transEditable" class="edit-btn" @click="toggleEdit">edit</a>
            <a v-show="!assit.transEditable" class="tran-btn" @click="translate">
              <i class="el-icon-view" style="color: #49baea;"></i>
            </a>
            <a v-show="assit.transEditable" class="confirm-btn" @click="saveSentenceTrans">
              <i class="el-icon-check" style="color: #49baea;"></i>
            </a>
            <a v-show="assit.transEditable" class="reject-btn" @click="toggleEdit">
              <i class="el-icon-close" style="color: #ccc;"></i>
            </a>
          </div>
        </div>
        <div class="col-footer">
          <span class="by">Translation by {{ engine }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { codeList } from "@/js/constant/code";
import { getSentenceDefaultAssit } from "./sentence.config";
import Translate from "@/js/translate";
import * as sentenceController from "@/server/controller/sentenceController";

export default {
  name: "sentence",

  props: ["meta"],

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
    saved() {
      return this.id != 0;
    }
  },

  watch: {
    meta() {
      const { word: text, from, to, engine, source } = this.meta;
      this.text = text;
      this.from = from;
      this.to = to;
      this.engine = engine;
      this.source = source;
      this.translate()
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

    handleSaveClick() {
      this.assit.saving = true;
      sentenceController
        .save({
          tags: [],
          trans: this.trans,
          text: this.text,
          from: this.from,
          to: this.to,
          source: this.source
        })
        .then(resp => {
          this.id = resp;
          this.assit.saving = false;
          this.$message.success(this.$i18n('save_ok'));
        });
    }
  },

  mounted() {
    this.translate();
  }
};
</script>

<style lang="scss" scoped>
.two-cols {
  margin-top: 10px;
}

.scroll-area {
  height: 240px;
}

.translated-container {
  height: 100%;
}

.sentence-wrap {
  height: 150px;
  overflow: auto;
}
</style>