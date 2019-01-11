
import Vue from 'vue'
import browser from 'webextension-polyfill'
import './newtab.scss'
import ElementUI from 'element-ui'
import _ from 'underscore'
import 'element-ui/lib/theme-default/index.css'
import { WORD_LEVEL } from '../../js/constant/options'
import { getRandomOne } from '../../js/common/utils'
import Translate from '../../js/translate'
Vue.use(ElementUI)

function init() {
    render();
}

const reciteStages = [
    'sentence',
    'trans'
];

function render() {
    const app = new Vue({
        el: '#app',
        data() {
            return {
                schemedWords: [],
                theWord: null,
                curWordState: {
                    id: '',
                    name: '',
                    level: 0,
                    trans: [],
                    sentence: ''
                },
                reciteResult: {
                    right: 0,
                    wrong: 0
                },
                reciteStage: 0
            }
        },

        computed: {
            isFinalStep() {
                return this.reciteStage === (reciteStages.length - 1);
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
                    chrome.runtime.sendMessage({
                        action: 'get'
                    }, ({ data }) => {
                        if (data) {
                            this.schemedWords = data;

                            resolve(data);
                        } else {
                            resolve([]);
                        }
                    });
                });
            },

            // recite
            beginRecite() {
                if (this.schemedWords.length) {
                    this.wordrecitevisible = true;
                    this.reciteWord();
                } else {
                    this.$message({
                        message: i18n.msg.wordsChoosedNothing,
                        type: 'warning'
                    });
                }
            },

            reciteWord() {
                const stage = this.reciteStage;

                if (stage === 0) {
                    this.theword = getRandomOne(this.schemedWords)
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

                    return sentence.split(' ').map(item => {
                        if (item.toLowerCase().indexOf(theword) !== -1) {
                            return `<em>${item}</em>`;
                        } else {
                            return item;
                        }
                    }).join(' ');
                } else {
                    return sentence;
                }
            },

            goNextStep() {
                let nextStage = this.reciteStage + 1;
                
                if (nextStage > (reciteStages.length - 1)) {
                    this.reciteStage = 0;

                    this.curWordState = {
                        id: '',
                        name: '',
                        level: 0,
                        trans: [],
                        sentence: ''
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
                    nextLevel = WORD_LEVEL.DONE
                } else if (nextLevel < WORD_LEVEL.ZERO) {
                    nextLevel = WORD_LEVEL.ZERO;
                }

                word.level = nextLevel;
                this.theword.level = nextLevel;

                chrome.runtime.sendMessage({
                    action: 'update',
                    data: JSON.parse(JSON.stringify(word))
                }, () => {
                    this.goNextStep();
                });
            },
        }
    });
}

init();