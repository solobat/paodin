const stewardUrl = 'https://chrome.google.com/webstore/detail/dnkhdiodfglfckibnfcjbgddcgjgkacd';

let langZh = [
    {
        version: 'v2.2.3',
        detail: `
            更好的配合steward扩展;<br>
            修复查词时定义不能删除的问题
        `
    },
    {
        version: 'v2.2.2',
        detail: '修改外部API'
    },
    {
        version: 'v2.2.1',
        detail: `
            将接口暴露给其它扩展，使比如<a href="${stewardUrl}" target="_blank">Steward</a>这样的扩展能与之交互;
            <br><a href="http://v.youku.com/v_show/id_XMzE2NDA4MzY1Ng==.html?spm=a2h3j.8428770.3416059.1" target="_blank">更新视频</a>
        `
    },
    {
        version: 'v2.2',
        detail: `新增omnibox(地址栏)功能，keyword为<em>wd</em>，通过输入level或tag或英文字符以空格或,分割来查询;
            <br>设置更新后将即时生效；<br>其它一些改进.
            <br><a href="http://v.youku.com/v_show/id_XMzE2MTg5OTc4NA==.html?spm=a2h3j.8428770.3416059.1" target="_blank">更新视频</a>
        `
    },
    {
        version: 'v2.1.8',
        detail: "可配置成将相关句子<em>自动剪裁</em>为<em>3</em>句，默认开启；<br />优化句子范围查找逻辑。"
    },
    {
        version: 'v2.1.7',
        detail: "背单词时在例句中高亮单词; <br />为设置页面所有tab设置快捷键，为alt + [1 - 8]; <br />bug修复及一些改进。"
    },
    {
        version: 'v2.1.6',
        detail: "优化双击取词；<br />修复bug"
    },
    {
        version: 'v2.1.5',
        detail: "添加常用词根表，更方便单词记忆; <br />修复bug及体验优化"
    },
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