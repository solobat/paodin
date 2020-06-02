const stewardUrl = 'https://chrome.google.com/webstore/detail/dnkhdiodfglfckibnfcjbgddcgjgkacd';

let langZh = [
    {
        version: 'v3.0.2',
        detail: `
            Bug 修复。
        `
    },
    {
        version: 'v3.0.1',
        detail: `
            Bug 修复。
        `
    },
    {
        version: 'v3.0.0',
        detail: `
            项目重构优化；<br>
            添加句子功能。 
        `
    },
    {
        version: 'v2.4.2',
        detail: `
            Bug 修复。
        `
    },
    {
        version: 'v2.4.1',
        detail: `
            缓存微信小程序的关联状态；<br>
            支持自动同步到小程序，默认开启。
        `
    },
    {
        version: 'v2.4',
        detail: `
            添加新页面背单词的方式；<br>
            ESC 关闭查词弹窗。
        `
    },
    {
        version: 'v2.3.5.1',
        detail: `
            放开单词同步的语言区限制 
        `
    },
    {
        version: 'v2.3.5',
        detail: `
            根据域名自动保存 lang pair 记录;<br>
            点击高亮弹出翻译框，使用 cmd/ctrl + 点击移除高亮;<br>
            一些优化及 bug 修复。
        `
    },
    {
        version: 'v2.3.4',
        detail: `
            支持自动探测网站语言;<br>
            国际化。
        `
    },
    {
        version: 'v2.3.3',
        detail: `
            支持多语言查词，自动归类单词本，以及单词本筛选;<br>
            修复某个网站样式污染问题。
        `
    },
    {
        version: 'v2.3.2',
        detail: `
            新增保存到扇贝单词本;<br>
            新增保存到有道单词本;<br>
            单词列表添加词根链接。
        `
    },
    {
        version: 'v2.3.1',
        detail: `
            记录单词的网页以及页面位置；<br>
            支持批量删除选中的单词；<br>
            点击 icon 可更改同步状态；<br>
            支持快捷键查询选中的单词。
        `
    },
    {
        version: 'v2.3',
        detail: `
            引入多翻译引擎，目前支持 Google / Baidu，默认 Google，可以选项页更改；<br>
            支持单词<em>同步</em>到小程序版单词小卡片，具体操作在 选项 -> 高级 -> 云同步。
        `
    },
    {
        version: 'v2.2.8',
        detail: `
            修复部分网站 star 图标显示错误的问题;<br>
            背单词卡片字体大小可设置;<br>
            支持仅导出单词本身。
        `
    },
    {
        version: 'v2.2.7',
        detail: `添加 JSON 格式导出下载`
    },
    {
        version: 'v2.2.6',
        detail: `
            点一个释义就删除;<br>
            ctrl + 鼠标选中弹出查词;<br>
            部分情况下的iframe 兼容处理
        `
    },
    {
        version: 'v2.2.5',
        detail: `
            单词库最大容量提醒;<br>
            兼容 简悦 类阅读器.
        `
    },
    {
        version: 'v2.2.4',
        detail: `
            双击查词框title，可收藏单词；<br>
            修复单词无法实际删除的bug；<br>
            一些说明。
        `
    },
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

let langEn = [
    {
        version: 'v3.0.2',
        detail: `
            Bugfix. 
        `
    },
    {
        version: 'v3.0.1',
        detail: `
            Bugfix. 
        `
    },
    {
        version: 'v3.0.0',
        detail: `
            Refactoring and optimization,<br>
            Add sentences features. 
        `
    },
    {
        version: 'v2.4.2',
        detail: `
            Bugfix. 
        `
    },
    {
        version: 'v2.4.1',
        detail: `
            Update. 
        `
    },
    {
        version: 'v2.4',
        detail: `
            Add a new page to back the word; <br>
            Press ESC to close the search window. 
        `
    },
    {
        version: 'v2.3.5.1',
        detail: `
            Add word sync for zh-CN users.
        `
    },
    {
        version: 'v2.3.5',
        detail: `
            Automatically save lang pair records based on host;<br>
            Click on the highlight will show popup box and use cmd/ctrl + click to remove the highlight;<br>
            Some optimizations and bug fixes.
        `
    },
    {
        version: 'v2.3.4',
        detail: `
            Support automatic detection of website language;<br>
            i18n.
        `
    },
    {
         version: 'v2.3.3',
         detail: `
            Support multi-language search, automatic categorization of vocabularies, and can filter by vocabulary;<br>
            Fix a site style pollution issue.
         `
     }
];

let results;

if (chrome.i18n.getUILanguage().indexOf('zh') > -1) {
    results = langZh;
} else {
    results = langEn;
}

export default results;