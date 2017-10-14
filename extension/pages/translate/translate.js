
import $ from 'jquery'
import _ from 'underscore'
import Translate from '../../js/translate'
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import './translate.scss'
import AV from 'leancloud-storage'
import ga from '../../js/common/ga'

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

function render({ word, surroundings, source, host }, parentWin) {
    new Vue({
        el: '#main',
        data: function() {
            return {
                word,
                wordEditable: false,
                surroundings,
                sentenceEditable: false,
                newWordDef: '',
                translate: {},
                tagInputVisible: false,
                tagInputValue: '',
                wordTags: [],
                allTags: [],
                orgWord: null
            }
        },

        mounted() {
            this.loadWord();
            this.fetchAllTags();
        },

        methods: {
            queryWordIndex() {
                AVHelper.getTag(this.word).then(tag => {
                    if (tag) {
                        this.wordTags.push(tag);
                    }
                });
            },
            fetchAllTags() {
                chrome.runtime.sendMessage({
                    action: 'allTags',
                    host
                }, ({ data }) => {
                    let { tags = [], hostTags = [] } = data;

                    if (tags.length) {
                        this.allTags = tags.map(tag => {
                            return {
                                value: tag,
                                label: tag
                            }
                        });
                    }

                    if (hostTags.length) {
                        // just add the two most used tag
                        this.wordTags = this.wordTags.concat(hostTags.slice(0, 2));
                    }
                });
            },

            loadWord() {
                chrome.runtime.sendMessage({
                    action: 'find',
                    word: this.word
                }, ({ data }) => {
                    if (data) {
                        this.orgWord = data;
                    }
                    this.getTranslate();
                    this.queryWordIndex();
                });
            },
            getTranslate() {
                Translate.translate(this.word).then(data => {
                    if (!data.basic) {
                        return false;
                    }
        
                    let results = {
                        phonetic: data.basic['us-phonetic'],
                        trans: data.translation || [],
                        explains: data.basic.explains
                    };

                    // FIXME: orgWord may only have id attr
                    if (this.orgWord) {
                        let { trans = [], tags = [] } = this.orgWord;

                        results.trans = trans;
                        this.wordTags = tags;
                    }

                    this.translate = results;
        
                    setTimeout(function() {
                        Translate.playAudio(word);
                    }, 1000);
                });
            },

            playAudio() {
                Translate.playAudio(this.word);
            },

            enbaleWordInput() {
                this.wordEditable = true;
                _gaq.push(['_trackEvent', 'iframe', 'click', 'editword']);
            },

            handleDefAdd() {
                if (this.newWordDef) {
                    this.translate.trans.push(this.newWordDef);
                    this.newWordDef = '';
                    _gaq.push(['_trackEvent', 'iframe', 'input', 'addDef']);
                }
            },

            handleTagClose(tag) {
                this.wordTags.splice(this.wordTags.indexOf(tag), 1);
                _gaq.push(['_trackEvent', 'iframe', 'input', 'tagClose']);
            },

            createFilter(queryString) {
                return (item) => {
                  return (item.value.indexOf(queryString.toLowerCase()) === 0);
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
                if (tagInputValue && this.wordTags.indexOf(tagInputValue) === -1) {
                  this.wordTags.push(tagInputValue);
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

            toggleEdit() {
                this.sentenceEditable = !this.sentenceEditable;
                _gaq.push(['_trackEvent', 'iframe', 'click', 'editsentence']);
            },

            saveSentence() {
                var sentence = this.surroundings;

                this.sentenceEditable = false;
            },
    
            updateWord() {
                if (this.wordEditable) {
                    this.wordEditable = false;
                    this.loadWord();
                    _gaq.push(['_trackEvent', 'iframe', 'input', 'updateword']);
                }
            },

            handleCloseClick() {
                parentWin.postMessage({
                    type: 'popup'
                }, '*');
            },

            handleDeleteClick() {
                var self = this;
    
                chrome.extension.sendRequest({
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
                let self = this;
                let attrs = {
                    name: this.word,
                    sentence: this.surroundings,
                    trans: this.translate.trans,
                    tags: this.wordTags,
                    host,
                    source
                };

                chrome.runtime.sendMessage({
                    'action': 'create',
                    'data': attrs
                }, function({ data }) {
                    self.orgWord = data;
                    self.$message('Save successfully');     
                });

                _gaq.push(['_trackEvent', 'iframe', 'save']);
            },

            handleSaveClick() {
                if (this.orgWord) {
                    this.$confirm('会覆盖单词库里的单词，确定要继续吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.save();
                    }).catch(() => { });
                } else {
                    this.save();
                }
            }
        }
    });
}

function initAV() {
    const appId = 'jA3TvXP3ALTwNBhujMGnjgXk-gzGzoHsz';
    const appKey = 'tWGoClvRJED6U4IAkzwaqESq';
    AV.init({ appId, appKey });
}

initAV();

window.addEventListener('message', function(event) {
    render(event.data, event.source);
    ga();
});