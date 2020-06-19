/**
 * @file bg.js
 * @author solopea@gmail.com
 */

import _ from 'underscore'
import '../../js/lib/backbone.chromestorage'
import { WordList } from '../../js/word'
import Translate from '../../js/translate'
import { WORD_LEVEL } from '../../js/constant/options'
import { getSyncConfig, getUserInfo } from '../../js/common/config'

const browser = window.chrome;

let config;

function msgHandler(req, sender, resp) {
    let action = req.action;

    if (action === 'lookup') {
        console.log('lookup');
        browser.tabs.query({active: true, currentWindow: true}, function(tabs){
            browser.tabs.sendMessage(tabs[0].id, {action: "lookup"}, function(response) {});  
        });
        resp({ msg: 'pass ok' });
    }
}

['onMessage'].forEach((msgType) => {
    browser.runtime[msgType].addListener(msgHandler);
});

chrome.commands.onCommand.addListener(function(command) {
    if (command === 'lookup_in_selection') {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "lookup" }, function() {});
        });    
    }
});

function setup() {
    browser.contextMenus.create({
        title : chrome.i18n.getMessage('extShortName'),
        contexts: ['selection'],
        onclick : function(info, tab) {
            browser.tabs.query({active: true, currentWindow: true}, function(tabs){
                browser.tabs.sendMessage(tabs[0].id, {action: "menuitemclick"}, function(response) {});  
            });
        }
    });
}

function loadConfig() {
    return Promise.all([
        getSyncConfig(),
        getUserInfo()
    ]).then(([conf, userInfo]) => {
        config = conf;

        return {
            config: conf,
            userInfo
        }
    });
}

function notifyTabs(resp) {
    chrome.tabs.query({}, function(tabs) {
        tabs.forEach(({ id }) => {
            chrome.tabs.sendMessage(id, resp, function() {});
        });
    });
}

function init(data) {
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

