let langZh = [
    {
        version: 'v2.1.4',
        detail: "bugfix"
    },
    {
        version: 'v2.1.3',
        detail: "bugfix"
    },
    {
        version: 'v2.1.2',
        detail: "根据网站自动添加最常使用的标签; <br /> bug修复."
    },
    {
        version: 'v2.1.1',
        detail: "自动按<em>cocoa 20000</em>词频添加标签;<br />样式优化。"
    },
    {
        version: 'v2.1',
        detail: "添加背单词功能"
    },
    {
        version: 'v2.0.3',
        detail: "查词时带出已有单词的tags以及释义; <br />一些交互及UI样式优化。"
    },
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