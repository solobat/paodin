
import $ from 'jquery'
import _ from 'underscore'
import Translate from '../../js/translate'
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import './translate.scss'

Vue.use(ElementUI)

function render(word, surroundings, parentWin) {
    console.log(arguments);
    new Vue({
        el: '#main',
        data: function() {
            return {
                word,
                wordEditable: false,
                surroundings,
                sentenceEditable: false,
                newWordDef: '',
                translate: {}
            }
        },

        mounted() {
            this.getTranslate();
        },

        methods: {
            getTranslate() {
                Translate.translate(this.word).then(data => {
                    if (!data.basic) {
                        return false;
                    }
        
                    this.translate = {
                        phonetic: data.basic['us-phonetic'],
                        trans: data.translation,
                        explains: data.basic.explains
                    };
        
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
            },

            handleDefAdd() {
                if (this.newWordDef) {
                    this.translate.trans.push(this.newWordDef);
                    this.newWordDef = '';
                }
            },

            toggleEdit() {
                this.sentenceEditable = !this.sentenceEditable;
            },

            saveSentence() {
                var sentence = this.surroundings;

                this.sentenceEditable = false;
            },

            saveTo(attrs) {
                let self = this;

                chrome.extension.sendRequest({
                    'action': 'create',
                    'data': attrs
                }, function() {
                    self.$message('Save successfully');     
                });
            },
    
            saveWord() {
                if (this.wordEditable) {
                    this.wordEditable = false;
                    this.getTranslate();
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

            handleSaveClick() {
                this.saveTo({
                    name: this.word,
                    sentence: this.surroundings,
                    trans: this.translate.trans
                });
            }
        }
    });
}

window.addEventListener('message', function(event) {
    render(event.data.word, event.data.surroundings, event.source);
});