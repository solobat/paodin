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
      this.$confirm(this.$i18n('confirm_to_delete'), this.$i18n('note'), {
        type: "warning"
      })
        .then(() => {
          this.delete().then(() => {
            this.$emit("delete");
            this.$message({
              type: "success",
              message: this.$i18n('delete_ok')
            });
          });
        })
        .catch(() => {});
    }
  }
};