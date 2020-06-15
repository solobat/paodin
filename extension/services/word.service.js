import AV from 'leancloud-storage'
import { setACL } from '@/js/helper/av.helper';

const Word = AV.Object.extend('Word');

export const wordService = {
  isExisted,
  addOne,
  create
}

export function isExisted(text) {
  const query = new AV.Query('Word');
  const user = AV.User.current();

  query.equalTo('text', text)
  query.equalTo('author', user)

  return query.first().then(item => {
    return Boolean(item)
  })
}

export function create(attrs) {
  const { text, trans, sentence, tags, source, from_lang, to_lang, platform } = attrs 
  const word = new Word();
  word.set('text', text)
  word.set('trans', trans)
  word.set('sentence', sentence)
  word.set('tags', tags)
  word.set('source', source)
  word.set('from_lang', from_lang)
  word.set('to_lang', to_lang)
  word.set('platform', platform)
  word.set('author', AV.User.current())

  setACL(word)

  return word.save()
}

export function addOne(attrs) {
  const { text } = attrs

  return isExisted(text).then(existed => {
    if (!existed) {
      
    } else {
      return Promise.reject('Word has existed')
    }
  })
}