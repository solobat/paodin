import browser from 'webextension-polyfill'

const version = '2.3';

export const defaultConfig = {
    enableUrls: [],
    disableUrls: [],
    urlMode: 'enableUrls',
    dblclick2trigger: true,
    withCtrlOrCmd: false,
    autocut: true,
    sentenceNum: 3,
    alertOnOmniboxInputEntered: true,
    cardFontSize: 'normal',
    engine: 'google',
    version
}

// merge config && save
export function getSyncConfig() {
    return new Promise((resolve, reject) => {
        browser.storage.sync.get('config', function({ config }) {
            if (!config) {
                config = defaultConfig;
            } else {
                config = Object.assign({}, defaultConfig, config);
            }

            resolve(config);
        });
    }).then(config => {
        browser.storage.sync.set({
            config
        }, function() {});

        return config;
    });
}