import { simTemplate } from '../common/utils'

export const lang = chrome.i18n.getUILanguage();

export const base = {
    choose: chrome.i18n.getMessage('options_base_choose'),
    'delete': chrome.i18n.getMessage('options_base_delete'),
    cancel: chrome.i18n.getMessage('options_base_cancel'),
    save: chrome.i18n.getMessage('options_base_save')
} 

export const tabs = {
    general: chrome.i18n.getMessage('options_tab_general'),
    words: chrome.i18n.getMessage('options_tab_words'),
    wordsrecite: chrome.i18n.getMessage('options_tab_wordsrecite'),
    wordroots: chrome.i18n.getMessage('options_tab_wordroots'),
    advanced: chrome.i18n.getMessage('options_tab_advanced'),
    help: chrome.i18n.getMessage('options_tab_help'),
    update: chrome.i18n.getMessage('options_tab_update')
}

export const general = {
    engine: chrome.i18n.getMessage('options_general_engine'),
    source: chrome.i18n.getMessage('options_general_source'),
    target: chrome.i18n.getMessage('options_general_target'),
    langTips: chrome.i18n.getMessage('options_general_lang_tips'),
    autoSource: chrome.i18n.getMessage('options_general_auto_source'),
    dblclickTrigger: chrome.i18n.getMessage('options_general_dblclick_trigger'),
    holdCtrl: chrome.i18n.getMessage('options_general_hold_ctrl'),
    holdCtrlTips: chrome.i18n.getMessage('options_general_hold_ctrl_tips'),
    autocutSentence: chrome.i18n.getMessage('options_general_autocut_sentence'),
    autocutSentenceTips: chrome.i18n.getMessage('options_general_autocut_sentence_tips'),
    precisionFirst: chrome.i18n.getMessage('options_general_precision_first'),
    precisionFirstTips: chrome.i18n.getMessage('options_general_precision_first_tips'),
    cardFontSize: chrome.i18n.getMessage('options_general_card_fontsize'),
    ominboxEnterShowSentence: chrome.i18n.getMessage('options_general_omnibox_enter_show_sentence'),
    autoSync: chrome.i18n.getMessage('options_general_autosync')
}

export const words = {
    search: chrome.i18n.getMessage('options_words_search'),
    vocabulary: chrome.i18n.getMessage('options_words_vocabulary'),
    reset: chrome.i18n.getMessage('options_words_reset'),
    level: chrome.i18n.getMessage('options_words_level'),
    tag: chrome.i18n.getMessage('options_words_tag'),
    count: (choosed, all) => simTemplate(chrome.i18n.getMessage('options_words_count'), { choosed, all }),
    batchdelete: chrome.i18n.getMessage('options_words_batchdelete')
}

export const wordsrecite = {
    title: chrome.i18n.getMessage('options_wordsrecite_title'),
    submit: chrome.i18n.getMessage('options_wordsrecite_submit'),
    result: chrome.i18n.getMessage('options_wordsrecite_result'),
    newquiz: chrome.i18n.getMessage('options_wordsrecite_newquiz'),
}

export const advanced = {
    'export': chrome.i18n.getMessage('options_advanced_export'),
    onlywords: chrome.i18n.getMessage('options_advanced_onlywords')
}

export const item = {
    word: chrome.i18n.getMessage('options_item_word'),
    translate: chrome.i18n.getMessage('options_item_translate'),
    tag: chrome.i18n.getMessage('options_item_tag'),
    sentence: chrome.i18n.getMessage('options_item_sentence'),
    right: chrome.i18n.getMessage('options_item_right'),
    wrong: chrome.i18n.getMessage('options_item_wrong'),
    tips: chrome.i18n.getMessage('options_item_tips'),
}

export const msg = {
    saveok: chrome.i18n.getMessage('options_msg_saveok'),
    deletewordsConfirm: chrome.i18n.getMessage('options_msg_deletewords_confirm'),
    nowordsToDelete: chrome.i18n.getMessage('options_msg_nowords_todelete'),
    batchDeleteOk: chrome.i18n.getMessage('options_msg_batchdelete_ok'),
    deleteOk: chrome.i18n.getMessage('options_msg_delete_ok'),
    formError: chrome.i18n.getMessage('options_msg_form_error'),
    wordsChoosedNothing: chrome.i18n.getMessage('options_msg_wordschoosed_nothing'),
    noWordsToExport: chrome.i18n.getMessage('options_msg_nowords_toexport')
}