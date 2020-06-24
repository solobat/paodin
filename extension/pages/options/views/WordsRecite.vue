<template>
  <div>
    <section class="scheme-filter" v-if="!wordrecitevisible && !allRecited">
      <header>
        <h2>{{$i18n("options_wordsrecite_title")}}</h2>
      </header>
      <div class="filter-items">
        <div class="filter-results">{{ i18n.words.count(schemedWords.length, words.length) }}</div>
        <div class="filter-item">
          <div class="field-label">
            <span class="label-text">{{$i18n("options_words_vocabulary")}}</span>
          </div>
          <div class="filter-tags">
            <el-select v-model="reciteFilter.langPair" clearable :placeholder="$i18n('options_base_choose')">
              <el-option
                v-for="(item, index) in langPairs"
                :key="index"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
          </div>
        </div>
        <div class="filter-item">
          <div class="field-label">
            <span class="label-text">{{$i18n("options_words_level")}}</span>
          </div>
          <div class="filter-tags">
            <el-tag
              style="margin-right: 10px;"
              v-for="level in [0, 1, 2, 3, 4, 5]"
              :type="reciteFilter.levels.indexOf(level) !== -1 ? 'danger' : 'grey'"
              :key="level"
              @click.native="handleLevelFilterClick(level, 'recite')"
            >{{level}}</el-tag>
          </div>
        </div>
        <div class="filter-item">
          <div class="field-label">
            <span class="label-text">{{$i18n("options_words_tag")}}</span>
          </div>
          <div class="filter-tags">
            <el-tag
              style="margin-right: 10px;margin-bottom: 5px;"
              v-for="(tag, index) in tags"
              :key="index"
              :type="reciteFilter.tags.indexOf(tag) !== -1 ? 'danger' : 'grey'"
              @click.native="handleTagFilterClick(tag, 'recite')"
            >{{tag}}</el-tag>
          </div>
        </div>
      </div>
      <footer>
        <div class="action-btns">
          <el-button size="small" @click="beginRecite">{{$i18n("options_wordsrecite_submit")}}</el-button>
        </div>
      </footer>
    </section>
    <section
      class="wordrecite-ground"
      :class="[`card-size-${config.cardFontSize}`]"
      v-if="wordrecitevisible && !allRecited"
    >
      <div class="word-card-wrap">
        <el-card class="word-card">
          <div class="word-fields">
            <div class="word-card-name word-field">{{curRecitedWord.name}}</div>
            <div class="word-card-trans word-field">{{(curRecitedWord.trans || []).join(',')}}</div>
            <div
              class="word-card-sentence word-field"
              v-html="highlightWord(curRecitedWord.sentence, curRecitedWord.name)"
            ></div>
          </div>
          <div class="word-otherinfo">
            <div class="word-level">
              <img :src="`/img/level${curRecitedWord.level || 0}.png`" alt />
            </div>
            <div class="play-voice">
              <img class="voice-btn" src="/img/wordvoice.png" alt @click="playVoice" />
            </div>
          </div>
        </el-card>
        <div class="word-card-actions">
          <img src="/img/nextstep.png" alt v-if="!isFinalStep" @click="goNextStep" />
          <template v-else>
            <img src="/img/gotit.png" alt @click="wordRecited(true)" />
            <img src="/img/wrong.png" alt @click="wordRecited(false)" />
          </template>
        </div>
      </div>
    </section>
    <section class="recite-results" v-if="allRecited">
      <header>
        <h2>{{$i18n("options_wordsrecite_result")}}</h2>
      </header>
      <div>
        <pie style="width: 300px;height: 200px; margin: 0 auto" :chart-data="reciteResultData"></pie>
      </div>
      <footer>
        <div class="action-btns">
          <el-button size="small" @click="beginNewReciteFilter">{{$i18n("options_wordsrecite_newquiz")}}</el-button>
        </div>
      </footer>
    </section>
  </div>
</template>

<script>
import { syncMixin } from "@/js/helper/syncData";
import { WORD_LEVEL, CARD_FONTSIZE_OPTIONS } from "@/js/constant/options";
import Pie from "@/js/components/pieChart";
import Translate from "@/js/translate";
import WordsMixin from "@/js/mixins/words.mixin";

