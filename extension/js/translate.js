import $ from 'jquery'
import * as baseEngin from 'translation.js'
import youdao from '@/services/translation/youdao.translation.service'

const Engine = {
    ...baseEngin,
    youdao
}

export default {
    translate: function(word, type, from, to) {
        return this.getTranslation(word, type, from, to);
    },

    getPhoetic(resp) {
        try {
            return [
                {
                    name: 'en-US'
                },
                {
                    name: 'en-GB'
                }
            ]; 
        } catch (error) {
            return []
        }
    },

    getTranslation: function(word, type = 'baidu', from, to) {
        return Engine[type].translate({
            text: word,
            from,
            com: chrome.i18n.getUILanguage() !== 'zh-CN',
            to
        }).then(resp => {
            return {
                explains: resp.dict,
                trans: resp.result,
                phonetic: resp.phonetic || this.getPhoetic(resp)
            };
        });
    },
}