<template>
  <div class="wordcard" v-cloak>
    <section class="wordrecite-ground card-size-normal">
      <div class="word-card-wrap">
        <el-card class="word-card">
          <div class="word-fields">
            <div class="word-card-name word-field">{{curWordState.name}}</div>
            <div class="word-card-trans word-field">
              <span
                v-if="curWordState.trans && curWordState.trans.length"
              >{{(curWordState.trans || []).join(',')}}</span>
              <span v-else class="msg-box clickable" @click="goNextStep">......</span>
            </div>
            <div
              class="word-card-sentence word-field"
              v-html="highlightWord(curWordState.sentence, curWordState.name)"
            ></div>
          </div>
          <div class="word-otherinfo">
            <div class="word-level">
              <img :src="`/img/level${curWordState.level || 0}.png`" alt />
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
  </div>
</template>

<script>
import browser from 'webextension-polyfill'
import _ from 'underscore'
import { WORD_LEVEL } from '@/js/constant/options'
import { getRandomOne } from '@/js/common/utils'
import Translate from '@/js/translate'

const reciteStages = [
    'sentence',
    'trans'
];

export default {
  data() {
    return {
      schemedWords: [],
      theWord: null,
      curWordState: {
        id: "",
        name: "",
        level: 0,
        trans: [],
        sentence: ""
      },
      reciteResult: {
        right: 0,
        wrong: 0
      },
      reciteStage: 0
    };
  },

  computed: {
    isFinalStep() {
      return this.reciteStage === reciteStages.length - 1;
    }
  },

  mounted() {
    this.loadWords().then(() => {
      this.beginRecite();
    });
  },

  methods: {
    loadWords() {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            action: "get"
          },
          ({ data }) => {
            if (data) {
              this.schemedWords = data;

              resolve(data);
            } else {
              resolve([]);
            }
          }
        );
      });
    },

    // recite
    beginRecite() {
      if (this.schemedWords.length) {
        this.wordrecitevisible = true;
        this.reciteWord();
      } else {
        this.$message({
          message: this.$i18n('options_msg_wordschoosed_nothing'),
          type: "warning"
        });
      }
    },

    reciteWord() {
      const stage = this.reciteStage;

      if (stage === 0) {
        this.theword = getRandomOne(this.schemedWords);
      }
      const word = this.theword;
      const curWordState = this.curWordState;
      const stageName = reciteStages[stage];

      if (stage === 0) {
        curWordState.id = word.id;
        curWordState.level = word.level;
        curWordState.name = word.name;
      }

      curWordState[stageName] = word[stageName];
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

        this.curWordState = {
          id: "",
          name: "",
          level: 0,
          trans: [],
          sentence: ""
        };
      } else {
        this.reciteStage = nextStage;
      }

      this.reciteWord();
    },

    playVoice() {
      Translate.playAudio(this.curWordState.name);
    },

    wordRecited(gotit) {
      let word = this.curWordState;
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
      this.theword.level = nextLevel;

      chrome.runtime.sendMessage(
        {
          action: "update",
          data: JSON.parse(JSON.stringify(word))
        },
        () => {
          this.goNextStep();
        }
      );
    }
  }
};
</script>

<style lang="scss">
[v-cloak] {
  display: none;
}

body,
p,
div,
ul,
li {
  margin: 0;
  padding: 0;
}

body {
  position: fixed;
  top: 0;
  left: 0;
  background: #f0f0f0;
  width: 100vw;
  height: 100vh;
}

img {
  vertical-align: top;
}

a {
  text-decoration: none;
}

.clickable {
  cursor: pointer;
}

.msg-box {
  color: #999;
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
    text-align: left;
    font-size: 16px;
    font-weight: 700;
    line-height: 2;
    flex: 1;
  }

  .word-card-trans {
    text-align: left;
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
    transition: all 200ms ease-in;
    opacity: 0.5;

    &:hover {
      opacity: 1;
    }

    img {
      display: block;
      margin: 0 auto 5px;
      width: 45px;
      height: 45px;
      cursor: pointer;
      opacity: 0.5;

      &:first-child {
        margin-top: 156px;
      }

      &:hover {
        opacity: 1;
      }
    }
  }

  .word-otherinfo {
    display: flex;
    justify-content: space-between;

    img {
      width: 30px;
      height: 30px;
      opacity: 0.5;

      &:hover {
        opacity: 1;
      }
    }

    .voice-btn {
      cursor: pointer;
    }
  }

  &.card-size-normal {
    .word-card-name {
      font-size: 26px;
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
      font-size: 28px;
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
      font-size: 30px;
    }

    .word-card-trans {
      font-size: 18px;
    }

    .word-card-sentence {
      font-size: 18px;
    }
  }
}
</style>