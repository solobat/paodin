
export function getI18nTexts(obj) {
  let texts = {};

  try {
      for (let cate in obj) {
          let subobj = texts[cate] = {};

          for (var key in obj[cate]) {
              subobj[key] = chrome.i18n.getMessage(`${cate}_${key}`);
          }
      }
  } catch (e) {
      console.log(e);
  }

  return texts;
}