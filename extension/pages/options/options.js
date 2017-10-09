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

function render(config, i18nTexts) {
    let activeName = 'general';
    
    if (config.version < version) {
        config.version = version;
        activeName = 'update';
    }

    new Vue({
        el: '#app',
        data: function() {
            return {
                activeName,
                changelog,
                appName,
                storeId,
                config,
                i18nTexts,
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
                }
            }
        },

        computed: {
            filteredWords() {
                let { wordSearchText, levels, tags } = this.filter;

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
            }
        },

        watch: {
            activeName() {
                if (this.activeName === 'words') {
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
            if (this.activeName === 'words') {
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

            handleLevelFilterClick(level) {
                let index = this.filter.levels.indexOf(level);

                if (index > -1) {
                    this.filter.levels.splice(index, 1);
                } else {
                    this.filter.levels.push(level);
                }

                _gaq.push(['_trackEvent', 'options_words_filter', 'click', 'level']);
            },

            handleTagFilterClick(tag) {
                let index = this.filter.tags.findIndex(item => item == tag);

                if (index > -1) {
                    this.filter.tags.splice(index, 1);
                } else {
                    this.filter.tags.push(tag);
                }

                _gaq.push(['_trackEvent', 'options_words_filter', 'click', 'tags']);
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
            },

            handleTagClose(tag) {
                this.wordForm.tags.splice(this.wordForm.tags.indexOf(tag), 1);
                _gaq.push(['_trackEvent', 'options_word_editor', 'input', 'tagClose']);
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
            },

            showTagInput() {
                this.tagInputVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.$refs.input.focus();
                });
            },

            handleEditorCancelClick() {
                this.wordEditorVisible = false;
            },

            handleEditorDeleteClick() {
                
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
                        this.loadWords();
                        this.wordEditorVisible = false;
                        this.resetWordForm();
                    });
                });
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