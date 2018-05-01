
import $ from 'jquery'
import _ from 'underscore'
import Translate from '../../js/translate'
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import './translate.scss'
import AV from 'leancloud-storage'
import * as PageConfig from './translate.config.js'

const chrome = window.browser;

Vue.use(ElementUI)

const AVHelper = {
    cache: {},
    getTag(word) {
        return this.query(word).then(res => {
            return this.getTagByInterval(res.index);
        });
    },
    query(word) {
        let cache = this.cache;

        if (cache[word]) {
            return Promise.resolve(cache[word]);
        }

        const cql = `select * from cocoa20000 where name = '${word}'`;

        return AV.Query.doCloudQuery(cql).then(function ({ results = [] }) {
            if (results.length) {
                cache[word] = results[0].attributes;

                return cache[word];
            }
        }, function (error) {
            return {
                word,
                index: -1
            }
        });
    },

    getTagByInterval(index) {
        if (index < 0) {
            return '';
        } else if (index <= 4000) {
            return '4000';
        } else if (index <= 8000  ) {
            return '8000'
        } else if (index <= 12000) {
            return '12000';
        } else if (index <= 15000) {
            return '15000';
        } else {
            return '20000';
        }
    }
};

let vm;
let parentWin;

function initApp({ word, surroundings, source, host, engine }) {
    vm = new Vue({
        el: '#main',
        data: function() {
            return {
                meta: {
                    word,
                    surroundings,
                    source,
                    host,
                    engine
                },
                assit: PageConfig.getDefaultAssit()
            }
        },

        mounted() {
            this.lookup();
        },

        methods: {
            rerender(meta) {
                this.meta = meta;
                this.assit = PageConfig.getDefaultAssit();
                this.$nextTick(() => {
                    this.lookup();
                });
            },

            lookup() {
                this.loadWord();
                this.fetchAllTags();
            },

            queryWordIndex() {
                AVHelper.getTag(this.meta.word).then(tag => {
                    if (tag) {
                        this.assit.wordTags.push(tag);
                    }
                });
            },
            fetchAllTags() {
                chrome.runtime.sendMessage({
                    action: 'allTags',
                    host: this.meta.host
                }, ({ data }) => {
                    let { allTags = [], hostTags = [] } = data;

                    if (allTags.length) {
                        this.assit.allTags = allTags.map(tag => {
                            return {
                                value: tag,
                                label: tag
                            }
                        });
                    }

                    if (hostTags.length) {
                        // just add the two most used tag
                        this.assit.wordTags = this.assit.wordTags.concat(hostTags.slice(0, 2));
                    }
                });
            },

            loadWord() {
                chrome.runtime.sendMessage({
                    action: 'find',
                    word: this.meta.word
                }, ({ data }) => {
                    if (data) {
                        this.assit.orgWord = data;
                    }
                    this.getTranslate().then(() => {
                        // 收藏过的单词就不需要再查 cocoa 了
                        if (!this.assit.orgWord) {
                            this.queryWordIndex();
                        }
                    });
                });
            },
            getTranslate() {
                return Translate.translate(this.meta.word, this.meta.engine).then(results => {
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
                Translate.playAudio(url);
            },

            enbaleWordInput() {
                this.assit.wordEditable = true;
            },

            handleDefDelete(index) {
                if (typeof index === 'number') {
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
                    this.assit.newWordDef = '';
                }
            },

            handleTagClose(tag) {
                this.assit.wordTags.splice(this.assit.wordTags.indexOf(tag), 1);
            },

            createFilter(queryString) {
                return (item) => {
                  return (item.value.indexOf(queryString.toLowerCase()) === 0);
                };
            },

            tagsQuerySearch(queryString, cb) {
                let allTags = this.assit.allTags;
                let results = queryString ? allTags.filter(this.createFilter(queryString)) : allTags;

                cb(results);
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
                this.assit.tagInputValue = '';
            },

            showTagInput() {
                this.assit.tagInputVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.$refs.input.focus();
                });
            },

            toggleEdit() {
                this.assit.sentenceEditable = !this.sentenceEditable;
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

            handleCloseClick() {
                parentWin.postMessage({
                    type: 'popup'
                }, '*');
            },

            handleDeleteClick() {
                var self = this;
    
                chrome.runtime.sendMessage({
                        'action': 'remove',
                        'data': {
                            id: self.wordId
                        }
                    },
                    function(resp) {
                        self.close();
                    });
            },

            save() {
                let vm = this;
                let attrs = {
                    name: this.meta.word,
                    sentence: this.meta.surroundings,
                    trans: this.assit.translate.trans || [],
                    tags: this.assit.wordTags,
                    host: this.meta.host,
                    source: this.meta.source
                };

                chrome.runtime.sendMessage({
                    'action': 'create',
                    'data': attrs
                }, function({ data }) {
                    vm.assit.orgWord = data;
                    vm.$message('Save successfully');     
                });
            },

            handleSaveClick() {
                if (this.assit.orgWord) {
                    this.$confirm('会覆盖单词库里的单词，确定要继续吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.save();
                    }).catch(() => { });
                } else {
                    chrome.runtime.sendMessage({
                        action: 'storageValid'
                    }, ({ msg, data }) => {
                        if (!data) {
                            this.$message.warning(msg);
                        } else {
                            this.save();
                        }
                    });
                }
            }
        }
    });
}

function render(data, parent) {
    parentWin = parent;
    if (!vm) {
        initApp(data);
    } else {
        vm.rerender(data);
    }
}

function initAV() {
    const appId = 'jA3TvXP3ALTwNBhujMGnjgXk-gzGzoHsz';
    const appKey = 'tWGoClvRJED6U4IAkzwaqESq';
    AV.init({ appId, appKey });
}

initAV();

window.addEventListener('message', function(event) {
    if (event.data) {
        render(event.data, event.source);
    }
});