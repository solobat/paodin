/**
 * @file wordcard.js
 * @author: tomasy
 * @email: solopea@gmail.com
 * @date: 2014-12-06
 */

import './content.scss'
import Highlight from '../../js/highlight'
import $ from 'jquery'
import browser from 'webextension-polyfill'
import { getSyncConfig } from '../../js/common/config'
import ga from '../../js/common/ga'

const chrome = window.chrome;
var options = window.options;

const enReg = /^[^\u4e00-\u9fa5]+$/i;
const numReg = /\d/;
const sentenceReg = '([^.?:]*?{{word}}.*?\[.?])';
const colors = [
    { bgcolor: '#9c5e99', color: '#fff' },
    { bgcolor: '#8ab7d8', color: '#333' },
    { bgcolor: '#60dd60', color: '#333' },
    { bgcolor: '#ffff70', color: '#333' },
    { bgcolor: '#ea9d70', color: '#333' },
    { bgcolor: '#ca181c', color: '#fff' }
];

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace, useRaw) {
    return str.replace(new RegExp(useRaw ? find : escapeRegExp(find), 'g'), replace);
}

var App = {
    handleTextSelected: function(e) {
        var selection = window.getSelection();
        var word = (selection.toString() || '').trim();
        var node = e.target;

        if (!word) {
            return;
        }

        // 数字或三个字母下的不翻译
        // 纯英文才翻译
        if (word.length < 3 || numReg.test(word)) {
            return;
        }

        if (!enReg.test(word)) {
            return;
        }

        // input内部不翻译
        if (['INPUT', 'TEXTAREA'].indexOf(node.tagName) !== -1) {
            return;
        }

        this.highlight = new Highlight(node, word);
        this.lookUp(e, word, node);
    },

    getSurroundings: function(word, elem) {
        if ($(elem).hasClass('wc-highlight')) {
            elem = elem.parentElement;
        }

        var wordContent = elem !== document && elem.innerText;
        // var reg = new RegExp(sentenceReg.replace('{{word}}', word));
        // var surroundings = wordContent.match(reg) && wordContent.match(reg)[0];

        return wordContent;
    },

    lookUp: function(e, word, node) {
        var x_pos = e.pageX;
        var y_pos = e.pageY;
        var x_posView = e.clientX;
        var y_posView = e.clientY;
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;
        var upDir = (y_posView > (winHeight / 2));

        if (upDir) {
            this.el.removeClass('bottom')
                .addClass('top');
        } else {
            this.el.removeClass('top')
                .addClass('bottom');
        }

        var data = {
            word: word,
            surroundings: this.getSurroundings(word, node),
            source: window.location.href,
            host: window.location.hostname
        };

        var html = [
            '<a href="javascript:;" class="wordcard-close"></a>',
            '<iframe id="wordcard-frame" name="wc-word" width="690" height="370" frameborder="0"></iframe>'
        ].join('');

        this.el.html(html);
        this.iframe = $('#wordcard-frame');

        this.el.show().animate({
            height: '370px',
            width: '690px',
            marginLeft: '-345px'
        }, 200, function() {
            $('#wordcard-frame').attr('src', chrome.extension.getURL('translate.html')).fadeIn();
            $('#wordcard-frame').load(function() {
                var iframeWindow = document.getElementById('wordcard-frame').contentWindow;
                iframeWindow.postMessage(data, '*');
            });
        });
        this.isOpen = true;
    },

    closePopup: function() {
        var self = this;

        this.isOpen = false;
        this.iframe.hide();
        this.el.animate({
            height: '80px',
            width: '80px',
            marginLeft: '-40px'
        }, 200, function() {
            self.el.hide();
        });
    },

    bindEvents: function() {
        var self = this;

        // 选中翻译
        if (this.config.dblclick2trigger) {
            $(document).on('dblclick', function(e) {
                self.handleTextSelected(e);
                _gaq.push(['_trackEvent', 'content', 'dblclick']);
            });
        }

        let menuEvent;

        document.body.addEventListener('contextmenu', function(e) {
            menuEvent = e;
        }, false);

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'menuitemclick') {
                self.handleTextSelected(menuEvent);
                _gaq.push(['_trackEvent', 'content', 'menuitemclick']);
            }
        });

        $(document).on('click', '.wordcard-close', function() {
            self.closePopup();
        });

        $(document).on('click', function(e) {
            if (self.isOpen && e.target.id !== 'wordcard-main') {
                self.closePopup();
            }
        });

        window.addEventListener('message', function(event) {
            if (event.data.type && (event.data.type === 'popup')) {
                self.closePopup();
            }
        }, false);
    },

    searchAndHighlight(words) {
        $('p,span').each((index, elem) => {
            var content = $(elem).text();

            if (!content.match(/\w+/)) {
                return;
            }

            words.forEach((word, index) => {
                let searchText = word.name;
                let { bgcolor, color } = colors[index % 6];

                content = replaceAll(content, `[^\\w]${searchText}[^\\w]`, ` <em class="wc-highlight" style="background-color: ${bgcolor}; color: ${color}; margin: 0px 5px;">${searchText}</em> `, true);
            });

            elem.innerHTML = content;
        });
    },

    initHighlights() {
        let self = this;

        chrome.extension.sendRequest({
            'action': 'get',
            'data': {}
        },
        function(resp) {
            if (resp.data && resp.data.length) {
                self.searchAndHighlight(resp.data);
            }
        });
    },

    init: function(config) {
        this.config = config;

        var popup = [
            '<div id="wordcard-main" class="wordcard-main" style="display:none;">',
            '</div>'
        ];
        $('body').prepend(popup);
        this.el = $('#wordcard-main');
        this.bindEvents();

        ga();
        // this.initHighlights();
    }
};

// TODO: host enable
var host = window.location.hostname;

getSyncConfig().then(config => {
    App.init(config);
});