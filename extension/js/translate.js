import $ from 'jquery'
import * as Engine from 'translation.js'

export default {
    translate: function(word, type, from, to) {
        console.log(`engine is: ${type}`);
        return this.getTranslation(word, type, from, to);
    },

    getTranslation: function(word, type = 'baidu', from, to) {
        return Engine[type].translate({
            text: word,
            from,
            com: chrome.i18n.getUILanguage() !== 'zh-CN',
            to
        }).then(resp => {
            console.log(resp);
            return {
                explains: resp.dict,
                trans: resp.result,
                phonetic: resp.phonetic || [{
                    name: ''
                }]
            };
        });
    },

    playAudio: function(voiceUrl = '', tl = 'en-US') {
        if (voiceUrl.startsWith('http')) {
            this.playAudioUrl(voiceUrl);
        } else {
            const word = voiceUrl;

            return chrome.tts.speak(word, {'lang': tl});
        }
    },

    playAudioUrl: function(voiceUrl) {
        var $audio = $('#wc-audio');

        if (!$audio.length) {
            $audio = $('<audio id="wc-audio" style="display: none"></audio>');
            $audio.appendTo('body');
        }

        var audioElem = $audio.get(0);

        $audio.attr('src', voiceUrl);

        audioElem.play();
    }
}