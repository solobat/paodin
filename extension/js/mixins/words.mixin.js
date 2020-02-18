import { Base64 } from "js-base64";
import URI from "urijs";
import _ from 'underscore'

const filterKeyMap = {
  list: "filter",
  recite: "reciteFilter"
};

export default {
  data() {
    return {
      words: [],
      langPairs: [],
      tags: [],
      allTags: [],
    }
  },

  watch: {
    words() {
      let allTags = [];
      let langPairs = [];

      this.words.forEach(({ tags = [], from = "en", to = "zh-CN" }) => {
        allTags = allTags.concat(tags);
        langPairs.push(`${from},${to}`);
      });

      this.tags = _.uniq(allTags);
      this.langPairs = _.uniq(langPairs);
      this.allTags = this.tags.map(tag => {
        return {
          label: tag,
          value: tag
        };
      });
    }
  },

  methods: {
    handleLevelFilterClick(level, type = "list") {
      let filter = this[filterKeyMap[type]];
      let index = filter.levels.indexOf(level);

      if (index > -1) {
        filter.levels.splice(index, 1);
      } else {
        filter.levels.push(level);
      }
    },
    handleTagFilterClick(tag, type = "list") {
      let filter = this[filterKeyMap[type]];
      let index = filter.tags.findIndex(item => item == tag);

      if (index > -1) {
        filter.tags.splice(index, 1);
      } else {
        filter.tags.push(tag);
      }
    },
    filterWords(filter, type = "list") {
      let { wordSearchText, levels, tags, langPair } = filter;

      if (!this.words.length) {
        return [];
      }

      let results = this.words;

      if (wordSearchText) {
        results = results.filter(word => {
          // TODO: 连同sentence一起筛选
          return (
            word.name.toLowerCase().indexOf(wordSearchText.toLowerCase()) !== -1
          );
        });
      }

      if (levels.length) {
        results = results.filter(({ level }) => {
          return levels.indexOf(level) !== -1;
        });
      }

      if (tags.length) {
        results = results.filter(({ tags: wtags = [] }) => {
          if (!wtags.length) {
            return false;
          }

          let hasTag = false;

          tags.forEach(tag => {
            if (wtags.indexOf(tag) > -1) {
              hasTag = true;
            }
          });

          return hasTag;
        });
      }

      if (langPair && langPair.indexOf(",") !== -1) {
        results = results.filter(({ from = "en", to = "zh-CN" }) => {
          const arr = langPair.split(",");

          return from === arr[0] && to === arr[1];
        });
      }

      return results;
    },
    handleWords(list) {
      list.forEach(item => {
        if (item.pos) {
          const { url, offset, path } = item.pos;
          const tag = Base64.encodeURI(JSON.stringify({ offset, path }));
          const link = URI(url)
            .removeSearch("wc_tag")
            .addSearch("wc_tag", tag);

          item.link = link.href();
        }
      });

      return list;
    },
    loadWords() {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            action: "get"
          },
          ({ data }) => {
            if (data) {
              this.words = this.handleWords(data);

              resolve(data);
            } else {
              resolve([]);
            }
          }
        );
      });
    },
  },
  mounted() {
    this.loadWords();
  }
}