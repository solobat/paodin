import $ from 'jquery'
import API from './common/api'

export default {
    translate: function(word) {
        return this.getTranslation(word);
    },

    getTranslation: function(word) {
        return new Promise(function(resolve, reject) {
            var url = API.translate + word;

            $.get(url, function(data) {
                resolve(data);
            });
        });
    },

    getImg: function(wordText) {
        return new Promise(function(resolve, reject) {
            $.getJSON(API.img.replace('{{word}}', wordText)).done(function(res) {
                var data = res.responseData.results;
                if (!data || !data.length) {
                    resolve([]);
                    return;
                }

                var imgList = data.map(function(item) {
                    return item.url;
                });

                resolve(imgList);
            });
        });
    },

    playAudio: function(word) {
        word = word || this.word;

        this.playAudioByWord(word);
    },

    getAudioUrl: function(word) {
        var index = Math.floor(Math.random() * API.audio.length);

        return API.audio[index].replace('{{word}}', word);
    },

    playAudioByWord: function(word) {
        var $audio = $('#wc-audio');

        if (!$audio.length) {
            $audio = $('<audio id="wc-audio" style="display: none"></audio>');
            $audio.appendTo('body');
        }

        var audioElem = $audio.get(0);
        var voiceUrl = this.getAudioUrl(word);

        $audio.attr('src', voiceUrl);

        audioElem.play();
    }
}