/**
 * @file bg.js
 * @author solopea@gmail.com
 */
/*
<script src="js/word.js"></script>
<script src="js/translate.js"></script>
<script src="js/bg.js"></script>
*/
import $ from 'jquery'
import _ from 'underscore'
import Backbone from 'backbone'
import '../../js/lib/backbone.chromestorage'
import API from '../../js/common/api'
import guid from '../../js/common/guid'
import { WordList } from '../../js/word'
import Translate from '../../js/translate'
import { WORD_LEVEL } from '../../js/constant/options'

var chrome = window.chrome;
var Notification = window.Notification;
var Words = new WordList();

window.Words = Words;

// TODO: option
var options = {
    // hide the explains while the word's num >= hideNum
    maxNum: 5,

    // interval for notice, default 8 min
    timeInterval: 1000 * 60 * 8,
    congratTitle: 'Good Job',
    congratBody: '背完一轮，新的一轮即将开始....',
    speakletter: true
};

var words;

var wordsHelper = {
    create: function(info) {
        if (!info.name) {
            return;
        }

        var word = Words.findWhere({
            name: info.name
        });

        if (word) {
            this.update({
                id: word.id,
                ...info
            });

            return word;
        }

        word = Words.create({
            ...info,
            level: WORD_LEVEL.ZERO,
            images: []
        });

        return word;
    },

    changeLevel: function(id, offset) {
        var word = Words.findWhere({
            id: id
        });
        var level = (word.get('level') || WORD_LEVEL.ZERO) + offset;

        if (level < WORD_LEVEL.ZERO) {
            level = WORD_LEVEL.ZERO;
        }

        if (level >= WORD_LEVEL.DONE) {
            return this.remove(id);
        }

        word.save({
            level: level
        });
        console.log('change word: %s level to %d', word.get('name'), level);
    },

    remove: function(id) {
        var model = Words.findWhere({
            id: id
        });

        model.destroy();
        this.getWords();
        console.log('remove word: %s', model.get('name'));
    },

    update: function(attrs) {
        var word = Words.set(attrs, {
            add: false,
            remove: false
        });

        word.save();
        return word;
    },

    getWords: function() {
        words = Words.toJSON();

        return words;
    },

    getAllTags: function() {
        return _.uniq(_.flatten(Words.pluck('tags')));
    },

    getWord: function(name) {
        var model = Words.findWhere({
            name
        });

        return model;
    },

    addImage: function(id, imageUrl) {

    },

    init: function() {
        let self = this;

        Words.fetch().then(function() {
            self.getWords();
        });
    }
};

chrome.runtime.onMessage.addListener(function(req, sender, resp) {
    var data = req.data;
    // 新建单词
    if (req.action === 'create') {
        let { id } = wordsHelper.create(data);
        resp({
            msg: 'create ok...',
            data: { id }
        });
        return;
    }

    // 删除单词
    if (req.action === 'remove') {
        wordsHelper.remove(data.id);
        resp({ msg: 'remove ok...' });
    }

    if (req.action === 'update') {
        var word = wordsHelper.update(data);
        resp({
            msg: 'update ok...',
            data: {}
        });
    }

    if (req.action === 'get') {
        let words = wordsHelper.getWords()

        resp({
            msg: 'get words',
            data: words
        });
    }

    if (req.action === 'find') {
        resp({
            msg: 'find word',
            data: wordsHelper.getWord(req.word)
        });
    }

    if (req.action === 'allTags') {
        let allTags = wordsHelper.getAllTags();

        resp({
            msg: 'get All Tags',
            data: allTags
        });
    }
});

function setup() {
    let parentMenu = chrome.contextMenus.create({
        title : "单词小卡片",
        contexts: ['selection'],
        onclick : function(info, tab) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id, {action: "menuitemclick"}, function(response) {});  
            });
        }
    });

    wordsHelper.init();
}

setup();

Words.on('add remove', function() {
    wordsHelper.getWords();
});
