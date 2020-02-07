
export function getDefaultAssit() {
    return {
        wordEditable: false,
        sentenceEditable: false,
        newWordDef: '',
        tagInputVisible: false,
        tagInputValue: '',
        deleteTimes: 0,
        translate: {
            phonetic: [{
                name: 'en-US'
            }],
            trans: [],
            explains: []
        },
        wordTags: [],
        allTags: [],
        orgWord: null,
    };
}