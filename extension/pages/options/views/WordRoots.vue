<template>
  <div class="view-container wordroots-container">
    <div class="filter-panel">
      <div class="filter-item">
        <div class="field-label">搜索</div>
        <el-input
          placeholder="Search"
          icon="search"
          :autofocus="true"
          v-model="rootsFilter.searchText"
        ></el-input>
      </div>
      <div class="other-info">
        数据来自
        <a href="https://book.douban.com/subject/3002766/" target="_blank">《英语词根与单词的说文解字》</a>
      </div>
    </div>
    <div class="roots-container">
      <el-table :data="filteredRoots" border style="width: 100%;">
        <el-table-column prop="root" label="词根" width="180"></el-table-column>
        <el-table-column prop="source" label="来源" width="100"></el-table-column>
        <el-table-column prop="explaintion" label="解释"></el-table-column>
        <el-table-column prop="page" label="页码" width="100"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import wordRoots from "@/js/constant/wordroots";

export default {
  data() {
    return {
      wordRoots,
      rootsFilter: {
        searchText: "a"
      }
    };
  },

  computed: {
    filteredRoots() {
      let { searchText } = this.rootsFilter;

      let results = this.wordRoots;

      if (searchText) {
        results = results.filter(({ root }) => {
          return root.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
        });
      }

      return results;
    }
  }
};
</script>

<style lang="scss" scoped>
.wordroots-container {
  display: flex;
}

.roots-container {
  flex: 1;
  overflow: scroll;
}
</style>