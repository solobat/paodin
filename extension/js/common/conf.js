/**
 * @file conf.js
 * @author solopea@gmail.com
 */

const chrome = window.browser;
// get user's options
let options = {
    autoplay: true,
    timetoclose: 3000,
    onlyen: true,
    noinput: true,
    speakletter: false
};

export function getOptions() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('options', function(data) {
            $.extend(options, data.options);
        });
    });
}
