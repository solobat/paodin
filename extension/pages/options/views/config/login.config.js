
export function getDefaultForm() {
  return {
    username: '',
    password: ""
  }
}

export function getFormRules(vm) {
  return {
    username: [{ required: true, message: vm.$i18n('enter_username') }],
    password: [{ required: true, message: vm.$i18n('enter_password') }],
  }
}