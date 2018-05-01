/**
 * @file popup.js
 * @author solopea@gmail.com
 */

import './popup.scss'
import $ from 'jquery'

$(function() {
    $('.menu-item').on('click', function() {
        const tab = $(this).data('tab');
        browser.tabs.create({
            url: `options.html?${tab}`
        });
    });
});