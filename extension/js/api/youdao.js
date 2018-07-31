import axios from 'axios'

export const BASE_URL = 'http://dict.youdao.com'

const youdao = axios.create({
    baseURL: BASE_URL
})

youdao.interceptors.response.use(res => res.data, error => error)

export function addToVocabulary(word) {
    return youdao('/wordbook/ajax', {
      params: {
        q: word,
        action: 'addword',
        date: encodeURI(new Date().toString()),
        le: 'eng'
      }
    })
}

export function delInVocabulary(word) {
    return youdao(`/wordbook/ajax`, {
      params: {
        q: word,
        action: 'delword',
        date: encodeURI(new Date().toString())
      }
    })
}

export function getUpdateInfo() {
    return cdn(`/dadda-update-info.json?t=${Date.now()}`)
}
