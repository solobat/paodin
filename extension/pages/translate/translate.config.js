
export function getDefaultAssit() {
    return {
        wordEditable: false,
        sentenceEditable: false,
        newWordDef: '',
        tagInputVisible: false,
        tagInputValue: '',
        deleteTimes: 0,
        translate: {
            phonetic: '',
            trans: [],
            explains: []
        },
        wordTags: [],
        allTags: [],
        orgWord: null,
    };
}
