import axios from 'axios'

export const BASE_URL = 'http://www.shanbay.com/api/v1'

const shanbay = axios.create({
    baseURL: BASE_URL
})

shanbay.interceptors.response.use(
    res => res.data,
    error => {
      return Promise.reject(error)
    }
)

export function translate(word) {
    return shanbay(`/bdc/search/?word=${word}`)
}

export function addToVocabulary(id) {
    return shanbay.post('/bdc/learning/', {
      content_type: 'vocabulary',
      id
    })
}

export function delInVocabulary(learningId) {
    return shanbay.put(`/bdc/learning/${learningId}`, {
      retention: 1
    })
}