import { simTemplate } from '../common/utils'

export const msg = {
    maxWords: max => simTemplate(chrome.i18n.getMessage('background_msg_maxwords_tips'), { max }),
}
