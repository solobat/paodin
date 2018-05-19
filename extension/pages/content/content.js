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
import { isMac, getParameterByName } from '../../js/common/utils'
import { Base64 } from 'js-base64'
import CssSelectorGenerator from 'css-selector-generator'

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

let blockTags = ['LI', 'P', 'DIV', 'BODY'];

function getBlock(node, deep) {
    if (blockTags.indexOf(node.tagName.toUpperCase()) !== -1 || deep === 0) {
        return node;
    } else {
        return getBlock(node.parentElement, deep - 1);
    }
}

function getPosition(selection) {
    const gen = new CssSelectorGenerator();
    const path = gen.getSelector(selection.baseNode.parentElement);
    const offset = [selection.baseOffset, selection.extentOffset];
    const pos = {
        url: window.location.href,
        path,
        offset
    };

    return pos;
}

let menuEvent;
var App = {
    context: window,
    iframeLoaded: false,
    handleTextSelected: function(e) {
        var selection = this.context.getSelection();
        var word = (selection.toString() || '').trim();
        if (!e) {
            console.error('no selection...');
            debugger
        }
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

        const pos = getPosition(selection);

        this.highlight = new Highlight(node, word, this.context);
        this.lookUp(e, word, node, pos);
    },

    autocutSentenceIfNeeded(word, sentence) {
        let { autocut, sentenceNum } = this.config;
        
        if (autocut && sentenceNum > 0) {
            let puncts = sentence.match(/[\.\?!;]/g) || [];
            let arr = sentence.split(/[\.\?!;]/).filter(s => s.trim() !== '').map((s, index) => s.trim() + `${puncts[index] || ''} `);
            let index = arr.findIndex(s => s.indexOf(word) !== -1);
            let left = Math.ceil((sentenceNum - 1) / 2);
            let start = index - left;
            let end = index + ((sentenceNum - 1) - left);

            if (start < 0) {
                start = 0;
                end = sentenceNum - 1;
            } else if (end > (arr.length - 1)) {
                end = arr.length - 1;

                if ((end - (sentenceNum -1)) < 0) {
                    start = 0;
                } else {
                    start = end - (sentenceNum - 1);
                }
            }

            return arr.slice(start, end + 1).join('');
        } else {
            return sentence;
        }
    },

    getSurroundings: function(word, elem) {
        let wordContent = '';
        let upNum = 4;

        if ($(elem).hasClass('wc-highlight')) {
            elem = elem.parentElement;
        }

        elem = getBlock(elem, upNum);

        if (elem !== document) {
            wordContent = elem.innerText;
        }

        return this.autocutSentenceIfNeeded(word, wordContent);
    },

    initIframe() {
        const iframeUrl = chrome.extension.getURL('translate.html');
        var html = `
            <a href="javascript:;" class="wordcard-close"></a>
            <iframe id="wordcard-frame" src="${iframeUrl}" style="max-width: initial;" name="wc-word" width="690" height="370" frameborder="0"></iframe>
        `;

        this.el.html(html);
        this.iframe = $('#wordcard-frame');
    },

    lookUp: function(e, word, node, pos) {
        var x_pos = e.pageX;
        var y_pos = e.pageY;
        var x_posView = e.clientX;
        var y_posView = e.clientY;
        var winWidth = this.context.innerWidth;
        var winHeight = this.context.innerHeight;
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
            host: window.location.hostname,
            engine: this.config.engine,
            pos
        };

        if (!this.iframe) {
            this.initIframe();
        }

        this.el.css({
            height: '370px',
            width: '690px',
            marginLeft: '-345px'
        }).show();
        this.noticeIframe(data);
        this.isOpen = true;
    },

    noticeIframe(data) {
        function notice() {
            var iframeWindow = document.getElementById('wordcard-frame').contentWindow;
            
            iframeWindow.postMessage(data, '*');
        }

        if (!this.iframeLoaded) {
            this.iframe.on('load', () => {
                notice();
                this.iframeLoaded = true;
            });
        } else {
            setTimeout(notice, 25);
        }
    },

    closePopup: function() {
        this.isOpen = false;
        this.el.hide();
    },

    injectStyles(doc) {
        var $head = $(doc).find('head');                

        $head.append(`
            <style>
                .wc-highlight {
                    margin: 0 5px;
                    background-color: yellow;
                    color: black;
                }
            </style>
        `);    
    },

    checkIframes() {
        const self = this;

        $('iframe').each(function() {
            const win = this.contentWindow;
            const doc = this.contentDocument;
            const $iframe = $(this);

            if (!$iframe.hasClass('wordcard-init') && $iframe.is(':visible') 
                && !$(doc).find('#wordcard-main').length) {
                doc.documentElement.addEventListener('contextmenu', function(event) {
                    menuEvent = event;
                    self.context = win;
                }, false);

                self.injectStyles(doc);
                $iframe.addClass('wordcard-init');
            } else {
                console.log('iframe invisible or has wordcard');
            }
        });
    },

    bindEvents: function() {
        var self = this;

        // 选中翻译
        $(document).on('dblclick', function(event) {
            if (self.config.dblclick2trigger) {
                const withCtrlOrCmd = self.config.withCtrlOrCmd;

                if (!withCtrlOrCmd || (withCtrlOrCmd && (isMac ? event.metaKey : event.ctrlKey))) {
                    self.handleTextSelected(event);
                }
            }
        });

        document.documentElement.addEventListener('contextmenu', function(event) {
            menuEvent = event;
            self.context = window;
        }, false);

        window.addEventListener('hashchange', function() {
            setTimeout(function() {
                self.checkIframes();
            }, 5000);
        });

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            let action = request.action;

            if (action === 'menuitemclick') {
                self.handleTextSelected(menuEvent);
            } else if (action === 'config') {
                this.config = request.data;
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

    initHighlight(pos, goto) {
        const node = $(pos.path)[0];
        const range = document.createRange();
        
        range.setStart(node.firstChild, pos.offset[0]);
        range.setEnd(node.firstChild, pos.offset[1]);

        const selectionContents = range.extractContents();
        const elem = document.createElement('em');

        elem.appendChild(selectionContents);
        elem.setAttribute('class', 'wc-highlight');
        range.insertNode(elem);

        if (goto) {
            node.scrollIntoView();
        }
    },

    initHighlights() {
        const tag = getParameterByName('wc_tag');

        if (tag) {
            try {
                const pos = JSON.parse(Base64.decode(tag));

                this.initHighlight(pos, true);
            } catch (error) {
                console.log(error);
            }
        }
    },

    init: function(config) {
        this.config = config;

        var popup = [
            '<div id="wordcard-main" class="wordcard-main" style="display:none;">',
            '</div>'
        ];
        $('html').append(popup);
        this.el = $('#wordcard-main');
        this.bindEvents();
        this.initHighlights();
    }
};

var host = window.location.hostname;

getSyncConfig().then(config => {
    App.init(config);
});