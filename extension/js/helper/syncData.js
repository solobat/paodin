import API from '../api'

let final = [];

const syncHelper = {
    async makeWordsSynced(newWords = []) {
        const words = newWords.map(word => {
            return { id: word.id, name: word.name, synced: true };
        });
        return this.batchUpdate(words);
    },

    partial(list, chunk = 5) {
        let i, j, parts = [];

        for (i = 0,j = list.length; i < j; i += chunk) {
            parts.push(list.slice(i, i + chunk));
        }

        return parts;
    },

    async getShouldSyncWords(filterFn) {
        const words = await this.loadWords();
        const newWords = filterFn ? words.filter(filterFn) : words;

        if (newWords.length) {
            return JSON.parse(JSON.stringify(newWords))
        } else {
            return;
        }
    },

    async batchSync(syncMethod, parts) {
        return parts.reduce((tasks, part) => {
            return tasks.then(results => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(syncMethod(part).then((result) => {
                            final.push(result);
                            const percent = (final.length / parts.length * 100).toFixed(2);

                            this.syncPorcess = Number(percent);
                        }));
                    }, 200);
                });
            }).catch(console.error);
        }, Promise.resolve());
    },

    async syncToCloud(syncMethod, filterFn, chunk) {
        const list = await this.getShouldSyncWords(filterFn);

        if (list) {
            final = [];

            const parts = this.partial(list, chunk);

            this.syncing = true;

            try {
                const result = await this.batchSync(syncMethod, parts);
                
                return list;
            } catch (error) {
                console.log(error);
                this.notice('同步失败，请稍后再试，或去论坛反馈', 'error');
            } finally {
                this.syncing = false;
            }
        } else {
            this.notice('没有需要同步的单词了.', 'warning');
        }
    },

    async syncToMinapp() {
        const userData = this.getUserData();
        const syncMethod = (part) => {
            return API.minapp.sync(userData.userId, part);
        };
        const filterFn = word => !word.synced;
        const syncedList = await this.syncToCloud(syncMethod, filterFn, 5);
        const resp = await this.makeWordsSynced(syncedList);

        this.notice('最新单词已经成功同步到单词小卡片小程序!', 'success');
    },

    async syncToShanbay() {
        const syncMethod = async (part) => {
            const word = part[0].name;
            const { data } = await API.shanbay.translate(word);

            return API.shanbay.addToVocabulary(data.id);
        };

        await this.syncToCloud(syncMethod, null, 1);
        this.notice('单词已经全部同步到扇贝!', 'success');
    },

    shouldSyncToShanbay() {
        chrome.cookies.get({ url: 'http://www.shanbay.com', name: 'auth_token' }, cookie => {
            if (cookie) {
                this.syncToShanbay();
            } else {
                if (!this.isBg) {
                    chrome.tabs.create({ url: 'https://www.shanbay.com/web/account/login' })
                }
            }
        })
    },

    async syncToYoudao() {
        const syncMethod = async (part) => {
            const word = part[0].name;

            return API.youdao.addToVocabulary(word);
        };

        await this.syncToCloud(syncMethod, null, 1);
        this.notice('单词已经全部同步到有道!', 'success');
    },

    shouldSyncToYoudao() {
        const url = 'http://dict.youdao.com';
        const loginURL = 'http://account.youdao.com/login?service=dict&back_url=http://dict.youdao.com/wordbook/wordlist%3Fkeyfrom%3Dnull';

        chrome.cookies.get({ url, name: 'DICT_SESS' }, async cookie => {
            if (cookie) {
                this.syncToYoudao();
            } else {
                if (!this.isBg) {
                    chrome.tabs.create({ url: loginURL })
                }
            }
        })
    }
}

export const syncMixin = {
    data() {
        return {
            syncPorcess: 0,
            syncing: false,
        }
    },

    methods: {
        notice(msg, type) {
            this.$message[type](msg);
        },
        getUserData() {
            return {
                userId: this.userInfo.id,
                openId: this.userInfo.openid
            };
        },
        batchUpdate(words) {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: 'batchUpdate',
                    data: words
                }, ({ data }) => {
                    resolve(data);
                });
            });
        },
        ...syncHelper
    }
};

export function getSyncHelper4Bg(wordsHelper, userInfo) {
    return {
        isBg: true,
        autoSyncInterval: 60 * 60 * 1000,
        userInfo,
        syncTimer: 0,
        loadWords() {
            return Promise.resolve(wordsHelper.getWords());
        },
        getUserData() {
            return {
                userId: this.userInfo.id,
                openId: this.userInfo.openid
            };
        },
        notice(msg) {
            console.log(msg);
        },
        batchUpdate(words) {
            wordsHelper.batchUpdate(words);

            return Promise.resolve(true);
        },
        autoSyncIfNeeded(config) {
            if (this.userInfo && config.autoSync) {
                this.startAutoSync();
            } else {
                this.stopAutoSync();
            }
        },

        startAutoSync() {
            clearInterval(this.syncTimer);

            this.syncTimer = setInterval(() => {
                this.syncToMinapp();
            }, this.autoSyncInterval);
            console.log('syncing to miniapp every hour...');
        },

        stopAutoSync() {
            clearInterval(this.syncTimer);
            console.log('stop auto sync to minapp');
        },
        ...syncHelper
    };
}