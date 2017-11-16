/**
 * @file api.js
 * @author solopea@gmail.com
 */

export default {
    translate: 'https://fanyi.youdao.com/openapi.do?' +
    'keyfrom=mineword&key=1362458147&type=data&doctype=json&version=1.1&q=',
    audio: [
        'https://dict.youdao.com/dictvoice?audio={{word}}'
    ],
    img: 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q={{word}}'
};
