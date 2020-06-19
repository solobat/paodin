
export function getDefaultForm() {
  return {
    username: '',
    password: "",
    repassword: "",
    email: '',
  }
}

export function getFormRules(vm) {
  return {
    username: [{ required: true, message: vm.$i18n('enter_username') }],
    email: [{ type: 'email', message: vm.$i18n('not_email') }],
    password: [{ required: true, message: vm.$i18n('enter_password') }],
    repassword: [
      { required: true, message: vm.$i18n('reenter_password') },
      {
        validator: (rule, value, callback) => {
          if (value && value === vm.form.password) {
            callback();
          } else {
            callback(new Error(vm.$i18n('diff_password')));
          }
        }
      }
    ],
  }
}