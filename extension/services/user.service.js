import AV from 'leancloud-storage'

export const userService = {
  register,
  login,
  logout
}

function register(attrs) {
  const { username, password, email, } = attrs 
  const user = new AV.User();

  user.setUsername(username)
  user.setPassword(password)
  if (email) {
    user.setEmail(email)
  }

  return user.signUp()
}

export function login(username, password) {
  return AV.User.logIn(username, password)
}

export function logout() {
  return AV.User.logOut()
}