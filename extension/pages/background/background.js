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

var chrome = window.chrome;
var Notification = window.Notification;
var Words = new WordList();

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
var StarLevel = {
    ZERO: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    DONE: 5
};

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
            name: info.name,
            sentence: info.sentence || '',
            trans: info.trans,
            state: StarLevel.ZERO,
            images: []
        });

        return word;
    },

    changeState: function(id, offset) {
        var word = Words.findWhere({
            id: id
        });
        var state = (word.get('state') || StarLevel.ZERO) + offset;

        if (state < StarLevel.ZERO) {
            state = StarLevel.ZERO;
        }

        if (state >= StarLevel.DONE) {
            return this.remove(id);
        }

        word.save({
            state: state
        });
        console.log('change word: %s state to %d', word.get('name'), state);
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
        console.log(words);
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
        var word = wordsHelper.create(data);
        resp({
            msg: 'create ok...',
            data: {
                id: word.id
            }
        });
        return;
    }

    // 删除单词
    if (req.action === 'remove') {
        wordsHelper.remove(data.id);
        resp({
            msg: 'remove ok...'
        });
    }

    if (req.action === 'update') {
        var word = wordsHelper.update(data);
        console.log(word);
        resp({
            msg: 'update ok...',
            data: {}
        });
    }

    if (req.action === 'get') {
        wordsHelper.getWords()

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

    // removeLast
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
