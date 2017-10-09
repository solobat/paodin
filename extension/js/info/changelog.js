let langZh = [
    {
        version: 'v2.0.2',
        detail: "设置页新增单词编辑功能； <br /> 一些UI样式优化。"
    },
    {
        version: 'v2.0.1',
        detail: "标签添加<em>自动提示</em>功能; 修正level筛选逻辑; <br /> 一些UI样式优化。"
    },
    {
        version: 'v2.0',
        detail: "全新上阵"
    }
];

// TODO: translate
let langEn = [

];

let results;

if (chrome.i18n.getUILanguage().indexOf('zh') > -1) {
    results = langZh;
} else {
    results = langEn;
}

export default results;