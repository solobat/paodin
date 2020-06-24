import AV from 'leancloud-storage'

function initAV() {
    const appId = '9q9kRvjIW5lKVkWI4lgUFeoa-gzGzoHsz';
    const appKey = 'wuqSe6vGYqVlUKQEEeGFGi5R';
    const serverURL = 'https://api-paodin.nohabitlife.com';
    AV.init({ appId, appKey, serverURL });
}

initAV();