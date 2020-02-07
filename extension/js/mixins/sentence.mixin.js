import * as sentenceController from "@/server/controller/sentenceController";

export default {
  props: ["item", "mode"],

  methods: {
    save() {
      return sentenceController.save(this.item);
    },
    delete() {
      return sentenceController.del(this.item.id);
    },
    handleDeleteClick() {
      this.$confirm("确认删除?", "提示", {
        type: "warning"
      })
        .then(() => {
          this.delete().then(() => {
            this.$emit("delete");
            this.$message({
              type: "success",
              message: "删除成功!"
            });
          });
        })
        .catch(() => {});
    }
  }
};