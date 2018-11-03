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
import { WORD_LEVEL, CARD_FONTSIZE_OPTIONS } from '../../js/constant/options'
import * as Validator from '../../js/common/validatorHelper'
import Pie from '../../js/components/pieChart'
import Translate from '../../js/translate'
import { TRANSLATE_ENGINS } from '../../js/constant/options'
import { getParameterByName } from '../../js/common/utils'
import wordRoots from '../../js/constant/wordroots'
import keyboardJS from 'keyboardjs'
import SocialSharing  from 'vue-social-sharing'
import API from '../../js/api'
import { Base64 } from 'js-base64'
import URI from 'urijs'

Vue.use(SocialSharing);

const chrome = window.chrome;
const bg = chrome.extension.getBackgroundPage();
const manifest = chrome.runtime.getManifest();
const version = manifest.version;
const appName = 'wordcard';
const storeId = 'oegblnjiajbfeegijlnblepdodmnddbk';
let final = [];

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

const tabs = ['general', 'words', 'wordsrecite', 'wordroots', 'advanced', 'help', 'update', 'about'];

function render(config, i18nTexts) {
    let activeName = getParameterByName('tab') || 'general';
    
    if (config.version < version) {
        config.version = version;
        activeName = 'update';
    }

    const app = new Vue({
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
                CARD_FONTSIZE_OPTIONS,
                TRANSLATE_ENGINS,
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
                wordRoots,
                activeSyncNames: [],
                minappForm: {
                    userKey: ''
                },
                minappRules: {
                    userKey: Validator.text('userKey')
                },
                hasMinappChecked: false,

                // sync
                syncPorcess: 0,
                syncing: false,
                version
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

            handleWords(list) {
                list.forEach(item => {
                    if (item.pos) {
                        const { url, offset, path } = item.pos;
                        const tag = Base64.encodeURI(JSON.stringify({ offset, path }));
                        const link = URI(url).removeSearch('wc_tag').addSearch('wc_tag', tag);

                        item.link = link.href();
                    }
                });

                return list;
            },

            loadWords() {
                return new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage({
                        action: 'get'
                    }, ({ data }) => {
                        if (data) {
                            this.words = this.handleWords(data);

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

            resetFilter() {
                this.filter = {
                    wordSearchText: '',
                    levels: [],
                    tags: []
                };
            },

            handleBatchDeleteClick() {
                const words = this.filteredWords;

                if (words.length) {
                    this.$confirm('此操作将永久删除这些单词, 是否继续?', '提示').then(() => {
                        this.batchDelete();
                    }).catch(() => {
                        console.log('cancel');
                    });
                } else {
                    this.$message.warning('没有要删除的单词!');
                }
            },

            batchDelete() {
                const ids = this.filteredWords.map(word => word.id);

                chrome.runtime.sendMessage({
                    action: 'batchDelete',
                    data: { ids }
                }, () => {
                    this.$message('批量删除成功!');
                    this.resetFilter();
                    this.loadWords();
                });
            },

            handleWordClick(word) {
                this.wordEditorVisible = true;
                this.wordForm = {
                    id: word.id,
                    name: word.name,
                    trans: (word.trans || []).join(','),
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

            handleSyncedClick(word) {
                word.synced = false;
                this.saveWord(word);
            },

            handleWordLinkClick(link) {
                chrome.tabs.create({
                    url: link
                });
            },

            handleRootClick(word) {
                chrome.tabs.create({
                    url: `http://www.cgdict.com/index.php?app=cigen&ac=word&w=${word.name}`
                });
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
                Translate.playAudio(this.curRecitedWord.name);
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

            handleExportClick(format) {
                this.loadWords().then(words => this.exportWords(words, format));
            },

            download(url, name) {
                const downloadAnchorNode = document.createElement('a');

                downloadAnchorNode.setAttribute('href', url);
                downloadAnchorNode.setAttribute('download', name);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            },

            downloadAsJson(exportObj, exportName){
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj));

                this.download(dataStr, exportName + '.json');
            },

            downloadAsCsv(words) {
                let csvContent = "data:text/csv;charset=utf-8,";

                words.forEach(({ name, trans = [], sentence, tags = []}, index) => {
                    let wordString = `${name};${trans.join(' ')};${sentence};${tags.join(';')}`;

                    csvContent += index < words.length ? wordString+ "\n" : wordString;
                });

                let encodedUri = encodeURI(csvContent);

                this.download(encodedUri, 'wordcard-words.csv');
            },

            downloadAsText(words = []) {
                let textContent = "data:text/plain;charset=utf-8,";
                const data = words.map(word => word.name);

                let encodedUri = encodeURI(`${textContent}${data.join('\n')}`);

                this.download(encodedUri, 'wordcard-words.txt');
            },

            exportWords(words, format) {
                if (!words.length) {
                    this.$message.warn('没有可导出的词语！');
                    
                    return;
                }

                const obj = JSON.parse(JSON.stringify(words));

                if (format === 'csv') {
                    this.downloadAsCsv(obj);
                } else if (format === 'json') {
                    this.downloadAsJson(obj, 'wordcard-words');
                } else if (format === 'words') {
                    this.downloadAsText(obj);
                }

                _gaq.push(['_trackEvent', 'options_advanced', 'click', 'export']);
            },

            async handleUserCheck(type) {
                this.$refs.minappForm.validate(async valid => {
                    if (valid) {
                        const resp = await API.minapp.checkUser(this.minappForm.userKey);

                        if (resp && resp.code === 0 && resp.data) {
                            this.$message.success(`身份验证成功，Hi, ${resp.data.nickname}`);
                            this.hasMinappChecked = true;
                        } else {
                            this.$message.error('查找不到匹配的用户!');
                        }
                    }
                });
            },

            async makeWordsSynced(newWords = []) {
                const words = newWords.map(word => {
                    return { id: word.id, name: word.name, synced: true };
                });
                return new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage({
                        action: 'batchUpdate',
                        data: words
                    }, ({ data }) => {
                        resolve(data);
                    });
                });
            },

            partial(list, chunk = 5) {
                let i, j, parts = [];

                for (i = 0,j = list.length; i < j; i += chunk) {
                    parts.push(list.slice(i, i + chunk));
                }

                return parts;
            },

            async getShouldSyncWords(filterFn) {
                const words = await this.loadWords();
                const newWords = filterFn ? words.filter(filterFn) : words;

                if (newWords.length) {
                    return JSON.parse(JSON.stringify(newWords))
                } else {
                    return;
                }
            },

            async batchSync(syncMethod, parts) {
                return parts.reduce((tasks, part) => {
                    return tasks.then(results => {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(syncMethod(part).then((result) => {
                                    final.push(result);
                                    const percent = (final.length / parts.length * 100).toFixed(2);

                                    this.syncPorcess = Number(percent);
                                }));
                            }, 200);
                        });
                    }).catch(console.error);
                }, Promise.resolve());
            },

            async syncToCloud(syncMethod, filterFn, chunk) {
                const list = await this.getShouldSyncWords(filterFn);

                if (list) {
                    const parts = this.partial(list, chunk);

                    this.syncing = true;

                    try {
                        const result = await this.batchSync(syncMethod, parts);
                        
                        return list;
                    } catch (error) {
                        console.log(error);
                        this.$message.error('同步失败，请稍后再试，或去论坛反馈');
                    } finally {
                        this.syncing = false;
                    }
                } else {
                    this.$message.warning('没有需要同步的单词了.');
                }
            },

            async shouldSyncToMinapp() {
                this.$refs.minappForm.validate(async valid => {
                    if (valid) {
                        const userData = API.minapp.pasreUserKey(this.minappForm.userKey);
                        const syncMethod = (part) => {
                            return API.minapp.sync(userData.userId, part);
                        };
                        const filterFn = word => !word.synced;
                        const syncedList = await this.syncToCloud(syncMethod, filterFn, 5);
                        const resp = await this.makeWordsSynced(syncedList);

                        this.$message.success('最新单词已经成功同步到单词小卡片小程序!');
                    }
                });
            },

            async syncToShanbay() {
                const syncMethod = async (part) => {
                    const word = part[0].name;
                    const { data } = await API.shanbay.translate(word);

                    return API.shanbay.addToVocabulary(data.id);
                };

                await this.syncToCloud(syncMethod, null, 1);
                this.$message.success('单词已经全部同步到扇贝!');
            },

            shouldSyncToShanbay() {
                chrome.cookies.get({ url: 'http://www.shanbay.com', name: 'auth_token' }, cookie => {
                    if (cookie) {
                        this.syncToShanbay();
                    } else {
                        chrome.tabs.create({ url: 'https://www.shanbay.com/web/account/login' })
                    }
                })
            },

            async syncToYoudao() {
                const syncMethod = async (part) => {
                    const word = part[0].name;

                    return API.youdao.addToVocabulary(word);
                };

                await this.syncToCloud(syncMethod, null, 1);
                this.$message.success('单词已经全部同步到有道!');
            },

            shouldSyncToYoudao() {
                const url = 'http://dict.youdao.com';
                const loginURL = 'http://account.youdao.com/login?service=dict&back_url=http://dict.youdao.com/wordbook/wordlist%3Fkeyfrom%3Dnull';

                chrome.cookies.get({ url, name: 'DICT_SESS' }, async cookie => {
                    if (cookie) {
                        this.syncToYoudao();
                    } else {
                        chrome.tabs.create({
                            url: loginURL
                        })
                    }
                })
            },

            handleSyncClick(type) {
                if (type === 'minapp') {
                    this.shouldSyncToMinapp();
                } else if (type === 'shanbay') {
                    this.shouldSyncToShanbay();
                } else if (type === 'youdao') {
                    this.shouldSyncToYoudao();
                }
            }
        }
    });

    function bindEvents() {
        let keys = ['alt + 1', 'alt + 2', 'alt + 3', 'alt + 4', 'alt + 5', 'alt + 6', 'alt + 7', 'alt + 8'];

        keys.forEach((key, index) => {
            keyboardJS.on(key, _ => {
                app.activeName = tabs[index];
            });
        });
    }

    bindEvents();
}

init();