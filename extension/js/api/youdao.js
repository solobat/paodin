import axios from 'axios'
import md5 from 'blueimp-md5'
import { sha256 } from 'js-sha256'
import { getSyncConfig } from '../common/config'

export default {
  translate
}

function getApiConfig() {
  return getSyncConfig().then(config => {
    return {
      appKey: config.ydAppKey,
      key: config.ydAppSecret
    }
  })
}

function truncate(q){
  const len = q.length;

  if (len <= 20) {
    return q;
  }
  return q.substring(0, 10) + len + q.substring(len - 10, len);
}

function getSign(appKey, query, salt, curTime, key) {
  const str = appKey + truncate(query) + salt + curTime + key;

  return sha256(str)
}

function respHandler(data) {
  console.log("respHandler -> data", data)
  if ( data ) {
    if (data.errorCode == 0) {
      const obj = {
        text: data.query,
        response: data ,
        linkToResult: data.webdict.url
      };

      try {
        const basic = data.basic;

        obj.dict = basic.explains;
        obj.phonetic = [
          {
            name: 'en-UK',
            value: basic['uk-phonetic'],
            audioUrl: (basic['uk-speech'] || '').replace('http', 'https')
          },
          {
            name: 'en-US',
            value: basic['us-phonetic'],
            audioUrl: (basic['us-speech'] || '').replace('http', 'https')
          }
        ];
      }
      catch ( e ) {}

      try {
        obj.result = data.translation;
      }
      catch ( e ) {
      }

      return obj
    }
  }
}

function translate(attrs) {
  return getApiConfig().then(config => {
    if (config && config.appKey && config.key) {
      const { appKey, key } = config
      const { text, from, to } = attrs
      const query = text
      const salt = (new Date).getTime();
      const curTime = Math.round(new Date().getTime() / 1000);
      const sign = getSign(appKey, query, salt, curTime, key)

      return axios.get('https://openapi.youdao.com/api', {
        params: {
          q: query, appKey, salt, from,
          to, sign, signType: 'v3', curtime: curTime
        }
      }).then(resp => {
        return respHandler(resp.data)
      })
    } else {
      throw new Error('api key/secret is required')
    }
  })
}