const reciteStages = ["name", "sentence", "trans"];

export default {
  props: ["i18n", "config"],

  mixins: [syncMixin, WordsMixin],

  components: {
    Pie
  },

  data() {
    return {
      wordrecitevisible: false,
      reciteFilter: {
        levels: [],
        tags: [],
        langPair: ""
      },
      reciteStage: 0,
      recitedWordIndex: 0,
      allRecited: false,
      curRecitedWord: {
        id: "",
        name: "",
        level: 0,
        trans: [],
        sentence: ""
      },
      reciteResult: {
        right: 0,
        wrong: 0
      }
    };
  },

  computed: {
    schemedWords() {
      let filter = this.reciteFilter;

      return this.filterWords(filter, "recite");
    },
    isFinalStep() {
      return this.reciteStage === reciteStages.length - 1;
    },
    reciteResultData() {
      let { right, wrong } = this.reciteResult;

      return {
        labels: [this.$i18n('options_item_right'), this.$i18n('options_item_wrong')],
        datasets: [
          {
            backgroundColor: ["#1ebe8d", "#e80d39"],
            data: [right, wrong]
          }
        ]
      };
    }
  },

  methods: {
    beginRecite() {
      if (this.schemedWords.length) {
        this.wordrecitevisible = true;
        this.recitedWordIndex = 0;
        this.reciteWord();
      } else {
        this.$message({
          message: this.$i18n('options_msg_wordschoosed_nothing'),
          type: "warning"
        });
      }
    },

    reciteWord() {
      let stage = this.reciteStage;
      let word = this.schemedWords[this.recitedWordIndex];
      let curRecitedWord = this.curRecitedWord;
      let stageName = reciteStages[stage];

      if (stage === 0) {
        curRecitedWord.id = word.id;
        curRecitedWord.level = word.level;
      }

      curRecitedWord[stageName] = word[stageName];
    },

    highlightWord(sentence, word) {
      if (sentence && word) {
        let theword = word.toLowerCase();

        return sentence
          .split(" ")
          .map(item => {
            if (item.toLowerCase().indexOf(theword) !== -1) {
              return `<em>${item}</em>`;
            } else {
              return item;
            }
          })
          .join(" ");
      } else {
        return sentence;
      }
    },

    goNextStep() {
      let nextStage = this.reciteStage + 1;

      if (nextStage > reciteStages.length - 1) {
        this.reciteStage = 0;

        let nextWordIndex = this.recitedWordIndex + 1;

        if (nextWordIndex > this.schemedWords.length - 1) {
          this.allRecited = true;
        } else {
          this.curRecitedWord = {
            id: "",
            name: "",
            level: 0,
            trans: [],
            sentence: ""
          };
          this.recitedWordIndex = this.recitedWordIndex + 1;
        }
      } else {
        this.reciteStage = nextStage;
      }

      if (!this.allRecited) {
        this.reciteWord();
      }
    },

    playVoice() {
      Translate.playAudio(this.curRecitedWord.name);
    },

    wordRecited(gotit) {
      let word = this.curRecitedWord;
      let level = word.level || 0;
      let nextLevel;

      if (gotit) {
        nextLevel = level + 1;
        this.reciteResult.right = this.reciteResult.right + 1;
      } else {
        nextLevel = level - 1;
        this.reciteResult.wrong = this.reciteResult.wrong + 1;
      }

      if (nextLevel > WORD_LEVEL.DONE) {
        nextLevel = WORD_LEVEL.DONE;
      } else if (nextLevel < WORD_LEVEL.ZERO) {
        nextLevel = WORD_LEVEL.ZERO;
      }

      word.level = nextLevel;

      chrome.runtime.sendMessage(
        {
          action: "update",
          data: JSON.parse(JSON.stringify(word))
        },
        () => {
          this.goNextStep();
        }
      );
    },

    beginNewReciteFilter() {
      this.allRecited = false;
      this.wordrecitevisible = false;
      this.curRecitedWord = {
        id: "",
        name: "",
        level: 0,
        trans: [],
        sentence: ""
      };
      this.reciteFilter = {
        levels: [],
        tags: []
      };
      this.reciteResult = {
        right: 0,
        wrong: 0
      };
    }
  }
};
</script>

<style>
</style>