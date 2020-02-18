
export function getSentenceDefaultAssit() {
  return {
    tags: [],
    tagInputVisible: false,
    tagInputValue: '',
    deleteTimes: 0,
    allTags: [],
    translating: false,
    translate: {
      phonetic: [{
        name: 'en-US'
      }],
      trans: [],
      explains: []
    },
    transEditable: false
  }
}