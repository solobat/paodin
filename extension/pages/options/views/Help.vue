<template>
  <div class="text-panel">
    <div>
      <a
        v-if="i18n.lang === 'zh-CN'"
        href="https://paodin.app"
        target="_blank"
      >官网</a>
      <a href="https://t.me/okwordcard" style="margin-left: 12px;" target="_blank">Telegram</a>
      <a
        v-if="i18n.lang === 'zh-CN'"
        href="http://bbs.oksteward.com/?tab=wordcard"
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
      按钮将单词、释义、例句保存到云端，
      你还可以为单词打上各种标签
      <div>
        <div>关注微信公众号(<em>比奇堡沙滩</em>)，获取最新消息</div>
        <img src="http://static.oksteward.com/qrcode_wx_gzh.jpg" alt="微信公众号" class="qrcode">
      </div>
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