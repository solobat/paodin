import browser from 'webextension-polyfill'
import { wordsHelper } from '@/js/collection/word.collection'
import { list as getSentences } from '@/server/controller/sentenceController'
import { wordService } from '@/services/word.service'
import { sentenceService } from '@/services/sentence.service'

export const migrationHelper = {
  isMigrated,
  setMigrated,
  getOldData,
  shouldMigrate,
  migrate,
}

function migrateWords(words) {
  const items = words.map(attrs => wordFormatter(attrs))

  return wordService.bulkAdd(items)
}

function migrateSentences(sentences) {
  const items = sentences.map(attrs => sentenceFormatter(attrs))

  return sentenceService.bulkAdd(items)
}

function wordFormatter(word) {
  const { from, name, sentence, source, tags, to, trans = [] } = word

  return {
    text: name,
    trans: trans.join(','),
    sentence,
    tags,
    source,
    from_lang: from,
    to_lang: to,
    platform: 'Chrome',
  }
}

function sentenceFormatter(sentence) {
  const { tags = [], trans = '', text, from, to, source } = sentence

  return {
    text,
    trans,
    tags,
    source,
    from_lang: from,
    to_lang: to,
    platform: 'Chrome'
  }
}

async function migrate() {
  const { words, sentences } = await getOldData()
  
  try {
    if (words.length) {
      await migrateWords(words)
    }
    if (sentences.length) {
      await migrateSentences(sentences)
    }
    
    return true
  } catch (error) {
    return false 
  }
}

function isMigrated() {
  return browser.storage.sync.get('did_migrated').then(({ did_migrated }) => {
      return did_migrated
  })
}

function shouldMigrate() {
  return isMigrated().then(did_migrated => {
    if (!did_migrated) {
      return getOldData().then(store => {
        if (store.words.length || store.sentences.length) {
          return true
        } else {
          return false
        }
      })
    } else {
      return false
    }
  })
}

function getOldData() {
  return Promise.all([
    wordsHelper.init(),
    getSentences()
  ]).then(([words = [], sentences = []]) => {
    return {
      words,
      sentences
    }
  })
}

function setMigrated(status = true) {
  return browser.storage.sync.set({
    did_migrated: status
  })
}