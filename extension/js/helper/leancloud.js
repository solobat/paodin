import AV from 'leancloud-storage'

function initAV() {
    const appId = 'jA3TvXP3ALTwNBhujMGnjgXk-gzGzoHsz';
    const appKey = 'tWGoClvRJED6U4IAkzwaqESq';
    AV.init({ appId, appKey });
}

initAV();

export const AVHelper = {
  cache: {},
  getTag(word) {
      return this.query(word).then(res => {
          return this.getTagByInterval(res.index);
      });
  },
  query(word) {
      let cache = this.cache;

      if (cache[word]) {
          return Promise.resolve(cache[word]);
      }

      const cql = `select * from cocoa20000 where name = '${word}'`;

      return AV.Query.doCloudQuery(cql).then(function ({ results = [] }) {
          if (results.length) {
              cache[word] = results[0].attributes;

              return cache[word];
          }
      }, function (error) {
          return {
              word,
              index: -1
          }
      });
  },

  getTagByInterval(index) {
      if (index < 0) {
          return '';
      } else if (index <= 4000) {
          return '4000';
      } else if (index <= 8000  ) {
          return '8000'
      } else if (index <= 12000) {
          return '12000';
      } else if (index <= 15000) {
          return '15000';
      } else {
          return '20000';
      }
  }
};