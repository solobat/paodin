<template>
  <div class="text-panel">
    <div>
      <a
        v-if="i18n.lang === 'zh-CN'"
        href="http://list.youku.com/albumlist/show/id_51352320.html"
        target="_blank"
      >单词小卡片视频专辑</a>
      <a href="https://t.me/okwordcard" style="margin-left: 12px;" target="_blank">Telegram</a>
      <a
        v-if="i18n.lang === 'zh-CN'"
        href="http://bbs.oksteward.com"
        style="margin-left: 12px;"
        target="_blank"
      >论坛</a>
    </div>
    <div v-if="i18n.lang === 'zh-CN'">
      <span>QQ群: 314501729</span>
      <hr />此扩展可以帮助你在访问英文网站过程中，遇到不认识的单词，使用
      <em>右键菜单</em>查询：
      <br />
      <br />如果你想更方便地查词，可以在设置页设置
      <em>双击取词</em> ：
      <br />同时，通过点击左下角的
      <i class="el-icon-star-on"></i>
      按钮将单词、释义、例句保存成单词小卡片，
      你还可以为单词打上各种
      <em>标签</em> ，以方便筛选复习.
      <br />收集的单词可以在设置/单词列表中查看并编辑
      <br />你还可以筛选中不同类型/状态的单词
      <br />并记忆或测验它们
      <br />如果你还在使用其它背单词app，那你还可以将这里收集到的单词导出成
      <em>csv</em> 文件，然后导入app中。
    </div>
  </div>
</template>

<script>
export default {
  props: ['i18n']
};
</script>

<style>
</style>