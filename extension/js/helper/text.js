import { TEXT_TYPE } from '@/js/constant/options'

function isArticle(text, isDbText, lang) {
  const MIN_P = 3
  const pReg = /\n/g
  const matched = text.match(pReg)

  if (matched && matched.length >= MIN_P) {
    return true
  } else {
    return false
  }
}

function isSentence(text, isDbText, lang) {
  const MIN_W = 10

  if (isDbText) {
    return text.length >= MIN_W
  } else {
    return text.split(' ').length >= MIN_W
  }
}

export function getTextType(text, lang) {
  const dbReg = /[\u4e00-\u9fa5]/
  const isDbText = dbReg.test(text)

  if (isArticle(text, isDbText, lang)) {
    return TEXT_TYPE.ARTICLE
  } else if (isSentence(text, isDbText, lang)) {
    return TEXT_TYPE.SENTENCE
  } else {
    return TEXT_TYPE.WORD
  }
}