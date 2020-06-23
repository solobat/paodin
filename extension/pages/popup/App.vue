<template>
  <div id="main" class="main">
    <ul class="menus">
      <li>
        <a href="options.html#/" target="_blank">
          <img src="/img/icon.png" alt />
          <span>{{$i18n("popup_item_settings")}}</span>
        </a>
      </li>
      <li class="menu-item">
        <a href="https://paodin.app/" target="_blank">
          <img src="/img/pc.svg" alt />
          <span>{{$i18n("popup_item_website")}}</span>
        </a>
      </li>
      <li>
        <a href="options.html#/help" target="_blank">
          <img src="/img/help.png" alt />
          <span>{{$i18n("popup_item_help")}}</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>

export default {
  data() {
    return {
    };
  }
};
</script>

<style lang="scss">
@import "../../../node_modules/normalize.css/normalize.css";

body {
  margin: 0;
  padding: 0;

  user-select: none;
  box-sizing: border-box;

  * {
    box-sizing: inherit;
  }
}

a {
  text-decoration: none;

  &:active,
  &:focus,
  &:hover,
  &:visited,
  &:link {
    color: #333;
  }
}

li {
  list-style: none;

  :focus {
    outline: none;
  }
}

.main {
  padding: 0px 12px;
  width: 250px;
}

.menus {
  margin: 12px 0;
  padding: 0;
  border-radius: 2px;

  li {
    padding: 10px 0px 10px 15px;
    cursor: pointer;

    &:hover {
      background-color: #ece7df;
    }
  }

  a {
    display: flex;
    align-items: center;
  }

  img {
    margin-right: 5px;
    width: 20px;
    height: 20px;
  }
}
</style>