import $ from 'jquery'
import * as Engine from 'translation.js'

export default {
    translate: function(word, type, from, to) {
        console.log(`engine is: ${type}`);
        return this.getTranslation(word, type, from, to);
    },

    getTranslation: function(word, type = 'baidu', from = 'en', to = 'zh-CN') {
        return Engine[type].translate({
            text: word,
            from,
            to
        }).then(resp => {
            return {
                explains: resp.dict,
                trans: resp.result,
                phonetic: resp.phonetic || [{
                    name: '美'
                }]
            };
        });
    },

    playAudio: function(voiceUrl = '') {
        if (voiceUrl.startsWith('http')) {
            this.playAudioUrl(voiceUrl);
        } else {
            const word = voiceUrl;

            return chrome.tts.speak(word, {'lang': 'en-US'});
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