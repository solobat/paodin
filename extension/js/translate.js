import $ from 'jquery'
import * as Engine from 'translation.js'

export default {
    translate: function(word, type) {
        console.log(`engine is: ${type}`);
        return this.getTranslation(word, type);
    },

    getTranslation: function(word, type = 'baidu') {
        return Engine[type].translate({
            text: word,
            from: 'en',
            to: 'zh-CN'
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