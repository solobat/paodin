import AV from 'leancloud-storage'
import { setACL } from '@/js/helper/av.helper';

const Sentence = AV.Object.extend('Sentence');

export const sentenceService = {
  isExisted,
  addOne,
  create,
  upateExisted,
  bulkAdd
}

export function upateExisted(sentence, attrs) {
  const { trans, tags, source, from_lang, to_lang, platform } = attrs

  sentence.set('trans', trans)
  sentence.set('tags', tags)
  sentence.set('source', source)
  sentence.set('from_lang', from_lang)
  sentence.set('to_lang', to_lang)
  sentence.set('platform', platform)

  return sentence.save()
}

export function isExisted(text) {
  const query = new AV.Query('Sentence');
  const user = AV.User.current();

  query.equalTo('text', text)
  query.equalTo('author', user)

  return query.first().then(item => {
    return {
      isExisted: Boolean(item),
      item
    }
  })
}

function createByAttrs(attrs) {
  const { text, trans, tags, source, from_lang, to_lang, platform } = attrs 
  const sentence = new Sentence();

  sentence.set('text', text)
  sentence.set('trans', trans)
  sentence.set('tags', tags)
  sentence.set('source', source)
  sentence.set('from_lang', from_lang)
  sentence.set('to_lang', to_lang)
  sentence.set('platform', platform)
  sentence.set('author', AV.User.current())

  setACL(sentence)

  return sentence
}

export function create(attrs) {
  const sentence = createByAttrs(attrs)

  return sentence.save()
}

export function addOne(attrs) {
  const { text } = attrs

  return isExisted(text).then(existed => {
    if (!existed) {
      
    } else {
      return Promise.reject('Sentence has existed')
    }
  })
}

export function bulkAdd(attrsList) {
  const sentences = attrsList.map(attrs => createByAttrs(attrs))

  return AV.Object.saveAll(sentences)
}