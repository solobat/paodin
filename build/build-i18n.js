const i18n = require('../extension/assets/index-build.js')
const glob = require('glob')
const fs = require('fs')

const paths = [
  './extension/{components,pages,js}/**/*{.js,.vue}',
  './extension/*{.js,.vue}'
]

let keys = {}
let total = 0
let totalUnique = 0

let toParseNumber = 0
const reg = /\$i18n\(['"](.*?)['"][),]/g
paths.forEach(p => {
  glob.sync(p).forEach(file => {
    ++toParseNumber
    fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
      console.log('file:', file)
      if (err) {
        console.error(err)
        return
      }
      for (let match = reg.exec(data); match; match = reg.exec(data)) {
        let text = match[1].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\')
        ++total
        if (!(text in keys)) {
          ++totalUnique
          keys[text] = 0
        }
      }
      if (--toParseNumber == 0) {
        onParse()
      }
    })
  })
})

function onParse() {
  console.log(`----------------------------------------
  find: ${total}, unique: ${totalUnique}
  `)
  debugger
  for (let key in keys) {
    if (!i18n.en[key]) {
      i18n.en[key] = { "message": key }
      console.warn(`no en key: ${key}`)
    }
  }
  for (let locale in i18n) {
    let data = i18n[locale]

    for (let key in keys) {
      if (!(key in data)) {
        data[key] = {"message": ""}
      }
      if (data[key]) {
        ++keys[key]
      }
    }

    for (let key in data) {
      if (!(key in keys) && !key.startsWith('ext')) {
        console.info(`delete: ${locale} ${key}`)
        delete data[key]
      }
    }
    fs.writeFile(`./extension/_locales/${locale}/messages.json`, JSON.stringify(data, null, 2) + '\n', err => {
      err && console.error(err)
    })
  }

  console.info('\nfind not tranlsate msg...\n')
  for (let key in keys) {
    if (keys[key] === 0) {
      console.warn(`nothing: ${key}`)
    }
  }
}