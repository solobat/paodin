/**
 * @file word.js
 * @author solopea@gmail.com
 */
import Backbone from 'backbone'
import $ from 'jquery'

export const Word = Backbone.Model.extend({
    sync: Backbone.sync,
    defaults: function () {
        return {
            created: +new Date(),
            updated: +new Date()
        };
    }
});

export const WordList = Backbone.Collection.extend({
    model: Word,

    chromeStorage: new Backbone.ChromeStorage("words", "sync"),

    nextOrder: function () {
        if (!this.length) {
            return 1;
        }
        return this.last().get('created') + 1;
    },

    comparator: 'created'
});