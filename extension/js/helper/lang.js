import storage from '../common/storage'

export const LANG_STORAGE_KEY = 'lang_settings';

export function updateUserLang(host, from, to) {
    return storage.local.get(LANG_STORAGE_KEY, {}).then(settings => {
        settings[host] = {from, to};

        return {
            [LANG_STORAGE_KEY]: settings
        };
    }).then(storage.local.set);
}

export function getUserLang(host) {
    return storage.local.get(LANG_STORAGE_KEY, {}).then(settings => {
        if (settings[host]) {
            return settings[host];
        } else {
            return null;
        }
    });
}