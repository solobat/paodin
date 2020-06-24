<template>
  <div style="margin: 15px;">
    <div class="panel-content" style="padding: 10px 0;">
      <el-button type="primary" @click="handleExportClick('csv')">CSV {{$i18n("options_advanced_export")}}</el-button>
      <el-button type="primary" @click="handleExportClick('json')">JSON {{$i18n("options_advanced_export")}}</el-button>
      <el-button
        type="primary"
        @click="handleExportClick('words')"
      >{{$i18n("options_advanced_onlywords")}} {{$i18n("options_advanced_export")}}</el-button>
    </div>
    <el-collapse class="collapse" v-model="activeSyncNames" accordion>
      <el-collapse-item name="1" title="同步到小程序">
        <div>「庖丁解语」小程序用户可以使用此功能，账号密码可以在「我的」--> 「账户」设置</div>
        <el-form ref="paodinMpForm" :model="paodinMpForm" :inline="true" :rules="paodinMpRules" v-if="!user">
          <el-form-item label="账号" prop="username">
            <el-input
              v-model="paodinMpForm.username"
              placeholder="请输入账号"
              style="width: 150px;"
            ></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password"
              v-model="paodinMpForm.password"
              placeholder="请输入密码"
              style="width: 150px;"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onPaodinLoginClick">登录</el-button>
          </el-form-item>
        </el-form>
        <div v-if="user">
          <div class="paodin-uname">{{ user.username }}</div>
          <div>
            <el-button type="primary" @click="syncToPaodin">开始同步</el-button>
            <el-button @click="logoutPaodin">登出</el-button>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item title="同步到单词小卡片" name="2">
        <div>「单词小卡片」小程序用户可以使用此功能，用户身份码从小程序个人头像点击获取</div>
        <el-form ref="minappForm" :model="minappForm" :inline="true" :rules="minappRules">
          <el-row>
            <el-col :span="16">
              <el-form-item v-if="!userInfo" label="用户身份" prop="userKey">
                <el-input
                  v-model="minappForm.userKey"
                  placeholder="请输入"
                  :disabled="hasMinappChecked"
                  style="width: 400px;"
                ></el-input>
              </el-form-item>
              <el-form-item v-else label="账号">
                <el-input :value="userInfo.nickname" :disabled="true" style="width: 400px;"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-button
                v-if="!userInfo"
                type="primary"
                @click.native="handleUserCheck('minapp')"
              >检查</el-button>
              <template v-if="!syncing">
                <el-button
                  v-if="userInfo"
                  type="primary"
                  @click.native="handleSyncClick('minapp')"
                >开始同步</el-button>
                <el-button v-if="userInfo" type="primary" @click.native="userInfo = null">取消</el-button>
              </template>
              <el-progress v-else :text-inside="true" :stroke-width="18" :percentage="syncPorcess"></el-progress>
            </el-col>
          </el-row>
        </el-form>
      </el-collapse-item>
      <el-collapse-item name="3" title="同步到有道">
        <div>使用此功能前，需要先登录有道网站</div>
        <el-button v-if="!syncing" type="primary" @click.native="handleSyncClick('youdao')">开始同步</el-button>
        <el-progress v-else :text-inside="true" :stroke-width="18" :percentage="syncPorcess"></el-progress>
      </el-collapse-item>
      <el-collapse-item name="4" title="同步到扇贝">
        <div>使用此功能前，需要先登录扇贝网站</div>
        <el-button v-if="!syncing" type="primary" @click.native="handleSyncClick('shanbay')">开始同步</el-button>
        <el-progress v-else :text-inside="true" :stroke-width="18" :percentage="syncPorcess"></el-progress>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import API from "@/js/api";
import WordsMixin from "@/js/mixins/words.mixin";
import * as Validator from "@/js/common/validatorHelper";
import { syncMixin } from "@/js/helper/syncData";
import { userService } from '@/services/user.service'
import { migrationHelper } from '@/js/helper/migration.helper'

