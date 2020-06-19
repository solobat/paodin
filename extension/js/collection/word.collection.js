import Backbone from 'backbone'
import '../../js/lib/backbone.chromestorage'
import { WordList } from '../../js/word'

let Words = new WordList();
let words;

export const wordsHelper = {
    getWords: function() {
        words = Words.toJSON();

        return words || [];
    },

    init: function() {
        let self = this;

        return Words.fetch().then(function() {
            return self.getWords();
        });
    }
};