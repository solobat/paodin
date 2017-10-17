/**
 * @file options
 * @author solopea@gmail.com
 */

import Vue from 'vue'
import ElementUI from 'element-ui'
import _ from 'underscore'
import 'element-ui/lib/theme-default/index.css'
import './options.scss'
import ga from '../../js/common/ga'
import changelog from '../../js/info/changelog'
import browser from 'webextension-polyfill'
import { getSyncConfig } from '../../js/common/config'
import { WORD_LEVEL } from '../../js/constant/options'
import * as Validator from '../../js/common/validatorHelper'
import Pie from '../../js/components/pieChart'
import Translate from '../../js/translate'
import { getParameterByName } from '../../js/common/utils'
import wordRoots from '../../js/constant/wordroots'

const chrome = window.chrome;
const bg = chrome.extension.getBackgroundPage();
const manifest = chrome.runtime.getManifest();
const version = manifest.version;
const appName = 'wordcard';
const storeId = 'oegblnjiajbfeegijlnblepdodmnddbk';

Vue.use(ElementUI)

function init() {
    getSyncConfig().then(config => {
        console.log(config);
        let i18nTexts = getI18nTexts();
        
        ga();
        render(config, i18nTexts);
    });
}

function getI18nTexts(obj) {
    let texts = {};

    try {
        for (let cate in obj) {
            let subobj = texts[cate] = {};

            for (var key in obj[cate]) {
                subobj[key] = chrome.i18n.getMessage(`${cate}_${key}`);
            }
        }
    } catch (e) {
        console.log(e);
    }

    return texts;
}

const levels = [0, 1, 2, 3, 4, 5].map(level => {
    return {
        label: level,
        value: level
    }
});
const filterKeyMap = {
    list: 'filter',
    recite: 'reciteFilter'
};
const reciteStages = [
    'name',
    'sentence',
    'trans'
];