export default {
  props: ["i18n", "config", "userInfo", "user"],

  mixins: [syncMixin, WordsMixin],

  data() {
    return {
      activeSyncNames: [],
      paodinMpForm: {
        username: '',
        password: ''
      },
      paodinMpRules: {
        username: Validator.text("username"),
        password: Validator.text("password"),
      },
      minappForm: {
        userKey: ""
      },
      minappRules: {
        userKey: Validator.text("userKey")
      },
      hasMinappChecked: false
    };
  },

  methods: {
    handleExportClick(format) {
      this.loadWords().then(words => this.exportWords(words, format));
    },

    download(url, name) {
      const downloadAnchorNode = document.createElement("a");

      downloadAnchorNode.setAttribute("href", url);
      downloadAnchorNode.setAttribute("download", name);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },

    downloadAsJson(exportObj, exportName) {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(exportObj));

      this.download(dataStr, exportName + ".json");
    },

    downloadAsCsv(words) {
      let csvContent = "data:text/csv;charset=utf-8,";

      words.forEach(({ name, trans = [], sentence, tags = [] }, index) => {
        let wordString = `${name};${trans.join(" ")};${sentence};${tags.join(
          ";"
        )}`;

        csvContent += index < words.length ? wordString + "\n" : wordString;
      });

      let encodedUri = encodeURI(csvContent);

      this.download(encodedUri, "wordcard-words.csv");
    },

    downloadAsText(words = []) {
      let textContent = "data:text/plain;charset=utf-8,";
      const data = words.map(word => word.name);

      let encodedUri = encodeURI(`${textContent}${data.join("\n")}`);

      this.download(encodedUri, "wordcard-words.txt");
    },

    exportWords(words, format) {
      if (!words.length) {
        this.$message.warning(this.$i18n('options_msg_nowords_toexport'));

        return;
      }

      const obj = JSON.parse(JSON.stringify(words));

      if (format === "csv") {
        this.downloadAsCsv(obj);
      } else if (format === "json") {
        this.downloadAsJson(obj, "wordcard-words");
      } else if (format === "words") {
        this.downloadAsText(obj);
      }
    },

    async handleUserCheck(type) {
      this.$refs.minappForm.validate(async valid => {
        if (valid) {
          const resp = await API.minapp.checkUser(this.minappForm.userKey);

          if (resp && resp.code === 0 && resp.data) {
            this.userInfo = resp.data;
            this.$message.success(`身份验证成功，Hi, ${resp.data.nickname}`);
            saveUserInfo(resp.data);
          } else {
            this.$message.error("查找不到匹配的用户!");
          }
        }
      });
    },

    async shouldSyncToMinapp() {
      this.$refs.minappForm.validate(async valid => {
        if (valid) {
          this.syncToMinapp();
        }
      });
    },

    handleSyncClick(type) {
      if (type === "minapp") {
        this.shouldSyncToMinapp();
      } else if (type === "shanbay") {
        this.shouldSyncToShanbay();
      } else if (type === "youdao") {
        this.shouldSyncToYoudao();
      }
    },

    loginToPaodin() {
      const { username, password } = this.paodinMpForm
      
      return userService.login(username, password).then((user) => {
        this.user = user
        this.$message.success('登录成功')
      })
    },

    syncToPaodin() {
      migrationHelper.shouldMigrate().then(should => {
        if (should) {
          migrationHelper.migrate().then(() => {
            this.$message.success('同步成功')
          })
        } else {
          this.$message.info('没有要同步的')
        }
      })
    },

    logoutPaodin() {
      return userService.logout().then(() => {
        this.user = null;
        this.$message.success('登出成功')
      })
    },

    onPaodinLoginClick() {
      this.$refs.paodinMpForm.validate(async valid => {
        if (valid) {
          this.loginToPaodin()
        }
      });
    }
  }
};
</script>

<style lang="scss">
.collapse {
  margin-top: 10px;
  
  .el-collapse-item__header,
  .el-collapse-item__wrap {
    background: inherit;
  }
}
</style>