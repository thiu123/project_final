<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script>
import { mapActions } from "vuex";
export default {
  methods: {
    ...mapActions("auth", ["restoreSession"]),
  },
  mounted() {
    this.restoreSession();
  }
};
</script>