function render(config, i18nTexts) {
    let activeName = getParameterByName('tab') || 'general';
    
    if (config.version < version) {
        config.version = version;
        activeName = 'update';
    }

    new Vue({
        el: '#app',
        data: function() {
            return {
                // tab
                activeName,
                // base info
                changelog,
                appName,
                storeId,
                config,
                i18nTexts,
                // list
                words: [],
                filter: {
                    wordSearchText: '',
                    levels: [],
                    tags: []
                },
                tags: [],
                allTags: [],
                tagInputVisible: false,
                tagInputValue: '',
                levels,
                wordEditorVisible: false,
                wordForm: {
                    name: '',
                    trans: '',
                    sentence: '',
                    tags: [],
                    level: 0
                },
                wordRules: {
                    name: Validator.text('单词'),
                    trans: Validator.text('翻译')
                },
                // recite
                wordrecitevisible: false,
                reciteFilter: {
                    levels: [],
                    tags: []
                },
                reciteStage: 0,
                recitedWordIndex: 0,
                allRecited: false,
                curRecitedWord: {
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
                // roots
                rootsFilter: {
                    searchText: 'a'
                },
                wordRoots
            }
        },

        components: {
            Pie
        },

        computed: {
            filteredWords() {
                let filter = this.filter;

                return this.filterWords(filter, 'list');
            },
            filteredRoots() {
                let { searchText } = this.rootsFilter;

                let results = this.wordRoots;
                
                if (searchText) {
                    results = results.filter(({ root }) => {
                        return root.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
                    });
                }

                return results;
            },
            schemedWords() {
                let filter = this.reciteFilter;

                return this.filterWords(filter, 'recite');
            },
            isFinalStep() {
                return this.reciteStage === (reciteStages.length - 1);
            },
            reciteResultData() {
                let { right, wrong } = this.reciteResult;

                return {
                    labels: ['正确', '错误'],
                    datasets: [
                        {
                            backgroundColor: ['#1ebe8d', '#e80d39'],
                            data: [right, wrong]
                        }
                    ]
                };
            }
        },

        watch: {
            activeName() {
                let activeName = this.activeName;

                if (activeName === 'words' || activeName === 'wordsrecite') {
                    this.loadWords();
                }
            },

            words() {
                let allTags = [];

                this.words.forEach(({ tags = [] }) => {
                    allTags = allTags.concat(tags);
                });

                this.tags = _.uniq(allTags);
                this.allTags = this.tags.map(tag => {
                    return {
                        label: tag,
                        value: tag
                    };
                });
            }
        },
        mounted: function() {
            if (this.activeName === 'words' || this.activeName === 'wordsrecite') {
                this.loadWords();
            }

            if (activeName === 'update') {
                this.$nextTick(() => {
                    this.saveConfig(true);
                });
            }
        },
        methods: {
            handleClick: function(tab) {
                _gaq.push(['_trackEvent', 'options_tab', 'click', tab.name]);
            },

            loadWords() {
                return new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage({
                        action: 'get'
                    }, ({ data }) => {
                        if (data) {
                            this.words = data;

                            resolve(data);
                        } else {
                            resolve([]);
                        }
                    });
                });
            },

            filterWords(filter, type = 'list') {
                let { wordSearchText, levels, tags } = filter;

                if (!this.words.length) {
                    return [];
                }

                let results = this.words;

                if (wordSearchText) {
                    results = results.filter(word => {
                        // TODO: 连同sentence一起筛选
                        return word.name.toLowerCase().indexOf(wordSearchText.toLowerCase()) !== -1;
                    });
                }

                if (levels.length) {
                    results = results.filter(({ level }) => {
                        return levels.indexOf(level) !== -1;                         
                    });
                }

                if (tags.length) {
                    results = results.filter(({tags: wtags = []}) => {
                        if (!wtags.length) {
                            return false;
                        }

                        let hasTag = false;

                        tags.forEach(tag => {
                            if (wtags.indexOf(tag) > -1) {
                                hasTag = true;
                            }
                        });

                        return hasTag;
                    });
                }

                return results;
            },

            handleLevelFilterClick(level, type = 'list') {
                let filter = this[filterKeyMap[type]];
                let index = filter.levels.indexOf(level);

                if (index > -1) {
                    filter.levels.splice(index, 1);
                } else {
                    filter.levels.push(level);
                }

                _gaq.push(['_trackEvent', 'wordlist', 'click', 'filter', 'level']);
            },

            handleTagFilterClick(tag, type = 'list') {
                let filter = this[filterKeyMap[type]];
                let index = filter.tags.findIndex(item => item == tag);

                if (index > -1) {
                    filter.tags.splice(index, 1);
                } else {
                    filter.tags.push(tag);
                }

                _gaq.push(['_trackEvent', 'wordlist', 'click', 'filter', 'tag']);
            },

            handleConfigSubmit() {
                this.saveConfig();

                _gaq.push(['_trackEvent', 'options_general', 'save']);
            },

            saveConfig: function(silent) {
                let self = this;
                let newConfig = JSON.parse(JSON.stringify(this.config));

                browser.storage.sync.set({
                    config: newConfig
                }).then(resp => {
                    if (!silent) {
                        this.$message('保存成功');
                    }
                });

                _gaq.push(['_trackEvent', 'general', 'click', 'save']);
            },

            handleWordClick(word) {
                this.wordEditorVisible = true;
                this.wordForm = {
                    id: word.id,
                    name: word.name,
                    trans: word.trans.join(','),
                    sentence: word.sentence,
                    tags: word.tags,
                    level: word.level
                };

                _gaq.push(['_trackEvent', 'wordlist', 'click', 'word']);
            },

            handleTagClose(tag) {
                this.wordForm.tags.splice(this.wordForm.tags.indexOf(tag), 1);
                _gaq.push(['_trackEvent', 'wordeditor', 'input', 'tagClose']);
            },

            createFilter(queryString) {
                return (item) => {
                  return (item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
                };
            },

            tagsQuerySearch(queryString, cb) {
                let allTags = this.allTags;
                let results = queryString ? allTags.filter(this.createFilter(queryString)) : allTags;

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
                this.tagInputValue = '';

                _gaq.push(['_trackEvent', 'wordeditor', 'input', 'addtag']);
            },

            showTagInput() {
                this.tagInputVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.$refs.input.focus();
                });

                _gaq.push(['_trackEvent', 'wordeditor', 'click', 'taginput']);
            },

            handleEditorCancelClick() {
                this.wordEditorVisible = false;
                _gaq.push(['_trackEvent', 'wordeditor', 'click', 'cancel']);
            },

            handleEditorDeleteClick() {
                chrome.runtime.sendMessage({
                    action: 'remove',
                    data: { id: this.wordForm.id }
                }, () => {
                    this.$message('删除成功!');
                    this.resetWordEditor();
                });
                _gaq.push(['_trackEvent', 'wordeditor', 'click', 'delete']);
            },

            onWordFormSubmit() {

            },

            saveWord(word) {
                if (word && word.name) {
                    return new Promise((resolve, reject) => {
                        chrome.runtime.sendMessage({
                            action: 'update',
                            data: JSON.parse(JSON.stringify(word))
                        }, (resp) => {
                            resolve(resp);
                        });
                    });
                } else {
                    return Promise.reject(null);
                }
            },

            resetWordForm() {
                this.wordForm = {
                    name: '',
                    trans: '',
                    sentence: '',
                    tags: [],
                    level: 0
                };
            },

            handleEditorSubmit() {
                this.$refs.wordForm.validate((valid) => {
                    if (!valid) {
                        this.$message.error('信息填写有问题');
                        return;
                    }
                    
                    let {id, name, trans, sentence, tags, level} = this.wordForm;

                    let word = {
                        id,
                        name,
                        trans: trans.split(','),
                        sentence,
                        tags,
                        level
                    };

                    this.saveWord(word).then(resp => {
                        this.resetWordEditor();
                    });
                });
                _gaq.push(['_trackEvent', 'wordeditor', 'click', 'save']);
            },

            resetWordEditor() {
                this.loadWords();
                this.wordEditorVisible = false;
                this.resetWordForm();
            },

            // recite
            beginRecite() {
                if (this.schemedWords.length) {
                    this.wordrecitevisible = true;
                    this.recitedWordIndex = 0;
                    this.reciteWord();
                } else {
                    this.$message({
                        message: '没有选中任何单词!',
                        type: 'warning'
                    });
                }
                
                _gaq.push(['_trackEvent', 'recite', 'click', 'begin']);
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

            goNextStep() {
                let nextStage = this.reciteStage + 1;
                
                if (nextStage > (reciteStages.length - 1)) {
                    this.reciteStage = 0;

                    let nextWordIndex = this.recitedWordIndex + 1;

                    if (nextWordIndex > (this.schemedWords.length - 1)) {
                        this.allRecited = true;
                    } else {
                        this.curRecitedWord = {
                            id: '',
                            name: '',
                            level: 0,
                            trans: [],
                            sentence: ''
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
                Translate.playAudioByWord(this.curRecitedWord.name);
                _gaq.push(['_trackEvent', 'recite', 'click', 'voice']);
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
                    nextLevel = WORD_LEVEL.DONE
                } else if (nextLevel < WORD_LEVEL.ZERO) {
                    nextLevel = WORD_LEVEL.ZERO;
                }

                word.level = nextLevel;

                chrome.runtime.sendMessage({
                    action: 'update',
                    data: JSON.parse(JSON.stringify(word))
                }, () => {
                    this.goNextStep();
                });

                _gaq.push(['_trackEvent', 'recite', 'click', gotit ? 'right' : 'wrong']);
            },

            beginNewReciteFilter() {
                this.allRecited = false;
                this.wordrecitevisible = false;
                this.curRecitedWord = {
                    id: '',
                    name: '',
                    level: 0,
                    trans: [],
                    sentence: ''
                };
                this.reciteFilter = {
                    levels: [],
                    tags: []
                };
                this.reciteResult = {
                    right: 0,
                    wrong: 0
                };

                _gaq.push(['_trackEvent', 'recite', 'click', 'newrecite']);
            },

            handleExportClick() {
                this.loadWords().then(words => this.exportWords(words));
            },

            exportWords(words) {
                if (!words.length) {
                    this.$message.warn('没有可导出的词语！');
                    
                    return;
                }

                words = JSON.parse(JSON.stringify(words));
                
                let csvContent = "data:text/csv;charset=utf-8,";

                words.forEach(({ name, trans, sentence, tags}, index) => {
                    let wordString = `${name};${trans.join(' ')};${sentence};${tags.join(';')}`;

                    csvContent += index < words.length ? wordString+ "\n" : wordString;
                });

                let encodedUri = encodeURI(csvContent);

                window.open(encodedUri);
                _gaq.push(['_trackEvent', 'options_advanced', 'click', 'export']);
            }
        }
    });
}

init();