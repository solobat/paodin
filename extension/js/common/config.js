import browser from 'webextension-polyfill'

const manifest = chrome.runtime.getManifest();
const version = manifest.version;

export const defaultConfig = {
    enableUrls: [],
    disableUrls: [],
    urlMode: 'enableUrls',
    dblclick2trigger: false,
    withCtrlOrCmd: false,
    autocut: true,
    sentenceNum: 3,
    alertOnOmniboxInputEntered: true,
    version
}

// merge config && save
export function getSyncConfig() {
    return browser.storage.sync.get('config').then(({ config }) => {
        if (!config) {
            config = defaultConfig;
        } else {
            config = Object.assign({}, defaultConfig, config);
        }

        browser.storage.sync.set({
            config
        });

        return config;
    });
}