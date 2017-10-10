
import $ from 'jquery'
import _ from 'underscore'
import Translate from '../../js/translate'
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import './translate.scss'
import ga from '../../js/common/ga'

Vue.use(ElementUI)

function render(word, surroundings, parentWin) {
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
            fetchAllTags() {
                chrome.runtime.sendMessage({
                    action: 'allTags'
                }, ({ data: tags }) => {
                    if (tags && tags.length) {
                        this.allTags = tags.map(tag => {
                            return {
                                value: tag,
                                label: tag
                            }
                        });
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
                    tags: this.wordTags
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

window.addEventListener('message', function(event) {
    render(event.data.word, event.data.surroundings, event.source);
    ga();
});