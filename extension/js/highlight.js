/**
 * @file highlightjs
 * @author solopea@gmail.com
 */
import { selectText } from './common/utils'
import $ from 'jquery'

export default class Highlight {
    constructor(target, word, context) {
        this.context = context || window;
        if (this.shouldHighlight(target)) {
            return this.create(word);
        }
    }

    hasWords() {
        var selection = this.context.getSelection();
        var frag = selection.getRangeAt(0).cloneContents();

        return !!frag.querySelector('.wc-highlight');
    }

    shouldHighlight(target) {
        var shouldHighlight = true;
        var $target = $(target);

        if (!target || $target.hasClass('wc-highlight') || $target.closest('.wc-highlight').length) {
            shouldHighlight = false;
        }

        return shouldHighlight;
    }

    create() {
        var range = this.context.getSelection().getRangeAt(0);
        var selectionContents = range.extractContents();
        var elem = this.context.document.createElement('em');

        elem.appendChild(selectionContents);
        elem.setAttribute('class', 'wc-highlight');
        range.insertNode(elem);

        return elem;
    }

    remove() {
        var $elem = $('em.wc-highlight');
        if (!$elem.length) {
            return;
        }
        // TODO: optimize
        // remove all by ID ?
        $elem.each(function() {
            var elem = this;

            utils.selectText(elem);

            var range = this.context.getSelection().getRangeAt(0);
            var selectionContents = range.extractContents();

            elem.remove();
            range.insertNode(selectionContents);
        });
    }
    getAllTextNode(el) {
        var n;
        var a = [];
        var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        while (n = walk.nextNode()) {
            a.push(n);
        }
        return a;
    }
}