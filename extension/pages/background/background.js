/**
 * @file bg.js
 * @author solopea@gmail.com
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
import { getSyncConfig } from '../../js/common/config'

const cocoaTags = ['4000', '8000', '12000', '15000', '20000'];
// browser.runtime.sendMessage api is not equivalent to chrome.runtime.sendMessage
const browser = window.chrome;

let Words = new WordList();
let config;
let words;

window.Words = Words;
window._ = _;

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

    remove: function(id) {
        var model = Words.remove(id);
        console.log(model);
        return model;
    },

    update: function(attrs) {
        var word = Words.set(attrs, {
            add: false,
            remove: false
        });

        word.save();
        return word;
    },

    review(id, gotit) {
        let word = Words.findWhere({ id });
        let level = word.level || 0;
        let nextLevel;

        if (gotit) {
            nextLevel = level + 1;
        } else {
            nextLevel = level - 1;
        }

        if (nextLevel > WORD_LEVEL.DONE) {
            nextLevel = WORD_LEVEL.DONE
        } else if (nextLevel < WORD_LEVEL.ZERO) {
            nextLevel = WORD_LEVEL.ZERO;
        }

        word.save({ level });
        console.log('change word: %s level to %d', word.get('name'), level);
        return nextLevel;
    },

    getWords: function() {
        words = Words.toJSON();

        return words;
    },

    getAllTags: function(host) {
        let allTags = _.uniq(_.flatten(Words.pluck('tags')));
        let tagsArr = Words.where({ host }).map(word => word.get('tags'));

        function sortTags(tagsList) {
            let mode = {};
            
            tagsList.forEach(tags => {
                tags.forEach(item => {
                    if (mode[item]) {
                        mode[item] += 1;
                    } else {
                        mode[item] = 1;
                    }
                });
            });

            let arr = [];

            for (let key in mode) {
                arr.push({
                    label: key,
                    value: mode[key]
                });
            }

            let sortedTags = arr.sort((a, b) => a.value < b.value)
                .filter(item => cocoaTags.indexOf(item.label) === -1)
                .map(item => item.label);

            return sortedTags;
        }

        let sortedTags= sortTags(tagsArr);

        return {
            allTags,
            hostTags: sortedTags
        };
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

function msgHandler(req, sender, resp) {
    let data = req.data;
    let action = req.action;

    // 新建单词
    if (action === 'create') {
        let { id } = wordsHelper.create(data);
        resp({
            msg: 'create ok...',
            data: { id }
        });
        return;
    }

    // 删除单词
    if (action === 'remove') {
        wordsHelper.remove(data.id);
        resp({ msg: 'remove ok...' });
    }

    if (action === 'update') {
        var word = wordsHelper.update(data);
        resp({
            msg: 'update ok...',
            data: {}
        });
    }

    if (action === 'get') {
        let words = wordsHelper.getWords()

        resp({
            msg: 'get words',
            data: words
        });
    }

    if (action === 'find') {
        resp({
            msg: 'find word',
            data: wordsHelper.getWord(req.word)
        });
    }

    if (action === 'allTags') {
        let allTags = wordsHelper.getAllTags(req.host);

        resp({
            msg: 'get All Tags',
            data: allTags
        });
    }

    if (action === 'filter') {
        let filtered = queryByFilter(req.query, true);
        
        resp({
            msg: 'query by filter',
            data: filtered
        });
    }

    if (action === 'review') {
        let { id, gotit } = req.data;
        let newLevel = wordsHelper.review(id, gotit);

        resp({
            msg: 'review word',
            data: { newLevel }
        });
    }
}

['onMessage', 'onMessageExternal'].forEach((msgType) => {
    browser.runtime[msgType].addListener(msgHandler);
});

function filterWords(words, filter) {
    let { wordSearchText, levels = [], tags = [] } = filter;

    if (!words.length) {
        return [];
    }

    if (!filter) {
        return words;
    }

    let results = words;

    if (wordSearchText) {
        results = results.filter(word => {
            return word.name.toLowerCase().indexOf(wordSearchText.toLowerCase()) !== -1;
        });
    }

    if (levels.length) {
        results = results.filter(({ level }) => {
            return levels.indexOf(level) !== -1;                         
        });
    }

    if (tags.length) {
        results = results.filter(({tags: wtags = []}) => {
            if (!wtags.length) {
                return false;
            }

            let hasTag = false;

            tags.forEach(tag => {
                if (wtags.indexOf(tag) > -1) {
                    hasTag = true;
                }
            });

            return hasTag;
        });
    }

    return results;
}

function queryByFilter(str, sync) {
    let words = wordsHelper.getWords();
    let levelReg = /^[0-5]{1}$/g;
    let { allTags } = wordsHelper.getAllTags();
    let results;

    if (str) {
        let filter = {
            wordSearchText: '',
            levels: [],
            tags: []
        };

        let items = str.split(/[\s,]/);

        items.forEach(item => {
            if (item.match(levelReg)) {
                filter.levels.push(Number(item));
            } else if(allTags.indexOf(item) !== -1) {
                filter.tags.push(item);
            } else {
                filter.wordSearchText = item;
            }
        });

        results = filterWords(words, filter);
    } else {
        results = words;
    }

    if (sync) {
        return results;
    } else {
        return Promise.resolve(results);
    }
}

function getRandomNums(max, repeatTimes) {
    const nums = [];
    let times = repeatTimes;

    if (times > max) {
        times = max;
    }
    
    for (let index = 0; index < times; index += 1) {
        let gen = Math.floor(Math.random() * max);

        nums.push(gen);
    }

    return nums;
}

function genRandomWords(words, num = 5) {
    if (words && words.length) {
        let nums = getRandomNums(words.length, num);
        
        return nums.map(index => words[index]);
    } else {
        return [];
    }
}

function map2omnibox({ name, trans = []}) {
    return {
        content: `${name}: ${trans.join(',')}`,
        description: name
    };
}

function setupOmnibox() {
    let suggestion;
    browser.omnibox.onInputChanged.addListener((str, suggest) => {
        queryByFilter(str.trim()).then(resp => {
            suggestion = genRandomWords(resp).map(map2omnibox);

            suggest(suggestion);
        });
    });
    
    browser.omnibox.onInputEntered.addListener(content => {
        let name = content.split(':')[0];
        let word = wordsHelper.getWord(name);

        Translate.playAudio(name);

        if (config.alertOnOmniboxInputEntered) {
            setTimeout(() => {
                alert(word.get('sentence'));
            }, 500);
        }
    });
}

function setup() {
    let parentMenu = browser.contextMenus.create({
        title : "单词小卡片",
        contexts: ['selection'],
        onclick : function(info, tab) {
            browser.tabs.query({active: true, currentWindow: true}, function(tabs){
                browser.tabs.sendMessage(tabs[0].id, {action: "menuitemclick"}, function(response) {});  
            });
        }
    });

    setupOmnibox();
}

function loadConfig() {
    return getSyncConfig().then(conf => {
        config = conf;
    });
}

function notifyTabs(resp) {
    chrome.tabs.query({}, function(tabs) {
        tabs.forEach(({ id }) => {
            chrome.tabs.sendMessage(id, resp, function() {});
        });
    });
}

function init() {
    wordsHelper.init();
    Words.on('add remove', function() {
        wordsHelper.getWords();
    });

    setup();

    browser.storage.onChanged.addListener((changes) => {
        if (changes.config) {
            config = changes.config.newValue;
            notifyTabs({
                action: 'config',
                data: config
            });
        }
    });
}

loadConfig().then(init);

