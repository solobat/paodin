import browser from 'webextension-polyfill'
import { wordsHelper } from '@/collection/word.collection'
import { list as getSentences, update as updateSentence } from '@/server/controller/sentenceController'
import { wordService } from '@/services/word.service'
import { sentenceService } from '@/services/sentence.service'

export const migrationHelper = {
  getOldData,
  shouldMigrate,
  migrate,
}

function migrateWords(words) {
  const items = words.map(attrs => wordFormatter(attrs))

  return wordService.bulkAdd(items).then(() => {
    markWordsAsSynced(words)
  })
}

function markSentencesAsSynced(list) {
  list.forEach(item => {
    updateSentence(item.id, {
      synced: true
    })
  })
}

function markWordsAsSynced(list) {
    const words = list.map(word => {
        return { id: word.id, name: word.name, synced: true };
    });
    
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
          action: 'batchUpdate',
          data: words
      }, ({ data }) => {
          resolve(data);
      });
  });
}

function migrateSentences(sentences) {
  const items = sentences.map(attrs => sentenceFormatter(attrs))

  return sentenceService.bulkAdd(items).then(() => {
    markSentencesAsSynced(sentences)
  })
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

function shouldMigrate() {
  return getOldData().then(store => {
    if (store.words.length || store.sentences.length) {
      return true
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
      words: words.filter(word => !word.synced),
      sentences: sentences.filter(sentence => !sentence.synced)
    }
  })
}
