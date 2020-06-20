<template>
  <div class="topbar">
    <header class="main-header">
      <div class="container">
        <a href="https://paodin.app" target="_blank" class="logo"></a>
        <nav class="main-nav">
          <ul class="nav-list">
            <li class="nav-item">
              <router-link to="/">{{$i18n("options_tab_general")}}</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/help">{{$i18n("options_tab_help")}}</router-link>
            </li>
          </ul>
        </nav>
        <nav class="right-nav">
          <ul class="right-nav-list">
            <li v-if="!loggedIn">
              <router-link to="/login" class="link-btn">{{$i18n('login')}}</router-link>
            </li>
            <li v-if="!loggedIn">
              <router-link to="/register" class="link-btn">{{$i18n('register')}}</router-link>
            </li>
            <li v-else>
              <a-dropdown :trigger="['click']" overlayClassName="user-layer">
                <span class="btn-trigger">{{user.username}}
                  <a-icon type="caret-down" />
                </span>
                <a-menu slot="overlay">
                  <a-menu-item v-if="shouldMigrate">
                    <router-link to="/migration">{{$i18n("data_migration")}}</router-link>
                  </a-menu-item>
                  <a-menu-item>
                    <div @click="onLogoutClick">{{$i18n("logout")}}</div>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </li>
            <li>
              <a-dropdown overlayClassName="mpqrcode-layer">
                <span class="btn-trigger">
                  <img class="icon-mp" src="/img/mp.svg" alt="">
                </span>
                <div class="mpqrcode-wrap " slot="overlay">
                  <img class="mp-qrcode" src="/img/mp_qrcode.jpg" alt="">
                </div>
              </a-dropdown>
            </li>
            <li>
              <a href="https://paodin.app" target="_blank">
                <img src="/img/pc.svg" class="icon-pc" title="https://paodin.app" alt="https://paodin.app">
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { migrationHelper } from '@/js/helper/migration.helper'

export default {
  name: "TopBar",

  data() {
    return {
      shouldMigrate: false
    }
  },

  computed: {
    ...mapGetters('account', ['loggedIn', 'user', 'uid'])
  },

  methods: {
    ...mapActions('account', ['logout']),

    onLogoutClick() {
      this.logout().then(() => {
        this.$message.success(this.$i18n('logout_ok'));
      })
    },

    loadData() {
      migrationHelper.shouldMigrate().then(shouldMigrate => {
        this.shouldMigrate = shouldMigrate
      })
    }
  },

  mounted() {
    this.loadData();
  }
};
</script>

<style lang="scss" scoped>
@import "../../../styles/scss/theme.scss";

.topbar {
  height: 60px;
  background: $background-color-light;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.main-header {
  position: relative;
  height: 60px;

  .container {
    display: flex;
    align-items: center;
    margin: 0 auto;
    width: 960px;
    height: 60px;
  }

  .logo {
    background: url('/img/icon.png') no-repeat center center;
    background-size: 40px 40px;
    width: 40px;
    height: 40px;
  }

  a {
    text-decoration: none;
    color: $color-deep;

    &:hover {
      color: $color-primary;
    }
  }

  .router-link-exact-active {
    color: $color-primary;
  }

  ul {
    list-style: none;
  }

  .main-nav {
    flex: 1;
  }

  .nav-list {
    display: flex;
    height: 40px;
    align-items: center;
    margin-left: 20px;

    .nav-item {
      padding: 0 10px;
    }
  }

  .right-nav-list {
    display: flex;
    align-items: center;
    height: 40px;

    li {
      margin-left: 10px;
    }

    .link-btn {
      margin-left: 10px;
    }
  }

  .github-btn-wrap {
    display: flex;
    align-items: center;
  }
}

.btn-trigger {
  display: flex;
  align-items: center;
  padding: 5px 8px;
  cursor: pointer;

  &:hover {
    color: $color-deep;
  }

  .anticon {
    position: relative;
    top: 1px;
    margin-left: 4px;
    color: $color-light;
    font-size: 12px;
  }
}

.mpqrcode-wrap {
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  outline: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.mp-qrcode {
  width: 150px;
}

.icon-mp,
.icon-pc {
  width: 20px;
  height: 20px;
}
</style>
<style lang="scss">
.user-layer {
  width: 120px;
}

.mpqrcode-layer {
  width: 180px;
  text-align: center;
}
</style>