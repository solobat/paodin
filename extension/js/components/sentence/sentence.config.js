
export function getSentenceDefaultAssit() {
  return {
    tags: [],
    tagInputVisible: false,
    tagInputValue: '',
    deleteTimes: 0,
    allTags: [],
    saved: false,
    saving: false,
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