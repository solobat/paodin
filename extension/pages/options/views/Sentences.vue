<template>
  <div class="content-wrapper">
    <div class="toolbar">
      <el-radio-group v-model="mode">
        <el-radio-button
          v-for="(item, index) in SENTENCE_MODE"
          :key="index"
          :label="item.value"
        >{{item.label}}</el-radio-button>
      </el-radio-group>

      <el-radio-group v-model="showMode">
        <el-radio-button label="grid">
          <i class="el-icon-s-grid"></i>
        </el-radio-button>
        <el-radio-button label="carousel">
          <i class="el-icon-files"></i>
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="items-container items-container-grid" v-if="showMode === 'grid'">
      <component
        :is="`sentence-${mode}-card`"
        v-for="(item, index) in list"
        :item="item"
        :key="index"
        :mode="mode"
        @delete="onDelete"
      />
    </div>
    <div class="items-container items-container-slide" v-if="showMode === 'carousel'">
      <el-carousel :autoplay="false" arrow="always" type="card" indicator-position="none">
        <el-carousel-item v-for="(item, index) in list" :key="index">
          <div class="item-wrap">
            <component
              :is="`sentence-${mode}-card`"
              :item="item"
              :mode="mode"
              @delete="onDelete"
            />
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>

<script>
import "@/js/components/sentence-card/";
import * as sentenceController from "@/server/controller/sentenceController";
import { SENTENCE_MODE } from "@/js/constant/options";

export default {
  name: "Sentences",

  data() {
    return {
      list: [],
      showMode: 'carousel',
      mode: this.$route.query.mode || "preview",
      SENTENCE_MODE
    };
  },

  watch: {
    mode() {
      this.$router.push({ query: { mode: this.mode } });
    }
  },

  methods: {
    async loadList() {
      const list = await sentenceController.list();

      this.list = list;
    },

    onDelete() {
      this.loadList();
    }
  },

  mounted() {
    this.loadList();
  }
};
</script>

<style lang="scss" scoped>
.content-wrapper {
  height: 100%;
  padding: 24px 60px 64px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
}

.items-container {
  margin-top: 10px;
}

.items-container-grid {
  display: grid;
  grid-column-gap: 12px;
  grid-row-gap: 12px;
  grid-template-columns: repeat(auto-fill, 400px);
}

.items-container-slide {
  .item-wrap {
    width: 520px;
    margin: 0 auto;
  }
}
</style>