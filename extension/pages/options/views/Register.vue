<template>
  <div class="page-register">
    <div class="container">
      <a-tabs default-active-key="1">
        <a-tab-pane key="1" :tab="$i18n('wechat_mp')">
          <div class="register-mp">
            <a-alert :message="$i18n('register_mp_tips')" type="info" />
            <img src="/img/mp_qrcode.jpg" alt="" class="mp-qrcode">
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" :tab="$i18n('register_byuname')">
          <div class="register-byuname">
            <a-alert :message="$i18n('register_byuname_tips')" type="warning" />
            <div class="form-panel">
              <a-form-model
                :model="form"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 10 }"
                @submit="handleSubmit"
                ref="form"
                :rules="rules"
              >
                <a-form-model-item :label="$i18n('username')" prop="username">
                  <a-input v-model="form.username" :placeholder="$i18n('enter_username')"></a-input>
                </a-form-model-item>
                <a-form-model-item :label="$i18n('email')" prop="email">
                  <a-input v-model="form.email" :placeholder="$i18n('enter_email')"></a-input>
                </a-form-model-item>
                <a-form-model-item :label="$i18n('password')" prop="password">
                  <a-input-password v-model="form.password" :placeholder="$i18n('enter_password')"></a-input-password>
                </a-form-model-item>
                <a-form-model-item :label="$i18n('repassword')" prop="repassword">
                  <a-input-password
                    v-model="form.repassword"
                    :placeholder="$i18n('reenter_password')"
                  ></a-input-password>
                </a-form-model-item>
                <a-form-model-item :wrapper-col="{ span: 10, offset: 5 }">
                  <a-button type="primary" html-type="submit" :disabled="submitting">{{$i18n("signup")}}</a-button>
                </a-form-model-item>
              </a-form-model>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import { getDefaultForm, getFormRules } from "./config/register.config";
import { userService } from '../../../services/user.service';

export default {
  name: 'Register',

  data() {
    return {
      submitting: false,
      form: getDefaultForm(),
      rules: getFormRules(this)
    };
  },

  methods: {
    afterRegister() {
      this.$nextTick(() => {
        this.$router.push('/')
      })
    },

    submit() {
      const { username, password, email } = this.form;

      this.submitting = true;
      userService.register({ username, password, email }).then((user) => {
        this.submitting = false;
        this.$message.success(this.$i18n('register_ok'), 1, () => {
          this.$store.dispatch('account/updateUser', user)
          this.afterRegister()
        });
      }).catch((error) => {
        console.log("submit -> error", error)
        this.$message.error(this.$i18n('register_error'))
      })
    },
  
    handleSubmit(e) {
      e.preventDefault();
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submit();
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../styles/scss/theme.scss";

.container {
  width: 960px;
  margin: 40px auto;
  padding: 40px;
  background: #fff;
  border: 1px solid #ededed;
}

.mp-qrcode {
  display: block;  
  margin-top: 10px;
  width: 300px;
}

.form-panel {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ededed;
}
</style>